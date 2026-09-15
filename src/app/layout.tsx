import type { Metadata } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { siteConfig } from "@/config/site";
import { Providers } from "@/components/providers";
import { AnalyticsScripts } from "@/components/shared/analytics-scripts";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["luxury fashion", "bridal wear", "made to order", "designer clothing", "AELIA"],
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/favicon.ico`,
  sameAs: [siteConfig.social.instagram, siteConfig.social.pinterest, siteConfig.social.tiktok],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    contactType: "customer service",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteConfig.url}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodoni.variable} ${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-warm-white text-ink antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <AnalyticsScripts />
        <Providers>{children}</Providers>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              borderRadius: 0,
              border: "1px solid var(--color-line)",
              background: "var(--color-warm-white)",
              color: "var(--color-ink)",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
