import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  phone: z.string().trim().max(30).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const addressSchema = z.object({
  fullName: z.string().trim().min(2),
  phone: z.string().trim().min(6),
  country: z.string().min(1),
  city: z.string().trim().min(1),
  addressLine1: z.string().trim().min(3),
  addressLine2: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  type: z.enum(["SHIPPING", "BILLING"]).default("SHIPPING"),
  isDefault: z.boolean().default(false),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
