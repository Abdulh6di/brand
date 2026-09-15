import { NextRequest } from "next/server";
import { storageProvider, ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/server/storage";
import { apiSuccess, apiError, handleApiError } from "@/server/api-response";
import { rateLimit, getClientIp } from "@/server/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { success } = await rateLimit(`upload:${getClientIp(req)}`, 15, 60);
    if (!success) return apiError("Too many uploads, please slow down", 429);

    const formData = await req.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") ?? "misc").replace(/[^a-z0-9-]/gi, "");

    if (!(file instanceof File)) return apiError("No file provided", 400);
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return apiError("Only JPEG, PNG, or WebP images are allowed", 415);
    if (file.size > MAX_UPLOAD_BYTES) return apiError("Image must be smaller than 8MB", 413);

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await storageProvider.uploadImage(buffer, folder);

    return apiSuccess(result, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not configured")) {
      return apiError(error.message, 503);
    }
    return handleApiError(error);
  }
}
