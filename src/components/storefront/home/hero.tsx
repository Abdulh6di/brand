"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative flex h-[100svh] min-h-[640px] w-full items-end overflow-hidden bg-ink">
      <Image
        src="https://picsum.photos/seed/aelia-hero/1920/1200"
        alt="Model wearing an ivory hand-embroidered gown from the AELIA Autumn collection"
        fill
        priority
        className="object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

      <div className="container-editorial relative z-10 w-full pb-24 text-warm-white md:pb-32">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="kicker mb-5 text-warm-white/80"
        >
          Autumn / Winter 2026
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl font-display text-5xl leading-[1.05] md:text-7xl"
        >
          The Art of Elegance
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="mt-6 max-w-md text-sm leading-relaxed text-warm-white/85 md:text-base"
        >
          Discover our latest collection — hand-finished silhouettes cut from rare
          fabrics, made for the moments that matter most.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Button asChild size="lg" variant="primary" className="bg-warm-white text-ink hover:bg-beige">
            <Link href="/shop">Shop Collection</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-warm-white text-warm-white hover:bg-warm-white hover:text-ink"
          >
            <Link href="/lookbook">Explore Lookbook</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
