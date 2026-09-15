import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { AdminPageHeader, AdminCard, AdminBadge } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Newsletter — Admin" };

export default async function AdminNewsletterPage() {
  await requirePermission("newsletter.read");
  const subscribers = await db.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const activeCount = subscribers.filter((s) => s.isSubscribed).length;

  return (
    <div>
      <AdminPageHeader title="Newsletter" description={`${subscribers.length} subscribers · ${activeCount} active`} />
      <AdminCard>
        <div className="max-h-[60vh] divide-y divide-neutral-100 overflow-y-auto">
          {subscribers.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <p>{sub.email}</p>
                {sub.name && <p className="text-xs text-neutral-500">{sub.name}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-400">{formatDate(sub.createdAt)}</span>
                <AdminBadge tone={sub.isSubscribed ? "success" : "neutral"}>{sub.isSubscribed ? "Subscribed" : "Unsubscribed"}</AdminBadge>
              </div>
            </div>
          ))}
          {subscribers.length === 0 && <p className="py-6 text-sm text-neutral-400">No subscribers yet.</p>}
        </div>
      </AdminCard>
    </div>
  );
}
