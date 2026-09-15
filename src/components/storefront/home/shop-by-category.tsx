import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/generated/prisma/client";

export function ShopByCategory({ categories }: { categories: Category[] }) {
  return (
    <section className="container-editorial py-20 md:py-28">
      <div className="mb-12">
        <p className="kicker mb-4">Shop By Category</p>
        <h2 className="font-display text-4xl">Find Your Occasion</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/category/${category.slug}`} className="group relative block aspect-[3/4] overflow-hidden bg-ivory">
            <Image
              src={category.imageUrl ?? "https://picsum.photos/seed/category/800/1000"}
              alt={`${category.name} category`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
            <span className="absolute bottom-5 left-5 font-display text-xl text-warm-white">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
