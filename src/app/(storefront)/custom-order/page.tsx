import type { Metadata } from "next";
import { CustomOrderForm } from "@/components/storefront/custom-order-form";

export const metadata: Metadata = {
  title: "Custom Order",
  description: "Submit a made-to-order request and our design team will craft your piece to your exact measurements.",
};

export default function CustomOrderPage() {
  return (
    <div className="container-editorial py-16 md:py-24">
      <div className="mb-14 text-center">
        <p className="kicker mb-3">Bespoke</p>
        <h1 className="font-display text-4xl md:text-5xl">Create Your Look</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm text-charcoal/75">
          Tell us your vision and our atelier will bring it to life — from fabric selection to
          the final fitting.
        </p>
      </div>
      <CustomOrderForm />
    </div>
  );
}
