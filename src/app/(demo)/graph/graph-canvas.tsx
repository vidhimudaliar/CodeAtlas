"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Edge, Node, OnEdgesChange, OnNodesChange } from "@xyflow/react";
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export interface GraphNode {
  id: string;
  name: string;
  level: number;
  type: string;
  path?: string | null;
}

export interface GraphEdge {
  parentId: string;
  childId: string;
}

export interface GraphRelation {
  sourceId: string;
  targetId: string;
  label?: string | null;
}

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  relations: GraphRelation[];
}

const STATIC_NODES: Node[] = [
  {
    id: "node-1",
    position: { x: 0, y: 0 },
    data: { label: "Planner" },
  },
  {
    id: "node-2",
    position: { x: 200, y: 100 },
    data: { label: "Architecture" },
  },
  {
    id: "node-3",
    position: { x: 400, y: 0 },
    data: { label: "Execution" },
  },
];

const STATIC_EDGES: Edge[] = [
  {
    id: "edge-1",
    source: "node-1",
    target: "node-2",
    markerEnd: { type: MarkerType.ArrowClosed },
    type: "smoothstep",
  },
  {
    id: "edge-2",
    source: "node-2",
    target: "node-3",
    markerEnd: { type: MarkerType.ArrowClosed },
    type: "smoothstep",
  },
];

function buildFlowNodes(nodes: GraphNode[]): Node[] {
  if (!nodes.length) {
    return STATIC_NODES;
  }

  return nodes.map((node, index) => ({
    id: node.id,
    position: {
      x: index * 220,
      y: (node.level ?? 1) * 80,
    },
    data: {
      label: node.name,
    },
  }));
}

function buildFlowEdges(edges: GraphEdge[], relations: GraphRelation[]): Edge[] {
  if (!edges.length && !relations.length) {
    return STATIC_EDGES;
  }

  const flowEdges: Edge[] = [];

  edges.forEach((edge, index) => {
    flowEdges.push({
      id: `hier-${edge.parentId}-${edge.childId}-${index}`,
      source: edge.parentId,
      target: edge.childId,
      type: "smoothstep",
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    });
  });

  relations.forEach((relation, index) => {
    flowEdges.push({
      id: `rel-${relation.sourceId}-${relation.targetId}-${index}`,
      source: relation.sourceId,
      target: relation.targetId,
      animated: true,
      label: relation.label ?? undefined,
      type: "smoothstep",
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    });
  });

  return flowEdges;
}


export function GraphCanvas({ nodes, edges, relations }: GraphCanvasProps) {
  const initialNodes = useMemo(() => buildFlowNodes(nodes), [nodes]);
  const initialEdges = useMemo(() => buildFlowEdges(edges, relations), [edges, relations]);

  const [flowNodes, setFlowNodes] = useState<Node[]>(initialNodes);
  const [flowEdges, setFlowEdges] = useState<Edge[]>(initialEdges);

  useEffect(() => {
    setFlowNodes(initialNodes);
  }, [initialNodes]);

  useEffect(() => {
    setFlowEdges(initialEdges);
  }, [initialEdges]);

  const onNodesChange = useCallback<OnNodesChange>((changes) => {
    setFlowNodes((current) => applyNodeChanges(changes, current));
  }, []);

  const onEdgesChange = useCallback<OnEdgesChange>((changes) => {
    setFlowEdges((current) => applyEdgeChanges(changes, current));
  }, []);

  const onConnect = useCallback(
    (connection) => {
      setFlowEdges((current) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: "#0f172a" },
          },
          current,
        ),
      );
    },
    [],
  );

  return (
    <div className="h-[70vh] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 0.3 }}
      >
        <Background gap={24} size={1} color="#cbd5f5" />
        <MiniMap pannable zoomable />
        <Controls position="bottom-right" />
      </ReactFlow>
    </div>
  );
}
