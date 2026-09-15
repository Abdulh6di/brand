import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { AdminPageHeader } from "@/components/admin/ui";
import { ReviewsManager } from "@/components/admin/reviews-manager";

export const metadata: Metadata = { title: "Reviews — Admin" };

export default async function AdminReviewsPage() {
  await requirePermission("reviews.read");
  const reviews = await db.review.findMany({
    include: { user: { select: { name: true, email: true } }, product: { select: { name: true, slug: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <AdminPageHeader title="Reviews" description={`${reviews.length} reviews`} />
      <ReviewsManager initial={reviews} />
    </div>
  );
}
