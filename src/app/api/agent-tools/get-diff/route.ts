import { NextRequest, NextResponse } from "next/server";
import { getInstallationOctokit } from "@/lib/github/client";

export async function POST(req: NextRequest) {
    try {
        const { owner, repo, base, head, installation_id } = await req.json();
        const octokit = await getInstallationOctokit(installation_id);
        const { data } = await octokit.rest.repos.compareCommits({
            owner, repo, base, head
        });
        const changed = (data.files || []).map(f => ({
            path: f.filename,
            status: f.status
        }));
        return NextResponse.json({ changed, base, head });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "get-diff failed" }, { status: 500 });
    }
}