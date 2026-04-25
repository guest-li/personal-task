import { NextRequest, NextResponse } from "next/server";
import { getCourseBySlug } from "@/server/services/public.service";
import { jsonError } from "@/server/http";

export const GET = async (_req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const course = await getCourseBySlug(params.id);
    if (!course) return jsonError("Course not found", 404);
    return NextResponse.json({ course });
  } catch (e) {
    return jsonError("Failed to fetch course", 500);
  }
};
