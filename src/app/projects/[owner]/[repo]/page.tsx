import { fetchPlanByRepo, buildTree } from "@/lib/plan/fetch";
import Checklist from "./Checklist";

export default async function ProjectPlanPage({ params }: { params: { owner: string; repo: string } }) {
    const owner = decodeURIComponent(params.owner);
    const repo = decodeURIComponent(params.repo);

    const { projectId, nodes, edges } = await fetchPlanByRepo(owner, repo);
    console.log(nodes)
    const tree = buildTree(nodes, edges);

    return (
        <div className="mx-auto max-w-4xl p-6 space-y-6">
            <h1 className="text-2xl font-semibold">Plan for {owner}/{repo}</h1>
            {!projectId ? (
                <p className="text-sm text-gray-500">No plan found.</p>
            ) : (
                <Checklist projectId={projectId} tree={tree} />
            )}
        </div>
    );
}
