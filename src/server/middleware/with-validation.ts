import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/server/http";

export function withValidation<
  S extends z.ZodType,
  P = Record<string, string>,
>(
  schema: S,
  handler: (
    req: NextRequest,
    ctx: P & { body: z.infer<S> },
  ) => Promise<NextResponse>,
) {
  return async (req: NextRequest, ctx: P): Promise<NextResponse> => {
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return jsonError("Invalid request", 400, { message: "Missing or malformed JSON body" });
    }

    const result = schema.safeParse(raw);
    if (!result.success) {
      return jsonError("Invalid request", 400, result.error.flatten());
    }

    return handler(req, { ...ctx, body: result.data });
  };
}
