import { NextRequest, NextResponse } from "next/server";
import { listCourses } from "@/server/services/public.service";
import { jsonError } from "@/server/http";

export const GET = async (req: NextRequest) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "20", 10);

  try {
    const result = await listCourses(page, limit, {
      degree: params.degree,
      language: params.language,
      major: params.major,
      universityId: params.universityId,
      intake: params.intake,
      province: params.province,
      city: params.city,
      search: params.search,
    });
    return NextResponse.json(result);
  } catch (e) {
    return jsonError("Failed to fetch courses", 500);
  }
};
