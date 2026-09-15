import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).optional(),
  quantity: z.number().int().min(1).max(20).default(1),
  customizationSelections: z
    .array(z.object({ optionId: z.string(), choiceId: z.string() }))
    .max(20)
    .optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0).max(20).optional(),
  savedForLater: z.boolean().optional(),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
