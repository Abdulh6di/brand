import { z } from "zod";

export const customOrderSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
  category: z.string().optional(),
  fabric: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  deliveryDate: z.string().optional(),
  budget: z.number().int().positive().optional(),
  specialRequirements: z.string().trim().max(1000).optional(),
  measurements: z
    .object({
      bust: z.string().optional(),
      waist: z.string().optional(),
      hips: z.string().optional(),
      height: z.string().optional(),
    })
    .optional(),
  imageUrls: z.array(z.string().url()).max(6).optional(),
});

export type CustomOrderInput = z.infer<typeof customOrderSchema>;
