"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { trackEvent } from "@/lib/analytics";

export function CustomOrderForm() {
  const [submitting, setSubmitting] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [images, setImages] = React.useState<string[]>([]);
  const [referenceNumber, setReferenceNumber] = React.useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "custom-orders");
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setImages((prev) => [...prev, json.data.url]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image uploads are unavailable right now");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      category: formData.get("category") || undefined,
      fabric: formData.get("fabric") || undefined,
      color: formData.get("color") || undefined,
      size: formData.get("size") || undefined,
      deliveryDate: formData.get("deliveryDate") || undefined,
      budget: formData.get("budget") ? Number(formData.get("budget")) : undefined,
      specialRequirements: formData.get("specialRequirements") || undefined,
      measurements: {
        bust: formData.get("bust") || undefined,
        waist: formData.get("waist") || undefined,
        hips: formData.get("hips") || undefined,
        height: formData.get("height") || undefined,
      },
      imageUrls: images,
    };

    try {
      const res = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      trackEvent("custom_order_submitted", { referenceNumber: json.data.referenceNumber });
      setReferenceNumber(json.data.referenceNumber);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to submit your request");
    } finally {
      setSubmitting(false);
    }
  }

  if (referenceNumber) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h2 className="font-display text-2xl">Request Received</h2>
        <p className="mt-4 text-sm text-charcoal/75">
          Your reference number is <strong>{referenceNumber}</strong>. Our design team will reach out within 2
          business days with a quote. For urgent requests, message us on{" "}
          <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} className="underline" target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-10">
      <section>
        <p className="kicker mb-5">Contact Information</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" required />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
        </div>
      </section>

      <section>
        <p className="kicker mb-5">Design Preferences</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="category">Category</Label>
            <select id="category" name="category" className="h-12 w-full border border-line bg-warm-white px-4 text-sm">
              {siteConfig.categories.map((c) => (
                <option key={c.slug} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="fabric">Fabric Preference</Label>
            <Input id="fabric" name="fabric" placeholder="e.g. Silk, Velvet, Organza" />
          </div>
          <div>
            <Label htmlFor="color">Color Preference</Label>
            <Input id="color" name="color" placeholder="e.g. Emerald" />
          </div>
          <div>
            <Label htmlFor="size">Standard Size (or Custom)</Label>
            <Input id="size" name="size" placeholder="e.g. M or Custom" />
          </div>
          <div>
            <Label htmlFor="deliveryDate">Needed By</Label>
            <Input id="deliveryDate" name="deliveryDate" type="date" />
          </div>
          <div>
            <Label htmlFor="budget">Budget (USD, optional)</Label>
            <Input id="budget" name="budget" type="number" min={0} />
          </div>
        </div>
      </section>

      <section>
        <p className="kicker mb-5">Measurements (inches, optional)</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <Label htmlFor="bust">Bust</Label>
            <Input id="bust" name="bust" />
          </div>
          <div>
            <Label htmlFor="waist">Waist</Label>
            <Input id="waist" name="waist" />
          </div>
          <div>
            <Label htmlFor="hips">Hips</Label>
            <Input id="hips" name="hips" />
          </div>
          <div>
            <Label htmlFor="height">Height</Label>
            <Input id="height" name="height" />
          </div>
        </div>
      </section>

      <section>
        <Label htmlFor="specialRequirements">Notes &amp; Special Requirements</Label>
        <Textarea id="specialRequirements" name="specialRequirements" placeholder="Tell us about your vision..." />
      </section>

      <section>
        <p className="kicker mb-3">Reference Images (optional)</p>
        <div className="flex flex-wrap gap-3">
          {images.map((url) => (
            <div key={url} className="relative h-20 w-20 overflow-hidden bg-ivory">
              <Image src={url} alt="Uploaded reference" fill sizes="80px" className="object-cover" />
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center bg-warm-white/90"
              >
                <X className="h-3 w-3" strokeWidth={1.5} />
              </button>
            </div>
          ))}
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-line-strong text-taupe hover:border-ink">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" strokeWidth={1.5} />}
            <span className="text-[10px]">Upload</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileChange} disabled={uploading} />
          </label>
        </div>
      </section>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Request"}
      </Button>
    </form>
  );
}
