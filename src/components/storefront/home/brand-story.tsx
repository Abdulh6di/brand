import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BrandStory() {
  return (
    <section className="bg-ink text-warm-white">
      <div className="container-editorial grid gap-8 py-20 md:grid-cols-2 md:gap-16 md:py-32">
        <div className="order-2 flex flex-col justify-center md:order-1">
          <p className="kicker mb-4 text-warm-white/70">Our Craft</p>
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            Made by hand, worn for a lifetime
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-warm-white/80">
            Every AELIA piece begins on a cutting table, not a spreadsheet. Our
            artisans hand-select fabric from mills we&apos;ve worked with for over a
            decade, then spend upward of forty hours embroidering, draping, and
            finishing each garment entirely by hand. We believe true luxury is
            measured in attention, not logos — in a seam that will still hold
            twenty years from now.
          </p>
          <Button asChild variant="outline" size="lg" className="mt-8 w-fit border-warm-white text-warm-white hover:bg-warm-white hover:text-ink">
            <Link href="/about">Our Story</Link>
          </Button>
        </div>
        <div className="order-1 relative aspect-[4/5] overflow-hidden md:order-2">
          <Image
            src="https://picsum.photos/seed/atelier-craft/1200/1500"
            alt="An AELIA artisan hand-embroidering silk fabric in the atelier"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
