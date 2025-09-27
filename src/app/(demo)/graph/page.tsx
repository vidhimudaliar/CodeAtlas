import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function fetchPlanByRepo(owner: string, repo: string) {
    const { data: proj, error: pErr } = await supabase
        .from("projects")
        .select("id")
        .eq("owner", owner)
        .eq("repo", repo)
        .maybeSingle();
    if (pErr || !proj?.id) return { nodes: [], edges: [], relations: [] };

    const [n, e, r] = await Promise.all([
        supabase.from("nodes")
            .select("project_id,node_id,name,level,type,path")
            .eq("project_id", proj.id)
            .order("level"),
        supabase.from("edges")
            .select("project_id,parent_node_id,child_node_id")
            .eq("project_id", proj.id),
        supabase.from("relations")
            .select("project_id,source_node_id,target_node_id,label")
            .eq("project_id", proj.id),
    ]);

    const nodes = (n.data ?? []).map(row => ({
        id: row.node_id,          // 👈 composite key part
        name: row.name,
        level: row.level,
        type: row.type,
        path: row.path ?? undefined,
    }));

    const edges = (e.data ?? []).map(row => ({
        parentId: row.parent_node_id,
        childId: row.child_node_id,
    }));

    const relations = (r.data ?? []).map(row => ({
        sourceId: row.source_node_id,
        targetId: row.target_node_id,
        label: row.label,
    }));

    return { nodes, edges, relations, projectId: proj.id };
}
