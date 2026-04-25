import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import {
  getCourseDetailAdmin,
  updateCourseAdmin,
  deleteCourseAdmin,
} from "@/server/services/admin.service";
import { updateCourseSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (_req, { params }) => {
  const course = await getCourseDetailAdmin(params.id);
  if (!course) return jsonError("Course not found", 404);
  return NextResponse.json({ course });
});

export const PUT = withRole(["admin"], async (req, { params }) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = updateCourseSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const course = await updateCourseAdmin(params.id, parsed.data);
    return NextResponse.json({ course });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("Course not found", 404);
    if (e.message === "Slug already exists") return jsonError("Slug already exists", 400);
    return jsonError("Failed to update course", 500);
  }
});

export const DELETE = withRole(["admin"], async (_req, { params }) => {
  try {
    await deleteCourseAdmin(params.id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("Course not found", 404);
    return jsonError("Failed to delete course", 500);
  }
});
