import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getActiveCollections } from "@/server/queries/catalog";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore AELIA's seasonal and capsule collections.",
};

export default async function CollectionsPage() {
  const collections = await getActiveCollections();

  return (
    <div className="container-editorial py-12 md:py-16">
      <div className="mb-12 text-center">
        <p className="kicker mb-3">The Atelier</p>
        <h1 className="font-display text-4xl md:text-5xl">Collections</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {collections.map((collection) => (
          <Link key={collection.id} href={`/collections/${collection.slug}`} className="group relative block aspect-[4/3] overflow-hidden bg-ivory">
            <Image
              src={collection.heroImageUrl ?? "https://picsum.photos/seed/collection/1200/900"}
              alt={collection.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 text-warm-white">
              <h2 className="font-display text-3xl">{collection.name}</h2>
              <p className="mt-2 max-w-xs text-sm text-warm-white/85">{collection.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
