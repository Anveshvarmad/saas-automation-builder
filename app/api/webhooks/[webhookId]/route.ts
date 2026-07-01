import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ webhookId: string }> }
) {
  try {
    const { webhookId } = await context.params;

    const webhook = await prisma.webhookEndpoint.findUnique({
      where: {
        id: webhookId,
      },
      include: {
        workflow: {
          include: {
            steps: {
              orderBy: {
                position: "asc",
              },
            },
          },
        },
      },
    });

    if (!webhook || !webhook.isActive) {
      return NextResponse.json(
        { error: "Webhook endpoint not found." },
        { status: 404 }
      );
    }

    if (webhook.workflow.status !== "ACTIVE") {
      return NextResponse.json(
        {
          error:
            "Workflow is not active. Change workflow status to ACTIVE before triggering it.",
        },
        { status: 409 }
      );
    }

    let inputData: unknown;

    try {
      inputData = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const execution = await prisma.$transaction(async (tx) => {
      const createdExecution = await tx.workflowExecution.create({
        data: {
          organizationId: webhook.workflow.organizationId,
          workflowId: webhook.workflow.id,
          status: "QUEUED",
          inputData: inputData as object,
        },
      });

      if (webhook.workflow.steps.length > 0) {
        await tx.workflowExecutionStep.createMany({
          data: webhook.workflow.steps.map((step) => ({
            executionId: createdExecution.id,
            stepId: step.id,
            position: step.position,
            stepName: step.name,
            stepType: step.type,
            status: "QUEUED",
          })),
        });
      }

      await tx.auditLog.create({
        data: {
          organizationId: webhook.workflow.organizationId,
          userId: null,
          action: "WEBHOOK_RECEIVED",
          metadata: {
            workflowId: webhook.workflow.id,
            workflowName: webhook.workflow.name,
            executionId: createdExecution.id,
          },
        },
      });

      return createdExecution;
    });

    return NextResponse.json(
      {
        message: "Webhook accepted.",
        execution: {
          id: execution.id,
          status: execution.status,
          workflowId: execution.workflowId,
          createdAt: execution.createdAt,
        },
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Webhook trigger error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook trigger failed.",
      },
      { status: 500 }
    );
  }
}
