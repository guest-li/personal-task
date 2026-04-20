import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { getFullProfile } from "@/server/services/profile.service";
import { jsonError } from "@/server/http";

export const GET = withAuth(async (_req: NextRequest, { user }: AuthContext) => {
  const dbUser = await getFullProfile(user.sub);
  if (!dbUser) {
    return jsonError("User not found", 404);
  }

  return NextResponse.json({
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      phone: dbUser.phone,
      gender: dbUser.gender,
      country: dbUser.country,
      role: dbUser.role,
      avatar: dbUser.avatar,
      createdAt: dbUser.createdAt,
      studentProfile: dbUser.studentProfile,
      partnerProfile: dbUser.partnerProfile,
      certificates: dbUser.certificates,
    },
  });
});
