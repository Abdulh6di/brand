import type { Metadata } from "next";
import Image from "next/image";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { AdminPageHeader, AdminCard, AdminBadge } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Lookbook — Admin" };

export default async function AdminLookbookPage() {
  await requirePermission("lookbook.read");
  const lookbooks = await db.lookbook.findMany({
    include: { images: { take: 4, orderBy: { sortOrder: "asc" } }, _count: { select: { images: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <AdminPageHeader
        title="Lookbook"
        description="Manage editorial galleries. Full image/product-tagging editor coming soon — images are seeded via the database today."
      />
      <div className="space-y-4">
        {lookbooks.map((lb) => (
          <AdminCard key={lb.id}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{lb.title}</p>
                <p className="text-xs text-neutral-500">
                  {lb._count.images} images · {formatDate(lb.createdAt)}
                </p>
              </div>
              <AdminBadge tone={lb.status === "PUBLISHED" ? "success" : "neutral"}>{lb.status}</AdminBadge>
            </div>
            <div className="flex gap-2">
              {lb.images.map((img) => (
                <div key={img.id} className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-200">
                  <Image src={img.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                </div>
              ))}
            </div>
          </AdminCard>
        ))}
        {lookbooks.length === 0 && <p className="text-sm text-neutral-400">No lookbooks yet.</p>}
      </div>
    </div>
  );
}
