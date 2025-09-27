import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalyzeForm } from "./analyze-form";
import { listInstallationRepositories } from "@/lib/github/actions";

interface AnalyzePageProps {
  searchParams?: {
    installation_id?: string | string[];
    repo?: string | string[];
  };
}

export default async function AnalyzePage({ searchParams }: AnalyzePageProps) {
  const installationParam = searchParams?.installation_id;
  const repoParam = searchParams?.repo;

  const installationIdValue = Array.isArray(installationParam) ? installationParam[0] : installationParam;
  const repoFullName = Array.isArray(repoParam) ? repoParam[0] : repoParam;

  if (!installationIdValue) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 p-8">
        <h1 className="text-2xl font-semibold">Pick a repository to analyze</h1>
        <p className="text-sm text-slate-600">
          Provide an <code>installation_id</code> in the query string (e.g. <code>?installation_id=12345</code>)
          after finishing the GitHub App installation.
        </p>
        <p className="text-sm text-slate-600">
          Need to install the app first? Visit the <Link href="/connect-github" className="text-indigo-600 underline">connect
            page</Link>.
        </p>
      </div>
    );
  }

  const installationId = Number(installationIdValue);

  if (!Number.isInteger(installationId) || installationId <= 0) {
    notFound();
  }

  let repositories = [];

  try {
    repositories = await listInstallationRepositories(installationId);
  } catch (error) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 p-8">
        <h1 className="text-2xl font-semibold">Unable to load repositories</h1>
        <p className="text-sm text-red-600">{error instanceof Error ? error.message : "Unexpected error"}</p>
        <p className="text-sm text-slate-600">
          Double-check that the GitHub App is installed and that this environment has access to the app&apos;s private
          key.
        </p>
        <Link href="/callback/github" className="text-sm text-indigo-600 underline">
          Return to the callback page
        </Link>
      </div>
    );
  }

  if (!repositories.length) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 p-8">
        <h1 className="text-2xl font-semibold">No repositories found</h1>
        <p className="text-sm text-slate-600">
          The installation <code>{installationId}</code> does not have any repositories granted. Update the
          installation on GitHub to include at least one repository, then reload this page.
        </p>
        <Link href="/callback/github" className="text-sm text-indigo-600 underline">
          Back to installation callback
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Analyze a repository</h1>
        <p className="text-sm text-slate-600">
          Pick a repository from installation <code className="font-mono">{installationId}</code>, tweak the brief,
          and kick off a backfill run via the Planner ADK.
        </p>
      </header>

      <AnalyzeForm
        installationId={installationId}
        repositories={repositories}
        initialRepoFullName={repoFullName}
      />
    </div>
  );
}
