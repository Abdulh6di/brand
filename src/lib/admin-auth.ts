import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Permission } from "@/lib/permissions";

export const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "EDITOR"];

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    redirect("/account/login?callbackUrl=/admin");
  }
  return session;
}

export function can(session: { user: { role: string; permissions: string[] } }, permission: Permission) {
  if (session.user.role === "SUPER_ADMIN") return true;
  return session.user.permissions.includes(permission);
}

export async function requirePermission(permission: Permission) {
  const session = await requireAdminSession();
  if (!can(session, permission)) {
    redirect("/admin?error=forbidden");
  }
  return session;
}
