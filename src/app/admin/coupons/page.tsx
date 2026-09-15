import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { AdminPageHeader } from "@/components/admin/ui";
import { CouponsManager } from "@/components/admin/coupons-manager";

export const metadata: Metadata = { title: "Coupons — Admin" };

export default async function AdminCouponsPage() {
  await requirePermission("coupons.read");
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <AdminPageHeader title="Coupons" description={`${coupons.length} coupons`} />
      <CouponsManager initial={coupons} />
    </div>
  );
}
