import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest, { params }: { params: { projectName: string } }) {
  const repo = "desi-discipline";

  const ownerUserId = req.nextUrl.searchParams.get("ownerUserId");
  const ownerParam = req.nextUrl.searchParams.get("owner");

  if (!repo || !ownerUserId) {
    console.error("[project/graph] missing repo or ownerUserId", { repo, ownerUserId });
    return NextResponse.json(
      { ok: false, error: "repo and ownerUserId are required" },
      { status: 400 }
    );
  }

  try {
    let projectQuery = supabaseAdmin
      .from("projects")
      .select("id, owner, repo, owner_user_id")
      .eq("repo", repo)
      .eq("owner_user_id", ownerUserId);

    if (ownerParam) {
      projectQuery = projectQuery.eq("owner", ownerParam);
    }

    const { data: project, error: projectError } = await projectQuery.maybeSingle();

    if (projectError) {
      console.error("[project/graph] failed to fetch project", projectError);
      return NextResponse.json({ ok: false, error: "project_fetch_failed" }, { status: 500 });
    }

    if (!project?.id) {
      console.error("[project/graph] project not found", { repo, ownerUserId });
      return NextResponse.json({ ok: false, error: "project_not_found" }, { status: 404 });
    }

    const projectId = project.id as string;

    const { data: nodeRows, error: nodeError } = await supabaseAdmin
      .from("nodes")
      .select("node_id, name, level, type, path, status")
      .eq("project_id", projectId)
      .eq("owner_user_id", ownerUserId);

    if (nodeError) {
      console.error("[project/graph] failed to fetch nodes", nodeError);
      return NextResponse.json({ ok: false, error: "nodes_fetch_failed" }, { status: 500 });
    }

    const { data: edgeRows, error: edgeError } = await supabaseAdmin
      .from("edges")
      .select("parent_node_id, child_node_id")
      .eq("project_id", projectId)
    // .eq("last_touched_by_user_id", ownerUserId);

    if (edgeError) {
      console.error("[project/graph] failed to fetch edges", edgeError);
      return NextResponse.json({ ok: false, error: "edges_fetch_failed" }, { status: 500 });
    }

    const { data: relationRows, error: relationError } = await supabaseAdmin
      .from("relations")
      .select("source_node_id, target_node_id, label")
      .eq("project_id", projectId)

    if (relationError) {
      console.error("[project/graph] failed to fetch relations", relationError);
    }

    return NextResponse.json({
      ok: true,
      projectId,
      owner: project.owner,
      repo: project.repo,
      nodes: (nodeRows ?? []).map((node) => ({
        id: node.node_id,
        name: node.name,
        level: node.level,
        type: node.type,
        path: node.path,
        status: node.status,
      })),
      edges: (edgeRows ?? []).map((edge) => ({
        parent_node_id: edge.parent_node_id,
        child_node_id: edge.child_node_id,
      })),
      relations: relationRows ?? [],
    });
  } catch (error) {
    console.error("[project/graph] unhandled error", error);
    return NextResponse.json({ ok: false, error: "graph_fetch_failed", detail: String(error) }, { status: 500 });
  }
}
