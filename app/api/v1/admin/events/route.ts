import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { listEventsAdmin, createEventAdmin } from "@/server/services/admin.service";
import { listEventsSchema, createEventSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (req) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = listEventsSchema.safeParse(params);
  if (!parsed.success) return jsonError("Invalid params", 400, parsed.error.flatten());

  const result = await listEventsAdmin(parsed.data.page, parsed.data.limit, {
    status: parsed.data.status,
    search: parsed.data.search,
  });

  return NextResponse.json(result);
});

export const POST = withRole(["admin"], async (req) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const event = await createEventAdmin(parsed.data);
    return NextResponse.json({ event }, { status: 201 });
  } catch (e: any) {
    return jsonError("Failed to create event", 500);
  }
});
