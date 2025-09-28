import { NextRequest, NextResponse } from "next/server";
import { getInstallationOctokit } from "@/lib/github/client";

export async function POST(req: NextRequest) {
    try {
        const { owner, repo, ref = "main", installation_id } = await req.json();
        const octokit = await getInstallationOctokit(installation_id); 
        const repoInfo = await octokit.request("GET /repos/{owner}/{repo}", { owner, repo });
        const branch = ref || repoInfo.data.default_branch || "main";

        const { data: b } = await octokit.request(
            "GET /repos/{owner}/{repo}/branches/{branch}",
            { owner, repo, branch }
        );
        const treeSha = b.commit.commit.tree.sha;
        const { data } = await octokit.request(
            "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
            { owner, repo, tree_sha: treeSha, recursive: "1" }
        );
        const paths = (data.tree || []).filter((n: any) => n.type === "blob").map((n: any) => n.path);
        return NextResponse.json({ paths, ref: branch });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "list-tree failed" }, { status: 500 });
    }
}