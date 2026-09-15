import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

/**
 * Static placeholder grid today. Swap the `images` source for a live
 * Instagram Graph API fetch (cached via `src/server/cache`) once the
 * business connects an Instagram Business account — the markup below
 * doesn't need to change.
 */
export function InstagramGallery() {
  const images = Array.from({ length: 6 }).map((_, i) => `https://picsum.photos/seed/insta-${i}/600/600`);

  return (
    <section className="container-editorial py-20 md:py-28">
      <div className="mb-10 text-center">
        <p className="kicker mb-4">Follow Along</p>
        <h2 className="font-display text-4xl">@aelia on Instagram</h2>
      </div>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
        {images.map((src, i) => (
          <Link key={i} href={siteConfig.social.instagram} target="_blank" className="relative block aspect-square overflow-hidden bg-ivory">
            <Image src={src} alt="AELIA Instagram post" fill sizes="200px" className="object-cover transition-opacity hover:opacity-80" />
          </Link>
        ))}
      </div>
    </section>
  );
}
