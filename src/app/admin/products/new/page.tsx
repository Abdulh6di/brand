import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { AdminPageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "New Product — Admin" };

export default async function NewProductPage() {
  await requirePermission("products.create");
  const [categories, collections] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.collection.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <AdminPageHeader title="New Product" />
      <ProductForm categories={categories} collections={collections} />
    </div>
  );
}
