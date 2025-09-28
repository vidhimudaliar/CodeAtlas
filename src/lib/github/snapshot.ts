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
    const start = Date.now();
    let body: any;
    try {
        body = await req.json();
    } catch (err) {
        console.error("[snapshot] failed to parse JSON body", err);
        return NextResponse.json({ error: "invalid_json", detail: String(err) }, { status: 400 });
    }

    console.log("[snapshot] incoming request", body);
    const { installation_id, owner, repo, stack, brief, ref } = body;

    // Validate required fields early so caller sees clear errors
    const missing = { installation_id: !installation_id, owner: !owner, repo: !repo };
    if (missing.installation_id || missing.owner || missing.repo) {
        console.error("[snapshot] missing required fields", { installation_id, owner, repo });
        return NextResponse.json({ error: "missing_required_fields", missing, body }, { status: 400 });
    }

    let octokit: any;
    try {
        octokit = await getInstallationOctokit(Number(installation_id));
        console.log("[snapshot] octokit created for installation", installation_id);
    } catch (err) {
        console.error("[snapshot] getInstallationOctokit failed", err);
        return NextResponse.json({ error: "octokit_init_failed", detail: String(err) }, { status: 502 });
    }

    try {
        const defaultBranch = await getDefaultBranch(octokit, owner, repo);
        console.log("[snapshot] resolved ref", { defaultBranch, requestedRef: ref });

        const files = await getTreePaths(octokit, owner, repo, defaultBranch);
        console.log("[snapshot] tree entries count", files.length);

        // Pull a few key files for the planner’s context (keep it light)
        const previewPaths = ["README.md", "package.json", "next.config.js", "next.config.ts"];
        const likely = files.filter((p: any) =>
            p.startsWith("app/") ||
            p.startsWith("pages/") ||
            p.startsWith("app/api/") ||
            p.startsWith("sql/") || p.includes("/migrations/")
        ).slice(0, 40); // cap for speed

        const targets = [...new Set([...previewPaths, ...likely])];
        console.log("[snapshot] preview targets count", targets.length, { previewPathsCount: previewPaths.length, likelyCount: likely.length });

        const previews = (await Promise.all(
            targets.map(async p => {
                try {
                    const res = await getPreview(octokit, owner, repo, p);
                    if (res) return res;
                    return null;
                } catch (err) {
                    console.error(`[snapshot] preview fetch failed for ${p}`, err);
                    return null;
                }
            })
        )).filter(Boolean);

        console.log("[snapshot] previews fetched", previews.length);

        const elapsed = Date.now() - start;
        console.log("[snapshot] completed", { owner, repo, installation_id, elapsed });

        return NextResponse.json({ snapshot: { defaultBranch, files, previews }, stack, brief, owner, repo, installation_id });
    } catch (err) {
        console.error("[snapshot] unexpected error", err);
        return NextResponse.json({ error: "snapshot_failed", detail: String(err) }, { status: 502 });
    }
}
