import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { getCurrentTenant } from "../../lib/tenant";

export default async function WorkflowsPage() {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    redirect("/login");
  }

  const workflows = await prisma.workflow.findMany({
    where: {
      organizationId: tenant.organization.id,
    },
    include: {
      steps: true,
      _count: {
        select: {
          executions: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
            <p className="mt-2 text-gray-600">
              Create and manage automations for {tenant.organization.name}.
            </p>
          </div>

          <a
            href="/workflows/new"
            className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
          >
            New Workflow
          </a>
        </div>

        {workflows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              No workflows yet
            </h2>
            <p className="mt-2 text-gray-600">
              Create your first workflow to start automating business tasks.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <a
                key={workflow.id}
                href={`/workflows/${workflow.id}`}
                className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-gray-400"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {workflow.name}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                      {workflow.description || "No description provided."}
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {workflow.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 text-sm text-gray-600 md:grid-cols-3">
                  <p>Trigger: {workflow.triggerType}</p>
                  <p>Steps: {workflow.steps.length}</p>
                  <p>Executions: {workflow._count.executions}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
