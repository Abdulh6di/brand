import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { customOrderSchema } from "@/validations/custom-order";
import { sendEmail } from "@/server/email";
import { customOrderReceivedEmail } from "@/emails/templates";
import { apiSuccess, apiError, handleApiError } from "@/server/api-response";
import { rateLimit, getClientIp } from "@/server/rate-limit";

async function generateReferenceNumber() {
  const count = await db.customOrder.count();
  return `AEL-CO-${String(1000 + count + 1)}`;
}

export async function POST(req: NextRequest) {
  try {
    const { success } = await rateLimit(`custom-order:${getClientIp(req)}`, 5, 300);
    if (!success) return apiError("Too many requests. Please try again shortly.", 429);

    const input = customOrderSchema.parse(await req.json());
    const session = await auth();

    const referenceNumber = await generateReferenceNumber();

    const customOrder = await db.customOrder.create({
      data: {
        referenceNumber,
        userId: session?.user?.id,
        name: input.name,
        email: input.email,
        phone: input.phone,
        category: input.category,
        fabric: input.fabric,
        color: input.color,
        size: input.size,
        deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : undefined,
        budget: input.budget ? input.budget * 100 : undefined,
        specialRequirements: input.specialRequirements,
        measurements: input.measurements,
        images: input.imageUrls?.length ? { create: input.imageUrls.map((url) => ({ url })) } : undefined,
      },
    });

    await sendEmail({
      to: input.email,
      subject: "We've received your custom order request",
      html: customOrderReceivedEmail(referenceNumber),
    });

    return apiSuccess({ referenceNumber: customOrder.referenceNumber }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
