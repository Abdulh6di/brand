/**
 * WhatsApp Business API abstraction. `buildWhatsAppLink` (src/lib/whatsapp.ts)
 * covers the click-to-chat deep links used throughout the storefront today.
 * This module is the seam for automated, server-initiated messages (order
 * status pushes, custom-order confirmations) once WHATSAPP_API_TOKEN and
 * WHATSAPP_PHONE_NUMBER_ID are configured against the Meta Cloud API.
 */

export interface WhatsAppMessenger {
  sendTemplateMessage(to: string, template: string, params: string[]): Promise<{ success: boolean; id?: string }>;
}

class MetaCloudApiMessenger implements WhatsAppMessenger {
  async sendTemplateMessage(to: string, template: string, params: string[]) {
    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!token || !phoneNumberId) {
      console.warn("[whatsapp] WHATSAPP_API_TOKEN/WHATSAPP_PHONE_NUMBER_ID not configured — message not sent", {
        to,
        template,
        params,
      });
      return { success: false };
    }

    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: "en_US" },
          components: [{ type: "body", parameters: params.map((text) => ({ type: "text", text })) }],
        },
      }),
    });

    if (!res.ok) {
      console.error("[whatsapp] failed to send message", await res.text());
      return { success: false };
    }

    const data = (await res.json()) as { messages?: Array<{ id: string }> };
    return { success: true, id: data.messages?.[0]?.id };
  }
}

export const whatsappMessenger: WhatsAppMessenger = new MetaCloudApiMessenger();
