import { NextRequest, NextResponse } from "next/server";
import { listUniversities } from "@/server/services/public.service";
import { jsonError } from "@/server/http";

export const GET = async (req: NextRequest) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "12", 10);

  if (page < 1 || limit < 1 || limit > 100) {
    return jsonError("Invalid pagination", 400);
  }

  try {
    const result = await listUniversities(page, limit, {
      province: params.province,
      tags: params.tags ? params.tags.split(",") : undefined,
      search: params.search,
    });
    return NextResponse.json(result);
  } catch (e) {
    return jsonError("Failed to fetch universities", 500);
  }
};
