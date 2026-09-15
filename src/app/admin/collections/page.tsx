import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { AdminPageHeader } from "@/components/admin/ui";
import { CollectionsManager } from "@/components/admin/collections-manager";

export const metadata: Metadata = { title: "Collections — Admin" };

export default async function AdminCollectionsPage() {
  await requirePermission("collections.read");
  const collections = await db.collection.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <AdminPageHeader title="Collections" description={`${collections.length} collections`} />
      <CollectionsManager initial={collections} />
    </div>
  );
}
