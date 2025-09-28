import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface StorePayload {
    owner: string;
    repo: string;
    ownerUserId?: string;
    blob: string;
}

interface PlannerPlan {
    nodes?: Array<{
        id: string;
        name?: string;
        type?: string;
        level?: number;
        path?: string | null;
        status?: string | null;
    }>;
    edges?: Array<{
        sourceId?: string;
        targetId?: string;
        parentId?: string;
        childId?: string;
    }>;
    relations?: Array<{
        sourceId: string;
        targetId: string;
        label?: string;
    }>;
}

export async function POST(req: NextRequest) {
    const started = Date.now();

    try {
        const payload = (await req.json()) as StorePayload;
        const owner =
            typeof payload.owner === "string"
                ? payload.owner.charAt(0).toUpperCase() + payload.owner.slice(1)
                : "";
        const repo = typeof payload.repo === "string" ? payload.repo : "";
        const ownerUserId =
            typeof payload.ownerUserId === "string" && payload.ownerUserId.trim()
                ? payload.ownerUserId.trim()
                : null;
        const { blob } = payload;

        if (!owner || !repo || !ownerUserId || typeof blob !== "string" || !blob.trim()) {
            console.error("[planner/store] missing required fields", {
                owner,
                repo,
                ownerUserId,
                hasBlob: Boolean(blob),
            });
            return NextResponse.json(
                { ok: false, error: "owner, repo, ownerUserId, and blob are required" },
                { status: 400 }
            );
        }

        console.log("[planner/store] raw blob preview", blob.slice(0, 400));

        const parsed = safeParsePlan(blob);
        if (!parsed.plan) {
            console.error("[planner/store] failed to parse planner blob", {
                owner,
                repo,
                sample: blob.slice(0, 500),
                error: parsed.error,
            });
            return NextResponse.json(
                { ok: false, error: "invalid_plan", detail: parsed.error },
                { status: 400 }
            );
        }

        const plan = parsed.plan;
        const nodes = normalizeNodes(plan.nodes || []);
        const edges = normalizeEdges(plan.edges || []);
        const relations = normalizeRelations(plan.relations || []);

        console.log("[planner/store] normalized plan", {
            nodeCount: nodes.length,
            edgeCount: edges.length,
            relationCount: relations.length,
        });

        const projectId = await upsertProject({ owner, repo, ownerUserId });

        if (!projectId) {
            console.error("[planner/store] failed to identify project", { owner, repo });
            return NextResponse.json(
                { ok: false, error: "project_not_found" },
                { status: 500 }
            );
        }

    const results = await persistGraph({ projectId, ownerUserId, nodes, edges, relations });

        console.log("[planner/store] persisted graph", {
            durationMs: Date.now() - started,
            projectId,
            ...results,
        });

        return NextResponse.json({
            ok: true,
            projectId,
            counts: results,
        });
    } catch (error) {
        console.error("[planner/store] unhandled error", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });

        return NextResponse.json(
            { ok: false, error: "planner_store_failed", detail: String(error) },
            { status: 500 }
        );
    }
}

function safeParsePlan(blob: string): { plan: PlannerPlan | null; error?: string } {
    const cleaned = stripCodeFence(blob);

    try {
        const candidate = JSON.parse(cleaned);

        if (candidate?.plan?.nodes || candidate?.plan?.edges) {
            console.log("[planner/store] parsed plan wrapper", Object.keys(candidate.plan ?? {}));
            return { plan: candidate.plan };
        }

        if (candidate?.nodes || candidate?.edges) {
            console.log("[planner/store] parsed plan direct", {
                nodeCount: Array.isArray(candidate.nodes) ? candidate.nodes.length : 0,
                edgeCount: Array.isArray(candidate.edges) ? candidate.edges.length : 0,
            });
            return { plan: candidate };
        }

        if (Array.isArray(candidate)) {
            for (const item of candidate) {
                if (item?.content?.parts) {
                    for (const part of item.content.parts) {
                        if (typeof part?.text === "string") {
                            console.log("[planner/store] attempting nested parse from part", part.text.slice(0, 200));
                            const nested = safeParsePlan(part.text);
                            if (nested.plan) {
                                return nested;
                            }
                        }
                    }
                }
            }
        }

        return { plan: null, error: "plan_structure_not_found" };
    } catch (error) {
        return { plan: null, error: error instanceof Error ? error.message : String(error) };
    }
}

function stripCodeFence(value: string): string {
    let text = value.trim();
    if (text.startsWith("```")) {
        text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    }
    if (!text) {
        console.warn("[planner/store] stripCodeFence resulted in empty text");
    }
    return text;
}

function normalizeNodes(nodes: PlannerPlan["nodes"]): Array<{
    id: string;
    name: string;
    type: string;
    level: number;
    path: string | null;
    status: string | null;
}> {
    const seen = new Set<string>();
    const result: Array<{
        id: string;
        name: string;
        type: string;
        level: number;
        path: string | null;
        status: string | null;
    }> = [];

    for (const node of nodes || []) {
        if (!node?.id) continue;
        if (seen.has(node.id)) continue;
        seen.add(node.id);

        result.push({
            id: node.id,
            name: node.name ?? node.id,
            type: node.type ?? "unknown",
            level: typeof node.level === "number" ? node.level : 0,
            path: typeof node.path === "string" ? node.path : null,
            status: typeof node.status === "string" ? node.status : null,
        });
    }

    return result;
}

function normalizeEdges(edges: PlannerPlan["edges"]): Array<{
    parentId: string;
    childId: string;
}> {
    const result: Array<{ parentId: string; childId: string }> = [];
    const seen = new Set<string>();

    for (const edge of edges || []) {
        const parent = edge.parentId ?? edge.sourceId;
        const child = edge.childId ?? edge.targetId;
        if (!parent || !child) continue;
        const key = `${parent}->${child}`;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({ parentId: parent, childId: child });
    }

    return result;
}

function normalizeRelations(relations: PlannerPlan["relations"]): Array<{
    sourceId: string;
    targetId: string;
    label: string;
}> {
    const result: Array<{ sourceId: string; targetId: string; label: string }> = [];

    for (const rel of relations || []) {
        if (!rel?.sourceId || !rel?.targetId) continue;
        result.push({
            sourceId: rel.sourceId,
            targetId: rel.targetId,
            label: rel.label ?? "",
        });
    }

    return result;
}

async function upsertProject({ owner, repo, ownerUserId }: { owner: string; repo: string; ownerUserId: string }) {
    try {
        const { data: found, error } = await supabaseAdmin
            .from("projects")
            .select("id")
            .eq("owner", owner)
            .eq("repo", repo)
            .eq("owner_user_id", ownerUserId)
            .maybeSingle();

        if (error) throw error;
        if (found?.id) return found.id as string;

        const { data: created, error: insertError } = await supabaseAdmin
            .from("projects")
            .insert({ owner, repo, title: repo, owner_user_id: ownerUserId })
            .select("id")
            .single();

        if (insertError) throw insertError;
        return created?.id as string;
    } catch (error) {
        console.error("[planner/store] upsertProject failed", {
            owner,
            repo,
            ownerUserId,
            error: error instanceof Error ? error.message : String(error),
        });
        return null;
    }
}

async function persistGraph({
    projectId,
    ownerUserId,
    nodes,
    edges,
    relations,
}: {
    projectId: string;
    ownerUserId: string;
    nodes: ReturnType<typeof normalizeNodes>;
    edges: ReturnType<typeof normalizeEdges>;
    relations: ReturnType<typeof normalizeRelations>;
}) {
    const { data: project, error: projectError } = await supabaseAdmin
        .from("projects")
        .select("owner, repo")
        .eq("id", projectId)
        .maybeSingle();

    if (projectError) {
        console.error("[planner/store] failed to fetch project metadata", projectError);
    }

    console.log("[planner/store] upserting nodes", {
        projectId,
        count: nodes.length,
        sample: nodes.slice(0, 3),
    });

  const nodeRows = nodes.map((node) => ({
    project_id: projectId,
    owner_user_id: ownerUserId,
    node_id: node.id,
    name: node.name,
    level: node.level,
    type: node.type,
    path: node.path,
    status: node.status ?? "todo",
  }));

    const { error: nodeError } = await supabaseAdmin
        .from("nodes")
        .upsert(nodeRows, { onConflict: "project_id,node_id" });
    if (nodeError) {
        console.error("[planner/store] node upsert failed", nodeError);
        throw nodeError;
    }

    console.log("[planner/store] upserting edges", {
        projectId,
        count: edges.length,
        sample: edges.slice(0, 3),
    });

  const edgeRows = edges.map((edge) => ({
    project_id: projectId,
    parent_node_id: edge.parentId,
    child_node_id: edge.childId,
    last_touched_by_user_id: ownerUserId,
  }));

    const { error: edgeError } = await supabaseAdmin
        .from("edges")
        .upsert(edgeRows, { onConflict: "project_id,parent_node_id,child_node_id" });
    if (edgeError) {
        console.error("[planner/store] edge upsert failed", edgeError);
        throw edgeError;
    }

    if (relations.length) {
        console.log("[planner/store] upserting relations", {
            projectId,
            count: relations.length,
            sample: relations.slice(0, 3),
        });

    const relationRows = relations.map((relation) => ({
      project_id: projectId,
      owner_user_id: ownerUserId,
      source_node_id: relation.sourceId,
      target_node_id: relation.targetId,
      label: relation.label,
    }));

        const { error: relationError } = await supabaseAdmin
            .from("relations")
            .upsert(relationRows, { onConflict: "project_id,source_node_id,target_node_id,label" });
        if (relationError) {
            console.error("[planner/store] relation upsert failed", relationError);
            throw relationError;
        }
    }

    return {
        nodes: nodeRows.length,
        edges: edgeRows.length,
        relations: relations.length,
    };
}
