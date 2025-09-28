import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseAgentBlob, toTree } from "@/lib/plan/ingest"; // make sure path/name is correct

export const runtime = "nodejs";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
);

const ADK_BASE_URL = process.env.ADK_BASE_URL ?? "http://127.0.0.1:8000";
const ADK_APP_NAME = process.env.ADK_APP_NAME ?? "agent";
const ADK_USER_ID = process.env.ADK_USER_ID ?? "local";
const ADK_AGENT_NAME = process.env.ADK_AGENT_NAME ?? "Planner";

type StoreAndRunBody = {
    owner: string;             // "acme"
    repo: string;              // "acme/codeatlas"  (store the same string you used in `projects.repo`)
    blob: string;              // code-block text from the Planner (must include {"nodes":[],"edges":[]})
    // optional extras to pass to the agent:
    installationId?: number;
    branch?: string;
    sha?: string;
    hints?: Record<string, unknown>;
};

/**
 * POST: persist planner blob -> nodes/edges/relations -> call ADK agent with compact payload
 */
export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as StoreAndRunBody;

        if (!body?.owner || !body?.repo || typeof body?.blob !== "string") {
            return NextResponse.json(
                { ok: false, error: "Missing owner|repo|blob" },
                { status: 400 }
            );
        }

        // 1) Parse & normalize blob
        const agentGraph = parseAgentBlob(body.blob);         // -> { nodes, edges }
        const { treeNodes, treeEdges, relations } = toTree(agentGraph);

        // 2) Upsert/find project
        const { data: found, error: selErr } = await supabaseAdmin
            .from("projects")
            .select("id, default_branch")
            .eq("owner", body.owner)
            .eq("repo", body.repo)
            .maybeSingle();
        if (selErr) throw selErr;

        let projectId: string;
        let defaultBranch = found?.default_branch ?? "main";

        if (found?.id) {
            projectId = found.id;
        } else {
            const { data: created, error: insErr } = await supabaseAdmin
                .from("projects")
                .insert({
                    owner: body.owner,
                    repo: body.repo,
                    title: body.repo,
                    default_branch: body.branch ?? "main",
                })
                .select("id, default_branch")
                .single();
            if (insErr) throw insErr;
            projectId = created.id;
            defaultBranch = created.default_branch ?? defaultBranch;
        }

        // 3) Upsert nodes
        const nodeRows = treeNodes.map(n => ({
            project_id: projectId,
            node_id: n.id,       // composite PK part
            name: n.name,
            level: n.level,
            type: n.type,
            path: n.path ?? null,
            // optional defaults the Orchestrator will appreciate later:
            status: "todo" as const
        }));
        const { error: nErr } = await supabaseAdmin
            .from("nodes")
            .upsert(nodeRows, { onConflict: "project_id,node_id" });
        if (nErr) throw nErr;

        // 4) Upsert edges
        const edgeRows = treeEdges.map(e => ({
            project_id: projectId,
            parent_node_id: e.parentId,
            child_node_id: e.childId
        }));
        const { error: eErr } = await supabaseAdmin
            .from("edges")
            .upsert(edgeRows, { onConflict: "project_id,parent_node_id,child_node_id" });
        if (eErr) throw eErr;

        // 5) Upsert relations (optional)
        if (relations.length) {
            const relRows = relations.map(r => ({
                project_id: projectId,
                source_node_id: r.sourceId,
                target_node_id: r.targetId,
                label: r.label ?? ""
            }));
            const { error: relErr } = await supabaseAdmin
                .from("relations")
                .upsert(relRows, { onConflict: "project_id,source_node_id,target_node_id,label" });
            if (relErr) throw relErr;
        }

        // 6) Build compact payload for the agent (so you don’t burn tokens later)
        const compactPayload = {
            project: {
                id: projectId,
                owner: body.owner,
                repo: body.repo,
                defaultBranch,
                branch: body.branch ?? defaultBranch,
                sha: body.sha ?? null,
                installationId: body.installationId ?? null
            },
            // minimal graph
            nodes: nodeRows.map(n => ({
                id: n.node_id,
                name: n.name,
                level: n.level,
                type: n.type,
                path: n.path ?? undefined
            })),
            edges: edgeRows.map(e => ({
                parentId: e.parent_node_id,
                childId: e.child_node_id
            })),
            // optional hints for the agent
            hints: body.hints ?? {}
        };

        // 7) Call ADK: create session, then /run with the payload
        const sessionId = randomUUID();

        // create session (bind to an agent by name)
        const sessionRes = await fetch(
            `${ADK_BASE_URL}/apps/${encodeURIComponent(ADK_APP_NAME)}/users/${encodeURIComponent(ADK_USER_ID)}/sessions/${encodeURIComponent(sessionId)}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ agent: ADK_AGENT_NAME })
            }
        );
        const sessionText = await sessionRes.text();
        if (!sessionRes.ok) {
            return NextResponse.json(
                { ok: false, error: "ADK session create failed", detail: sessionText },
                { status: 502 }
            );
        }

        // run with a single text part containing JSON
        const runRes = await fetch(`${ADK_BASE_URL}/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({
                appName: ADK_APP_NAME,
                userId: ADK_USER_ID,
                sessionId,
                newMessage: {
                    role: "user",
                    parts: [
                        {
                            text:
                                `Backfill stored. Here is the compact project graph. ` +
                                `Return any suggested node_rules, initial statuses, or follow-up steps as JSON.\n\n` +
                                JSON.stringify(compactPayload)
                        }
                    ]
                }
            })
        });

        const contentType = runRes.headers.get("content-type") || "";
        let adkRaw: unknown = null;

        if (contentType.includes("application/json")) {
            adkRaw = await runRes.json();
        } else {
            const text = await runRes.text();
            try { adkRaw = JSON.parse(text); } catch { adkRaw = { messages: [{ parts: [{ text }] }] }; }
        }

        const agentOut = unwrapAgent(adkRaw);

        return NextResponse.json({
            ok: true,
            projectId,
            counts: {
                nodes: nodeRows.length,
                edges: edgeRows.length,
                relations: relations.length
            },
            agent: agentOut
        });
    } catch (e: any) {
        console.error("[planner/store-and-run] error", e);
        return NextResponse.json(
            { ok: false, error: e?.message ?? "store-and-run failed" },
            { status: 500 }
        );
    }
}

/** Extract first JSON object the agent produced (from ADK’s messages/parts/text). */
function unwrapAgent(raw: any): any {
    // If it already looks like JSON output we care about
    if (raw && typeof raw === "object" && (raw.impacts || raw.updates || raw.nodes || raw.rules)) {
        return raw;
    }

    const texts: string[] = [];
    const collect = (v: any) => {
        if (v == null) return;
        if (typeof v === "string") { texts.push(v); return; }
        if (Array.isArray(v)) { v.forEach(collect); return; }
        if (typeof v === "object") {
            if (typeof v.text === "string") texts.push(v.text);
            Object.values(v).forEach(collect);
        }
    };
    collect(raw);

    for (const t of texts) {
        const cleaned = stripFence(t);
        try {
            const json = JSON.parse(cleaned);
            if (json && (json.impacts || json.updates || json.nodes || json.rules || json.wbs)) {
                return json;
            }
        } catch { /* ignore */ }
    }
    // fallback: return the first text we saw
    return { text: texts[0] ?? null };
}

function stripFence(s: string): string {
    let t = s.trim();
    if (t.startsWith("```")) {
        t = t.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    }
    return t;
}
