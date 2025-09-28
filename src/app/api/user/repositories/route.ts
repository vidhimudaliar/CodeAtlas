import { NextRequest, NextResponse } from "next/server";
import { getUserRepositories } from "@/lib/user.actions";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("user_id") ?? undefined;
    const repositories = userId ? await getUserRepositories(userId) : await getUserRepositories();
    return NextResponse.json({ repositories });
  } catch (error) {
    console.error("Failed to fetch user repositories", error);
    return NextResponse.json({ error: "Unable to load repositories" }, { status: 500 });
  }
}
