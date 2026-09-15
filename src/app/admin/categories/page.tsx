import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { AdminPageHeader } from "@/components/admin/ui";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const metadata: Metadata = { title: "Categories — Admin" };

export default async function AdminCategoriesPage() {
  await requirePermission("categories.read");
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <AdminPageHeader title="Categories" description={`${categories.length} categories`} />
      <CategoriesManager initial={categories} />
    </div>
  );
}
