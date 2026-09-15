import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { addressSchema } from "@/validations/account";
import { apiSuccess, apiError, handleApiError } from "@/server/api-response";

async function assertOwnership(id: string, userId: string) {
  return db.address.findFirst({ where: { id, userId } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return apiError("Not authenticated", 401);

    const { id } = await params;
    const existing = await assertOwnership(id, session.user.id);
    if (!existing) return apiError("Address not found", 404);

    const input = addressSchema.partial().parse(await req.json());

    if (input.isDefault) {
      await db.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
    }

    const address = await db.address.update({ where: { id }, data: input });
    return apiSuccess({ address });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return apiError("Not authenticated", 401);

    const { id } = await params;
    const existing = await assertOwnership(id, session.user.id);
    if (!existing) return apiError("Address not found", 404);

    await db.address.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
