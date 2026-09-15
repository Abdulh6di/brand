"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AdminButton, AdminSelect, AdminInput, AdminLabel, AdminCard } from "@/components/admin/ui";
import type { Order } from "@/generated/prisma/client";

const STATUSES = [
  "PENDING", "CONFIRMED", "PAYMENT_PENDING", "PAID", "PROCESSING", "CUSTOMIZATION",
  "IN_PRODUCTION", "READY", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED",
  "RETURN_REQUESTED", "RETURNED", "REFUNDED",
];

export function OrderStatusPanel({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = React.useState(order.status);
  const [note, setNote] = React.useState("");
  const [trackingCourier, setTrackingCourier] = React.useState(order.trackingCourier ?? "");
  const [trackingNumber, setTrackingNumber] = React.useState(order.trackingNumber ?? "");
  const [trackingUrl, setTrackingUrl] = React.useState(order.trackingUrl ?? "");
  const [internalNote, setInternalNote] = React.useState(order.internalNote ?? "");
  const [saving, setSaving] = React.useState(false);

  async function onSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note, trackingCourier, trackingNumber, trackingUrl, internalNote }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Order updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update order");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminCard>
      <p className="mb-4 text-sm font-medium">Manage Order</p>
      <div className="space-y-4">
        <div>
          <AdminLabel>Status</AdminLabel>
          <AdminSelect value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </AdminSelect>
        </div>
        <div>
          <AdminLabel>Status Note (visible in timeline)</AdminLabel>
          <AdminInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <AdminLabel>Courier</AdminLabel>
            <AdminInput value={trackingCourier} onChange={(e) => setTrackingCourier(e.target.value)} />
          </div>
          <div>
            <AdminLabel>Tracking #</AdminLabel>
            <AdminInput value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
          </div>
          <div>
            <AdminLabel>Tracking URL</AdminLabel>
            <AdminInput value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} />
          </div>
        </div>
        <div>
          <AdminLabel>Internal Notes (staff only)</AdminLabel>
          <AdminInput value={internalNote} onChange={(e) => setInternalNote(e.target.value)} />
        </div>
        <AdminButton onClick={onSave} disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
        </AdminButton>
      </div>
    </AdminCard>
  );
}
