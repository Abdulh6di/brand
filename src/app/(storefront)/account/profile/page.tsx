import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AccountShell } from "@/components/storefront/account/account-shell";
import { ProfileForm } from "@/components/storefront/account/profile-form";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) notFound();

  return (
    <AccountShell title="Profile">
      <ProfileForm initialName={user.name ?? ""} initialPhone={user.phone ?? ""} email={user.email} />
    </AccountShell>
  );
}
