"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { AdminButton, AdminInput, AdminSelect, AdminCard, AdminBadge, AdminLabel } from "@/components/admin/ui";
import { formatMoney } from "@/lib/utils";
import type { Coupon } from "@/generated/prisma/client";

export function CouponsManager({ initial }: { initial: Coupon[] }) {
  const [coupons, setCoupons] = React.useState(initial);
  const [showForm, setShowForm] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      code: formData.get("code"),
      type: formData.get("type"),
      value: Number(formData.get("value")),
      minOrderAmount: formData.get("minOrderAmount") ? Number(formData.get("minOrderAmount")) * 100 : undefined,
      usageLimit: formData.get("usageLimit") ? Number(formData.get("usageLimit")) : undefined,
      perUserLimit: formData.get("perUserLimit") ? Number(formData.get("perUserLimit")) : undefined,
      expiresAt: formData.get("expiresAt") || undefined,
      firstOrderOnly: formData.get("firstOrderOnly") === "on",
    };

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCoupons((prev) => [json.data.coupon, ...prev]);
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to create coupon");
    } finally {
      setSaving(false);
    }
  }

  async function onToggle(coupon: Coupon) {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? json.data.coupon : c)));
    } catch {
      toast.error("Unable to update coupon");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (res.ok) setCoupons((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      {showForm ? (
        <AdminCard className="mb-6">
          <form onSubmit={onCreate} className="grid gap-4 sm:grid-cols-3">
            <div>
              <AdminLabel>Code</AdminLabel>
              <AdminInput name="code" required />
            </div>
            <div>
              <AdminLabel>Type</AdminLabel>
              <AdminSelect name="type">
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed ($)</option>
              </AdminSelect>
            </div>
            <div>
              <AdminLabel>Value</AdminLabel>
              <AdminInput name="value" type="number" required />
            </div>
            <div>
              <AdminLabel>Min Order (USD)</AdminLabel>
              <AdminInput name="minOrderAmount" type="number" />
            </div>
            <div>
              <AdminLabel>Usage Limit</AdminLabel>
              <AdminInput name="usageLimit" type="number" />
            </div>
            <div>
              <AdminLabel>Per-User Limit</AdminLabel>
              <AdminInput name="perUserLimit" type="number" />
            </div>
            <div>
              <AdminLabel>Expires At</AdminLabel>
              <AdminInput name="expiresAt" type="date" />
            </div>
            <label className="mt-6 flex items-center gap-2 text-sm">
              <input type="checkbox" name="firstOrderOnly" /> First order only
            </label>
            <div className="flex items-end gap-2">
              <AdminButton type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </AdminButton>
              <AdminButton type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </AdminButton>
            </div>
          </form>
        </AdminCard>
      ) : (
        <AdminButton className="mb-6" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> New Coupon
        </AdminButton>
      )}

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs text-neutral-500">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-neutral-100 last:border-none">
                <td className="px-4 py-3 font-medium">{coupon.code}</td>
                <td className="px-4 py-3">{coupon.type === "PERCENTAGE" ? `${coupon.value}%` : formatMoney(coupon.value, "USD")}</td>
                <td className="px-4 py-3">
                  {coupon.usedCount}
                  {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => onToggle(coupon)}>
                    <AdminBadge tone={coupon.isActive ? "success" : "neutral"}>{coupon.isActive ? "Active" : "Inactive"}</AdminBadge>
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onDelete(coupon.id)} className="text-neutral-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
