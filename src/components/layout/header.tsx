"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Heart, ShoppingBag, User, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/hooks/use-cart-store";
import { useWishlistStore } from "@/hooks/use-wishlist-store";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const cartCount = useCartStore((s) => s.count());
  const wishlistCount = useWishlistStore((s) => s.items.length);

  React.useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const transparent = isHome && !scrolled && !menuOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        transparent
          ? "bg-transparent text-warm-white"
          : "border-b border-line bg-warm-white/95 text-ink backdrop-blur-sm",
      )}
    >
      <div className="container-editorial flex h-20 items-center justify-between md:h-24">
        <button
          aria-label="Open menu"
          className="md:hidden"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.main.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs tracking-editorial uppercase transition-opacity hover:opacity-60"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className={cn(
            "font-display text-2xl tracking-[0.2em] md:text-3xl",
            "absolute left-1/2 -translate-x-1/2",
          )}
        >
          {siteConfig.name}
        </Link>

        <div className="flex items-center gap-5">
          <Link href="/search" aria-label="Search" className="hidden md:block">
            <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </Link>
          <Link href="/account" aria-label="Account" className="hidden md:block">
            <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </Link>
          <Link href="/wishlist" aria-label="Wishlist" className="relative">
            <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center bg-accent text-[9px] text-warm-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative">
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center bg-accent text-[9px] text-warm-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-warm-white text-ink">
          <div className="container-editorial flex h-20 items-center justify-between">
            <span className="font-display text-xl tracking-[0.2em]">{siteConfig.name}</span>
            <button aria-label="Close menu" onClick={() => setMenuOpen(false)}>
              <X className="h-6 w-6" strokeWidth={1.5} />
            </button>
          </div>
          <nav className="container-editorial flex flex-1 flex-col justify-center gap-6 pb-24">
            {siteConfig.nav.main.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="font-display text-3xl"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-10 flex gap-8 border-t border-line pt-8">
              <Link href="/search" onClick={() => setMenuOpen(false)} className="kicker flex items-center gap-2">
                <Search className="h-4 w-4" strokeWidth={1.5} /> Search
              </Link>
              <Link href="/account" onClick={() => setMenuOpen(false)} className="kicker flex items-center gap-2">
                <User className="h-4 w-4" strokeWidth={1.5} /> Account
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
