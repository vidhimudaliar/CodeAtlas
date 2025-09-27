import { listInstallationRepositories } from "@/lib/github/installations";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const installationParam = searchParams.get("installation_id");

  if (!installationParam) {
    return NextResponse.json({ error: "installation_id is required" }, { status: 400 });
  }

  const installationId = Number(installationParam);

  if (!Number.isInteger(installationId) || installationId <= 0) {
    return NextResponse.json({ error: "installation_id must be a positive integer" }, { status: 400 });
  }

  try {
    const repositories = await listInstallationRepositories(installationId);
    return NextResponse.json({ installationId, repositories });
  } catch (error) {
    console.error("Failed to list installation repositories", error);
    return NextResponse.json({ error: "Unable to list repositories for installation" }, { status: 500 });
  }
}
