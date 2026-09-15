import Link from "next/link";
import { LogoutButton } from "@/components/storefront/account/logout-button";

export function AdminTopbar({ userName, role }: { userName: string; role: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6">
      <Link href="/" target="_blank" className="text-xs text-neutral-500 hover:text-neutral-900">
        View Storefront →
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-neutral-500">
          {userName} <span className="text-neutral-300">·</span> {role.replace("_", " ")}
        </span>
        <div className="[&>button]:border-0 [&>button]:p-0 [&>button]:w-auto [&>button]:text-neutral-500 [&>button]:hover:text-neutral-900">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
