"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Address } from "@/generated/prisma/client";

const COUNTRIES = ["United States", "United Kingdom", "Canada", "United Arab Emirates", "Pakistan"];

export function AddressesManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = React.useState(initialAddresses);
  const [showForm, setShowForm] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      country: formData.get("country"),
      city: formData.get("city"),
      addressLine1: formData.get("addressLine1"),
      addressLine2: formData.get("addressLine2") || undefined,
      postalCode: formData.get("postalCode") || undefined,
      isDefault: formData.get("isDefault") === "on",
    };

    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setAddresses((prev) => [json.data.address, ...prev.map((a) => (payload.isDefault ? { ...a, isDefault: false } : a))]);
      setShowForm(false);
      toast.success("Address saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save address");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast.error("Unable to delete address");
    }
  }

  return (
    <div>
      <div className="space-y-4">
        {addresses.map((address) => (
          <div key={address.id} className="flex items-start justify-between border border-line p-5 text-sm">
            <div>
              <p className="font-medium">
                {address.fullName} {address.isDefault && <span className="kicker ml-2">Default</span>}
              </p>
              <p className="mt-1 text-charcoal/70">
                {address.addressLine1}
                {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                <br />
                {address.city}, {address.country} {address.postalCode}
                <br />
                {address.phone}
              </p>
            </div>
            <button aria-label="Delete address" onClick={() => onDelete(address.id)} className="text-taupe hover:text-error">
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <form onSubmit={onSubmit} className="mt-8 space-y-4 border-t border-line pt-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" required />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <select id="country" name="country" className="h-12 w-full border border-line bg-warm-white px-4 text-sm">
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="addressLine1">Address</Label>
              <Input id="addressLine1" name="addressLine1" required />
            </div>
            <div>
              <Label htmlFor="addressLine2">Apartment (optional)</Label>
              <Input id="addressLine2" name="addressLine2" />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" name="postalCode" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isDefault" className="accent-ink" /> Set as default address
          </label>
          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Address"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" className="mt-6" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Add Address
        </Button>
      )}
    </div>
  );
}
