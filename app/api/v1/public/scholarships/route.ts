import { NextRequest, NextResponse } from "next/server";
import { listScholarships } from "@/server/services/public.service";
import { jsonError } from "@/server/http";

export const GET = async (req: NextRequest) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "20", 10);

  try {
    const result = await listScholarships(page, limit, {
      type: params.type,
      degree: params.degree,
      language: params.language,
      major: params.major,
      province: params.province,
      city: params.city,
      search: params.search,
    });
    return NextResponse.json(result);
  } catch (e) {
    return jsonError("Failed to fetch scholarships", 500);
  }
};
