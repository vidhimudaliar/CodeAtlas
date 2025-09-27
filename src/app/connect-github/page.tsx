"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STATE_STORAGE_KEY = "codeatlas-gh-app-state";

export default function ConnectGitHub() {
  const appSlug = process.env.NEXT_PUBLIC_GH_APP_SLUG;
  const [state, setState] = useState<string | null>(null);

  useEffect(() => {
    const existing = window.sessionStorage.getItem(STATE_STORAGE_KEY);
    if (existing) {
      setState(existing);
      return;
    }

    const nextState = window.crypto.randomUUID();
    window.sessionStorage.setItem(STATE_STORAGE_KEY, nextState);
    setState(nextState);
  }, []);

  const installUrl = useMemo(() => {
    if (!appSlug || !state) {
      return null;
    }
    const target = new URL(`https://github.com/apps/${appSlug}/installations/new`);
    target.searchParams.set("state", state);
    return target.toString();
  }, [appSlug, state]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Connect GitHub</h1>
        <p className="text-sm text-gray-600">
          Install the CodeAtlas GitHub App on the repository you want to analyze. GitHub will bring you
          back here once the installation is complete.
        </p>
      </header>

      {!appSlug ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          <strong>Missing configuration.</strong> Set <code>NEXT_PUBLIC_GH_APP_SLUG</code> in your environment
          to continue.
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <a
          href={installUrl ?? undefined}
          className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          aria-disabled={!installUrl}
        >
          Install GitHub App
        </a>
        <span className="text-xs text-gray-500">You&apos;ll pick a repository on GitHub.</span>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p className="mb-2 font-medium">What happens next?</p>
        <ol className="list-inside list-decimal space-y-1">
          <li>GitHub prompts you to choose the installation target.</li>
          <li>After installing, GitHub redirects to <code>/callback/github</code>.</li>
          <li>We list every repository the app can access so you can choose one to analyze.</li>
        </ol>
      </div>

      <p className="text-sm text-slate-600">
        Already installed the app? Head straight to the <Link href="/callback/github" className="text-indigo-600">
          callback page
        </Link>{" "}
        to refresh your repositories.
      </p>
    </div>
  );
}
