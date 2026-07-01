import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentTenant } from "../../../../lib/tenant";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const workflow = await prisma.workflow.findFirst({
    where: {
      id,
      organizationId: tenant.organization.id,
    },
    include: {
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
    return NextResponse.json({ error: "Workflow not found." }, { status: 404 });
  }

  return NextResponse.json({ workflow });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();

  const existingWorkflow = await prisma.workflow.findFirst({
    where: {
      id,
      organizationId: tenant.organization.id,
    },
  });

  if (!existingWorkflow) {
    return NextResponse.json({ error: "Workflow not found." }, { status: 404 });
  }

  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const status = String(body.status ?? existingWorkflow.status);

  if (!name) {
    return NextResponse.json(
      { error: "Workflow name is required." },
      { status: 400 }
    );
  }

  if (!["DRAFT", "ACTIVE", "PAUSED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const workflow = await prisma.workflow.update({
    where: {
      id,
    },
    data: {
      name,
      description,
      status: status as "DRAFT" | "ACTIVE" | "PAUSED",
    },
    include: {
      steps: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: tenant.organization.id,
      userId: tenant.user.id,
      action: "WORKFLOW_UPDATED",
      metadata: {
        workflowId: workflow.id,
        workflowName: workflow.name,
      },
    },
  });

  return NextResponse.json({ workflow });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const workflow = await prisma.workflow.findFirst({
    where: {
      id,
      organizationId: tenant.organization.id,
    },
  });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found." }, { status: 404 });
  }

  await prisma.workflow.delete({
    where: {
      id,
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: tenant.organization.id,
      userId: tenant.user.id,
      action: "WORKFLOW_DELETED",
      metadata: {
        workflowId: workflow.id,
        workflowName: workflow.name,
      },
    },
  });

  return NextResponse.json({
    message: "Workflow deleted successfully.",
  });
}
