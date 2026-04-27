import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, stripe } from "@/src/lib/stripe";
import { db } from "@/server/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const event = constructWebhookEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const consultationId = session.metadata?.consultationId;

      if (consultationId) {
        await db.consultation.update({
          where: { id: consultationId },
          data: {
            paid: true,
            stripePaymentId: session.id,
            status: "confirmed",
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
