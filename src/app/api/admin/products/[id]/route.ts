import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { adminProductSchema } from "@/validations/admin-product";
import { recordAuditLog } from "@/server/audit-log";
import { apiSuccess, apiError, handleApiError } from "@/server/api-response";
import { getClientIp } from "@/server/rate-limit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("products.update");
    const { id } = await params;
    const input = adminProductSchema.parse(await req.json());

    const existing = await db.product.findUnique({ where: { id }, include: { images: true, variants: true, collections: true } });
    if (!existing) return apiError("Product not found", 404);

    const existingVariantIds = existing.variants.map((v) => v.id);
    const incomingVariantIds = input.variants.filter((v) => v.id).map((v) => v.id as string);
    const variantIdsToDelete = existingVariantIds.filter((vid) => !incomingVariantIds.includes(vid));

    const product = await db.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (variantIdsToDelete.length) {
        await tx.productVariant.deleteMany({ where: { id: { in: variantIdsToDelete } } });
      }

      for (const v of input.variants) {
        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: { sku: v.sku, color: v.color, size: v.size, stock: v.stock, priceOverride: v.priceOverride },
          });
        } else {
          await tx.productVariant.create({
            data: { productId: id, sku: v.sku, color: v.color, size: v.size, stock: v.stock, priceOverride: v.priceOverride },
          });
        }
      }

      return tx.product.update({
        where: { id },
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
          publishedAt: input.status === "ACTIVE" && !existing.publishedAt ? new Date() : undefined,
          collections: { set: input.collectionIds.map((cid) => ({ id: cid })) },
          images: { create: input.images.map((img, i) => ({ ...img, sortOrder: i })) },
        },
      });
    });

    await recordAuditLog({
      userId: session.user.id,
      action: "UPDATE",
      entity: "Product",
      entityId: id,
      oldValue: { name: existing.name, price: existing.price, status: existing.status },
      newValue: { name: input.name, price: input.price, status: input.status },
      ipAddress: getClientIp(req),
    });

    return apiSuccess({ product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("products.delete");
    const { id } = await params;

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) return apiError("Product not found", 404);

    await db.product.update({ where: { id }, data: { status: "ARCHIVED", deletedAt: new Date() } });

    await recordAuditLog({
      userId: session.user.id,
      action: "ARCHIVE",
      entity: "Product",
      entityId: id,
      oldValue: { status: existing.status },
      newValue: { status: "ARCHIVED" },
      ipAddress: getClientIp(req),
    });

    return apiSuccess({ archived: true });
  } catch (error) {
    return handleApiError(error);
  }
}
