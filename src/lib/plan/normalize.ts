export type RawNode = {
    id: string;
    label?: string;
    level?: number;
    description?: string;
    stack?: any;
    parent_id?: string;
    path?: string;
    type?: string; // may not exist in your dump
};
export type RawEdge = { source: string; target: string; label?: string };

export type NormNode = {
    id: string;
    name: string;
    level: number;
    type: string;      // "frontend" | "backend" | "dev" | "group" | "route" | "api" | "component" | ...
    path?: string;
};
export type NormEdge = { parentId: string; childId: string };

export function parseModelJson(text: string): { nodes: RawNode[]; edges: RawEdge[] } {
    // Remove leading ```json fences if present
    const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
    return JSON.parse(cleaned);
}

export function normalizePlan(raw: { nodes: RawNode[]; edges: RawEdge[] }) {
    const nodes: NormNode[] = [];
    const edges: NormEdge[] = [];

    const idToRaw = new Map<string, RawNode>();
    raw.nodes.forEach(n => idToRaw.set(n.id, n));

    // Nodes
    for (const n of raw.nodes) {
        const name = n.label || n.id;
        // infer a type for level-1 roots; else fallback to "group"
        const inferredType =
            n.id === "frontend" ? "frontend" :
                n.id === "backend" ? "backend" :
                    n.id === "dev" ? "dev" :
                        n.type || "group";

        nodes.push({
            id: n.id,
            name,
            level: Math.max(1, Math.min(4, Math.round(Number(n.level ?? 3)))),
            type: inferredType,
            path: n.path
        });
    }

    // Edges: prefer explicit parent_id
    for (const n of raw.nodes) {
        if (n.parent_id) edges.push({ parentId: n.parent_id, childId: n.id });
    }

    // If no parent_id for some nodes, infer from "Part of" edges (child -> parent)
    const hasParent = new Set(edges.map(e => e.childId));
    for (const e of raw.edges || []) {
        if (e.label?.toLowerCase() === "part of" && !hasParent.has(e.source)) {
            edges.push({ parentId: e.target, childId: e.source });
            hasParent.add(e.source);
        }
    }

    // De-dupe edges
    const dedup = new Map<string, NormEdge>();
    for (const e of edges) dedup.set(`${e.parentId}→${e.childId}`, e);

    return { nodes, edges: Array.from(dedup.values()) };
}
