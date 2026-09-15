import type { Metadata } from "next";
import { FaqAccordion } from "@/components/storefront/faq-accordion";

export const metadata: Metadata = { title: "FAQ", description: "Frequently asked questions about AELIA orders, sizing, and shipping." };

const FAQ_ITEMS = [
  {
    question: "How long does a made-to-order piece take?",
    answer: "Made-to-order pieces typically take 2–3 weeks to produce, plus standard shipping time, since each is cut and finished individually once your order is confirmed.",
  },
  {
    question: "Can I request a custom size not listed?",
    answer: "Yes. Select \"Custom\" at checkout, or submit a custom order request with your measurements, and our team will confirm fit before production begins.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept major credit and debit cards, bank transfer, and Cash on Delivery in select regions. All card payments are processed securely and we never store your card details.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we currently ship to the United States, United Kingdom, Canada, the UAE, and Pakistan, with more destinations added regularly.",
  },
  {
    question: "How do I care for embroidered or beaded pieces?",
    answer: "We recommend dry cleaning only for embellished pieces. Store folded with acid-free tissue paper to protect delicate threadwork, away from direct sunlight.",
  },
  {
    question: "Can I return a custom or made-to-order piece?",
    answer: "Because these pieces are cut specifically for you, they are final sale except in the case of a manufacturing defect. Ready-to-wear pieces can be returned within 14 days.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="container-editorial max-w-3xl py-16 md:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mb-12 text-center">
        <p className="kicker mb-3">Support</p>
        <h1 className="font-display text-4xl md:text-5xl">Frequently Asked Questions</h1>
      </div>
      <FaqAccordion items={FAQ_ITEMS} />
    </div>
  );
}
