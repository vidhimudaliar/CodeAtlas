"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { InstallationRepository } from "@/lib/github/installations";

type LoadState = "idle" | "loading" | "error" | "ready";

const STATE_STORAGE_KEY = "codeatlas-gh-app-state";

export default function GitHubCallbackPage() {
  const [repos, setRepos] = useState<InstallationRepository[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadState>("idle");
  const [setupAction, setSetupAction] = useState<string | null>(null);
  const [installationId, setInstallationId] = useState<number | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const installationParam = url.searchParams.get("installation_id");
    const action = url.searchParams.get("setup_action");
    const returnedState = url.searchParams.get("state");

    setSetupAction(action);

    if (!installationParam) {
      setError("Missing installation identifier. Try running the installation again.");
      setStatus("error");
      return;
    }

    const parsedInstallation = Number(installationParam);
    if (!Number.isInteger(parsedInstallation) || parsedInstallation <= 0) {
      setError("Invalid installation identifier returned by GitHub.");
      setStatus("error");
      return;
    }

    const storedState = window.sessionStorage.getItem(STATE_STORAGE_KEY);
    if (storedState && returnedState && storedState !== returnedState) {
      setError("State mismatch. Start the installation flow from the connect page again.");
      setStatus("error");
      return;
    }

    setInstallationId(parsedInstallation);
    setStatus("loading");

    fetch(`/api/github/installation?installation_id=${parsedInstallation}`)
      .then(async (response) => {
        if (!response.ok) {
          const info = await response.json().catch(() => ({}));
          throw new Error(info.error ?? `Request failed with status ${response.status}`);
        }

        return (await response.json()) as { repositories: InstallationRepository[] };
      })
      .then((payload) => {
        const sorted = [...payload.repositories].sort((a, b) => a.fullName.localeCompare(b.fullName));
        setRepos(sorted);
        setStatus("ready");
      })
      .catch((err: Error) => {
        setError(err.message);
        setStatus("error");
      });
  }, []);

  const heading = useMemo(() => {
    if (status === "ready") {
      return "GitHub App connected";
    }
    if (status === "error") {
      return "Something went wrong";
    }
    if (status === "loading") {
      return "Fetching repositories";
    }
    return "Finalising installation";
  }, [status]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{heading}</h1>
        <p className="text-sm text-slate-600">
          {status === "ready"
            ? "Pick a repository below to kick off analysis with CodeAtlas."
            : "We&apos;re finishing the handshake with GitHub and gathering the repositories you granted to the app."}
        </p>
      </header>

      {status === "loading" ? (
        <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Contacting GitHub for the list of repositories your installation can access…
        </div>
      ) : null}

      {status === "error" && error ? (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">We couldn&apos;t finish connecting the app.</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2">
            Try restarting from the <Link href="/connect-github" className="text-red-700 underline">
              connect page
            </Link>
            .
          </p>
        </div>
      ) : null}

      {status === "ready" ? (
        <section className="space-y-4">
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <p className="font-medium">The GitHub App is installed!</p>
            <p className="mt-1">
              {setupAction === "update" ? "Installation updated." : "New installation created."} You can now
              choose any repository from the list below.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3 text-sm text-slate-500">
              Showing {repos.length} repository{repos.length === 1 ? "" : "ies"} for installation
              {" "}
              <code className="font-mono">{installationId}</code>
            </div>
            <ul className="divide-y divide-slate-200">
              {repos.map((repo) => (
                <li key={repo.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{repo.fullName}</p>
                    <p className="text-xs text-slate-500">
                      Default branch <code className="font-mono">{repo.defaultBranch}</code>
                      {repo.private ? " • Private" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-indigo-600">
                    {repo.htmlUrl ? (
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:underline"
                      >
                        Open in GitHub
                      </a>
                    ) : null}
                    <Link
                      href={installationId
                        ? `/analyze?installation_id=${installationId}&repo=${encodeURIComponent(repo.fullName)}`
                        : "/analyze"}
                      className="font-medium hover:underline"
                    >
                      Analyze with CodeAtlas
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <footer className="text-xs text-slate-500">
        Need to install on a different org or user account? Return to the
        {" "}
        <Link href="/connect-github" className="text-indigo-600 hover:underline">
          connect page
        </Link>
        .
      </footer>
    </div>
  );
}
