import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/validations/auth";
import { sendEmail } from "@/server/email";
import { welcomeEmail } from "@/emails/templates";
import { apiSuccess, apiError, handleApiError } from "@/server/api-response";
import { rateLimit, getClientIp } from "@/server/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { success } = await rateLimit(`register:${getClientIp(req)}`, 5, 300);
    if (!success) return apiError("Too many attempts. Please try again later.", 429);

    const { name, email, password } = registerSchema.parse(await req.json());
    const normalizedEmail = email.toLowerCase();

    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return apiError("An account with this email already exists", 409);

    const customerRole = await db.role.findUnique({ where: { name: "CUSTOMER" } });
    if (!customerRole) return apiError("Registration is temporarily unavailable", 500);

    await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash: await hashPassword(password),
        roleId: customerRole.id,
        cart: { create: {} },
        wishlist: { create: {} },
      },
    });

    await sendEmail({ to: normalizedEmail, subject: `Welcome to AELIA`, html: welcomeEmail(name) });

    return apiSuccess({ registered: true }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
