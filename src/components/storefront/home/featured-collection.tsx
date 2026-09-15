import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Collection } from "@/generated/prisma/client";

export function FeaturedCollection({ collection }: { collection: Collection }) {
  return (
    <section className="container-editorial grid gap-8 py-20 md:grid-cols-2 md:gap-16 md:py-32">
      <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
        <Image
          src={collection.heroImageUrl ?? "https://picsum.photos/seed/featured/1200/1500"}
          alt={`${collection.name} — featured collection editorial image`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center">
        <p className="kicker mb-4">New Collection</p>
        <h2 className="font-display text-4xl leading-tight md:text-5xl">{collection.name}</h2>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-charcoal/80">
          {collection.description}
        </p>
        <Button asChild variant="outline" size="lg" className="mt-8 w-fit">
          <Link href={`/collections/${collection.slug}`}>Explore the Collection</Link>
        </Button>
      </div>
    </section>
  );
}
