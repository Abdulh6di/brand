import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { AdminPageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { ArchiveButton } from "@/components/admin/archive-button";

export const metadata: Metadata = { title: "Edit Product — Admin" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("products.update");
  const { id } = await params;

  const [product, categories, collections] = await Promise.all([
    db.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } }, variants: true, collections: true } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.collection.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <AdminPageHeader
        title={product.name}
        action={<ArchiveButton endpoint={`/api/admin/products/${id}`} confirmText="Archive this product?" />}
      />
      <ProductForm
        productId={id}
        categories={categories}
        collections={collections}
        initial={{
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          shortDescription: product.shortDescription ?? undefined,
          price: product.price,
          salePrice: product.salePrice,
          categoryId: product.categoryId,
          fabric: product.fabric ?? undefined,
          status: product.status,
          isFeatured: product.isFeatured,
          isBestseller: product.isBestseller,
          isNew: product.isNew,
          isLimited: product.isLimited,
          isExclusive: product.isExclusive,
          isCustomizable: product.isCustomizable,
          availableSizes: product.availableSizes,
          availableColors: product.availableColors,
          collectionIds: product.collections.map((c) => c.id),
          images: product.images.map((img) => ({ url: img.url, altText: img.altText, isPrimary: img.isPrimary })),
          variants: product.variants.map((v) => ({ id: v.id, sku: v.sku, color: v.color ?? undefined, size: v.size ?? undefined, stock: v.stock })),
        }}
      />
    </div>
  );
}
