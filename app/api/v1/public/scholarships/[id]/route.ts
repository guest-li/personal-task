import { NextRequest, NextResponse } from "next/server";
import { getScholarshipBySlug } from "@/server/services/public.service";
import { jsonError } from "@/server/http";

export const GET = async (_req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const scholarship = await getScholarshipBySlug(params.id);
    if (!scholarship) return jsonError("Scholarship not found", 404);
    return NextResponse.json({ scholarship });
  } catch (e) {
    return jsonError("Failed to fetch scholarship", 500);
  }
};
