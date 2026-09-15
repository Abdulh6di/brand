import { z } from "zod";

export const adminProductSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  sku: z.string().trim().min(2),
  description: z.string().trim().min(10),
  shortDescription: z.string().trim().optional(),
  price: z.number().int().positive(),
  salePrice: z.number().int().positive().nullable().optional(),
  categoryId: z.string().min(1),
  fabric: z.string().optional(),
  lowStockThreshold: z.number().int().min(0).default(5),
  status: z.enum(["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"]),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isLimited: z.boolean().default(false),
  isExclusive: z.boolean().default(false),
  isCustomizable: z.boolean().default(false),
  availableSizes: z.array(z.string()).default([]),
  availableColors: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  collectionIds: z.array(z.string()).default([]),
  images: z.array(z.object({ url: z.string().url(), altText: z.string().default(""), isPrimary: z.boolean().default(false) })).default([]),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        sku: z.string().min(1),
        color: z.string().optional(),
        size: z.string().optional(),
        stock: z.number().int().min(0),
        priceOverride: z.number().int().positive().nullable().optional(),
      }),
    )
    .default([]),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;
