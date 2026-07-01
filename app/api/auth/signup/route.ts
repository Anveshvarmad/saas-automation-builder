import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { createSession, hashPassword, slugify } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const organizationName = String(body.organizationName ?? "").trim();

    if (!name || !email || !password || !organizationName) {
      return NextResponse.json(
        { error: "Name, email, password, and organization name are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const baseSlug = slugify(organizationName);
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug,
        },
      });

      await tx.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "OWNER",
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          action: "USER_SIGNED_UP",
          metadata: {
            email,
            organizationName,
          },
        },
      });

      return {
        user,
        organization,
      };
    });

    await createSession(result.user.id);

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Signup failed.",
      },
      { status: 500 }
    );
  }
}
