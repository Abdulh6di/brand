import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { AdminPageHeader, AdminCard } from "@/components/admin/ui";
import { CustomOrderPanel } from "@/components/admin/custom-order-panel";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Custom Order — Admin" };

export default async function AdminCustomOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("customOrders.read");
  const { id } = await params;

  const customOrder = await db.customOrder.findUnique({ where: { id }, include: { images: true } });
  if (!customOrder) notFound();

  const measurements = customOrder.measurements as Record<string, string> | null;

  return (
    <div>
      <AdminPageHeader title={customOrder.referenceNumber} description={formatDate(customOrder.createdAt)} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AdminCard>
            <p className="mb-4 text-sm font-medium">Request Details</p>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-neutral-400">Name</dt>
                <dd>{customOrder.name}</dd>
              </div>
              <div>
                <dt className="text-neutral-400">Contact</dt>
                <dd>
                  {customOrder.email} · {customOrder.phone}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-400">Category</dt>
                <dd>{customOrder.category ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-neutral-400">Fabric / Color</dt>
                <dd>
                  {customOrder.fabric ?? "—"} / {customOrder.color ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-400">Size</dt>
                <dd>{customOrder.size ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-neutral-400">Delivery Needed By</dt>
                <dd>{customOrder.deliveryDate ? formatDate(customOrder.deliveryDate) : "—"}</dd>
              </div>
            </dl>

            {measurements && (
              <div className="mt-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-neutral-400">Measurements</p>
                <div className="flex gap-4 text-sm">
                  {Object.entries(measurements)
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <span key={k}>
                        {k}: {v}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {customOrder.specialRequirements && (
              <div className="mt-4">
                <p className="mb-1 text-xs uppercase tracking-wide text-neutral-400">Notes</p>
                <p className="text-sm">{customOrder.specialRequirements}</p>
              </div>
            )}
          </AdminCard>

          {customOrder.images.length > 0 && (
            <AdminCard>
              <p className="mb-4 text-sm font-medium">Reference Images</p>
              <div className="flex flex-wrap gap-3">
                {customOrder.images.map((img) => (
                  <div key={img.id} className="relative h-24 w-24 overflow-hidden rounded-md border border-neutral-200">
                    <Image src={img.url} alt="Reference" fill sizes="96px" className="object-cover" />
                  </div>
                ))}
              </div>
            </AdminCard>
          )}
        </div>

        <CustomOrderPanel customOrder={customOrder} />
      </div>
    </div>
  );
}
