import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentTenant } from "../../../../../lib/tenant";
import { enqueueWorkflowExecution } from "../../../../../lib/workflow-queue";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await getCurrentTenant();

    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const execution = await prisma.workflowExecution.findFirst({
      where: {
        id,
        organizationId: tenant.organization.id,
      },
      include: {
        workflow: true,
        steps: true,
      },
    });

    if (!execution) {
      return NextResponse.json(
        { error: "Execution not found." },
        { status: 404 }
      );
    }

    if (execution.status !== "FAILED") {
      return NextResponse.json(
        { error: "Only failed executions can be retried." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.workflowExecution.update({
        where: {
          id: execution.id,
        },
        data: {
          status: "QUEUED",
          errorMessage: null,
          outputData: undefined,
          startedAt: null,
          finishedAt: null,
        },
      });

      await tx.workflowExecutionStep.updateMany({
        where: {
          executionId: execution.id,
        },
        data: {
          status: "QUEUED",
          errorMessage: null,
          inputData: undefined,
          outputData: undefined,
          startedAt: null,
          finishedAt: null,
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId: tenant.organization.id,
          userId: tenant.user.id,
          action: "EXECUTION_RETRIED",
          metadata: {
            executionId: execution.id,
            workflowId: execution.workflowId,
            workflowName: execution.workflow.name,
          },
        },
      });
    });

    await enqueueWorkflowExecution(execution.id);

    return NextResponse.json({
      message: "Execution queued for retry.",
      execution: {
        id: execution.id,
        status: "QUEUED",
      },
    });
  } catch (error) {
    console.error("Retry execution error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to retry execution.",
      },
      { status: 500 }
    );
  }
}
