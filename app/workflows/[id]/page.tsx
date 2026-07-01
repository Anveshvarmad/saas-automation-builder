import Link from "next/link";
import WebhookSecretManager from "./webhook-secret-manager";
import { notFound, redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { getCurrentTenant } from "../../../lib/tenant";
import DeleteWorkflowButton from "./delete-workflow-button";

function getStatusClass(status: string) {
  if (status === "ACTIVE") {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (status === "PAUSED") {
    return "border-yellow-200 bg-yellow-50 text-yellow-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

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

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    redirect("/login");
  }

  const { id } = await params;

  const workflow = await prisma.workflow.findFirst({
    where: {
      id,
      organizationId: tenant.organization.id,
    },
    include: {
      webhook: true,
      steps: {
        orderBy: {
          position: "asc",
        },
      },
      executions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  if (!workflow) {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const webhookUrl = workflow.webhook
    ? `${appUrl}/api/webhooks/${workflow.webhook.id}`
    : null;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href="/workflows"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to workflows
            </Link>

            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              {workflow.name}
            </h1>

            <p className="mt-2 max-w-2xl text-slate-600">
              {workflow.description || "No description added yet."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/workflows/${workflow.id}/edit`}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Edit
            </Link>

            <DeleteWorkflowButton workflowId={workflow.id} />

            <div
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${getStatusClass(
                workflow.status
              )}`}
            >
              {workflow.status}
            </div>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Trigger</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {workflow.triggerType}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Steps</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {workflow.steps.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Executions</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {workflow.executions.length}
            </p>
          </div>
        </section>

        {webhookUrl && (
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Webhook Trigger URL
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Send a POST request to this URL to trigger the workflow.
            </p>

            <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
              {webhookUrl}
            </pre>

            <p className="mt-5 text-sm font-semibold text-slate-700">
              Example curl
            </p>

            <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
{`curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -H "x-webhook-secret: YOUR_WEBHOOK_SECRET" \\
  -d '{
    "leadName": "John Smith",
    "email": "john@example.com",
    "company": "Enterprise Cloud Inc",
    "message": "I am interested in your enterprise plan"
  }'`}
</pre>

<WebhookSecretManager
  webhookId={workflow.webhook!.id}
  tokenPrefix={workflow.webhook!.tokenPrefix}
/>

          </section>
        )}

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Workflow Steps
          </h2>

          <div className="mt-5 space-y-4">
            {workflow.steps.map((step) => (
              <div
                key={step.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">
                      Step {step.position}
                    </p>
                    <h3 className="font-semibold text-slate-900">
                      {step.name}
                    </h3>
                    <p className="text-sm text-slate-600">{step.type}</p>
                  </div>

                  <Link
                    href={`/workflows/${workflow.id}/steps/${step.id}/edit`}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Edit step
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Recent Executions
          </h2>

          {workflow.executions.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              No executions yet. Trigger the webhook to create one.
            </p>
          ) : (
            <div className="mt-5 overflow-hidden rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Execution</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Finished</th>
                    <th className="px-4 py-3">View</th>
                  </tr>
                </thead>

                <tbody className="divide-y bg-white">
                  {workflow.executions.map((execution) => (
                    <tr key={execution.id}>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">
                        {execution.id}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getExecutionStatusClass(
                            execution.status
                          )}`}
                        >
                          {execution.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {execution.createdAt.toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {execution.finishedAt
                          ? execution.finishedAt.toLocaleString()
                          : "-"}
                      </td>

                      <td className="px-4 py-3">
                        <Link
                          href={`/executions/${execution.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-700"
                        >
                          View details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
