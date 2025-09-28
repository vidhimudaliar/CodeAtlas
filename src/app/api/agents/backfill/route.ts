import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const ADK_BASE_URL = process.env.ADK_BASE_URL ?? "http://127.0.0.1:8000";
const APP_NAME = process.env.ADK_APP_NAME ?? "agent";        // your ADK app name
const AGENT_NAME = process.env.ADK_AGENT_NAME ?? "Planner";     // your agent name in ADK
const AGENT_USER = process.env.ADK_USER_ID ?? "local";          // user bucket in ADK

export async function POST(req: NextRequest) {
  try {
    const {
      installation_id,
      owner,
      repo,
      stack = {},
      brief = "",
      ref,
      commit, // optional: { base, head }
    } = await req.json();

    if (!installation_id || !owner || !repo) {
      return NextResponse.json(
        { ok: false, error: "installation_id, owner, repo are required" },
        { status: 400 }
      );
    }

    // 1) quick snapshot (reuse your existing endpoint so you can infer default branch, etc.)
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.BASE_URL ||
      `${req.nextUrl.protocol}//${req.headers.get("host")}`;

    const snapRes = await fetch(`${baseUrl}/api/github/snapshot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ installation_id, owner, repo, stack, brief }),
    });
    if (!snapRes.ok) {
      return NextResponse.json(
        { ok: false, stage: "snapshot", error: await snapRes.text() },
        { status: 502 }
      );
    }
    const snapJson = await snapRes.json();
    const snapshot = snapJson?.snapshot;
    // If the snapshot endpoint did not return a snapshot object, abort early.
    // The agent expects a snapshot in the input; calling ADK without it causes
    // errors like: "Missing key 'snapshot'". Return the snapshot endpoint
    // response to help diagnose the failure.
    if (!snapshot) {
      return NextResponse.json(
        { ok: false, stage: "snapshot", error: "snapshot_missing", body: snapJson },
        { status: 502 }
      );
    }

    await fetch("/api/agents/planner/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner: "acme", repo: "web",
        ref: "main",
        // optional:
        commit: { base: "abc123", head: "def456" },
        limits: { sampleFilesPerBucket: 10, maxBytesPerFile: 80_000 },
        preferences: { maxDepth: 4 },
        context: { stack: { framework: "nextjs", language: "ts", db: "postgres" }, brief: "dashboard + auth" }
      })
    });
    const branch = ref ?? snapshot?.defaultBranch ?? "main";

    // 2) create session (camelCase URL shape for ADK)
    // const sessionId = randomUUID();
    // const sessUrl = `${ADK_BASE_URL}/apps/${APP_NAME}/users/${AGENT_USER}/sessions/${sessionId}`;
    // const sess = await fetch(sessUrl, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   // Some ADK builds want the agent name here; harmless if ignored.
    //   body: JSON.stringify({ agent: AGENT_NAME }),
    // });
    // if (!sess.ok) {
    //   return NextResponse.json(
    //     { ok: false, stage: "session", error: await safeText(sess) },
    //     { status: 502 }
    //   );
    // }

    // 3) build the single JSON message the agent expects (NO prose, NO code fences)
    // const message = JSON.stringify({
    //   owner,
    //   repo,
    //   ref: branch,
    //   commit: {
    //     base: commit?.base ?? null,
    //     head: commit?.head ?? null,
    //   },
    //   // The agent will call tools to fetch real files/diff.
    //   limits: { maxFileBytes: 100_000, maxFilesPerBucket: 50 },
    //   preferences: { roots: ["frontend", "backend", "dev"], maxDepth: 4, branch },
    //   // Optional extra context (the agent may ignore this; keep it small)
    //   context: { stack, brief },
    // });

    // 4) run the agent (ADK /run schema: camelCase + parts[].text string)
    // const run = await fetch(`${ADK_BASE_URL}/run`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json", Accept: "application/json" },
    //   body: JSON.stringify({
    //     appName: APP_NAME,
    //     userId: AGENT_USER,
    //     sessionId,
    //     newMessage: { role: "user", parts: [{ text: message }] },
    //   }),
    // });
    // if (!run.ok) {
    //   return NextResponse.json(
    //     { ok: false, stage: "run", error: await safeText(run) },
    //     { status: 502 }
    //   );
    // }

    // 5) unwrap response: handle both JSON and text, with or without code fences
    // const contentType = run.headers.get("content-type") || "";
    // let raw: unknown;
    // if (contentType.includes("application/json")) raw = await run.json();
    // else raw = await run.text();

    // const { plan, jsonText, sample } = extractPlan(raw);
    // if (!plan || !Array.isArray((plan as any).nodes) || !Array.isArray((plan as any).edges)) {
    //   return NextResponse.json(
    //     { ok: false, stage: "unwrap", error: "plan_missing_or_invalid", sample },
    //     { status: 502 }
    //   );
    // }

    // 6) OPTIONAL: persist immediately to your store endpoint
    // Uncomment if you want auto-save:
    // const persist = await fetch(`${baseUrl}/api/agents/planner/store`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ owner, repo, blob: jsonText ?? JSON.stringify(plan) }),
    // });
    // const persistBody = await safeText(persist);

    return NextResponse.json({
      ok: true,
      // plan,
      // jsonText: jsonText ?? JSON.stringify(plan),
      // persist: { status: persist.status, body: persistBody },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}

/* ---------------- helpers ---------------- */

// async function safeText(res: Response) {
//   try {
//     const t = await res.text();
//     try {
//       const j = JSON.parse(t);
//       return j;
//     } catch {
//       return t;
//     }
//   } catch {
//     return null;
//   }
// }

// function extractPlan(raw: unknown): { plan: any; jsonText: string | null; sample?: string } {
//   // Case 1: already a JSON object containing plan
//   if (raw && typeof raw === "object") {
//     const direct = tryExtractFromObject(raw as any);
//     if (direct) return direct;
//   }

//   // Case 2: array of events (common ADK streaming)
//   if (Array.isArray(raw)) {
//     for (const ev of raw) {
//       const fromEv = tryExtractFromObject(ev);
//       if (fromEv) return fromEv;
//     }
//   }

//   // Case 3: plain text → try parse JSON (strip ```json fences if present)
//   if (typeof raw === "string") {
//     const cleaned = stripFence(raw);
//     const parsed = tryParsePlan(cleaned);
//     if (parsed) return parsed;
//     return { plan: null, jsonText: null, sample: cleaned.slice(0, 500) };
//   }

//   return { plan: null, jsonText: null, sample: JSON.stringify(raw).slice(0, 500) };
// }

// function tryExtractFromObject(obj: any): { plan: any; jsonText: string | null } | null {
//   // Direct
//   if (obj?.plan?.nodes && obj?.plan?.edges) {
//     return { plan: obj.plan, jsonText: JSON.stringify(obj.plan) };
//   }
//   if (obj?.nodes && obj?.edges) {
//     return { plan: obj, jsonText: JSON.stringify(obj) };
//   }
//   // ADK messages
//   const msgs = obj?.messages;
//   if (Array.isArray(msgs)) {
//     for (const m of msgs) {
//       const parts = m?.parts;
//       if (Array.isArray(parts)) {
//         for (const p of parts) {
//           if (typeof p?.text === "string") {
//             const cleaned = stripFence(p.text);
//             const parsed = tryParsePlan(cleaned);
//             if (parsed) return parsed;
//           }
//         }
//       }
//       if (typeof m?.content === "string") {
//         const cleaned = stripFence(m.content);
//         const parsed = tryParsePlan(cleaned);
//         if (parsed) return parsed;
//       }
//     }
//   }
//   // Event content (content.parts[].text)
//   const parts = obj?.content?.parts;
//   if (Array.isArray(parts)) {
//     for (const p of parts) {
//       if (typeof p?.text === "string") {
//         const cleaned = stripFence(p.text);
//         const parsed = tryParsePlan(cleaned);
//         if (parsed) return parsed;
//       }
//     }
//   }
//   return null;
// }

// function tryParsePlan(text: string | null): { plan: any; jsonText: string } | null {
//   if (!text) return null;
//   try {
//     const j = JSON.parse(text);
//     if (j?.plan?.nodes && j?.plan?.edges) return { plan: j.plan, jsonText: text };
//     if (j?.nodes && j?.edges) return { plan: j, jsonText: text };
//   } catch { }
//   // heuristic: last JSON object in string
//   const match = text.match(/\{[\s\S]*\}$/);
//   if (match) {
//     try {
//       const j = JSON.parse(match[0]);
//       if (j?.plan?.nodes && j?.plan?.edges) return { plan: j.plan, jsonText: match[0] };
//       if (j?.nodes && j?.edges) return { plan: j, jsonText: match[0] };
//     } catch { }
//   }
//   return null;
// }

// function stripFence(s: string): string {
//   const t = s.trim();
//   if (t.startsWith("```")) {
//     return t
//       .replace(/^```json\s*/i, "")
//       .replace(/^```\s*/i, "")
//       .replace(/```$/i, "")
//       .trim();
//   }
//   return t;
// }
