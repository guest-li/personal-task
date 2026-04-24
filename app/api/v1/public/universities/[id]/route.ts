import { NextRequest, NextResponse } from "next/server";
import { getUniversityDetail } from "@/server/services/public.service";
import { jsonError } from "@/server/http";

export const GET = async (_req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const university = await getUniversityDetail(params.id);
    if (!university) return jsonError("University not found", 404);
    return NextResponse.json({ university });
  } catch (e) {
    return jsonError("Failed to fetch university", 500);
  }
};
