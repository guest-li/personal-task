import { NextRequest, NextResponse } from "next/server";
import { getBlogBySlug } from "@/server/services/public.service";
import { prisma } from "@/server/db";
import { jsonError } from "@/server/http";

export const GET = async (_req: NextRequest, { params }: { params: { slug: string } }) => {
  try {
    const post = await getBlogBySlug(params.slug);
    if (!post) return jsonError("Blog post not found", 404);

    // Increment view count
    await prisma.blogPost.update({
      where: { slug: params.slug },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ post });
  } catch (e) {
    return jsonError("Failed to fetch blog post", 500);
  }
};
