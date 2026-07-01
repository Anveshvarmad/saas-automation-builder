import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { getCurrentTenant } from "../../../lib/tenant";
import RetryExecutionButton from "./retry-execution-button";

function formatJson(value: unknown) {
  if (value === null || value === undefined) {
    return "No data";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function getStatusClass(status: string) {
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

export default async function ExecutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    redirect("/login");
  }

  const { id } = await params;

  const execution = await prisma.workflowExecution.findFirst({
    where: {
      id,
      organizationId: tenant.organization.id,
    },
    include: {
      workflow: true,
      steps: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!execution) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href={`/workflows/${execution.workflow.id}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to workflow
            </Link>

            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              Execution Details
            </h1>

            <p className="mt-2 text-slate-600">
              Workflow: {execution.workflow.name}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
  <div
    className={`rounded-full border px-4 py-2 text-sm font-semibold ${getStatusClass(
      execution.status
    )}`}
  >
    {execution.status}
  </div>

  {execution.status === "FAILED" && (
    <RetryExecutionButton executionId={execution.id} />
  )}
</div>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Created</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {execution.createdAt.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Started</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {execution.startedAt
                ? execution.startedAt.toLocaleString()
                : "Not started"}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Finished</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {execution.finishedAt
                ? execution.finishedAt.toLocaleString()
                : "Not finished"}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Steps</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {execution.steps.length}
            </p>
          </div>
        </section>

        {execution.errorMessage && (
          <section className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h2 className="text-lg font-semibold text-red-800">Error</h2>
            <p className="mt-2 text-sm text-red-700">
              {execution.errorMessage}
            </p>
          </section>
        )}

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Webhook Input
          </h2>

          <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
            {formatJson(execution.inputData)}
          </pre>
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Final Output
          </h2>

          <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
            {formatJson(execution.outputData)}
          </pre>
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Step Results
          </h2>

          <div className="mt-6 space-y-5">
            {execution.steps.map((step) => (
              <div
                key={step.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Step {step.position}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {step.stepName}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Type: {step.stepType}
                    </p>
                  </div>

                  <div
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                      step.status
                    )}`}
                  >
                    {step.status}
                  </div>
                </div>

                {step.errorMessage && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {step.errorMessage}
                  </div>
                )}

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                      Step Input
                    </p>
                    <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
                      {formatJson(step.inputData)}
                    </pre>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                      Step Output
                    </p>
                    <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
                      {formatJson(step.outputData)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
