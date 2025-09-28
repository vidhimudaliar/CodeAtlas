import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// HMAC SHA256 check (GitHub uses: "sha256=<hex>")
function verifySignature(raw: string, signatureHeader: string | null) {
    if (!signatureHeader?.startsWith("sha256=")) return false;
    const their = signatureHeader.slice(7);
    const hmac = crypto.createHmac("sha256", GITHUB_WEBHOOK_SECRET);
    const digest = hmac.update(raw).digest("hex");
    // timing-safe compare
    const a = Buffer.from(their, "hex");
    const b = Buffer.from(digest, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
    try {
        // raw body needed for signature verification
        const raw = await req.text();

        // smee forwards headers; signature survives
        const sig = req.headers.get("x-hub-signature-256");
        if (!verifySignature(raw, sig)) {
            console.warn("[webhook] signature mismatch");
            return NextResponse.json({ ok: false, error: "bad signature" }, { status: 401 });
        }

        // core headers
        const event = req.headers.get("x-github-event") || "unknown";
        const delivery = req.headers.get("x-github-delivery") || crypto.randomUUID();

        // idempotency (don’t process same delivery twice)
        const exists = await supabase
            .from("webhook_events")
            .select("id")
            .eq("delivery_id", delivery)
            .maybeSingle();
        if (exists.data?.id) {
            return NextResponse.json({ ok: true, deduped: true });
        }

        const payload = JSON.parse(raw);

        // Resolve project
        // repo.full_name is "owner/repo"; we also keep owner and repo separately if you store both
        const fullName =
            payload?.repository?.full_name ||
            payload?.installation?.repositories?.[0]?.full_name ||
            "";
        const [owner, repo] = fullName.split("/");
        if (!owner || !repo) {
            return NextResponse.json({ ok: false, error: "no repo in payload" }, { status: 400 });
        }

        // upsert webhook receipt (for debug + idempotency)
        await supabase.from("webhook_events").insert({
            project_id: null, // we'll fill after lookup
            delivery_id: delivery,
            event_type: event,
            payload,
        });

        // find project_id
        const proj = await supabase
            .from("projects")
            .select("id")
            .eq("owner", owner)
            .eq("repo", `${owner}/${repo}`)  // make sure this matches how you persist repo
            .maybeSingle();

        const projectId = proj.data?.id ?? null;

        // if project not found, just acknowledge
        if (!projectId) {
            return NextResponse.json({ ok: true, note: "no matching project" });
        }

        // Update the webhook row now that we know project_id
        await supabase
            .from("webhook_events")
            .update({ project_id: projectId })
            .eq("delivery_id", delivery);

        // Quick path: handle push events with file lists
        if (event === "push") {
            const branch = payload.ref?.replace("refs/heads/", "") || "unknown";
            const commits = payload.commits ?? [];
            // minimal “ingest” to commits + commit_files
            for (const c of commits) {
                await supabase
                    .from("commits")
                    .upsert(
                        {
                            project_id: projectId,
                            sha: c.id,
                            branch,
                            author_login: c.author?.username,
                            author_name: c.author?.name,
                            committed_at: c.timestamp,
                            message: c.message,
                            html_url: c.url,
                        },
                        { onConflict: "project_id,sha" }
                    );

                const files: { path: string; change: "added" | "modified" | "removed" }[] = [
                    ...(c.added || []).map((p: string) => ({ path: p, change: "added" as const })),
                    ...(c.modified || []).map((p: string) => ({ path: p, change: "modified" as const })),
                    ...(c.removed || []).map((p: string) => ({ path: p, change: "removed" as const })),
                ];

                if (files.length) {
                    await supabase
                        .from("commit_files")
                        .upsert(
                            files.map((f) => ({
                                project_id: projectId,
                                sha: c.id,
                                path: f.path,
                                change: f.change,
                            })),
                            { onConflict: "project_id,sha,path" }
                        );
                }
            }

            // Kick the orchestrator AI for the HEAD commit
            const headSha = payload.after || commits[commits.length - 1]?.id;
            if (headSha) {
                await triggerOrchestrator({
                    projectId,
                    owner,
                    repo: `${owner}/${repo}`,
                    branch,
                    sha: headSha,
                });
            }
        }

        // You can add PR events similarly (to fetch full file list from GitHub API)

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error("[webhook] error", e);
        return NextResponse.json({ ok: false, error: e.message ?? "webhook failed" }, { status: 500 });
    }
}

// Call your ADK agent or internal worker
async function triggerOrchestrator(input: {
    projectId: string;
    owner: string;
    repo: string;
    branch: string;
    sha: string;
}) {
    // Option A: call your own Next route that runs the mapping/AI
    await fetch("http://localhost:3000/api/orchestrator/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    // Option B: call the ADK directly:
    // await fetch("http://127.0.0.1:8000/run", { ... })
}
