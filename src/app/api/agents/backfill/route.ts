// app/api/agents/backfill/route.ts
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const ADK_BASE_URL = process.env.ADK_BASE_URL ?? "http://localhost:8000";

function resolveBaseUrl(req: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BASE_URL ||
    `${req.nextUrl.protocol}//${req.headers.get("host")}` ||
    "http://127.0.0.1:3000"
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { installation_id, owner, repo, stack, brief } = body;
  const rawUserId = typeof body.userId === "string" ? body.userId.trim() : "";
  const agentUserId = rawUserId.length ? rawUserId : "local";

  console.log("[agents/backfill] incoming payload", {
    installation_id,
    owner,
    repo,
    stack,
    brief,
    agentUserId,
  });

  const baseUrl = resolveBaseUrl(req);

  const snapshotRes = await fetch(`${baseUrl}/api/github/snapshot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ installation_id, owner, repo, stack, brief }),
  });

  if (!snapshotRes.ok) {
    const errText = await snapshotRes.text();
    console.error("[agents/backfill] snapshot fetch failed", snapshotRes.status, errText);
    return NextResponse.json(
      { ok: false, error: "Snapshot fetch failed", detail: errText },
      { status: 502 },
    );
  }

  const snapshotPayload = await snapshotRes.json();
  const snapshot = snapshotPayload?.snapshot;

  if (!snapshot) {
    console.error("[agents/backfill] snapshot response missing snapshot key", snapshotPayload);
    return NextResponse.json(
      { ok: false, error: "Snapshot response malformed" },
      { status: 502 },
    );
  }

  console.log("[agents/backfill] snapshot summary", {
    defaultBranch: snapshot?.defaultBranch,
    fileCount: Array.isArray(snapshot?.files) ? snapshot.files.length : undefined,
    previewCount: Array.isArray(snapshot?.previews) ? snapshot.previews.length : undefined,
  });

  const sessionId = randomUUID();
  const sessionUrl = `${ADK_BASE_URL}/apps/agent/users/${agentUserId}/sessions/${sessionId}`;
  const sessionResponse = await fetch(sessionUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent: "planner_agent" }),
  });

  let sessionBody: unknown = null;
  try {
    const text = await sessionResponse.text();
    if (text) {
      try {
        sessionBody = JSON.parse(text);
      } catch {
        sessionBody = text;
      }
    }
  } catch (error) {
    console.warn("[agents/backfill] failed to read session response body", error);
  }

  console.log("[agents/backfill] session create response", {
    status: sessionResponse.status,
    sessionId,
    body: sessionBody,
  });

  if (!sessionResponse.ok) {
    return NextResponse.json(
      { ok: false, error: "Failed to create planner session", detail: sessionBody },
      { status: 502 },
    );
  }

  const promptText = [
    `Create architecture + WBS for ${stack.framework} (${stack.language}) using ${stack.db}.`,
    "",
    "INPUT JSON:",
    JSON.stringify({ stack, brief, snapshot, userId: agentUserId }),
  ].join("\n");

  console.log("[agents/backfill] sending run payload", {
    sessionId,
    textPreview: promptText.slice(0, 200),
    textLength: promptText.length,
  });

  const runRes = await fetch(`${ADK_BASE_URL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      appName: "agent",
      userId: agentUserId,
      sessionId,
      newMessage: { role: "user", parts: [{ text: promptText }] },
    }),
  });

  if (!runRes.ok) {
    const errText = await runRes.text();
    console.error("[agents/backfill] ADK /run failed", runRes.status, errText);
    return NextResponse.json(
      { ok: false, error: `ADK run failed: ${runRes.status}`, detail: errText },
      { status: 502 },
    );
  }

  const contentType = runRes.headers.get("content-type") || "";
  console.log("[agents/backfill] run response headers", {
    status: runRes.status,
    contentType,
  });

  let raw: unknown;
  const candidateTexts: string[] = [];

  if (contentType.includes("application/json")) {
    raw = await runRes.json();
    console.log("[agents/backfill] run response json", raw);
  } else {
    const text = await runRes.text();
    console.warn("[agents/backfill] ADK returned non-JSON, attempting to unwrap:", text.slice(0, 300));
    candidateTexts.push(text);
    try {
      raw = JSON.parse(text);
    } catch {
      raw = { messages: [{ parts: [{ text }] }] };
    }
  }

  collectTexts(raw);

  const { plan, jsonText } = unwrapPlan(raw, candidateTexts);
  console.log("[agents/backfill] unwrapped plan", {
    nodes: Array.isArray((plan as any)?.nodes) ? (plan as any).nodes.length : 0,
    edges: Array.isArray((plan as any)?.edges) ? (plan as any).edges.length : 0,
  });

  let storeResult: unknown = null;
  const hasGraph = Array.isArray((plan as any)?.nodes) && Array.isArray((plan as any)?.edges);

  if (hasGraph) {
    try {
      const storeRes = await fetch(`${baseUrl}/api/agents/planner/store`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, blob: jsonText }),
      });

      const storeBodyText = await storeRes.text();
      let storeBody: unknown = null;
      if (storeBodyText) {
        try {
          storeBody = JSON.parse(storeBodyText);
        } catch {
          storeBody = storeBodyText;
        }
      }
      storeResult = storeBody;

      if (!storeRes.ok) {
        console.error("[agents/backfill] planner/store failed", storeRes.status, storeBody);
      } else {
        console.log("[agents/backfill] planner/store response", storeBody);
      }
    } catch (error) {
      console.error("[agents/backfill] planner/store request threw", error);
    }
  } else {
    console.warn("[agents/backfill] skipping planner/store persist because plan lacks nodes/edges");
  }

  return NextResponse.json({ ok: true, plan, store: storeResult });

  function collectTexts(node: unknown) {
    if (node == null) return;
    if (typeof node === "string") {
      candidateTexts.push(node);
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) collectTexts(item);
      return;
    }
    if (typeof node === "object") {
      const maybeText = (node as { text?: unknown }).text;
      if (typeof maybeText === "string") candidateTexts.push(maybeText);
      for (const value of Object.values(node)) collectTexts(value);
    }
  }

  function unwrapPlan(rawAny: any, texts: string[]) {
    if (rawAny?.nodes && rawAny?.edges) {
      return { plan: rawAny, jsonText: JSON.stringify(rawAny) };
    }

    if (Array.isArray(rawAny) && rawAny.length === 1 && rawAny[0]?.nodes && rawAny[0]?.edges) {
      return { plan: rawAny[0], jsonText: JSON.stringify(rawAny[0]) };
    }

    const candidates = [...texts];

    if (Array.isArray(rawAny)) {
      for (const event of rawAny) {
        const parts = event?.content?.parts;
        if (Array.isArray(parts)) {
          for (const part of parts) {
            if (typeof part?.text === "string") candidates.push(part.text);
          }
        }
      }
    }

    if (rawAny?.messages) {
      for (const message of rawAny.messages) {
        for (const part of message?.parts ?? []) {
          if (typeof part?.text === "string") candidates.push(part.text);
        }
        if (typeof message?.content === "string") {
          candidates.push(message.content);
        }
      }
    }

    for (const candidate of candidates) {
      if (typeof candidate !== "string") continue;
      const cleaned = stripCodeFence(candidate);
      if (!cleaned) continue;
      try {
        const parsed = JSON.parse(cleaned);
        if (parsed && (parsed.nodes || parsed.edges || parsed.architecture || parsed.wbs)) {
          return { plan: parsed, jsonText: cleaned };
        }
      } catch {
        const match = cleaned.match(/\{[\s\S]*\}$/);
        if (match) {
          try {
            const parsed = JSON.parse(match[0]);
            if (parsed && (parsed.nodes || parsed.edges || parsed.architecture || parsed.wbs)) {
              return { plan: parsed, jsonText: match[0] };
            }
          } catch {
            // ignore
          }
        }
      }
    }

    const sample = candidates.find((value) => typeof value === "string" && value.trim());
    console.error("[agents/backfill] failed to unwrap planner response", {
      sample: typeof sample === "string" ? sample.slice(0, 500) : sample,
    });
    throw new Error("Unexpected planner response shape");
  }

  function stripCodeFence(value: string): string {
    let text = value.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    }
    return text;
  }
}
