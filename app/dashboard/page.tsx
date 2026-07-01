import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { getCurrentTenant } from "../../lib/tenant";

export default async function DashboardPage() {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    redirect("/login");
  }

  const [workflowCount, successfulExecutions, failedExecutions] =
    await Promise.all([
      prisma.workflow.count({
        where: {
          organizationId: tenant.organization.id,
        },
      }),
      prisma.workflowExecution.count({
        where: {
          organizationId: tenant.organization.id,
          status: "SUCCESS",
        },
      }),
      prisma.workflowExecution.count({
        where: {
          organizationId: tenant.organization.id,
          status: "FAILED",
        },
      }),
    ]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {tenant.user.name}. You are working inside{" "}
              <span className="font-medium text-gray-900">
                {tenant.organization.name}
              </span>
              .
            </p>
          </div>

          <form action="/api/auth/logout" method="post">
            <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900">
              Log out
            </button>
          </form>
        </div>

        <div className="mb-8 flex gap-3">
          <a
            href="/workflows"
            className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
          >
            View Workflows
          </a>

          <a
            href="/workflows/new"
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-900"
          >
            Create Workflow
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">Total Workflows</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {workflowCount}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">Successful Executions</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {successfulExecutions}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">Failed Executions</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {failedExecutions}
            </h2>
          </div>
        </div>
      </div>
    </main>
  );
}
