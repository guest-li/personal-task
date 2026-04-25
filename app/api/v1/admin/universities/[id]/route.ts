import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import {
  getUniversityDetailAdmin,
  updateUniversityAdmin,
  deleteUniversityAdmin,
} from "@/server/services/admin.service";
import { updateUniversitySchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (_req, { params }) => {
  const university = await getUniversityDetailAdmin(params.id);
  if (!university) return jsonError("University not found", 404);
  return NextResponse.json({ university });
});

export const PUT = withRole(["admin"], async (req, { params }) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = updateUniversitySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const university = await updateUniversityAdmin(params.id, parsed.data);
    return NextResponse.json({ university });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("University not found", 404);
    if (e.message === "Slug already exists") return jsonError("Slug already exists", 400);
    return jsonError("Failed to update university", 500);
  }
});

export const DELETE = withRole(["admin"], async (_req, { params }) => {
  try {
    await deleteUniversityAdmin(params.id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("University not found", 404);
    return jsonError("Failed to delete university", 500);
  }
});
