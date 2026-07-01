import { notFound, redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { getCurrentTenant } from "../../../../lib/tenant";
import EditWorkflowForm from "./edit-workflow-form";

type EditWorkflowPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditWorkflowPage({
  params,
}: EditWorkflowPageProps) {
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
  });

  if (!workflow) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <a href={`/workflows/${workflow.id}`} className="text-sm text-gray-600">
          ← Back to workflow
        </a>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Edit Workflow
        </h1>

        <EditWorkflowForm
          workflow={{
            id: workflow.id,
            name: workflow.name,
            description: workflow.description ?? "",
            status: workflow.status,
          }}
        />
      </div>
    </main>
  );
}
