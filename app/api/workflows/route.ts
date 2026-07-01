import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentTenant } from "../../../lib/tenant";

function createWebhookSecret() {
  return `wh_${crypto.randomBytes(24).toString("hex")}`;
}

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function GET() {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workflows = await prisma.workflow.findMany({
    where: {
      organizationId: tenant.organization.id,
    },
    include: {
      webhook: true,
      steps: {
        orderBy: {
          position: "asc",
        },
      },
      _count: {
        select: {
          executions: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ workflows });
}

export async function POST(request: Request) {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const description = String(body.description ?? "").trim();
    const triggerType = String(body.triggerType ?? "WEBHOOK");

    if (!name) {
      return NextResponse.json(
        { error: "Workflow name is required." },
        { status: 400 }
      );
    }

    if (!["WEBHOOK", "MANUAL", "SCHEDULE"].includes(triggerType)) {
      return NextResponse.json(
        { error: "Invalid trigger type." },
        { status: 400 }
      );
    }

    const webhookSecret = createWebhookSecret();

    const workflow = await prisma.workflow.create({
      data: {
        organizationId: tenant.organization.id,
        name,
        description,
        triggerType: triggerType as "WEBHOOK" | "MANUAL" | "SCHEDULE",
        status: "DRAFT",
        steps: {
          create: [
            {
              position: 1,
              type: "OPENAI_TEXT",
              name: "Classify input with AI",
              config: {
                prompt:
                  "Classify the incoming data and return a short JSON response.",
              },
            },
          ],
        },
        webhook:
          triggerType === "WEBHOOK"
            ? {
                create: {
                  tokenHash: hashValue(webhookSecret),
                  tokenPrefix: webhookSecret.slice(0, 12),
                  isActive: true,
                },
              }
            : undefined,
      },
      include: {
        webhook: true,
        steps: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: tenant.organization.id,
        userId: tenant.user.id,
        action: "WORKFLOW_CREATED",
        metadata: {
          workflowId: workflow.id,
          workflowName: workflow.name,
          triggerType: workflow.triggerType,
        },
      },
    });

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error) {
    console.error("Create workflow error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create workflow.",
      },
      { status: 500 }
    );
  }
}
