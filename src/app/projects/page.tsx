import { redirect } from "next/navigation";
import { ProjectsClient } from "./projects-client";
import getUserById, { getUserRepositories } from "@/lib/user.actions";

export default async function ProjectsPage() {
    const user = await getUserById();

    if (!user) {
        redirect("/connect-github");
    }

    const user_repository = await getUserRepositories(user.id);

    return (
        <ProjectsClient
            user={{
                id: user.id,
                name: user.name,
                email: user.email,
                isConnectedToGithub: Boolean(user.is_connected_to_github),
                createdAt: user.created_at,
                updatedAt: user.updated_at,
            }}
            user_repository={user_repository}
        />
    );
}