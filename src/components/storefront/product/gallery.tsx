"use client";

import * as React from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, productName }: { images: { url: string; altText: string }[]; productName: string }) {
  const [active, setActive] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const safeImages = images.length ? images : [{ url: "/images/placeholder.jpg", altText: productName }];

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-visible">
        {safeImages.map((img, i) => (
          <button
            key={img.url + i}
            onClick={() => setActive(i)}
            className={cn(
              "relative aspect-[4/5] w-16 shrink-0 overflow-hidden border md:w-20",
              active === i ? "border-ink" : "border-transparent opacity-70",
            )}
          >
            <Image src={img.url} alt={img.altText} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>

      <Dialog.Root open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <div className="group relative flex-1">
          <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
            <Image
              key={safeImages[active].url}
              src={safeImages[active].url}
              alt={safeImages[active].altText}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <Dialog.Trigger asChild>
            <button
              aria-label="View fullscreen"
              className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center bg-warm-white/90 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ZoomIn className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </Dialog.Trigger>
          {safeImages.length > 1 && (
            <>
              <button
                aria-label="Previous image"
                onClick={() => setActive((a) => (a - 1 + safeImages.length) % safeImages.length)}
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-warm-white/80"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                aria-label="Next image"
                onClick={() => setActive((a) => (a + 1) % safeImages.length)}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-warm-white/80"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/95" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <Dialog.Title className="sr-only">{productName} — full-screen image</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close" className="absolute right-6 top-6 text-warm-white">
                <X className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </Dialog.Close>
            <div className="relative h-full w-full max-w-3xl">
              <Image
                src={safeImages[active].url}
                alt={safeImages[active].altText}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
