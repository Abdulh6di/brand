import Link from "next/link";
import { LogoutButton } from "@/components/storefront/account/logout-button";

const NAV = [
  { label: "Overview", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Profile", href: "/account/profile" },
  { label: "Wishlist", href: "/wishlist" },
];

export function AccountShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container-editorial py-12 md:py-16">
      <h1 className="mb-10 font-display text-4xl">{title}</h1>
      <div className="grid gap-10 md:grid-cols-4 md:gap-12">
        <aside className="md:col-span-1">
          <nav className="space-y-1">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="block border-b border-line py-3 text-sm text-charcoal/80 hover:text-ink">
                {item.label}
              </Link>
            ))}
            <LogoutButton />
          </nav>
        </aside>
        <div className="md:col-span-3">{children}</div>
      </div>
    </div>
  );
}
