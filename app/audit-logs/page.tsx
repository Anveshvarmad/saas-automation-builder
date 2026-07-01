import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { getCurrentTenant } from "../../lib/tenant";

function formatJson(value: unknown) {
  if (value === null || value === undefined) {
    return "No metadata";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatAction(action: string) {
  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getActionClass(action: string) {
  if (action.includes("WEBHOOK")) {
    return "border-purple-200 bg-purple-50 text-purple-700";
  }

  if (action.includes("WORKFLOW")) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (action.includes("USER")) {
    return "border-green-200 bg-green-50 text-green-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export default async function AuditLogsPage() {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    redirect("/login");
  }

  const logs = await prisma.auditLog.findMany({
    where: {
      organizationId: tenant.organization.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  const userIds = Array.from(
    new Set(logs.map((log) => log.userId).filter(Boolean))
  ) as string[];

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const userMap = new Map(users.map((user) => [user.id, user]));

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to dashboard
            </Link>

            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              Audit Logs
            </h1>

            <p className="mt-2 text-slate-600">
              Review recent activity across your organization.
            </p>
          </div>

          <Link
            href="/workflows"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            View Workflows
          </Link>
        </div>

        <section className="rounded-xl border bg-white shadow-sm">
          {logs.length === 0 ? (
            <div className="p-8 text-center">
              <h2 className="text-lg font-semibold text-slate-900">
                No audit logs yet
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Create workflows, trigger webhooks, or update steps to generate
                activity.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => {
                const user = log.userId ? userMap.get(log.userId) : null;

                return (
                  <div key={log.id} className="p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getActionClass(
                            log.action
                          )}`}
                        >
                          {formatAction(log.action)}
                        </span>

                        <p className="mt-3 text-sm text-slate-600">
                          Actor:{" "}
                          <span className="font-semibold text-slate-900">
                            {user
                              ? `${user.name} (${user.email})`
                              : "System / External Request"}
                          </span>
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {log.createdAt.toLocaleString()}
                        </p>
                      </div>

                      <div className="w-full lg:max-w-2xl">
                        <p className="mb-2 text-sm font-semibold text-slate-700">
                          Metadata
                        </p>

                        <pre className="max-h-72 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
                          {formatJson(log.metadata)}
                        </pre>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
