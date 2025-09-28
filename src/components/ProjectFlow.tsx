"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Position, type Node, type Edge } from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import '@xyflow/react/dist/style.css';

export default function ProjectFlow({
    projectName,
    ownerUserId,
}: {
    projectName?: string;
    ownerUserId?: string;
}) {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const params = useParams();
    const slugParam = params?.projectName;
    const inferredProjectName = projectName ?? (Array.isArray(slugParam) ? slugParam[0] : slugParam);
    const resolvedOwner = ownerUserId ?? process.env.NEXT_PUBLIC_OWNER_USER_ID ?? '';

    useEffect(() => {
        if (!inferredProjectName || !resolvedOwner) {
            setError('Missing project or owner information');
            return;
        }

        const controller = new AbortController();

        const loadGraph = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/api/projects/${encodeURIComponent(inferredProjectName)}/graph?ownerUserId=${encodeURIComponent(resolvedOwner)}`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    const detail = await response.text();
                    throw new Error(`Graph fetch failed: ${response.status} ${detail}`);
                }

                const payload = await response.json();
                console.log('[ProjectFlow] graph payload', payload);

                const mappedNodes = toFlowNodes(payload.nodes ?? []);
                const mappedEdges = toFlowEdges(payload.edges ?? []);
                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                    mappedNodes,
                    mappedEdges,
                    'TB'
                );

                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
            } catch (err: any) {
                if (err.name === 'AbortError') return;
                console.error('[ProjectFlow] failed to load graph', err);
                setError(err.message ?? 'Failed to load project graph');
            } finally {
                setLoading(false);
            }
        };

        loadGraph();

        return () => controller.abort();
    }, [inferredProjectName, resolvedOwner]);

    const onNodesChange = useCallback(
        (changes: any) => setNodes((ns: Node[]) => applyNodeChanges(changes, ns)),
        []
    );
    const onEdgesChange = useCallback(
        (changes: any) => setEdges((es: Edge[]) => applyEdgeChanges(changes, es)),
        []
    );
    const onConnect = useCallback(
        (params: any) => setEdges((es: Edge[]) => addEdge(params, es)),
        []
    );

    if (loading) {
        return (
            <div style={{ height: 520, border: '1px solid #e9ecef', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#6c757d', fontSize: 14 }}>Loading project graph…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ height: 520, border: '1px solid #e9ecef', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#dc3545', fontSize: 14 }}>{error}</span>
            </div>
        );
    }

    return (
        <div style={{ height: 520, border: '1px solid #e9ecef', borderRadius: 8, padding: 8 }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            />
        </div>
    );
}

function toFlowNodes(nodes: Array<{ id?: string; node_id?: string; name?: string; type?: string; level?: number; path?: string | null; status?: string | null }>): Node[] {
    if (!nodes.length) {
        return [
            {
                id: 'empty',
                position: { x: 0, y: 0 },
                data: { label: 'No nodes yet' },
            },
        ];
    }

    const grouped = new Map<number, typeof nodes>();
    for (const node of nodes) {
        const level = typeof node.level === 'number' ? node.level : 0;
        if (!grouped.has(level)) grouped.set(level, []);
        grouped.get(level)!.push(node);
    }

    const levels = Array.from(grouped.keys()).sort((a, b) => a - b);
    const xSpacing = 240;
    const ySpacing = 140;

    const flowNodes: Node[] = [];
    levels.forEach((level, levelIndex) => {
        const bucket = grouped.get(level)!;
        bucket.forEach((node, index) => {
            const id = node.id ?? node.node_id;
            if (!id) {
                return;
            }
            flowNodes.push({
                id,
                position: {
                    x: levelIndex * xSpacing,
                    y: index * ySpacing,
                },
                data: {
                    label: node.name ?? id,
                    type: node.type,
                    status: node.status ?? 'todo',
                    path: node.path ?? undefined,
                },
            });
        });
    });

    return flowNodes;
}

function toFlowEdges(edges: Array<{ parent_node_id?: string; child_node_id?: string }>): Edge[] {
    if (!edges.length) return [];

    return edges
        .map((edge) => {
            const source = edge.parent_node_id;
            const target = edge.child_node_id;
            if (!source || !target) return null;
            return {
                id: `${source}->${target}`,
                source,
                target,
            } satisfies Edge;
        })
        .filter(Boolean) as Edge[];
}

const DEFAULT_NODE_WIDTH = 172;
const DEFAULT_NODE_HEIGHT = 36;

function getLayoutedElements(nodes: Node[], edges: Edge[], direction: 'LR' | 'TB' = 'LR') {
    if (!nodes.length) {
        return { nodes, edges };
    }

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction });

    const isHorizontal = direction === 'LR';

    nodes.forEach((node) => {
        const width = node.width ?? DEFAULT_NODE_WIDTH;
        const height = (node as any).height ?? (node as any).initialHeight ?? DEFAULT_NODE_HEIGHT;
        dagreGraph.setNode(node.id, { width, height });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        if (!nodeWithPosition) {
            return node;
        }
        const width = node.width ?? DEFAULT_NODE_WIDTH;
        const height = (node as any).height ?? (node as any).initialHeight ?? DEFAULT_NODE_HEIGHT;

        return {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            position: {
                x: nodeWithPosition.x - width / 2,
                y: nodeWithPosition.y - height / 2,
            },
        } satisfies Node;
    });

    return { nodes: layoutedNodes, edges };
}
