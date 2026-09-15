import type { Metadata } from "next";
import { MessageCircle, Mail, Phone, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ContactForm } from "@/components/storefront/contact-form";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container-editorial py-16 md:py-24">
      <div className="mb-14 text-center">
        <p className="kicker mb-3">Get in Touch</p>
        <h1 className="font-display text-4xl md:text-5xl">Contact Us</h1>
      </div>

      <div className="grid gap-16 md:grid-cols-2">
        <div>
          <p className="mb-8 text-sm leading-relaxed text-charcoal/75">
            Whether you have a question about an order, a fabric, or a custom piece — our
            concierge team is here to help.
          </p>
          <div className="space-y-5 text-sm">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-taupe" strokeWidth={1.5} />
              {siteConfig.contact.phone}
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-taupe" strokeWidth={1.5} />
              {siteConfig.contact.email}
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-taupe" strokeWidth={1.5} />
              {siteConfig.contact.hours}
            </div>
            <a
              href={buildWhatsAppLink("Hi AELIA, I have a question.")}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 underline"
            >
              <MessageCircle className="h-4 w-4 text-taupe" strokeWidth={1.5} />
              Message us on WhatsApp
            </a>
          </div>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
