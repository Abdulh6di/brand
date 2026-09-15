"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { AdminButton, AdminInput, AdminSelect, AdminCard } from "@/components/admin/ui";
import { slugifyText } from "@/lib/utils";
import type { Category } from "@/generated/prisma/client";

export function CategoriesManager({ initial }: { initial: Category[] }) {
  const [categories, setCategories] = React.useState(initial);
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [savingId, setSavingId] = React.useState<string | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: slugifyText(name), status: "ACTIVE" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCategories((prev) => [...prev, json.data.category]);
      setName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to create category");
    } finally {
      setSaving(false);
    }
  }

  async function onToggleStatus(category: Category) {
    setSavingId(category.id);
    try {
      const nextStatus = category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: category.name, slug: category.slug, status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCategories((prev) => prev.map((c) => (c.id === category.id ? json.data.category : c)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update category");
    } finally {
      setSavingId(null);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete category");
    }
  }

  return (
    <div>
      <AdminCard className="mb-6">
        <form onSubmit={onCreate} className="flex gap-3">
          <AdminInput placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
          <AdminButton type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
          </AdminButton>
        </form>
      </AdminCard>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs text-neutral-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-neutral-100 last:border-none">
                <td className="px-4 py-3 font-medium">{category.name}</td>
                <td className="px-4 py-3 text-neutral-500">{category.slug}</td>
                <td className="px-4 py-3">
                  <AdminSelect
                    value={category.status}
                    disabled={savingId === category.id}
                    onChange={() => onToggleStatus(category)}
                    className="w-32"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </AdminSelect>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onDelete(category.id)} className="text-neutral-400 hover:text-red-600">
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
