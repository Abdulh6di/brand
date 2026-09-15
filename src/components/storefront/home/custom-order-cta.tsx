import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CustomOrderCta() {
  return (
    <section className="relative overflow-hidden bg-charcoal py-24 text-warm-white md:py-32">
      <Image
        src="https://picsum.photos/seed/custom-order/1920/900"
        alt="Atelier fitting session for a made-to-order gown"
        fill
        className="object-cover opacity-25"
      />
      <div className="container-editorial relative z-10 mx-auto max-w-2xl text-center">
        <p className="kicker mb-5 text-warm-white/70">Bespoke</p>
        <h2 className="font-display text-4xl md:text-5xl">Create Your Look</h2>
        <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-warm-white/80">
          Bring us your vision — a reference image, a fabric, a silhouette — and
          our design team will craft it to your exact measurements. From bridal
          gowns to occasion wear, every custom order is a collaboration.
        </p>
        <Button asChild size="lg" className="mt-9 bg-warm-white text-ink hover:bg-beige">
          <Link href="/custom-order">Start Your Custom Order</Link>
        </Button>
      </div>
    </section>
  );
}
