"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { AdminButton, AdminInput, AdminSelect, AdminCard } from "@/components/admin/ui";
import { slugifyText } from "@/lib/utils";
import type { Collection } from "@/generated/prisma/client";

export function CollectionsManager({ initial }: { initial: Collection[] }) {
  const [collections, setCollections] = React.useState(initial);
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: slugifyText(name), status: "DRAFT" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCollections((prev) => [...prev, json.data.collection]);
      setName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to create collection");
    } finally {
      setSaving(false);
    }
  }

  async function onStatusChange(collection: Collection, status: string) {
    try {
      const res = await fetch(`/api/admin/collections/${collection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: collection.name, slug: collection.slug, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCollections((prev) => prev.map((c) => (c.id === collection.id ? json.data.collection : c)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update collection");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this collection?")) return;
    try {
      const res = await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setCollections((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete collection");
    }
  }

  return (
    <div>
      <AdminCard className="mb-6">
        <form onSubmit={onCreate} className="flex gap-3">
          <AdminInput placeholder="New collection name" value={name} onChange={(e) => setName(e.target.value)} />
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
            {collections.map((collection) => (
              <tr key={collection.id} className="border-b border-neutral-100 last:border-none">
                <td className="px-4 py-3 font-medium">{collection.name}</td>
                <td className="px-4 py-3 text-neutral-500">{collection.slug}</td>
                <td className="px-4 py-3">
                  <AdminSelect value={collection.status} onChange={(e) => onStatusChange(collection, e.target.value)} className="w-32">
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ARCHIVED">Archived</option>
                  </AdminSelect>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onDelete(collection.id)} className="text-neutral-400 hover:text-red-600">
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
