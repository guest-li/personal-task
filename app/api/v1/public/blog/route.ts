import { NextRequest, NextResponse } from "next/server";
import { listBlogPosts } from "@/server/services/public.service";
import { jsonError } from "@/server/http";

export const GET = async (req: NextRequest) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);

  try {
    const result = await listBlogPosts(page, limit, {
      category: params.category,
      topic: params.topic,
      search: params.search,
      sort: params.sort || "latest",
    });
    return NextResponse.json(result);
  } catch (e) {
    return jsonError("Failed to fetch blog posts", 500);
  }
};
