import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/validations/auth";
import { sendEmail } from "@/server/email";
import { passwordResetEmail } from "@/emails/templates";
import { siteConfig } from "@/config/site";
import { apiSuccess, handleApiError } from "@/server/api-response";
import { rateLimit, getClientIp } from "@/server/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { success } = await rateLimit(`forgot-password:${getClientIp(req)}`, 5, 300);
    if (!success) return apiSuccess({ sent: true }); // don't leak rate-limit state to attackers

    const { email } = forgotPasswordSchema.parse(await req.json());
    const normalizedEmail = email.toLowerCase();

    const user = await db.user.findUnique({ where: { email: normalizedEmail } });
    // Always return success to avoid leaking whether an email is registered.
    if (user) {
      const token = nanoid(48);
      await db.passwordResetToken.create({
        data: { email: normalizedEmail, token, expires: new Date(Date.now() + 60 * 60 * 1000) },
      });
      await sendEmail({
        to: normalizedEmail,
        subject: "Reset your AELIA password",
        html: passwordResetEmail(`${siteConfig.url}/account/reset-password?token=${token}`),
      });
    }

    return apiSuccess({ sent: true });
  } catch (error) {
    return handleApiError(error);
  }
}
