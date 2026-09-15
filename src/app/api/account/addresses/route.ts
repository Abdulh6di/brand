import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { addressSchema } from "@/validations/account";
import { apiSuccess, apiError, handleApiError } from "@/server/api-response";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return apiError("Not authenticated", 401);
    const addresses = await db.address.findMany({ where: { userId: session.user.id }, orderBy: { isDefault: "desc" } });
    return apiSuccess({ addresses });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return apiError("Not authenticated", 401);

    const input = addressSchema.parse(await req.json());

    if (input.isDefault) {
      await db.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
    }

    const address = await db.address.create({ data: { ...input, userId: session.user.id } });
    return apiSuccess({ address }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
