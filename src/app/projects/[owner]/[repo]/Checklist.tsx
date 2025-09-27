"use client";

import { useState } from "react";

type NodeStatus = "todo" | "doing" | "done";
type Tree = {
    id: string;
    name: string;
    level: number;
    type: string;
    status: NodeStatus;
    children: Tree[];
};

export default function Checklist({ projectId, tree }: { projectId: string; tree: Tree[] }) {
  const [data, setData] = useState<Tree[]>(tree);

  const updateStatusLocal = (id: string, status: NodeStatus) => {
    const walk = (nodes: Tree[]): Tree[] =>
      nodes.map((node) => ({
        ...node,
        status: node.id === id ? status : node.status,
        children: walk(node.children),
      }));

    setData((prev) => walk(prev));
  };

  const onToggle = async (id: string, current: NodeStatus) => {
    const next: NodeStatus = current === "todo" ? "doing" : current === "doing" ? "done" : "todo";
    updateStatusLocal(id, next);

    try {
      const res = await fetch("/api/nodes/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, nodeId: id, status: next }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
    } catch (error) {
      console.error("Failed to update status", error);
      updateStatusLocal(id, current);
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <ul className="space-y-4">
      {data.map((root) => (
        <NodeCard key={root.id} node={root} depth={0} onToggle={onToggle} />
      ))}
    </ul>
  );
}

function NodeCard({
  node,
  depth,
  onToggle,
}: {
  node: Tree;
  depth: number;
  onToggle: (id: string, cur: NodeStatus) => void;
}) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children.length > 0;
  const pct = hasChildren ? completion(node) : node.status === "done" ? 100 : node.status === "doing" ? 60 : 0;

  return (
    <li className="list-none">
      <div
        className={`flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md ${
          depth ? "ml-0" : ""
        }`}
      >
        <StatusCheckbox status={node.status} onClick={() => onToggle(node.id, node.status)} />

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">{node.name}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                {node.type}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {hasChildren ? <ProgressBadge pct={pct} /> : null}
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => setOpen((value) => !value)}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
                >
                  {open ? "Collapse" : "Expand"}
                  <span aria-hidden>{open ? "▾" : "▸"}</span>
                </button>
              ) : null}
            </div>
          </div>

          {hasChildren ? <ProgressTrack pct={pct} /> : <StatusCaption status={node.status} />}
        </div>
      </div>

      {hasChildren && open ? (
        <ul className="ml-6 mt-3 space-y-3 border-l border-slate-200 pl-6">
          {node.children.map((child) => (
            <NodeCard key={child.id} node={child} depth={depth + 1} onToggle={onToggle} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function StatusCheckbox({ status, onClick }: { status: NodeStatus; onClick: () => void }) {
  const indicator =
    status === "done" ? (
      <span className="text-[10px] font-bold text-white">✓</span>
    ) : status === "doing" ? (
      <span className="h-2 w-2 rounded-full bg-indigo-500" />
    ) : null;

  const baseClasses =
    status === "done"
      ? "border-green-500 bg-green-500"
      : status === "doing"
        ? "border-indigo-400 bg-indigo-50"
        : "border-slate-300 bg-white";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Toggle status"
      className={`flex h-6 w-6 items-center justify-center rounded-md border transition hover:scale-105 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${baseClasses}`}
    >
      {indicator}
    </button>
  );
}

function ProgressBadge({ pct }: { pct: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
      {pct}% complete
    </span>
  );
}

function ProgressTrack({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-200">
      <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatusCaption({ status }: { status: NodeStatus }) {
  const label = status === "todo" ? "Not started" : status === "doing" ? "In progress" : "Completed";
  const tone = status === "done" ? "text-green-600" : status === "doing" ? "text-indigo-600" : "text-slate-500";

  return <p className={`text-xs font-medium ${tone}`}>{label}</p>;
}

function completion(node: Tree): number {
  const flat: Tree[] = [];
  const walk = (n: Tree) => {
    flat.push(n);
    n.children.forEach(walk);
  };
  walk(node);
  const leafs = flat.filter((n) => n.children.length === 0);
  const done = leafs.filter((n) => n.status === "done").length;
  return leafs.length ? Math.round((done * 100) / leafs.length) : node.status === "done" ? 100 : 0;
}
