import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/server/middleware/with-auth";
import { withValidation } from "@/server/middleware/with-validation";
import { bookConsultationSchema } from "@/server/validators/consultation";
import { createConsultation, listStudentConsultations } from "@/server/services/consultation.service";
import { jsonSuccess, jsonError } from "@/server/lib/response";

export async function POST(req: NextRequest) {
  return withAuth(async (request, { user }) => {
    return withValidation(request, bookConsultationSchema, async (data) => {
      try {
        const consultation = await createConsultation(user.id, {
          title: data.title,
          description: data.description,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
          duration: data.duration,
          price: data.price,
        });
        return jsonSuccess("Consultation booked successfully", consultation, 201);
      } catch (error: any) {
        return jsonError("Failed to book consultation", 400);
      }
    });
  })(req);
}

export async function GET(req: NextRequest) {
  return withAuth(async (request, { user }) => {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") as any;

    try {
      const result = await listStudentConsultations(user.id, page, limit, status);
      return NextResponse.json(result);
    } catch (error) {
      return jsonError("Failed to fetch consultations", 500);
    }
  })(req);
}
