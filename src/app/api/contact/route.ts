import { NextRequest } from "next/server";
import { contactSchema } from "@/validations/contact";
import { sendEmail } from "@/server/email";
import { siteConfig } from "@/config/site";
import { apiSuccess, apiError, handleApiError } from "@/server/api-response";
import { rateLimit, getClientIp } from "@/server/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { success } = await rateLimit(`contact:${getClientIp(req)}`, 5, 300);
    if (!success) return apiError("Too many requests. Please try again shortly.", 429);

    const input = contactSchema.parse(await req.json());

    await sendEmail({
      to: siteConfig.contact.email,
      subject: `Contact form: ${input.subject}`,
      html: `<p><strong>From:</strong> ${input.name} (${input.email})</p><p><strong>Phone:</strong> ${input.phone ?? "—"}</p><p>${input.message}</p>`,
    });

    return apiSuccess({ sent: true });
  } catch (error) {
    return handleApiError(error);
  }
}
