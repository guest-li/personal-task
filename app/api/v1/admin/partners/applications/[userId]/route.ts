import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { approvePartnerAdmin } from "@/server/services/admin.service";
import { approvePartnerSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const PATCH = withRole(["admin"], async (req, { params }) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = approvePartnerSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const user = await approvePartnerAdmin(params.userId, parsed.data.approved);
    return NextResponse.json({ user });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("User not found", 404);
    return jsonError("Failed to update partner status", 500);
  }
});
