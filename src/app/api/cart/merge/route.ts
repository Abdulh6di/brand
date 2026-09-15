import { auth } from "@/lib/auth";
import { mergeGuestCartIntoUser } from "@/server/cart";
import { apiSuccess, apiError, handleApiError } from "@/server/api-response";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) return apiError("Not authenticated", 401);
    await mergeGuestCartIntoUser(session.user.id);
    return apiSuccess({ merged: true });
  } catch (error) {
    return handleApiError(error);
  }
}
