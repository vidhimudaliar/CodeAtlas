import type { NormNode, NormEdge } from "@/lib/plan/normalize";

export function toNodeRows(projectId: string, nodes: NormNode[]) {
    return nodes.map(n => ({
        id: n.id,
        project_id: projectId,
        name: n.name,
        level: n.level,
        type: n.type,
        path: n.path ?? null
    }));
}

export function toEdgeRows(projectId: string, edges: NormEdge[]) {
    return edges.map(e => ({
        project_id: projectId,
        parent_id: e.parentId,
        child_id: e.childId
    }));
}
