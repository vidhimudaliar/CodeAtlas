// app/api/agents/planner/run/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

const ADK = process.env.ADK_BASE_URL ?? "http://127.0.0.1:8000";
const APP_NAME = process.env.ADK_APP_NAME ?? "planner";
const AGENT_NAME = process.env.ADK_AGENT_NAME ?? "Planner";
const USER_ID = process.env.ADK_USER_ID ?? "9d926bf1-1579-47f3-8304-28efeb3e074a";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[planner/run] incoming request body", body);
    const {
      installation_id,
      owner, repo,
      ref = "main",
      commit,               // optional { base, head }
      limits = { sampleFilesPerBucket: 12, maxBytesPerFile: 100_000 },
      preferences = { maxDepth: 4 },
      context = {}          // optional extra: stack, brief, etc.
    } = body;

    if (!owner || !repo) {
      console.error("[planner/run] missing owner or repo", { owner, repo });
      return NextResponse.json({ ok: false, error: "owner & repo required" }, { status: 400 });
    }
    if (!installation_id) {
      console.error("[planner/run] missing installation_id");
      return NextResponse.json({ ok: false, error: "installation_id required" }, { status: 400 });
    }

    // 1) Create session
    const sessionId = randomUUID();
    const sessionUrl = `${ADK}/apps/${APP_NAME}/users/${USER_ID}/sessions/${sessionId}`;
    const sess = await fetch(sessionUrl, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent: AGENT_NAME })
    });
    console.log("[planner/run] session create response status", sess.status);
    if (!sess.ok) {
      return NextResponse.json(
        { ok: false, error: "session_create_failed", detail: await sess.text() },
        { status: 502 }
      );
    }

    // 2) Send a single, clean JSON message (the agent has the instruction)
    // Ensure we supply the ADK-required keys: snapshot, brief, userId, stack
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || `${req.nextUrl.protocol}//${req.headers.get("host")}`;

    const snapRes = await fetch(`${baseUrl}/api/github/snapshot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ installation_id, owner, repo, stack: context?.stack ?? {}, brief: context?.brief ?? "" }),
    });
    console.log("[planner/run] snapshot endpoint status", snapRes.status, "ok", snapRes.ok);
    let snapText: string | null = null;
    try { snapText = await snapRes.text(); } catch (e) { snapText = null; }
    console.log("[planner/run] snapshot raw response", snapText);
    if (!snapRes.ok) {
      return NextResponse.json(
        { ok: false, error: "snapshot_fetch_failed", detail: snapText },
        { status: 502 }
      );
    }
    let snapJson: any = null;
    try { snapJson = JSON.parse(snapText ?? "null"); } catch (e) { snapJson = null; }
    const snapshot = snapJson?.snapshot;
    console.log("[planner/run] parsed snapshot present", Boolean(snapshot));
    if (!snapshot) {
      console.error("[planner/run] snapshot missing from snapshot endpoint response", snapJson);
      return NextResponse.json(
        { ok: false, error: "snapshot_missing", body: snapJson },
        { status: 502 }
      );
    }

    const message = {
      owner,
      repo,
      ref,
      commit,
      limits,
      preferences,
      // Provide context and the ADK-required fields
      context,
      userId: USER_ID,
      brief: context?.brief ?? "",
      stack: context?.stack ?? {},
      snapshot,
    };

    const run = await fetch(`${ADK}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        appName: APP_NAME,
        userId: USER_ID,
        sessionId,
        agent: AGENT_NAME,
        newMessage: { role: "user", parts: [{ text: JSON.stringify(message) }] }
      })
    });

    console.log("[planner/run] ADK /run status", run.status);
    let runText: string | null = null;
    try { runText = await run.text(); } catch (e) { runText = null; }
    console.log("[planner/run] ADK /run raw response", runText?.slice(0, 1000));
    if (!run.ok) {
      return NextResponse.json(
        { ok: false, error: "run_failed", detail: runText },
        { status: 502 }
      );
    }

    // 5) unwrap response: handle both JSON and text, with or without code fences
    const contentType = run.headers.get("content-type") || "";
    let raw: unknown = runText;
    if (contentType.includes("application/json")) {
      try {
        raw = runText ? JSON.parse(runText) : null;
      } catch (parseErr) {
        console.warn("[planner/run] failed to parse JSON run response", parseErr);
        raw = runText;
      }
    }

    const { plan, jsonText, sample } = extractPlan(raw);
    if (!plan || !Array.isArray((plan as any).nodes) || !Array.isArray((plan as any).edges)) {
      return NextResponse.json(
        { ok: false, stage: "unwrap", error: "plan_missing_or_invalid", sample },
        { status: 502 }
      );
    }

    // 6) Persist to the planner/store endpoint (the older store that expects { owner, repo, blob })
    const storeBlob = jsonText ?? JSON.stringify(plan);
    let storeResult: any = null;
    try {
      const storeRes = await fetch(`${baseUrl}/api/agents/planner/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo, ownerUserId: USER_ID, blob: storeBlob })
      });
      const storeText = await storeRes.text();
      console.log('[planner/run] store endpoint status', storeRes.status);
      try { storeResult = JSON.parse(storeText); } catch { storeResult = storeText; }
      if (!storeRes.ok) console.warn('[planner/run] store failed', storeResult);
    } catch (storeErr) {
      console.error('[planner/run] error calling store endpoint', storeErr);
      storeResult = { ok: false, error: String(storeErr) };
    }

    return NextResponse.json({ ok: true, plan, jsonText: jsonText ?? JSON.stringify(plan), store: storeResult });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message ?? String(e) }, { status: 500 });
  }
}

function unwrapPlan(raw: any): { plan: any, jsonText: string | null } {
  // direct
  if (raw?.plan?.nodes && raw?.plan?.edges) {
    return { plan: raw.plan, jsonText: JSON.stringify(raw.plan) };
  }
  // events → messages → parts[].text
  const texts: string[] = [];
  collectTexts(raw, texts);
  for (const t of texts) {
    const s = stripFence(t);
    try {
      const p = JSON.parse(s);
      if (p?.plan?.nodes && p?.plan?.edges) return { plan: p.plan, jsonText: s };
      if (p?.nodes && p?.edges) return { plan: p, jsonText: s };
    } catch { }
  }
  return { plan: null, jsonText: null };
}

function collectTexts(node: any, out: string[]) {
  if (!node) return;
  if (typeof node === "string") { out.push(node); return; }
  if (Array.isArray(node)) { node.forEach(n => collectTexts(n, out)); return; }
  if (typeof node === "object") {
    if (typeof node.text === "string") out.push(node.text);
    if (Array.isArray(node.messages)) {
      for (const m of node.messages) {
        if (typeof m?.content === "string") out.push(m.content);
        if (Array.isArray(m?.parts)) for (const p of m.parts) if (typeof p?.text === "string") out.push(p.text);
      }
    }
    for (const v of Object.values(node)) collectTexts(v, out);
  }
}

// function stripFence(s: string) { s = s.trim(); return s.startsWith("```") ? s.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "").trim() : s; }

async function safeText(res: Response) {
  try {
    const t = await res.text();
    try {
      const j = JSON.parse(t);
      return j;
    } catch {
      return t;
    }
  } catch {
    return null;
  }
}

function extractPlan(raw: unknown): { plan: any; jsonText: string | null; sample?: string } {
  // Case 1: already a JSON object containing plan
  if (raw && typeof raw === "object") {
    const direct = tryExtractFromObject(raw as any);
    if (direct) return direct;
  }

  // Case 2: array of events (common ADK streaming)
  if (Array.isArray(raw)) {
    for (const ev of raw) {
      const fromEv = tryExtractFromObject(ev);
      if (fromEv) return fromEv;
    }
  }

  // Case 3: plain text → try parse JSON (strip ```json fences if present)
  if (typeof raw === "string") {
    const cleaned = stripFence(raw);
    const parsed = tryParsePlan(cleaned);
    if (parsed) return parsed;
    return { plan: null, jsonText: null, sample: cleaned.slice(0, 500) };
  }

  return { plan: null, jsonText: null, sample: JSON.stringify(raw).slice(0, 500) };
}

function tryExtractFromObject(obj: any): { plan: any; jsonText: string | null } | null {
  // Direct
  if (obj?.plan?.nodes && obj?.plan?.edges) {
    return { plan: obj.plan, jsonText: JSON.stringify(obj.plan) };
  }
  if (obj?.nodes && obj?.edges) {
    return { plan: obj, jsonText: JSON.stringify(obj) };
  }
  // ADK messages
  const msgs = obj?.messages;
  if (Array.isArray(msgs)) {
    for (const m of msgs) {
      const parts = m?.parts;
      if (Array.isArray(parts)) {
        for (const p of parts) {
          if (typeof p?.text === "string") {
            const cleaned = stripFence(p.text);
            const parsed = tryParsePlan(cleaned);
            if (parsed) return parsed;
          }
        }
      }
      if (typeof m?.content === "string") {
        const cleaned = stripFence(m.content);
        const parsed = tryParsePlan(cleaned);
        if (parsed) return parsed;
      }
    }
  }
  // Event content (content.parts[].text)
  const parts = obj?.content?.parts;
  if (Array.isArray(parts)) {
    for (const p of parts) {
      if (typeof p?.text === "string") {
        const cleaned = stripFence(p.text);
        const parsed = tryParsePlan(cleaned);
        if (parsed) return parsed;
      }
    }
  }
  return null;
}

function tryParsePlan(text: string | null): { plan: any; jsonText: string } | null {
  if (!text) return null;
  try {
    const j = JSON.parse(text);
    if (j?.plan?.nodes && j?.plan?.edges) return { plan: j.plan, jsonText: text };
    if (j?.nodes && j?.edges) return { plan: j, jsonText: text };
  } catch { }
  // heuristic: last JSON object in string
  const match = text.match(/\{[\s\S]*\}$/);
  if (match) {
    try {
      const j = JSON.parse(match[0]);
      if (j?.plan?.nodes && j?.plan?.edges) return { plan: j.plan, jsonText: match[0] };
      if (j?.nodes && j?.edges) return { plan: j, jsonText: match[0] };
    } catch { }
  }
  return null;
}

function stripFence(s: string): string {
  const t = s.trim();
  if (t.startsWith("```")) {
    return t
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();
  }
  return t;
}
