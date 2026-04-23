import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { getApplicationDetailAdmin, approveApplicationAdmin } from "@/server/services/admin.service";
import { approveApplicationSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (_req, { params }) => {
  const app = await getApplicationDetailAdmin(params.id);
  if (!app) return jsonError("Application not found", 404);
  return NextResponse.json({ application: app });
});

export const PATCH = withRole(["admin"], async (req, { params }) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = approveApplicationSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const app = await approveApplicationAdmin(params.id, parsed.data.status, parsed.data.adminNote);
    return NextResponse.json({ application: app });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("Application not found", 404);
    return jsonError("Failed to update application", 500);
  }
});
