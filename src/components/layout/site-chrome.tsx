"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { StoreHydrator } from "@/components/shared/store-hydrator";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      <StoreHydrator />
      <Header />
      <main className={cn("flex-1", !isHome && "pt-20 md:pt-24")}>{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
