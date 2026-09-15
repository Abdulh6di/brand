"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import type { LookbookImage, LookbookImageProduct, Product } from "@/generated/prisma/client";

type ImageWithProducts = LookbookImage & { products: (LookbookImageProduct & { product: Product })[] };

export function LookbookGallery({ images }: { images: ImageWithProducts[] }) {
  const [active, setActive] = React.useState<ImageWithProducts | null>(null);

  return (
    <Dialog.Root open={!!active} onOpenChange={(open) => !open && setActive(null)}>
      <div className="columns-2 gap-3 space-y-3 md:columns-3 md:gap-4 md:space-y-4">
        {images.map((image) => (
          <button key={image.id} onClick={() => setActive(image)} className="group relative block w-full overflow-hidden bg-ivory">
            <Image
              src={image.imageUrl}
              alt="AELIA lookbook editorial photograph"
              width={800}
              height={1000}
              className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {image.products.length > 0 && (
              <span className="absolute bottom-3 left-3 bg-warm-white/90 px-2 py-1 text-[10px] uppercase tracking-editorial">
                Shop the Look
              </span>
            )}
          </button>
        ))}
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/90" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-warm-white p-6 md:flex-row md:p-0">
          <Dialog.Title className="sr-only">Lookbook image detail</Dialog.Title>
          <Dialog.Close asChild>
            <button aria-label="Close" className="absolute right-6 top-6 z-10 text-ink md:text-warm-white">
              <X className="h-6 w-6" strokeWidth={1.5} />
            </button>
          </Dialog.Close>
          {active && (
            <>
              <div className="relative h-[50vh] w-full md:h-screen md:w-2/3">
                <Image src={active.imageUrl} alt="AELIA lookbook editorial photograph" fill sizes="66vw" className="object-cover" />
              </div>
              <div className="w-full p-6 md:w-1/3 md:overflow-y-auto md:p-10">
                <p className="kicker mb-6">Shop the Look</p>
                <div className="space-y-6">
                  {active.products.map((tag) => (
                    <Link key={tag.id} href={`/product/${tag.product.slug}`} className="flex items-center gap-4">
                      <div>
                        <p className="font-display text-base">{tag.product.name}</p>
                        <p className="mt-1 text-sm text-taupe">
                          {formatMoney(tag.product.salePrice ?? tag.product.price, tag.product.currency)}
                        </p>
                      </div>
                    </Link>
                  ))}
                  {active.products.length === 0 && <p className="text-sm text-taupe">No products tagged in this look.</p>}
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
