"use client";

import * as React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function PaymentFormInner({ orderNumber }: { orderNumber: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation/${orderNumber}`,
      },
    });

    if (error) {
      toast.error(error.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button type="submit" size="lg" className="w-full" disabled={!stripe || submitting}>
        {submitting ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
}

export function StripePaymentForm({ clientSecret, orderNumber }: { clientSecret: string; orderNumber: string }) {
  if (!stripePromise) {
    return (
      <p className="text-sm text-error">
        Card payments are not configured in this environment. Please choose Cash on Delivery or Bank Transfer.
      </p>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance: { theme: "stripe", variables: { colorPrimary: "#17140f", borderRadius: "0px" } } }}
    >
      <PaymentFormInner orderNumber={orderNumber} />
    </Elements>
  );
}
