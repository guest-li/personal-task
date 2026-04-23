import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { getUserDetailAdmin, updateUserAdmin, deactivateUserAdmin } from "@/server/services/admin.service";
import { updateUserSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (_req, { params }) => {
  const user = await getUserDetailAdmin(params.id);
  if (!user) return jsonError("User not found", 404);
  return NextResponse.json({ user });
});

export const PUT = withRole(["admin"], async (req, { params }) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const user = await updateUserAdmin(params.id, parsed.data);
    return NextResponse.json({ user });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("User not found", 404);
    return jsonError("Failed to update user", 500);
  }
});

export const DELETE = withRole(["admin"], async (_req, { params }) => {
  try {
    await deactivateUserAdmin(params.id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("User not found", 404);
    return jsonError("Failed to deactivate user", 500);
  }
});
