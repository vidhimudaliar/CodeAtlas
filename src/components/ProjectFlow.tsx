"use client";
import React, { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

type NodeType = any;
type EdgeType = any;

const defaultNodes: NodeType[] = [
    { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
    { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
];

const defaultEdges: EdgeType[] = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];

export default function ProjectFlow({
    initialNodes = defaultNodes,
    initialEdges = defaultEdges,
}: {
    initialNodes?: NodeType[];
    initialEdges?: EdgeType[];
}) {
    const [nodes, setNodes] = useState<NodeType[]>(initialNodes);
    const [edges, setEdges] = useState<EdgeType[]>(initialEdges);

    const onNodesChange = useCallback((changes: any) => setNodes((ns: NodeType[]) => applyNodeChanges(changes, ns)), []);
    const onEdgesChange = useCallback((changes: any) => setEdges((es: EdgeType[]) => applyEdgeChanges(changes, es)), []);
    const onConnect = useCallback((params: any) => setEdges((es: EdgeType[]) => addEdge(params, es)), []);

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
