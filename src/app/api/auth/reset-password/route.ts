import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { resetPasswordSchema } from "@/validations/auth";
import { apiSuccess, apiError, handleApiError } from "@/server/api-response";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = resetPasswordSchema.parse(await req.json());

    const resetToken = await db.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken || resetToken.expires < new Date()) {
      return apiError("This reset link is invalid or has expired", 400);
    }

    const user = await db.user.findUnique({ where: { email: resetToken.email } });
    if (!user) return apiError("Account not found", 404);

    await db.$transaction([
      db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } }),
      db.passwordResetToken.delete({ where: { token } }),
    ]);

    return apiSuccess({ reset: true });
  } catch (error) {
    return handleApiError(error);
  }
}
