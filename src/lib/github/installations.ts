import { getInstallationOctokit } from "./client";

export interface InstallationRepository {
  id: number;
  name: string;
  fullName: string;
  htmlUrl?: string;
  owner: string;
  private: boolean;
  defaultBranch: string;
}

export async function listInstallationRepositories(installationId: number): Promise<InstallationRepository[]> {
  const octokit = await getInstallationOctokit(installationId);
  const repositories = await octokit.paginate(octokit.rest.apps.listReposAccessibleToInstallation, {
    per_page: 100,
  });

  return repositories
    .map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      htmlUrl: repo.html_url ?? undefined,
      owner: repo.owner?.login ?? "",
      private: Boolean(repo.private),
      defaultBranch: repo.default_branch,
    }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}
