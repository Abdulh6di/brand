import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { adminProductSchema } from "@/validations/admin-product";
import { recordAuditLog } from "@/server/audit-log";
import { apiSuccess, handleApiError } from "@/server/api-response";
import { getClientIp } from "@/server/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission("products.create");
    const input = adminProductSchema.parse(await req.json());

    const product = await db.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        sku: input.sku,
        description: input.description,
        shortDescription: input.shortDescription,
        price: input.price,
        salePrice: input.salePrice,
        categoryId: input.categoryId,
        fabric: input.fabric,
        lowStockThreshold: input.lowStockThreshold,
        status: input.status,
        isFeatured: input.isFeatured,
        isBestseller: input.isBestseller,
        isNew: input.isNew,
        isLimited: input.isLimited,
        isExclusive: input.isExclusive,
        isCustomizable: input.isCustomizable,
        availableSizes: input.availableSizes,
        availableColors: input.availableColors,
        tags: input.tags,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        publishedAt: input.status === "ACTIVE" ? new Date() : undefined,
        collections: { connect: input.collectionIds.map((id) => ({ id })) },
        images: { create: input.images.map((img, i) => ({ ...img, sortOrder: i })) },
        variants: { create: input.variants.map((v) => ({ sku: v.sku, color: v.color, size: v.size, stock: v.stock, priceOverride: v.priceOverride })) },
      },
    });

    await recordAuditLog({
      userId: session.user.id,
      action: "CREATE",
      entity: "Product",
      entityId: product.id,
      newValue: input,
      ipAddress: getClientIp(req),
    });

    return apiSuccess({ product }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
