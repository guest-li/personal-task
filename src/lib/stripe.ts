import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function createCheckoutSession(
  consultationId: string,
  amount: number,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Consultation Session",
            description: `Consultation ID: ${consultationId}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      consultationId,
    },
  });

  return session;
}

export async function getSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId);
}

export async function constructWebhookEvent(body: string, signature: string, secret: string) {
  return stripe.webhooks.constructEvent(body, signature, secret);
}
