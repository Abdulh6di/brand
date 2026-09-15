import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="container-editorial max-w-3xl py-16 md:py-24">
      <div className="mb-12 text-center">
        <p className="kicker mb-3">Legal</p>
        <h1 className="font-display text-4xl md:text-5xl">Terms of Service</h1>
        <p className="mt-3 text-xs text-taupe">Last updated: January 2026</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-charcoal/80">
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">Orders &amp; Payment</h2>
          <p>
            By placing an order, you confirm that all information provided is accurate. Prices
            are shown in the currency displayed at checkout and are subject to change without
            notice, though confirmed orders will honor the price at time of purchase.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">Made-to-Order Pieces</h2>
          <p>
            Made-to-order and custom pieces are produced specifically for you based on the
            specifications you provide. Production timelines are estimates and may vary based on
            complexity and material availability.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">Intellectual Property</h2>
          <p>
            All designs, photography, and content on this site are the property of{" "}
            {siteConfig.fullName} and may not be reproduced without written permission.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">Limitation of Liability</h2>
          <p>
            {siteConfig.name} is not liable for indirect or consequential damages arising from
            the use of our products or website, to the maximum extent permitted by law.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">Governing Law</h2>
          <p>These terms are governed by the laws of the jurisdiction in which {siteConfig.fullName} is registered.</p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">Contact</h2>
          <p>Questions about these terms can be directed to {siteConfig.contact.email}.</p>
        </section>
      </div>
    </div>
  );
}
