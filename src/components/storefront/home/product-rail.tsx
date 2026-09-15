import Link from "next/link";
import { ProductCard } from "@/components/storefront/product-card";
import type { ProductCardData } from "@/server/queries/products";

export function ProductRail({
  kicker,
  title,
  products,
  viewAllHref,
}: {
  kicker: string;
  title: string;
  products: ProductCardData[];
  viewAllHref: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="container-editorial py-20 md:py-28">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <p className="kicker mb-4">{kicker}</p>
          <h2 className="font-display text-4xl">{title}</h2>
        </div>
        <Link href={viewAllHref} className="hidden text-xs tracking-editorial uppercase underline underline-offset-4 md:block">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="mt-10 text-center md:hidden">
        <Link href={viewAllHref} className="text-xs tracking-editorial uppercase underline underline-offset-4">
          View All
        </Link>
      </div>
    </section>
  );
}
