import { NextRequest, NextResponse } from "next/server";
import { getInstallationOctokit } from "@/lib/github/client";

export async function POST(req: NextRequest) {
    try {
        const { paths = [], maxBytes = 120_000, owner, repo, installation_id } = await req.json();
        const octokit = await getInstallationOctokit(installation_id);
        const files: any[] = [];
        // limit to ~40 files for speed
        const pick = (paths as string[]).slice(0, 40);
        for (const path of pick) {
            try {
                const { data } = await octokit.request(
                    "GET /repos/{owner}/{repo}/contents/{path}",
                    { owner, repo, path }
                );
                if (!Array.isArray(data) && data.type === "file" && typeof data.content === "string") {
                    const buf = Buffer.from(data.content, "base64");
                    const text = buf.toString("utf8").slice(0, maxBytes);
                    files.push({ path, text, truncated: buf.length > maxBytes });
                }
            } catch {/* skip missing/binary */ }
        }
        return NextResponse.json({ files });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "get-files failed" }, { status: 500 });
    }
}