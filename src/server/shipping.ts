import { db } from "@/lib/db";

const DEFAULT_RATE = { method: "Standard", price: 1500, freeShippingThreshold: 50000, estimatedDaysMin: 5, estimatedDaysMax: 9 };

export async function getShippingOptions(country: string, subtotal: number) {
  const zone = await db.shippingZone.findFirst({
    where: { countries: { has: country } },
    include: { rates: true },
  });

  const rates = zone?.rates.length ? zone.rates : [DEFAULT_RATE];

  return rates.map((rate) => ({
    method: rate.method,
    price: rate.freeShippingThreshold && subtotal >= rate.freeShippingThreshold ? 0 : rate.price,
    estimatedDaysMin: rate.estimatedDaysMin,
    estimatedDaysMax: rate.estimatedDaysMax,
  }));
}
