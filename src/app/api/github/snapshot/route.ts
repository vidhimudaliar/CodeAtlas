import { getInstallationOctokit } from "@/lib/github/client";
import { NextRequest, NextResponse } from "next/server";

type FileEntry = { path: string; sha: string; size?: number };

async function getDefaultBranch(octokit: any, owner: string, repo: string) {
    const repoInfo = await octokit.request("GET /repos/{owner}/{repo}", { owner, repo });
    return repoInfo.data.default_branch || "main";
}

async function getTreeEntries(
    octokit: any,
    owner: string,
    repo: string,
    ref: string
): Promise<FileEntry[]> {
    // Resolve ref -> commit -> tree
    const { data: branchInfo } = await octokit.request(
        "GET /repos/{owner}/{repo}/branches/{branch}",
        { owner, repo, branch: ref }
    );
    const treeSha = branchInfo.commit.commit.tree.sha;

    const { data } = await octokit.request(
        "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
        { owner, repo, tree_sha: treeSha, recursive: "1" }
    );

    // Keep only blobs (files)
    return (data.tree || [])
        .filter((n: any) => n.type === "blob")
        .map((n: any) => ({ path: n.path as string, sha: n.sha as string, size: n.size }));
}

function isLikelyTextPath(p: string) {
    const lower = p.toLowerCase();
    // quick heuristic; keeps previews cheap
    return (
        lower.endsWith(".md") ||
        lower.endsWith(".json") ||
        lower.endsWith(".ts") ||
        lower.endsWith(".tsx") ||
        lower.endsWith(".js") ||
        lower.endsWith(".jsx") ||
        lower.endsWith(".yml") ||
        lower.endsWith(".yaml") ||
        lower.endsWith(".toml") ||
        lower.endsWith(".sql") ||
        lower.endsWith(".prisma")
    );
}

async function tryPreview(
    octokit: any,
    owner: string,
    repo: string,
    path: string,
    limit = 15000
) {
    try {
        if (!isLikelyTextPath(path)) return null;
        const { data } = await octokit.request(
            "GET /repos/{owner}/{repo}/contents/{path}",
            { owner, repo, path }
        );
        if (Array.isArray(data)) return null;
        if ("content" in data && typeof data.content === "string") {
            const raw = Buffer.from(data.content, "base64").toString("utf8");
            return { path, preview: raw.slice(0, limit) };
        }
    } catch {
        // ignore
    }
    return null;
}

async function getCompareSummary(
    octokit: any,
    owner: string,
    repo: string,
    base: string,
    head: string
) {
    try {
        const { data } = await octokit.request(
            "GET /repos/{owner}/{repo}/compare/{base}...{head}",
            { owner, repo, base, head }
        );
        const files = (data.files || []).slice(0, 100).map((f: any) => ({
            filename: f.filename as string,
            status: f.status as string, // added | modified | removed | renamed
            additions: f.additions as number,
            deletions: f.deletions as number,
            changes: f.changes as number,
            sha: f.sha as string,
            patch: typeof f.patch === "string" ? f.patch.slice(0, 4000) : undefined, // keep small
        }));
        return {
            base: data.base_commit?.sha || base,
            head: data.merge_base_commit?.sha ? data.commits?.at?.(-1)?.sha || head : head,
            ahead_by: data.ahead_by,
            behind_by: data.behind_by,
            files,
        };
    } catch {
        return null;
    }
}

export async function POST(req: NextRequest) {
    const start = Date.now();
    try {
        const {
            installation_id,
            owner,
            repo,
            stack,
            brief,
            ref,                 // optional override (branch/sha/tag)
            commit,              // optional { base?: string, head?: string }
        } = await req.json();

        console.log("[snapshot] incoming request", {
            installation_id,
            owner,
            repo,
            hasStack: Boolean(stack),
            briefLength: typeof brief === "string" ? brief.length : 0,
            ref,
            commit,
        });

        if (!installation_id || !owner || !repo) {
            console.error("[snapshot] missing required fields", {
                installation_id,
                owner,
                repo,
            });
            return NextResponse.json(
                { ok: false, error: "installation_id, owner, repo are required" },
                { status: 400 }
            );
        }

        const octokit = await getInstallationOctokit(Number(installation_id));
        console.log("[snapshot] octokit created for installation", installation_id);

        const defaultBranch = await getDefaultBranch(octokit, owner, repo);
        const resolvedRef = (typeof ref === "string" && ref.trim()) || defaultBranch;
        console.log("[snapshot] resolved ref", { defaultBranch, resolvedRef });

        const entries = await getTreeEntries(octokit, owner, repo, resolvedRef);
        const files = entries.map(e => e.path);
        console.log("[snapshot] tree entries", { count: entries.length });

        const likely = files.filter(p =>
            p.startsWith("app/") ||
            p.startsWith("pages/") ||
            p.startsWith("app/api/") ||
            p.includes("/migrations/") ||
            p.startsWith("sql/")
        ).slice(0, 40);

        const previewCandidates = Array.from(
            new Set(["README.md", "package.json", "next.config.js", "next.config.ts", ...likely])
        );
        console.log("[snapshot] preview candidates", { count: previewCandidates.length });

        const previews = (
            await Promise.all(previewCandidates.map(p => tryPreview(octokit, owner, repo, p)))
        ).filter(Boolean) as { path: string; preview: string }[];
        console.log("[snapshot] collected previews", { count: previews.length });

        let compare: any = null;
        if (commit?.base && commit?.head) {
            compare = await getCompareSummary(octokit, owner, repo, commit.base, commit.head);
            console.log("[snapshot] compare summary", {
                base: compare?.base,
                head: compare?.head,
                ahead_by: compare?.compare?.ahead_by,
                behind_by: compare?.compare?.behind_by,
            });
        }

        const langCounts: Record<string, number> = {};
        for (const p of files) {
            const ext = (p.split(".").pop() || "").toLowerCase();
            if (!ext) continue;
            langCounts[ext] = (langCounts[ext] || 0) + 1;
        }
        console.log("[snapshot] language distribution", langCounts);

        const response = {
            ok: true,
            snapshot: {
                defaultBranch,
                ref: resolvedRef,
                fileCount: files.length,
                files,
                entries,
                previews,
                langCounts,
            },
            commit: compare ? { base: compare.base, head: compare.head, compare } : null,
            stack, brief, owner, repo, installation_id,
        };

        console.log("[snapshot] finished", {
            durationMs: Date.now() - start,
            fileCount: files.length,
            previewCount: previews.length,
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error("[snapshot] unhandled error", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        return NextResponse.json(
            { ok: false, error: "Snapshot failed", detail: String(error) },
            { status: 500 }
        );
    }
}
