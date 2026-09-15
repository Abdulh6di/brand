import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind AELIA — craftsmanship, fabric, and the philosophy of considered luxury.",
};

export default function AboutPage() {
  return (
    <div>
      <div className="relative flex h-[60vh] min-h-[420px] items-end overflow-hidden bg-ink">
        <Image
          src="https://picsum.photos/seed/about-hero/1920/1100"
          alt="The AELIA atelier workspace with fabric bolts and pattern tables"
          fill
          className="object-cover opacity-70"
        />
        <div className="container-editorial relative z-10 pb-16 text-warm-white">
          <p className="kicker mb-3 text-warm-white/80">Our Story</p>
          <h1 className="font-display text-5xl md:text-6xl">Luxury, Considered</h1>
        </div>
      </div>

      <div className="container-editorial max-w-3xl py-16 md:py-24">
        <p className="text-lg leading-relaxed text-charcoal/85">
          AELIA began as a single cutting table in a small studio, founded on a belief that
          luxury fashion had grown too loud. We wanted to build something quieter — clothing
          defined by construction, not logos; by fabric, not fast turnaround.
        </p>

        <div className="my-16 grid gap-10 sm:grid-cols-2">
          <div>
            <p className="kicker mb-3">Craftsmanship</p>
            <p className="text-sm leading-relaxed text-charcoal/80">
              Every AELIA piece passes through the hands of at least four artisans — a pattern
              cutter, an embroiderer, a seamstress, and a finisher — before it ever reaches you.
              Nothing is mass-produced; everything is made to order in small batches.
            </p>
          </div>
          <div>
            <p className="kicker mb-3">Fabric Sourcing</p>
            <p className="text-sm leading-relaxed text-charcoal/80">
              We work directly with mills in Italy, France, and South Asia, selecting silks,
              organzas, and hand-loomed textiles for their weight, drape, and longevity — not
              simply their cost.
            </p>
          </div>
          <div>
            <p className="kicker mb-3">Design Philosophy</p>
            <p className="text-sm leading-relaxed text-charcoal/80">
              Timeless over trend-driven. Every silhouette is designed to be worn for a decade,
              not a season, with construction details that reveal themselves the longer you look.
            </p>
          </div>
          <div>
            <p className="kicker mb-3">Customer Experience</p>
            <p className="text-sm leading-relaxed text-charcoal/80">
              From a first WhatsApp inquiry to your final fitting, our team treats every order as
              a relationship, not a transaction — because that&apos;s what heirloom pieces
              deserve.
            </p>
          </div>
        </div>

        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src="https://picsum.photos/seed/about-atelier/1600/900"
            alt="Close-up of hand embroidery being applied to silk fabric"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
