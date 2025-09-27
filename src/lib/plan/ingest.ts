type AgentNode = { id: string; label: string; type: string; parent?: string | null };
type AgentEdge = { source: string; target: string; label?: string };

export type TreeNode = {
    id: string; name: string; type: string; level: number; path?: string | null;
};
export type TreeEdge = { parentId: string; childId: string };
export type Relation = { sourceId: string; targetId: string; label?: string | null };

export function parseAgentBlob(text: string): { nodes: AgentNode[]; edges: AgentEdge[] } {
    const cleaned = text.trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "");
    return JSON.parse(cleaned);
}

// compute levels (1..4) by walking parents; cap at 4
export function toTree(
    agent: { nodes: AgentNode[]; edges: AgentEdge[] },
    roots: string[] = ["frontend", "backend", "dev"]
): { treeNodes: TreeNode[]; treeEdges: TreeEdge[]; relations: Relation[] } {
    const byId = new Map(agent.nodes.map(n => [n.id, n]));
    const children = new Map<string, string[]>();
    for (const n of agent.nodes) {
        const p = n.parent ?? null;
        if (p) {
            if (!children.has(p)) children.set(p, []);
            children.get(p)!.push(n.id);
        }
    }

    const levels = new Map<string, number>();
    const queue: string[] = [];
    // initialize roots at level 1
    for (const id of agent.nodes.map(n => n.id)) {
        if (roots.includes(id)) {
            levels.set(id, 1);
            queue.push(id);
        }
    }
    // also promote any node without parent to level 1 (fallback)
    for (const n of agent.nodes) {
        if (!n.parent && !levels.has(n.id)) {
            levels.set(n.id, 1);
            queue.push(n.id);
        }
    }
    // BFS to assign levels (cap at 4)
    while (queue.length) {
        const cur = queue.shift()!;
        const lvl = levels.get(cur) ?? 1;
        for (const c of children.get(cur) ?? []) {
            if (!levels.has(c)) {
                levels.set(c, Math.min(4, lvl + 1));
                queue.push(c);
            }
        }
    }

    const treeNodes: TreeNode[] = agent.nodes.map(n => ({
        id: n.id,
        name: n.label || n.id,
        type: n.type || "group",
        level: Math.max(1, Math.min(4, levels.get(n.id) ?? 1)),
        path: null
    }));

    const treeEdges: TreeEdge[] = agent.nodes
        .filter(n => n.parent)
        .map(n => ({ parentId: String(n.parent), childId: n.id }));

    // semantic relations go in a separate table
    const relations: Relation[] = (agent.edges || []).map(e => ({
        sourceId: e.source, targetId: e.target, label: e.label ?? null
    }));

    // de-dupe edges
    const key = (e: TreeEdge) => `${e.parentId}→${e.childId}`;
    const dedup = new Map<string, TreeEdge>();
    for (const e of treeEdges) dedup.set(key(e), e);

    return { treeNodes, treeEdges: [...dedup.values()], relations };
}
