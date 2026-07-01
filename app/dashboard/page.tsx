import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { getCurrentTenant } from "../../lib/tenant";

function getExecutionStatusClass(status: string) {
  if (status === "SUCCESS") {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (status === "FAILED") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "RUNNING") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-yellow-200 bg-yellow-50 text-yellow-700";
}

export default async function DashboardPage() {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    redirect("/login");
  }

  const [
    totalWorkflows,
    activeWorkflows,
    totalExecutions,
    successfulExecutions,
    failedExecutions,
    recentExecutions,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.workflow.count({
      where: {
        organizationId: tenant.organization.id,
      },
    }),
    prisma.workflow.count({
      where: {
        organizationId: tenant.organization.id,
        status: "ACTIVE",
      },
    }),
    prisma.workflowExecution.count({
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
    prisma.workflowExecution.findMany({
      where: {
        organizationId: tenant.organization.id,
      },
      include: {
        workflow: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
    prisma.auditLog.findMany({
      where: {
        organizationId: tenant.organization.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              {tenant.organization.name}
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Dashboard
            </h1>

            <p className="mt-2 text-slate-600">
              Welcome back, {tenant.user.name}. Monitor workflows, executions,
              and recent activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/workflows/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              New Workflow
            </Link>

            <Link
              href="/workflows"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Workflows
            </Link>

            <Link
              href="/audit-logs"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Audit Logs
            </Link>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-5">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Workflows</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalWorkflows}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Active</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {activeWorkflows}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Executions</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalExecutions}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Succeeded</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {successfulExecutions}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Failed</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {failedExecutions}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                Recent Executions
              </h2>

              <Link
                href="/workflows"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View workflows
              </Link>
            </div>

            {recentExecutions.length === 0 ? (
              <p className="mt-5 text-sm text-slate-600">
                No executions yet. Create a workflow and trigger its webhook.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {recentExecutions.map((execution) => (
                  <Link
                    key={execution.id}
                    href={`/executions/${execution.id}`}
                    className="block rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {execution.workflow.name}
                        </p>
                        <p className="mt-1 font-mono text-xs text-slate-500">
                          {execution.id}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {execution.createdAt.toLocaleString()}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getExecutionStatusClass(
                          execution.status
                        )}`}
                      >
                        {execution.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                Recent Activity
              </h2>

              <Link
                href="/audit-logs"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View audit logs
              </Link>
            </div>

            {recentAuditLogs.length === 0 ? (
              <p className="mt-5 text-sm text-slate-600">
                No activity yet.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {recentAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {log.action
                        .split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                        )
                        .join(" ")}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {log.createdAt.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Demo Checklist
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {[
              "Create workflow",
              "Generate webhook secret",
              "Trigger webhook",
              "View OpenAI output",
            ].map((item, index) => (
              <div
                key={item}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-semibold text-blue-600">
                  Step {index + 1}
                </p>
                <p className="mt-2 font-semibold text-slate-900">{item}</p>
              </div>
            ))}
          </div>

          <Link
            href="/demo"
            className="mt-5 inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            View full demo guide
          </Link>
        </section>
      </div>
    </main>
  );
}
