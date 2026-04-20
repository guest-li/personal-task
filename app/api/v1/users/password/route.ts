import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { changePasswordSchema } from "@/server/validators/profile";
import { changePassword } from "@/server/services/profile.service";
import { jsonError } from "@/server/http";

export const PUT = withAuth(async (req: NextRequest, { user }: AuthContext) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, parsed.error.flatten());
  }

  try {
    await changePassword(user.sub, parsed.data.currentPassword, parsed.data.newPassword);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Password change failed";
    return jsonError(message, 400);
  }

  return NextResponse.json({ message: "Password changed successfully" });
});
