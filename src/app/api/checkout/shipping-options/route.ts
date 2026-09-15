import { NextRequest } from "next/server";
import { getShippingOptions } from "@/server/shipping";
import { apiSuccess, handleApiError } from "@/server/api-response";

export async function GET(req: NextRequest) {
  try {
    const country = req.nextUrl.searchParams.get("country") ?? "";
    const subtotal = Number(req.nextUrl.searchParams.get("subtotal") ?? 0);
    const options = await getShippingOptions(country, subtotal);
    return apiSuccess({ options });
  } catch (error) {
    return handleApiError(error);
  }
}
