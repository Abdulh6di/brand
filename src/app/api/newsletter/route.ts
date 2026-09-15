import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { newsletterSchema } from "@/validations/newsletter";
import { apiSuccess, handleApiError } from "@/server/api-response";
import { rateLimit, getClientIp } from "@/server/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { success } = await rateLimit(`newsletter:${ip}`, 5, 60);
    if (!success) return handleApiError(new Error("Too many requests"));

    const isForm = req.headers.get("content-type")?.includes("application/x-www-form-urlencoded");
    const body = isForm ? Object.fromEntries((await req.formData()).entries()) : await req.json();

    const input = newsletterSchema.parse({ ...body, consent: true });

    await db.newsletterSubscriber.upsert({
      where: { email: input.email.toLowerCase() },
      update: { isSubscribed: true, name: input.name },
      create: { email: input.email.toLowerCase(), name: input.name, source: "website" },
    });

    if (isForm) {
      return Response.redirect(new URL("/?subscribed=1", req.url), 303);
    }
    return apiSuccess({ subscribed: true });
  } catch (error) {
    return handleApiError(error);
  }
}
