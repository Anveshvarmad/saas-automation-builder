import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      {
        user: null,
        organization: null,
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: {
      id: currentUser.user.id,
      name: currentUser.user.name,
      email: currentUser.user.email,
    },
    organization: currentUser.organization,
    role: currentUser.role,
  });
}
