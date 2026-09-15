"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SizeGuideDialog } from "@/components/shared/size-guide-dialog";
import { buildProductInquiryMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import { formatMoney, cn } from "@/lib/utils";
import { useCartStore } from "@/hooks/use-cart-store";
import { useWishlistStore } from "@/hooks/use-wishlist-store";
import { trackEvent } from "@/lib/analytics";
import type {
  Product,
  ProductVariant,
  ProductCustomizationOption,
  ProductCustomizationChoice,
} from "@/generated/prisma/client";

type CustomizationOptionWithChoices = ProductCustomizationOption & { choices: ProductCustomizationChoice[] };

export function PurchasePanel({
  product,
  variants,
  customizationOptions,
}: {
  product: Product;
  variants: ProductVariant[];
  customizationOptions: CustomizationOptionWithChoices[];
}) {
  const router = useRouter();
  const setSummary = useCartStore((s) => s.setSummary);
  const wishlistItems = useWishlistStore((s) => s.items);
  const setWishlistItems = useWishlistStore((s) => s.setItems);
  const isWishlisted = wishlistItems.some((w) => w.productId === product.id);

  const colors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[];
  const sizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean))) as string[];

  const [selectedColor, setSelectedColor] = React.useState<string | undefined>(colors[0]);
  const [selectedSize, setSelectedSize] = React.useState<string | undefined>();
  const [selections, setSelections] = React.useState<Record<string, string>>({});
  const [quantity, setQuantity] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  const activeVariant = variants.find(
    (v) => (!colors.length || v.color === selectedColor) && (!sizes.length || v.size === selectedSize),
  );

  const customizationPriceDelta = Object.entries(selections).reduce((sum, [optionId, choiceId]) => {
    const option = customizationOptions.find((o) => o.id === optionId);
    const choice = option?.choices.find((c) => c.id === choiceId);
    return sum + (choice?.priceDelta ?? 0);
  }, 0);

  const basePrice = activeVariant?.priceOverride ?? product.salePrice ?? product.price;
  const displayPrice = basePrice + customizationPriceDelta;
  const totalStock = variants.reduce((sum, v) => sum + Math.max(v.stock - v.reservedStock, 0), 0);
  const inStock =
    variants.length === 0
      ? true
      : activeVariant
        ? activeVariant.stock - activeVariant.reservedStock > 0
        : totalStock > 0;

  async function addToCart(redirectToCheckout = false) {
    if (sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    const missingRequired = customizationOptions.find((o) => o.isRequired && !selections[o.id]);
    if (missingRequired) {
      toast.error(`Please select ${missingRequired.label}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          variantId: activeVariant?.id,
          quantity,
          customizationSelections: Object.entries(selections).map(([optionId, choiceId]) => ({ optionId, choiceId })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Unable to add to cart");

      setSummary(json.data);
      trackEvent("add_to_cart", { productId: product.id, name: product.name, value: displayPrice / 100, currency: product.currency });
      toast.success("Added to your bag");
      if (redirectToCheckout) router.push("/checkout");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function toggleWishlist() {
    try {
      const res = await fetch("/api/wishlist/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      if (json.data.wishlisted) {
        trackEvent("add_to_wishlist", { productId: product.id, name: product.name });
        setWishlistItems([
          ...wishlistItems,
          {
            id: `${product.id}-temp`,
            productId: product.id,
            variantId: null,
            name: product.name,
            slug: product.slug,
            image: "",
            price: product.price,
            salePrice: product.salePrice,
            currency: product.currency,
            inStock,
          },
        ]);
        toast.success("Added to wishlist");
      } else {
        setWishlistItems(wishlistItems.filter((w) => w.productId !== product.id));
        toast.success("Removed from wishlist");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Please sign in to use your wishlist");
    }
  }

  const whatsappHref = buildWhatsAppLink(
    buildProductInquiryMessage({
      name: product.name,
      url: typeof window !== "undefined" ? window.location.href : "",
      sku: activeVariant?.sku ?? product.sku,
      size: selectedSize,
      color: selectedColor,
    }),
  );

  return (
    <div>
      <p className="kicker mb-3">{product.brand}</p>
      <h1 className="font-display text-3xl leading-tight md:text-4xl">{product.name}</h1>
      <div className="mt-4 flex items-center gap-3 text-lg">
        {product.salePrice ? (
          <>
            <span className="text-error">{formatMoney(displayPrice, product.currency)}</span>
            <span className="text-taupe line-through">{formatMoney(product.price + customizationPriceDelta, product.currency)}</span>
          </>
        ) : (
          <span>{formatMoney(displayPrice, product.currency)}</span>
        )}
      </div>
      <p className="mt-1 text-xs text-taupe">SKU: {activeVariant?.sku ?? product.sku}</p>

      {product.shortDescription && (
        <p className="mt-6 text-sm leading-relaxed text-charcoal/80">{product.shortDescription}</p>
      )}

      {colors.length > 0 && (
        <div className="mt-8">
          <p className="kicker mb-3">Color {selectedColor ? `— ${selectedColor}` : ""}</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "border px-4 py-2 text-xs uppercase tracking-wide",
                  selectedColor === color ? "border-ink bg-ink text-warm-white" : "border-line-strong hover:border-ink",
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="kicker">Size {selectedSize ? `— ${selectedSize}` : ""}</p>
            <SizeGuideDialog />
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const variantForSize = variants.find((v) => v.size === size && (!colors.length || v.color === selectedColor));
              const disabled = variantForSize ? variantForSize.stock - variantForSize.reservedStock <= 0 : false;
              return (
                <button
                  key={size}
                  disabled={disabled}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "h-11 w-14 border text-xs uppercase tracking-wide transition-colors",
                    selectedSize === size ? "border-ink bg-ink text-warm-white" : "border-line-strong hover:border-ink",
                    disabled && "cursor-not-allowed opacity-30 line-through",
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {customizationOptions.map((option) => (
        <div key={option.id} className="mt-6">
          <p className="kicker mb-3">
            {option.label} {option.isRequired && <span className="text-error">*</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {option.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => setSelections((s) => ({ ...s, [option.id]: choice.id }))}
                className={cn(
                  "border px-4 py-2 text-xs",
                  selections[option.id] === choice.id ? "border-ink bg-ink text-warm-white" : "border-line-strong hover:border-ink",
                )}
              >
                {choice.label}
                {choice.priceDelta !== 0 && (
                  <span className="ml-1.5 opacity-70">
                    ({choice.priceDelta > 0 ? "+" : ""}
                    {formatMoney(choice.priceDelta, product.currency)})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-8 flex items-center gap-4">
        <p className="kicker">Quantity</p>
        <div className="flex items-center border border-line-strong">
          <button
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center"
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            className="flex h-10 w-10 items-center justify-center"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1"
            disabled={!inStock || loading}
            onClick={() => addToCart(false)}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : inStock ? "Add to Bag" : "Sold Out"}
          </Button>
          <Button aria-label="Toggle wishlist" variant="outline" size="lg" className="w-14 shrink-0 px-0" onClick={toggleWishlist}>
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-ink")} strokeWidth={1.5} />
          </Button>
        </div>
        <Button variant="outline" size="lg" disabled={!inStock || loading} onClick={() => addToCart(true)}>
          Buy Now
        </Button>
        <Button asChild variant="ghost" size="lg">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            Ask on WhatsApp
          </a>
        </Button>
      </div>

      <div className="mt-10 space-y-2 border-t border-line pt-6 text-xs text-charcoal/70">
        <p>Fabric: {product.fabric ?? "Mixed"}</p>
        <p>Ships in 5–9 business days · Free shipping over {formatMoney(50000, product.currency)}</p>
        {product.isCustomizable && <p>Made-to-order pieces may require an additional 2–3 weeks.</p>}
      </div>
    </div>
  );
}
