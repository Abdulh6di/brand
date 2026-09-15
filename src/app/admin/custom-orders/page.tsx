import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { AdminPageHeader, AdminBadge } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Custom Orders — Admin" };

const TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  NEW: "info",
  QUOTED: "warning",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export default async function AdminCustomOrdersPage() {
  await requirePermission("customOrders.read");
  const customOrders = await db.customOrder.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <AdminPageHeader title="Custom Orders" description={`${customOrders.length} requests`} />
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs text-neutral-500">
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {customOrders.map((co) => (
              <tr key={co.id} className="border-b border-neutral-100 last:border-none hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/custom-orders/${co.id}`} className="font-medium hover:underline">
                    {co.referenceNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">{co.name}</td>
                <td className="px-4 py-3 text-neutral-500">{co.category ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-500">{formatDate(co.createdAt)}</td>
                <td className="px-4 py-3">
                  <AdminBadge tone={TONE[co.status] ?? "neutral"}>{co.status.replace(/_/g, " ")}</AdminBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
