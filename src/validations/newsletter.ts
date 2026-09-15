import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  name: z.string().trim().min(1).max(120).optional(),
  consent: z.boolean().refine((v) => v === true, "Consent is required to subscribe"),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
