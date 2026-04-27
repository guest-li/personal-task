import { NextRequest } from "next/server";
import { withAuth } from "@/server/middleware/with-auth";
import { createCheckoutSession } from "@/src/lib/stripe";
import { jsonError, jsonSuccess } from "@/server/lib/response";

export async function POST(req: NextRequest) {
  return withAuth(async (request, { user }) => {
    try {
      const { consultationId, amount } = await request.json();
      
      if (!consultationId || !amount) {
        return jsonError("Missing required fields", 400);
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const successUrl = `${baseUrl}/consultations/${consultationId}?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/book-consultation`;

      const session = await createCheckoutSession(
        consultationId,
        amount,
        user.email,
        successUrl,
        cancelUrl
      );

      return jsonSuccess("Checkout session created", { sessionId: session.id, url: session.url });
    } catch (error: any) {
      return jsonError(error.message, 500);
    }
  })(req);
}
