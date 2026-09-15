"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="block w-full border-b border-line py-3 text-left text-sm text-charcoal/80 hover:text-ink"
    >
      Sign Out
    </button>
  );
}
