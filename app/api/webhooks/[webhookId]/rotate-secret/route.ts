import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentTenant } from "../../../../../lib/tenant";
import {
  createWebhookSecret,
  hashWebhookSecret,
} from "../../../../../lib/webhook-secret";

export async function POST(
  request: Request,
  context: { params: Promise<{ webhookId: string }> }
) {
  try {
    const tenant = await getCurrentTenant();

    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { webhookId } = await context.params;

    const webhook = await prisma.webhookEndpoint.findFirst({
      where: {
        id: webhookId,
        workflow: {
          organizationId: tenant.organization.id,
        },
      },
      include: {
        workflow: true,
      },
    });

    if (!webhook) {
      return NextResponse.json(
        { error: "Webhook endpoint not found." },
        { status: 404 }
      );
    }

    const secret = createWebhookSecret();

    const updatedWebhook = await prisma.webhookEndpoint.update({
      where: {
        id: webhook.id,
      },
      data: {
        tokenHash: hashWebhookSecret(secret),
        tokenPrefix: secret.slice(0, 12),
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: tenant.organization.id,
        userId: tenant.user.id,
        action: "WEBHOOK_SECRET_ROTATED",
        metadata: {
          workflowId: webhook.workflow.id,
          webhookId: webhook.id,
          tokenPrefix: updatedWebhook.tokenPrefix,
        },
      },
    });

    return NextResponse.json({
      message: "Webhook secret generated. Copy it now. It will not be shown again.",
      secret,
      tokenPrefix: updatedWebhook.tokenPrefix,
    });
  } catch (error) {
    console.error("Rotate webhook secret error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to rotate webhook secret.",
      },
      { status: 500 }
    );
  }
}
