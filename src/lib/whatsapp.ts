import { siteConfig } from "@/config/site";

export function buildWhatsAppLink(message: string, phone: string = siteConfig.contact.whatsapp) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}

export function buildProductInquiryMessage(params: {
  name: string;
  url: string;
  sku: string;
  size?: string;
  color?: string;
}) {
  const lines = [
    `Hi AELIA, I'd like to ask about:`,
    params.name,
    `SKU: ${params.sku}`,
    params.size ? `Size: ${params.size}` : null,
    params.color ? `Color: ${params.color}` : null,
    params.url,
  ].filter(Boolean);
  return lines.join("\n");
}
