import { z } from "zod";

export const checkoutSchema = z.object({
  email: z.string().email("Enter a valid email"),
  fullName: z.string().trim().min(2, "Enter your full name"),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
  country: z.string().min(1, "Select a country"),
  city: z.string().trim().min(1, "Enter a city"),
  addressLine1: z.string().trim().min(3, "Enter your address"),
  addressLine2: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  shippingMethod: z.string().min(1, "Select a delivery method"),
  paymentMethod: z.enum(["CARD", "COD", "BANK_TRANSFER"]),
  customerNote: z.string().trim().max(500).optional(),
  createAccount: z.boolean().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
