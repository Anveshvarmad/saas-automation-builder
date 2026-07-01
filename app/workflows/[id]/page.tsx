import { notFound, redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { getCurrentTenant } from "../../../lib/tenant";
import DeleteWorkflowButton from "./delete-workflow-button";

type WorkflowDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function WorkflowDetailPage({
  params,
}: WorkflowDetailPageProps) {
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
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <a href="/workflows" className="text-sm text-gray-600">
              ← Back to workflows
            </a>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              {workflow.name}
            </h1>
            <p className="mt-2 text-gray-600">
              {workflow.description || "No description provided."}
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href={`/workflows/${workflow.id}/edit`}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900"
            >
              Edit
            </a>

            <DeleteWorkflowButton workflowId={workflow.id} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">Status</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              {workflow.status}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">Trigger</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              {workflow.triggerType}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">Recent Executions</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              {workflow.executions.length}
            </h2>
          </div>
        </div>

        {workflow.triggerType === "WEBHOOK" ? (
          <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Webhook Trigger URL
            </h2>

            {webhookUrl ? (
              <>
                <p className="mt-2 text-sm text-gray-600">
                  Send a POST request with JSON data to this URL. The workflow
                  must be ACTIVE before the webhook can run.
                </p>

                <div className="mt-4 rounded-lg border border-gray-300 bg-gray-50 p-4">
                  <code className="break-all text-sm text-gray-900">
                    {webhookUrl}
                  </code>
                </div>

                <pre className="mt-4 overflow-auto rounded-lg bg-black p-4 text-xs text-white">
{`curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -d '{
    "leadName": "John Smith",
    "email": "john@example.com",
    "message": "I am interested in your enterprise plan"
  }'`}
                </pre>
              </>
            ) : (
              <p className="mt-2 text-sm text-red-600">
                This workflow does not have a webhook endpoint. Create a new
                webhook workflow to generate one.
              </p>
            )}
          </section>
        ) : null}

        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Workflow Steps
          </h2>

          <div className="mt-5 space-y-4">
            {workflow.steps.map((step) => (
              <div
                key={step.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">
                    {step.position}. {step.name}
                  </h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs text-gray-700">
                    {step.type}
                  </span>
                </div>

                <pre className="mt-3 overflow-auto rounded-lg bg-black p-4 text-xs text-white">
                  {JSON.stringify(step.config, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Executions
          </h2>

          {workflow.executions.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">
              No executions yet. Send a POST request to the webhook URL to
              create your first execution.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {workflow.executions.map((execution) => (
                <div
                  key={execution.id}
                  className="rounded-lg border border-gray-200 p-4 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">
                      Execution {execution.id}
                    </p>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                      {execution.status}
                    </span>
                  </div>

                  <p className="mt-2 text-gray-600">
                    Created: {execution.createdAt.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
