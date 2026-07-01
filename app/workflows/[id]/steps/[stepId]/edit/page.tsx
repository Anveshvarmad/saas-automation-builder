import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "../../../../../../lib/prisma";
import { getCurrentTenant } from "../../../../../../lib/tenant";
import { EditStepForm } from "./edit-step-form";

function getPrompt(config: unknown) {
  if (config && typeof config === "object" && !Array.isArray(config)) {
    const prompt = (config as { prompt?: unknown }).prompt;
    return typeof prompt === "string" ? prompt : "";
  }

  return "";
}

export default async function EditWorkflowStepPage({
  params,
}: {
  params: Promise<{ id: string; stepId: string }>;
}) {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    redirect("/login");
  }

  const { id, stepId } = await params;

  const step = await prisma.workflowStep.findFirst({
    where: {
      id: stepId,
      workflowId: id,
      workflow: {
        organizationId: tenant.organization.id,
      },
    },
    include: {
      workflow: true,
    },
  });

  if (!step) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link
            href={`/workflows/${step.workflow.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to workflow
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Edit Workflow Step
          </h1>

          <p className="mt-2 text-slate-600">
            Configure the AI prompt used by this workflow step.
          </p>
        </div>

        <EditStepForm
          workflowId={step.workflow.id}
          stepId={step.id}
          initialName={step.name}
          initialPrompt={
            getPrompt(step.config) ||
            "Analyze this input and return structured JSON."
          }
        />
      </div>
    </main>
  );
}
