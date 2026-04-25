import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import {
  getScholarshipDetailAdmin,
  updateScholarshipAdmin,
  deleteScholarshipAdmin,
} from "@/server/services/admin.service";
import { updateScholarshipSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (_req, { params }) => {
  const scholarship = await getScholarshipDetailAdmin(params.id);
  if (!scholarship) return jsonError("Scholarship not found", 404);
  return NextResponse.json({ scholarship });
});

export const PUT = withRole(["admin"], async (req, { params }) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = updateScholarshipSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const scholarship = await updateScholarshipAdmin(params.id, parsed.data);
    return NextResponse.json({ scholarship });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("Scholarship not found", 404);
    if (e.message === "Slug already exists") return jsonError("Slug already exists", 400);
    return jsonError("Failed to update scholarship", 500);
  }
});

export const DELETE = withRole(["admin"], async (_req, { params }) => {
  try {
    await deleteScholarshipAdmin(params.id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("Scholarship not found", 404);
    return jsonError("Failed to delete scholarship", 500);
  }
});
