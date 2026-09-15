import type { Metadata } from "next";
import { getPublishedLookbook } from "@/server/queries/catalog";
import { LookbookGallery } from "@/components/storefront/lookbook-gallery";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Lookbook", description: "Editorial photography from AELIA's latest campaign." };

export default async function LookbookPage() {
  const lookbook = await getPublishedLookbook();

  return (
    <div className="container-editorial py-16 md:py-24">
      <div className="mb-14 text-center">
        <p className="kicker mb-3">Editorial</p>
        <h1 className="font-display text-4xl md:text-5xl">{lookbook?.title ?? "Lookbook"}</h1>
        {lookbook?.description && <p className="mx-auto mt-4 max-w-lg text-sm text-charcoal/75">{lookbook.description}</p>}
      </div>

      {lookbook && lookbook.images.length > 0 ? (
        <LookbookGallery images={lookbook.images} />
      ) : (
        <EmptyState title="No lookbook published yet" description="Check back soon for our latest editorial." />
      )}
    </div>
  );
}
