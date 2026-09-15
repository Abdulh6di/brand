import type { Metadata } from "next";

export const metadata: Metadata = { title: "Returns", description: "AELIA return and refund policy." };

export default function ReturnsPage() {
  return (
    <div className="container-editorial max-w-3xl py-16 md:py-24">
      <div className="mb-12 text-center">
        <p className="kicker mb-3">Customer Care</p>
        <h1 className="font-display text-4xl md:text-5xl">Returns &amp; Exchanges</h1>
      </div>

      <div className="space-y-10 text-sm leading-relaxed text-charcoal/80">
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">Ready-to-Wear Pieces</h2>
          <p>
            Unworn, unaltered pieces in original condition with tags attached may be returned
            within 14 days of delivery for a full refund to your original payment method, or
            exchanged for a different size or color.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">Made-to-Order &amp; Custom Pieces</h2>
          <p>
            Because made-to-order and custom pieces are cut specifically for you, they are final
            sale and not eligible for return or exchange, except in the case of a manufacturing
            defect.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">How to Start a Return</h2>
          <p>
            Contact our concierge team via{" "}
            <a href="/contact" className="underline">
              the contact page
            </a>{" "}
            or WhatsApp with your order number, and we&apos;ll arrange a prepaid return label
            and walk you through the process.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">Refund Timeline</h2>
          <p>
            Once we receive and inspect your return, refunds are issued within 5–7 business
            days. Shipping charges are non-refundable except where the return is due to our
            error.
          </p>
        </section>
      </div>
    </div>
  );
}
