import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const organizationCount = await prisma.organization.count();
    const workflowCount = await prisma.workflow.count();

    return NextResponse.json({
      status: "ok",
      database: "connected",
      counts: {
        users: userCount,
        organizations: organizationCount,
        workflows: workflowCount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
