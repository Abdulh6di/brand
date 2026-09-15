import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { verifyPassword, hashPassword } from "@/lib/password";
import { updateProfileSchema, changePasswordSchema } from "@/validations/account";
import { apiSuccess, apiError, handleApiError } from "@/server/api-response";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return apiError("Not authenticated", 401);

    const body = await req.json();

    if (body.currentPassword) {
      const { currentPassword, newPassword } = changePasswordSchema.parse(body);
      const user = await db.user.findUnique({ where: { id: session.user.id } });
      if (!user?.passwordHash || !(await verifyPassword(currentPassword, user.passwordHash))) {
        return apiError("Current password is incorrect", 400);
      }
      await db.user.update({ where: { id: session.user.id }, data: { passwordHash: await hashPassword(newPassword) } });
      return apiSuccess({ updated: true });
    }

    const input = updateProfileSchema.parse(body);
    await db.user.update({ where: { id: session.user.id }, data: input });
    return apiSuccess({ updated: true });
  } catch (error) {
    return handleApiError(error);
  }
}
