"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { AdminButton, AdminInput, AdminLabel, AdminTextarea, AdminSelect, AdminCard } from "@/components/admin/ui";
import { slugifyText } from "@/lib/utils";
import type { AdminProductInput } from "@/validations/admin-product";

type Category = { id: string; name: string };
type Collection = { id: string; name: string };

type VariantRow = { id?: string; sku: string; color: string; size: string; stock: number };
type ImageRow = { url: string; altText: string; isPrimary: boolean };

export function ProductForm({
  categories,
  collections,
  initial,
  productId,
}: {
  categories: Category[];
  collections: Collection[];
  initial?: Partial<AdminProductInput>;
  productId?: string;
}) {
  const router = useRouter();
  const [name, setName] = React.useState(initial?.name ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(!!initial?.slug);
  const [sku, setSku] = React.useState(initial?.sku ?? "");
  const [description, setDescription] = React.useState(initial?.description ?? "");
  const [shortDescription, setShortDescription] = React.useState(initial?.shortDescription ?? "");
  const [price, setPrice] = React.useState(initial?.price ? initial.price / 100 : 0);
  const [salePrice, setSalePrice] = React.useState(initial?.salePrice ? initial.salePrice / 100 : "");
  const [categoryId, setCategoryId] = React.useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [fabric, setFabric] = React.useState(initial?.fabric ?? "");
  const [status, setStatus] = React.useState(initial?.status ?? "DRAFT");
  const [flags, setFlags] = React.useState({
    isFeatured: initial?.isFeatured ?? false,
    isBestseller: initial?.isBestseller ?? false,
    isNew: initial?.isNew ?? false,
    isLimited: initial?.isLimited ?? false,
    isExclusive: initial?.isExclusive ?? false,
    isCustomizable: initial?.isCustomizable ?? false,
  });
  const [sizes, setSizes] = React.useState((initial?.availableSizes ?? []).join(", "));
  const [colors, setColors] = React.useState((initial?.availableColors ?? []).join(", "));
  const [collectionIds, setCollectionIds] = React.useState<string[]>(initial?.collectionIds ?? []);
  const [images, setImages] = React.useState<ImageRow[]>(initial?.images ?? []);
  const [variants, setVariants] = React.useState<VariantRow[]>(
    (initial?.variants ?? []).map((v) => ({ id: v.id, sku: v.sku, color: v.color ?? "", size: v.size ?? "", stock: v.stock })),
  );
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugifyText(value));
  }

  async function onImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "products");
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setImages((prev) => [...prev, { url: json.data.url, altText: name, isPrimary: prev.length === 0 }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload unavailable");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function addVariant() {
    setVariants((prev) => [...prev, { sku: `${sku}-${prev.length + 1}`, color: "", size: "", stock: 0 }]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload: AdminProductInput = {
      name,
      slug,
      sku,
      description,
      shortDescription: shortDescription || undefined,
      price: Math.round(Number(price) * 100),
      salePrice: salePrice ? Math.round(Number(salePrice) * 100) : null,
      categoryId,
      fabric: fabric || undefined,
      lowStockThreshold: 5,
      status: status as AdminProductInput["status"],
      ...flags,
      availableSizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
      availableColors: colors.split(",").map((s) => s.trim()).filter(Boolean),
      tags: [],
      collectionIds,
      images,
      variants: variants.map((v) => ({ ...v, priceOverride: null })),
    };

    try {
      const res = await fetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
        method: productId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Unable to save product");
      toast.success("Product saved");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <AdminCard>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <AdminLabel>Product Name</AdminLabel>
              <AdminInput value={name} onChange={(e) => onNameChange(e.target.value)} required />
            </div>
            <div>
              <AdminLabel>Slug</AdminLabel>
              <AdminInput value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} required />
            </div>
            <div>
              <AdminLabel>SKU</AdminLabel>
              <AdminInput value={sku} onChange={(e) => setSku(e.target.value)} required />
            </div>
            <div className="sm:col-span-2">
              <AdminLabel>Short Description</AdminLabel>
              <AdminInput value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <AdminLabel>Description</AdminLabel>
              <AdminTextarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <p className="mb-4 text-sm font-medium">Pricing</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <AdminLabel>Price (USD)</AdminLabel>
              <AdminInput type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
            </div>
            <div>
              <AdminLabel>Sale Price (optional)</AdminLabel>
              <AdminInput type="number" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium">Variants</p>
            <AdminButton type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus className="h-3.5 w-3.5" /> Add Variant
            </AdminButton>
          </div>
          <div className="space-y-2">
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-5 gap-2">
                <AdminInput placeholder="SKU" value={v.sku} onChange={(e) => setVariants((p) => p.map((row, ri) => (ri === i ? { ...row, sku: e.target.value } : row)))} />
                <AdminInput placeholder="Color" value={v.color} onChange={(e) => setVariants((p) => p.map((row, ri) => (ri === i ? { ...row, color: e.target.value } : row)))} />
                <AdminInput placeholder="Size" value={v.size} onChange={(e) => setVariants((p) => p.map((row, ri) => (ri === i ? { ...row, size: e.target.value } : row)))} />
                <AdminInput type="number" placeholder="Stock" value={v.stock} onChange={(e) => setVariants((p) => p.map((row, ri) => (ri === i ? { ...row, stock: Number(e.target.value) } : row)))} />
                <AdminButton type="button" variant="ghost" onClick={() => setVariants((p) => p.filter((_, ri) => ri !== i))}>
                  <Trash2 className="h-3.5 w-3.5" />
                </AdminButton>
              </div>
            ))}
            {variants.length === 0 && <p className="text-sm text-neutral-400">No variants — product will use a single default SKU.</p>}
          </div>
        </AdminCard>

        <AdminCard>
          <p className="mb-4 text-sm font-medium">Images</p>
          <div className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative h-20 w-20 overflow-hidden rounded-md border border-neutral-200">
                <Image src={img.url} alt={img.altText} fill sizes="80px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((p) => p.filter((_, ri) => ri !== i))}
                  className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded bg-white/90"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-neutral-300 text-neutral-400 hover:border-neutral-500">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span className="text-[10px]">Upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} disabled={uploading} />
            </label>
          </div>
        </AdminCard>
      </div>

      <div className="space-y-6">
        <AdminCard>
          <AdminLabel>Status</AdminLabel>
          <AdminSelect value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="ARCHIVED">Archived</option>
          </AdminSelect>

          <div className="mt-4">
            <AdminLabel>Category</AdminLabel>
            <AdminSelect value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </AdminSelect>
          </div>

          <div className="mt-4">
            <AdminLabel>Collections</AdminLabel>
            <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border border-neutral-200 p-2">
              {collections.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={collectionIds.includes(c.id)}
                    onChange={() =>
                      setCollectionIds((prev) => (prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]))
                    }
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <AdminLabel>Fabric</AdminLabel>
            <AdminInput value={fabric} onChange={(e) => setFabric(e.target.value)} />
          </div>
          <div className="mt-4">
            <AdminLabel>Sizes (comma separated)</AdminLabel>
            <AdminInput value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="XS, S, M, L, XL" />
          </div>
          <div className="mt-4">
            <AdminLabel>Colors (comma separated)</AdminLabel>
            <AdminInput value={colors} onChange={(e) => setColors(e.target.value)} placeholder="Ivory, Black" />
          </div>
        </AdminCard>

        <AdminCard>
          <p className="mb-3 text-sm font-medium">Badges</p>
          <div className="space-y-2 text-sm">
            {(Object.keys(flags) as (keyof typeof flags)[]).map((key) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" checked={flags[key]} onChange={() => setFlags((p) => ({ ...p, [key]: !p[key] }))} />
                {key.replace("is", "").replace(/([A-Z])/g, " $1").trim()}
              </label>
            ))}
          </div>
        </AdminCard>

        <AdminButton type="submit" className="w-full" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Product"}
        </AdminButton>
      </div>
    </form>
  );
}
