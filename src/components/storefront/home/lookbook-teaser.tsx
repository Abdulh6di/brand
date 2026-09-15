import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LookbookImage } from "@/generated/prisma/client";

export function LookbookTeaser({ images }: { images: LookbookImage[] }) {
  if (images.length === 0) return null;

  return (
    <section className="container-editorial py-20 md:py-28">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <p className="kicker mb-4">Editorial</p>
          <h2 className="font-display text-4xl">Lookbook</h2>
        </div>
        <Button asChild variant="link">
          <Link href="/lookbook">View Full Lookbook →</Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {images.slice(0, 6).map((image, i) => (
          <Link
            key={image.id}
            href="/lookbook"
            className={`relative block overflow-hidden bg-ivory ${i === 0 ? "col-span-2 aspect-[16/10] md:col-span-1 md:aspect-[3/4]" : "aspect-[3/4]"}`}
          >
            <Image
              src={image.imageUrl}
              alt="AELIA lookbook editorial photograph"
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
