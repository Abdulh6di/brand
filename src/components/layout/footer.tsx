import Link from "next/link";
import { AtSign } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ivory text-ink">
      <div className="container-editorial grid gap-12 py-16 md:grid-cols-5 md:py-24">
        <div className="md:col-span-2">
          <span className="font-display text-2xl tracking-[0.2em]">{siteConfig.name}</span>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-charcoal/80">
            {siteConfig.description}
          </p>
          <div className="mt-6 flex gap-4">
            <Link href={siteConfig.social.instagram} aria-label="Instagram" target="_blank">
              <AtSign className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        <FooterColumn title="Shop" links={siteConfig.nav.footerShop} />
        <FooterColumn title="Customer Care" links={siteConfig.nav.footerCare} />
        <FooterColumn title="The House" links={siteConfig.nav.footerAbout} />
      </div>

      <div className="hairline" />

      <div className="container-editorial flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="kicker mb-3">Join the atelier list</p>
          <form className="flex max-w-sm gap-2" action="/api/newsletter" method="post">
            <Input type="email" name="email" placeholder="Your email address" required />
            <Button type="submit" variant="outline" size="md" className="shrink-0">
              Subscribe
            </Button>
          </form>
        </div>
        <div className="text-xs text-taupe">
          <p>{siteConfig.contact.email} · {siteConfig.contact.phone}</p>
          <p className="mt-1">
            © {new Date().getFullYear()} {siteConfig.fullName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <p className="kicker mb-4">{title}</p>
      <ul className="space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-charcoal/80 transition-colors hover:text-ink">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
