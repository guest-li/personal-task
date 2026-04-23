import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { getEventDetailAdmin, updateEventAdmin, deleteEventAdmin } from "@/server/services/admin.service";
import { updateEventSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (_req, { params }) => {
  const event = await getEventDetailAdmin(params.id);
  if (!event) return jsonError("Event not found", 404);
  return NextResponse.json({ event });
});

export const PUT = withRole(["admin"], async (req, { params }) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const event = await updateEventAdmin(params.id, parsed.data);
    return NextResponse.json({ event });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("Event not found", 404);
    return jsonError("Failed to update event", 500);
  }
});

export const DELETE = withRole(["admin"], async (_req, { params }) => {
  try {
    await deleteEventAdmin(params.id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("Event not found", 404);
    return jsonError("Failed to delete event", 500);
  }
});
