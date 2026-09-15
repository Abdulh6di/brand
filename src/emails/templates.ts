import { formatMoney } from "@/lib/utils";
import { siteConfig } from "@/config/site";

function baseLayout(bodyHtml: string, previewText: string) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background-color:#f7f3ec;font-family:Georgia,'Times New Roman',serif;color:#17140f;">
    <span style="display:none;font-size:1px;color:#f7f3ec;">${previewText}</span>
    <table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#fbf9f5;">
      <tr>
        <td style="padding:40px 40px 24px;text-align:center;border-bottom:1px solid #e3d9c9;">
          <span style="font-size:22px;letter-spacing:4px;">${siteConfig.name}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:40px;">${bodyHtml}</td>
      </tr>
      <tr>
        <td style="padding:24px 40px;border-top:1px solid #e3d9c9;text-align:center;font-family:Arial,sans-serif;font-size:11px;color:#a6957e;">
          ${siteConfig.fullName} · ${siteConfig.contact.address}<br />
          © ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

const p = (text: string) =>
  `<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#2a2723;">${text}</p>`;

const button = (label: string, href: string) =>
  `<a href="${href}" style="display:inline-block;margin-top:16px;padding:14px 32px;background:#17140f;color:#fbf9f5;text-decoration:none;font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;">${label}</a>`;

export function welcomeEmail(name: string) {
  return baseLayout(
    `<h1 style="font-weight:500;font-size:26px;">Welcome, ${name}</h1>
     ${p("Your AELIA account has been created. Explore hand-finished pieces crafted in our atelier, save favorites to your wishlist, and track every order from your account dashboard.")}
     ${button("Start Shopping", `${siteConfig.url}/shop`)}`,
    `Welcome to ${siteConfig.name}`,
  );
}

export function passwordResetEmail(resetUrl: string) {
  return baseLayout(
    `<h1 style="font-weight:500;font-size:26px;">Reset Your Password</h1>
     ${p("We received a request to reset your password. This link expires in 1 hour. If you didn't request this, you can safely ignore this email.")}
     ${button("Reset Password", resetUrl)}`,
    "Reset your AELIA password",
  );
}

export function orderConfirmationEmail(params: { orderNumber: string; customerName: string; total: number; currency: string }) {
  return baseLayout(
    `<h1 style="font-weight:500;font-size:26px;">Thank You, ${params.customerName}</h1>
     ${p(`Your order <strong>#${params.orderNumber}</strong> has been confirmed. Total: <strong>${formatMoney(params.total, params.currency)}</strong>.`)}
     ${p("You'll receive another email as soon as your order ships.")}
     ${button("View Order", `${siteConfig.url}/order-confirmation/${params.orderNumber}`)}`,
    `Order ${params.orderNumber} confirmed`,
  );
}

export function orderShippedEmail(params: { orderNumber: string; trackingUrl?: string | null }) {
  return baseLayout(
    `<h1 style="font-weight:500;font-size:26px;">Your Order Has Shipped</h1>
     ${p(`Order <strong>#${params.orderNumber}</strong> is on its way to you.`)}
     ${params.trackingUrl ? button("Track Shipment", params.trackingUrl) : ""}`,
    `Order ${params.orderNumber} has shipped`,
  );
}

export function customOrderReceivedEmail(referenceNumber: string) {
  return baseLayout(
    `<h1 style="font-weight:500;font-size:26px;">We've Received Your Request</h1>
     ${p(`Thank you for your custom order request, reference <strong>${referenceNumber}</strong>. Our design team will review your submission and reach out within 2 business days with a quote.`)}`,
    "Your custom order request",
  );
}
