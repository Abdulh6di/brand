"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { X } from "lucide-react";
import { sizeOptions } from "@/config/site";
import { cn } from "@/lib/utils";
import type { Category } from "@/generated/prisma/client";

const COLOR_OPTIONS = ["Ivory", "Emerald", "Black", "Champagne", "Blush", "Midnight", "Bronze", "Rosewood"];

export function FiltersSidebar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const updateParam = useCallback(
    (key: string, value: string | null, multi = false) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");

      if (!multi) {
        if (value === null || params.get(key) === value) params.delete(key);
        else params.set(key, value);
      } else {
        const existing = params.get(key)?.split(",").filter(Boolean) ?? [];
        const next = existing.includes(value!)
          ? existing.filter((v) => v !== value)
          : [...existing, value!];
        if (next.length) params.set(key, next.join(","));
        else params.delete(key);
      }

      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [pathname, router, searchParams],
  );

  const activeCategory = searchParams.get("category");
  const activeSizes = searchParams.get("sizes")?.split(",").filter(Boolean) ?? [];
  const activeColors = searchParams.get("colors")?.split(",").filter(Boolean) ?? [];
  const hasFilters = searchParams.toString().length > 0;

  return (
    <aside className="w-full shrink-0 md:w-56">
      {hasFilters && (
        <button
          onClick={() => startTransition(() => router.push(pathname))}
          className="mb-6 flex items-center gap-1.5 text-xs uppercase tracking-editorial text-taupe hover:text-ink"
        >
          <X className="h-3 w-3" /> Clear Filters
        </button>
      )}

      <FilterGroup title="Category">
        {categories.map((c) => (
          <FilterCheckbox
            key={c.id}
            label={c.name}
            checked={activeCategory === c.slug}
            onChange={() => updateParam("category", c.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Size">
        {sizeOptions.filter((s) => s !== "Custom").map((size) => (
          <FilterCheckbox
            key={size}
            label={size}
            checked={activeSizes.includes(size)}
            onChange={() => updateParam("sizes", size, true)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Color">
        {COLOR_OPTIONS.map((color) => (
          <FilterCheckbox
            key={color}
            label={color}
            checked={activeColors.includes(color)}
            onChange={() => updateParam("colors", color, true)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Availability">
        <FilterCheckbox
          label="In Stock Only"
          checked={searchParams.get("inStock") === "1"}
          onChange={() => updateParam("inStock", searchParams.get("inStock") === "1" ? null : "1")}
        />
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 border-b border-line pb-8 last:border-none">
      <p className="kicker mb-4">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center border border-line-strong transition-colors",
          checked && "border-ink bg-ink",
        )}
      >
        {checked && <span className="h-1.5 w-1.5 bg-warm-white" />}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className={cn(checked ? "text-ink" : "text-charcoal/75")}>{label}</span>
    </label>
  );
}
