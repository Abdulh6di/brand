import Stripe from "stripe";
import type { PaymentGateway, PaymentIntentResult } from "@/server/payments/types";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export class StripeGateway implements PaymentGateway {
  async createPaymentIntent({ orderId, amount, currency }: { orderId: string; amount: number; currency: string }): Promise<PaymentIntentResult> {
    const stripe = getStripeClient();
    if (!stripe) {
      throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY to accept card payments.");
    }

    const intent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      metadata: { orderId },
      automatic_payment_methods: { enabled: true },
    });

    return { status: "requires_payment", clientSecret: intent.client_secret ?? undefined, transactionId: intent.id };
  }

  async refund({ transactionId, amount }: { transactionId: string; amount?: number }) {
    const stripe = getStripeClient();
    if (!stripe) return { success: false };
    await stripe.refunds.create({ payment_intent: transactionId, amount });
    return { success: true };
  }
}
