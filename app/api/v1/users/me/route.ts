import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { findUserById } from "@/server/services/user.service";
import { jsonError } from "@/server/http";

export const GET = withAuth(async (_req: NextRequest, { user }: AuthContext) => {
  const dbUser = await findUserById(user.sub);
  if (!dbUser) {
    return jsonError("User not found", 404);
  }

  return NextResponse.json({
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      phone: dbUser.phone,
      role: dbUser.role,
      avatar: dbUser.avatar,
      createdAt: dbUser.createdAt,
    },
  });
});
