import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type UINode = {
    id: string;
    name: string;
    level: number;
    type: string;
    path?: string;
    status: "todo" | "doing" | "done";
};
export type UIEdge = { parentId: string; childId: string };

export async function fetchPlanByRepo(owner: string, repo: string) {
    console.log(repo)
    const { data: proj } = await supabase
        .from("projects").select("id")
        // .eq("owner", owner)
        .eq("repo", repo)
        .maybeSingle();

    console.log("proj", proj)
    if (!proj?.id) return { projectId: null, nodes: [] as UINode[], edges: [] as UIEdge[] };
    const [n, e] = await Promise.all([
        supabase
            .from("nodes")
            .select("project_id,node_id,name,level,type,path,status")
            .eq("project_id", proj.id)
            .order("level"),
        supabase
            .from("edges")
            .select("project_id,parent_node_id,child_node_id")
            .eq("project_id", proj.id),
    ]);

    const nodes: UINode[] = (n.data ?? []).map((row: any) => ({
        id: row.node_id,
        name: row.name,
        level: row.level,
        type: row.type,
        path: row.path ?? undefined,
        status: row.status ?? "todo",
    }));

    const edges: UIEdge[] = (e.data ?? []).map((row: any) => ({
        parentId: row.parent_node_id,
        childId: row.child_node_id,
    }));

    return { projectId: proj.id as string, nodes, edges };
}

// Build a tree for checklist rendering
export type Tree = {
    id: string;
    name: string;
    level: number;
    type: string;
    status: "todo" | "doing" | "done";
    children: Tree[];
};

export function buildTree(nodes: UINode[], edges: UIEdge[]): Tree[] {
    const byId = new Map(nodes.map(n => [n.id, { ...n, children: [] as Tree[] }]));
    for (const { parentId, childId } of edges) {
        const p = byId.get(parentId);
        const c = byId.get(childId);
        if (p && c) (p.children as Tree[]).push(c as any);
    }
    // roots = nodes that are not a child in edges
    const childIds = new Set(edges.map(e => e.childId));
    const roots = nodes.filter(n => !childIds.has(n.id)).map(n => byId.get(n.id) as Tree);
    // sort children for stable UI
    const sortTree = (t: Tree[]) => {
        t.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
        t.forEach(n => sortTree(n.children));
    };
    sortTree(roots);
    return roots;
}
