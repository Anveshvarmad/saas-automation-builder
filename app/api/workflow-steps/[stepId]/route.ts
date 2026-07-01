import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentTenant } from "../../../../lib/tenant";
import type { Prisma } from "../../../../generated/prisma/client";

function toObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ stepId: string }> }
) {
  try {
    const tenant = await getCurrentTenant();

    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stepId } = await context.params;
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "Step name is required." },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    const existingStep = await prisma.workflowStep.findFirst({
      where: {
        id: stepId,
        workflow: {
          organizationId: tenant.organization.id,
        },
      },
    });

    if (!existingStep) {
      return NextResponse.json(
        { error: "Workflow step not found." },
        { status: 404 }
      );
    }

    if (existingStep.type !== "OPENAI_TEXT") {
      return NextResponse.json(
        { error: "Only OpenAI text steps can be edited right now." },
        { status: 400 }
      );
    }

    const currentConfig = toObject(existingStep.config);

    const nextConfig = {
      ...currentConfig,
      prompt,
    } as Prisma.InputJsonObject;

    const updatedStep = await prisma.workflowStep.update({
      where: {
        id: existingStep.id,
      },
      data: {
        name,
        config: nextConfig,
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: tenant.organization.id,
        userId: tenant.user.id,
        action: "WORKFLOW_STEP_UPDATED",
        metadata: {
          workflowId: existingStep.workflowId,
          stepId: existingStep.id,
          stepName: name,
        },
      },
    });

    return NextResponse.json({ step: updatedStep });
  } catch (error) {
    console.error("Update workflow step error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update workflow step.",
      },
      { status: 500 }
    );
  }
}
