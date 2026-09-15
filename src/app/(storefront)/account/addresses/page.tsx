import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AccountShell } from "@/components/storefront/account/account-shell";
import { AddressesManager } from "@/components/storefront/account/addresses-manager";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const addresses = await db.address.findMany({ where: { userId: session.user.id }, orderBy: { isDefault: "desc" } });

  return (
    <AccountShell title="Addresses">
      <AddressesManager initialAddresses={addresses} />
    </AccountShell>
  );
}
