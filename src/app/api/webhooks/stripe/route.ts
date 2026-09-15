import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripeClient } from "@/server/payments";
import { cancelUnpaidOrder } from "@/server/orders";
import { sendEmail } from "@/server/email";
import { orderConfirmationEmail } from "@/emails/templates";

/**
 * Source of truth for payment state. We never mark an order paid based on the
 * client-side confirmation response alone — only a verified webhook event
 * flips `Payment.status` and `Order.status`.
 */
export async function POST(req: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("Missing signature");
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = intent.metadata?.orderId;
        if (!orderId) break;

        const payment = await db.payment.findFirst({ where: { transactionId: intent.id } });
        if (payment && payment.status !== "SUCCESS") {
          await db.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS", rawResponse: intent as unknown as object } });
        }

        const order = await db.order.findUnique({ where: { id: orderId }, include: { user: { select: { email: true, name: true } } } });
        if (order && order.status !== "PAID" && order.status !== "CANCELLED") {
          await db.order.update({ where: { id: orderId }, data: { status: "PAID" } });
          await db.orderStatusHistory.create({ data: { orderId, status: "PAID", note: "Payment confirmed via Stripe" } });

          const recipient = order.guestEmail ?? order.user?.email;
          const address = order.shippingAddress as { fullName?: string };
          if (recipient) {
            await sendEmail({
              to: recipient,
              subject: `Order ${order.orderNumber} confirmed`,
              html: orderConfirmationEmail({
                orderNumber: order.orderNumber,
                customerName: address.fullName ?? order.user?.name ?? "there",
                total: order.total,
                currency: order.currency,
              }),
            });
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = intent.metadata?.orderId;
        if (!orderId) break;

        const payment = await db.payment.findFirst({ where: { transactionId: intent.id } });
        if (payment) {
          await db.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
        }

        const order = await db.order.findUnique({ where: { id: orderId } });
        if (order && order.status === "PENDING") {
          await cancelUnpaidOrder(orderId, "Payment failed");
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (!paymentIntentId) break;

        const payment = await db.payment.findFirst({ where: { transactionId: paymentIntentId } });
        if (payment) {
          const fullyRefunded = charge.amount_refunded >= charge.amount;
          await db.payment.update({
            where: { id: payment.id },
            data: { status: fullyRefunded ? "REFUNDED" : "PARTIALLY_REFUNDED" },
          });
          await db.order.update({
            where: { id: payment.orderId },
            data: { status: "REFUNDED" },
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook] handler error", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
