"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";
import type { ProductCardData } from "@/server/queries/products";

const badgeVariantMap = {
  NEW: "new",
  BESTSELLER: "bestseller",
  LIMITED: "limited",
  SALE: "sale",
  EXCLUSIVE: "exclusive",
} as const;

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <div className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-opacity duration-700 group-hover:opacity-0"
          />
          {product.hoverImage && (
            <Image
              src={product.hoverImage}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="absolute inset-0 object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.badges.map((badge) => (
              <Badge key={badge} variant={badgeVariantMap[badge]}>
                {badge}
              </Badge>
            ))}
          </div>
          <button
            aria-label="Add to wishlist"
            onClick={(e) => e.preventDefault()}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-warm-white/90 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Heart className="h-4 w-4" strokeWidth={1.5} />
          </button>
          {!product.inStock && (
            <div className="absolute inset-x-0 bottom-0 bg-ink/90 py-2 text-center text-[10px] tracking-editorial uppercase text-warm-white">
              Sold Out
            </div>
          )}
        </div>
      </Link>
      <div className="mt-4 space-y-1.5">
        <p className="kicker">{product.categoryName}</p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-display text-lg leading-snug">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2 text-sm">
          {product.salePrice ? (
            <>
              <span className="text-error">{formatMoney(product.salePrice, product.currency)}</span>
              <span className="text-taupe line-through">{formatMoney(product.price, product.currency)}</span>
            </>
          ) : (
            <span>{formatMoney(product.price, product.currency)}</span>
          )}
        </div>
        {product.colors.length > 0 && (
          <p className="text-xs text-taupe">
            {product.colors.slice(0, 3).join(" · ")}
            {product.colors.length > 3 ? ` +${product.colors.length - 3}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
