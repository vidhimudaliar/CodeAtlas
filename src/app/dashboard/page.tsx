import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";
import { createSupabaseClient } from "@/lib/utils/supabase/server";
import getUserById from "@/lib/user.actions";

export default async function DashboardPage() {
    const user = await getUserById();

    console.log("user", user)
    if (!user) {
        redirect("/connect-github");
    }

    return (
        <DashboardClient
            user={{
                id: user.id,
                name: user.name,
                email: user.email,
                isConnectedToGithub: Boolean(user.is_connected_to_github),
                createdAt: user.created_at,
                updatedAt: user.updated_at,
            }}
        />
    );
}
