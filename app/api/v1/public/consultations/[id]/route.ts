import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/server/middleware/with-auth";
import { getConsultationDetail, updateConsultation, cancelConsultation } from "@/server/services/consultation.service";
import { jsonSuccess, jsonError } from "@/server/lib/response";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(async (request, { user }) => {
    try {
      const consultation = await getConsultationDetail(params.id);
      if (!consultation) {
        return jsonError("Consultation not found", 404);
      }
      if (consultation.studentId !== user.id && consultation.consultantId !== user.id) {
        return jsonError("Unauthorized", 403);
      }
      return NextResponse.json(consultation);
    } catch (error) {
      return jsonError("Failed to fetch consultation", 500);
    }
  })(req);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(async (request, { user }) => {
    try {
      const consultation = await getConsultationDetail(params.id);
      if (!consultation) {
        return jsonError("Consultation not found", 404);
      }
      if (consultation.studentId !== user.id) {
        return jsonError("Unauthorized", 403);
      }

      const body = await request.json();
      const updated = await updateConsultation(params.id, body);
      return jsonSuccess("Consultation updated", updated);
    } catch (error) {
      return jsonError("Failed to update consultation", 400);
    }
  })(req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(async (request, { user }) => {
    try {
      const consultation = await getConsultationDetail(params.id);
      if (!consultation) {
        return jsonError("Consultation not found", 404);
      }
      if (consultation.studentId !== user.id) {
        return jsonError("Unauthorized", 403);
      }

      await cancelConsultation(params.id);
      return jsonSuccess("Consultation cancelled");
    } catch (error) {
      return jsonError("Failed to cancel consultation", 400);
    }
  })(req);
}
