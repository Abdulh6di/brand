"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AdminButton, AdminSelect, AdminInput, AdminLabel, AdminCard } from "@/components/admin/ui";
import type { CustomOrder } from "@/generated/prisma/client";

const STATUSES = ["NEW", "CONTACTED", "QUOTED", "CUSTOMER_APPROVED", "DEPOSIT_PAID", "IN_PRODUCTION", "READY", "DELIVERED", "CANCELLED"];

export function CustomOrderPanel({ customOrder }: { customOrder: CustomOrder }) {
  const router = useRouter();
  const [status, setStatus] = React.useState(customOrder.status);
  const [quotedPrice, setQuotedPrice] = React.useState(customOrder.quotedPrice ? customOrder.quotedPrice / 100 : "");
  const [adminNote, setAdminNote] = React.useState(customOrder.adminNote ?? "");
  const [saving, setSaving] = React.useState(false);

  async function onSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/custom-orders/${customOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          quotedPrice: quotedPrice ? Math.round(Number(quotedPrice) * 100) : undefined,
          adminNote,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminCard>
      <p className="mb-4 text-sm font-medium">Manage Request</p>
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
          <AdminLabel>Quoted Price (USD)</AdminLabel>
          <AdminInput type="number" value={quotedPrice} onChange={(e) => setQuotedPrice(e.target.value)} />
        </div>
        <div>
          <AdminLabel>Admin Notes</AdminLabel>
          <AdminInput value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
        </div>
        <AdminButton onClick={onSave} disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
        </AdminButton>
      </div>
    </AdminCard>
  );
}
