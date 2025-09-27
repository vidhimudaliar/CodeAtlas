"use client";

import { useMemo, useState } from "react";
import type { InstallationRepository } from "@/lib/github/actions";

interface AnalyzeFormProps {
  installationId: number;
  repositories: InstallationRepository[];
  initialRepoFullName?: string;
}

interface StackInput {
  framework: string;
  language: string;
  db: string;
}

const DEFAULT_STACK: StackInput = {
  framework: "nextjs",
  language: "typescript",
  db: "postgres",
};

const DEFAULT_BRIEF = "Backfill the architecture board and execution checklist for this repository.";

export function AnalyzeForm({ installationId, repositories, initialRepoFullName }: AnalyzeFormProps) {
  const initialRepo = useMemo(() => {
    if (!repositories.length) {
      return undefined;
    }
    if (initialRepoFullName) {
      return repositories.find((repo) => repo.fullName === initialRepoFullName) ?? repositories[0];
    }
    return repositories[0];
  }, [initialRepoFullName, repositories]);

  const [selectedRepo, setSelectedRepo] = useState(() => initialRepo);
  const [stack, setStack] = useState<StackInput>(DEFAULT_STACK);
  const [brief, setBrief] = useState(DEFAULT_BRIEF);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedRepo) {
      setError("Select a repository to analyze.");
      return;
    }

    setLoading(true);
    setError(null);
    setResultMessage(null);

    try {
      const response = await fetch("/api/agents/backfill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          installation_id: installationId,
          owner: selectedRepo.owner.toLowerCase(),
          repo: selectedRepo.name.toLowerCase(),
          stack,
          brief,
        }),
      });

      if (!response.ok) {
        const info = await response.json().catch(() => ({}));
        throw new Error(info.error ?? `Analyze failed with status ${response.status}`);
      }

      setResultMessage("Analysis triggered. Check the board for results in a moment.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analyze failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700" htmlFor="repo">
          Repository
        </label>
        <select
          id="repo"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          value={selectedRepo?.fullName ?? ""}
          onChange={(event) => {
            const next = repositories.find((repo) => repo.fullName === event.target.value);
            setSelectedRepo(next ?? repositories[0]);
          }}
          disabled={!repositories.length || loading}
        >
          {repositories.map((repo) => (
            <option key={repo.id} value={repo.fullName}>
              {repo.fullName}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="framework">
            Framework
          </label>
          <input
            id="framework"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            value={stack.framework}
            onChange={(event) => setStack((prev) => ({ ...prev, framework: event.target.value }))}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="language">
            Language
          </label>
          <input
            id="language"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            value={stack.language}
            onChange={(event) => setStack((prev) => ({ ...prev, language: event.target.value }))}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="database">
            Database
          </label>
          <input
            id="database"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            value={stack.db}
            onChange={(event) => setStack((prev) => ({ ...prev, db: event.target.value }))}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700" htmlFor="brief">
          Brief
        </label>
        <textarea
          id="brief"
          className="h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          value={brief}
          onChange={(event) => setBrief(event.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !selectedRepo}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Analyzing…" : "Analyze repository"}
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {resultMessage ? <p className="text-sm text-emerald-600">{resultMessage}</p> : null}
      </div>
    </div>
  );
}
