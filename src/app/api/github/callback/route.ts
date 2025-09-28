// app/api/github/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/utils/supabase/server";
import getUserById from "@/lib/user.actions";
import { listInstallationRepositories } from "@/lib/github/actions";

export const runtime = "nodejs";
const DASHBOARD_PATH = "/dashboard";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const installationIdParam = url.searchParams.get("installation_id");
  const setupAction = url.searchParams.get("setup_action");
  const targetType = url.searchParams.get("target_type");
  const targetId = url.searchParams.get("target_id");
  const state = url.searchParams.get("state");

  const redirectUrl = new URL(DASHBOARD_PATH, request.url);

  if (!installationIdParam) {
    redirectUrl.searchParams.set("github_error", "missing_installation_id");
    return NextResponse.redirect(redirectUrl);
  }
  const installationId = Number(installationIdParam);
  if (!Number.isFinite(installationId) || installationId <= 0) {
    redirectUrl.searchParams.set("github_error", "invalid_installation_id");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createSupabaseClient();
  const user = await getUserById();
  const userId = user?.id ?? null;

  if (!userId) {
    redirectUrl.searchParams.set("github_error", "user_not_found");
    return NextResponse.redirect(redirectUrl);
  }

  // 1) Light user update (no repo blobs on user)
  {
    const updates: Record<string, unknown> = {
      is_connected_to_github: true,
      github_installation_id: installationId,
      github_installation_setup_action: setupAction,
      github_installation_target_type: targetType,
      github_installation_target_id: targetId ? Number(targetId) : null,
      github_installation_state: state,
      updated_at: new Date().toISOString(),
    };
    const { error: userErr } = await supabase.from("users").update(updates).eq("id", userId);
    if (userErr) {
      console.error("persist_user_failed", userErr);
      redirectUrl.searchParams.set("github_error", "persist_user_failed");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 2) Fetch repos available to this installation
  let repositories: Awaited<ReturnType<typeof listInstallationRepositories>>;
  try {
    repositories = await listInstallationRepositories(installationId);
  } catch (err) {
    console.error("repositories_fetch_failed", err);
    redirectUrl.searchParams.set("github_error", "repositories_fetch_failed");
    return NextResponse.redirect(redirectUrl);
  }

  // 3) Upsert each repo into projects
  if (repositories.length) {
    const rows = repositories.map((r) => ({
      owner: r.owner,
      repo: r.name,
      title: r.name,
      default_branch: r.defaultBranch ?? "main",
      private: !!r.private,
      installation_id: installationId,
      owner_user_id: userId,
      last_synced_at: new Date().toISOString(),
    }));

    const { error: projErr } = await supabase
      .from("projects")
      .upsert(rows, { onConflict: "owner,repo" }); // uses uq_projects_owner_repo
    if (projErr) {
      console.error("projects_upsert_failed", projErr);
      redirectUrl.searchParams.set("github_error", "projects_upsert_failed");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // success
  redirectUrl.searchParams.set("github_connected", "true");
  redirectUrl.searchParams.set("github_repo_count", String(repositories.length));
  return NextResponse.redirect(redirectUrl);
}
