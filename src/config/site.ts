export const siteConfig = {
  name: "AELIA",
  fullName: "AELIA House of Design",
  tagline: "The Art of Elegance",
  description:
    "AELIA crafts made-to-measure and ready-to-wear luxury womenswear — bridal, occasion, and everyday pieces cut from rare fabrics and finished entirely by hand.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/images/og-default.jpg",
  currency: "USD",
  locale: "en-US",
  contact: {
    email: "atelier@aelia.com",
    phone: "+1 (555) 019-2244",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "15551234567",
    address: "12 Rue de la Mode, Paris, France",
    hours: "Monday – Saturday, 10:00 – 19:00 CET",
  },
  social: {
    instagram: "https://instagram.com/aelia",
    pinterest: "https://pinterest.com/aelia",
    tiktok: "https://tiktok.com/@aelia",
  },
  nav: {
    main: [
      { label: "Shop", href: "/shop" },
      { label: "Collections", href: "/collections" },
      { label: "New Arrivals", href: "/category/new-arrivals" },
      { label: "Bridal", href: "/category/bridal" },
      { label: "Party Wear", href: "/category/party-wear" },
      { label: "Lookbook", href: "/lookbook" },
      { label: "About", href: "/about" },
    ],
    footerShop: [
      { label: "Shop All", href: "/shop" },
      { label: "Collections", href: "/collections" },
      { label: "Lookbook", href: "/lookbook" },
      { label: "Custom Order", href: "/custom-order" },
      { label: "Gift Cards", href: "/shop?category=accessories" },
    ],
    footerCare: [
      { label: "Contact Us", href: "/contact" },
      { label: "Track Order", href: "/track-order" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "FAQ", href: "/faq" },
    ],
    footerAbout: [
      { label: "Our Story", href: "/about" },
      { label: "Journal", href: "/blog" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
  categories: [
    { label: "Bridal", slug: "bridal" },
    { label: "Party Wear", slug: "party-wear" },
    { label: "Luxury Pret", slug: "luxury-pret" },
    { label: "Ready to Wear", slug: "ready-to-wear" },
    { label: "Made to Order", slug: "made-to-order" },
    { label: "New Arrivals", slug: "new-arrivals" },
    { label: "Accessories", slug: "accessories" },
  ],
} as const;

export const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "Custom"] as const;

export type SizeOption = (typeof sizeOptions)[number];
