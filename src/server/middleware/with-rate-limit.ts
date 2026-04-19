import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/server/redis";
import { jsonError } from "@/server/http";

interface RateLimitOptions {
  limit: number;
  windowSec: number;
}

export function withRateLimit<P>(
  key: string,
  opts: RateLimitOptions,
  handler: (req: NextRequest, ctx: P) => Promise<NextResponse>,
) {
  return async (req: NextRequest, ctx: P): Promise<NextResponse> => {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
    const bucket = `ratelimit:${key}:${ip}`;

    const count = await redis.incr(bucket);
    if (count === 1) {
      await redis.expire(bucket, opts.windowSec);
    }

    if (count > opts.limit) {
      return jsonError("Too many requests", 429);
    }

    return handler(req, ctx);
  };
}
