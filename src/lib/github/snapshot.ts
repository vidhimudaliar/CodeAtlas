import { NextRequest, NextResponse } from "next/server";
import { getInstallationOctokit } from "./client";

async function getDefaultBranch(octokit: any, owner: string, repo: string) {
    const repoInfo = await octokit.request("GET /repos/{owner}/{repo}", { owner, repo });
    return repoInfo.data.default_branch || "main";
}

async function getTreePaths(octokit: any, owner: string, repo: string, branch: string) {
    const { data: branchInfo } = await octokit.request(
        "GET /repos/{owner}/{repo}/branches/{branch}",
        { owner, repo, branch }
    );
    const treeSha = branchInfo.commit.commit.tree.sha;
    const { data } = await octokit.request(
        "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
        { owner, repo, tree_sha: treeSha, recursive: "1" }
    );
    // blob = file; dir = tree
    return (data.tree || []).filter((n: any) => n.type === "blob").map((n: any) => n.path);
}

async function getPreview(octokit: any, owner: string, repo: string, path: string, limit = 15000) {
    try {
        const { data } = await octokit.request(
            "GET /repos/{owner}/{repo}/contents/{path}",
            { owner, repo, path }
        );
        if (Array.isArray(data)) return null;
        if ("content" in data && typeof data.content === "string") {
            const raw = Buffer.from(data.content, "base64").toString("utf8");
            return { path, preview: raw.slice(0, limit) };
        }
    } catch { /* ignore missing */ }
    return null;
}

export async function POST(req: NextRequest) {
    const { installation_id, owner, repo, stack, brief } = await req.json();
    const octokit = await getInstallationOctokit(Number(installation_id));

    const defaultBranch = await getDefaultBranch(octokit, owner, repo);
    const files = await getTreePaths(octokit, owner, repo, defaultBranch);

    // Pull a few key files for the planner’s context (keep it light)
    const previewPaths = [
        "README.md", "package.json", "next.config.js", "next.config.ts",
    ];
    // Common Next.js signals (optional, capped)
    const likely = files.filter((p: any) =>
        p.startsWith("app/") ||
        p.startsWith("pages/") ||
        p.startsWith("app/api/") ||
        p.startsWith("sql/") || p.includes("/migrations/")
    ).slice(0, 40); // cap for speed
    const targets = [...new Set([...previewPaths, ...likely])];

    const previews = (await Promise.all(
        targets.map(p => getPreview(octokit, owner, repo, p))
    )).filter(Boolean);

    return NextResponse.json({
        snapshot: { defaultBranch, files, previews },
        stack, brief, owner, repo, installation_id
    });
}
