import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { updateProfileSchema } from "@/server/validators/profile";
import { updateProfile, getFullProfile } from "@/server/services/profile.service";
import { jsonError } from "@/server/http";

export const PUT = withAuth(async (req: NextRequest, { user }: AuthContext) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, parsed.error.flatten());
  }

  await updateProfile(user.sub, parsed.data);
  const profile = await getFullProfile(user.sub);

  return NextResponse.json({
    user: {
      id: profile!.id,
      email: profile!.email,
      name: profile!.name,
      phone: profile!.phone,
      gender: profile!.gender,
      country: profile!.country,
      avatar: profile!.avatar,
      studentProfile: profile!.studentProfile,
    },
  });
});
