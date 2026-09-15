import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <div className="container-editorial max-w-3xl py-16 md:py-24">
      <div className="mb-12 text-center">
        <p className="kicker mb-3">Legal</p>
        <h1 className="font-display text-4xl md:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-xs text-taupe">Last updated: January 2026</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-charcoal/80">
        <p>
          {siteConfig.fullName} (&ldquo;AELIA,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) respects your
          privacy. This policy explains what information we collect, how we use it, and the
          choices you have.
        </p>
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">Information We Collect</h2>
          <p>
            We collect information you provide directly — name, email, phone, shipping address,
            and measurements for custom orders — as well as information collected automatically,
            such as browsing behavior and device data, to improve your shopping experience.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">How We Use Your Information</h2>
          <p>
            We use your information to process orders, provide customer support, send
            transactional and (with consent) marketing emails, prevent fraud, and improve our
            products and services.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">Payment Information</h2>
          <p>
            We never store your full card details. Card payments are processed by PCI-compliant
            third-party payment processors; we retain only the transaction reference needed to
            manage your order.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data at any
            time by contacting {siteConfig.contact.email}. You can unsubscribe from marketing
            emails using the link in any newsletter.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-xl text-ink">Contact</h2>
          <p>Questions about this policy can be directed to {siteConfig.contact.email}.</p>
        </section>
      </div>
    </div>
  );
}
