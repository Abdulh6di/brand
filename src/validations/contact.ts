import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().trim().optional(),
  subject: z.string().trim().min(2, "Enter a subject"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

export type ContactInput = z.infer<typeof contactSchema>;
