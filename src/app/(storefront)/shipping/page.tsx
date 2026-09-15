import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shipping", description: "AELIA shipping rates, timelines, and courier information." };

export default function ShippingPage() {
  return (
    <div className="container-editorial max-w-3xl py-16 md:py-24">
      <div className="mb-12 text-center">
        <p className="kicker mb-3">Customer Care</p>
        <h1 className="font-display text-4xl md:text-5xl">Shipping</h1>
      </div>

      <div className="space-y-10 text-sm leading-relaxed text-charcoal/80">
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">Domestic Shipping</h2>
          <p>
            Standard delivery within the United States takes 5–9 business days and is
            complimentary on orders over $500. Express delivery (2–3 business days) is
            available at checkout for a flat rate.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">International Shipping</h2>
          <p>
            We ship to the United Kingdom, Canada, the UAE, and Pakistan, with delivery
            estimates of 9–16 business days depending on destination and customs processing.
            Duties and taxes are calculated at checkout where applicable.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">Made-to-Order &amp; Custom Pieces</h2>
          <p>
            Made-to-order and fully custom pieces require an additional 2–3 weeks of production
            time before shipping, as each piece is cut and finished individually once your order
            is placed.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">Order Tracking</h2>
          <p>
            Once your order ships, you&apos;ll receive a tracking link by email. You can also
            check status anytime from your{" "}
            <a href="/track-order" className="underline">
              order tracking page
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
