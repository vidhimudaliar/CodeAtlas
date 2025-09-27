import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseAgentBlob, toTree } from "@/lib/plan/ingest";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const { owner, repo, blob } = await req.json();
        if (typeof blob !== "string") {
            return NextResponse.json({ ok: false, error: "Expected blob (string)" }, { status: 400 });
        }

        // parse & normalize
        const agent = parseAgentBlob(blob);                 // {nodes, edges}
        const { treeNodes, treeEdges, relations } = toTree(agent);

        // upsert/find project
        let projectId: string;
        const { data: found, error: selErr } = await supabaseAdmin
            .from("projects").select("id").eq("owner", owner).eq("repo", repo).maybeSingle();
        if (selErr) throw selErr;

        if (found?.id) {
            projectId = found.id;
        } else {
            const { data: created, error: insErr } = await supabaseAdmin
                .from("projects").insert({ owner, repo, title: repo }).select("id").single();
            if (insErr) throw insErr;
            projectId = created.id;
        }

        // upsert nodes
        // upsert nodes
        const nodeRows = treeNodes.map(n => ({
            project_id: projectId,
            node_id: n.id,       // <- composite PK part
            name: n.name,
            level: n.level,
            type: n.type,
            path: n.path ?? null
        }));
        const { error: nErr } = await supabaseAdmin
            .from("nodes")
            .upsert(nodeRows, { onConflict: "project_id,node_id" });
        if (nErr) throw nErr;

        // upsert edges
        const edgeRows = treeEdges.map(e => ({
            project_id: projectId,
            parent_node_id: e.parentId,
            child_node_id: e.childId
        }));
        const { error: eErr } = await supabaseAdmin
            .from("edges")
            .upsert(edgeRows, { onConflict: "project_id,parent_node_id,child_node_id" });
        if (eErr) throw eErr;

        // upsert relations
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

        return NextResponse.json({
            ok: true, projectId, counts: {
                nodes: nodeRows.length, edges: edgeRows.length, relations: relations.length
            }
        });
    } catch (e: any) {
        console.error("persist error", e);
        return NextResponse.json({ ok: false, error: e.message ?? "persist failed" }, { status: 500 });
    }
}
