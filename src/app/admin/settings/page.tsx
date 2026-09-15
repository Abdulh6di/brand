import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { AdminPageHeader, AdminCard, AdminBadge } from "@/components/admin/ui";
import { siteConfig } from "@/config/site";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Settings — Admin" };

export default async function AdminSettingsPage() {
  const session = await requireAdminSession();
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  const [users, auditLogs] = await Promise.all([
    db.user.findMany({ include: { role: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    db.auditLog.findMany({ include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Settings" description="Site configuration, team access, and audit history" />

      <AdminCard>
        <p className="mb-4 text-sm font-medium">Site Information</p>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-neutral-400">Store Name</dt>
            <dd>{siteConfig.name}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">Contact Email</dt>
            <dd>{siteConfig.contact.email}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">Default Currency</dt>
            <dd>{siteConfig.currency}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">Site URL</dt>
            <dd>{siteConfig.url}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-neutral-400">
          Editable homepage/CMS content lives in the database (HomepageSection, Banner models). A full visual editor is
          a natural next iteration — update via database seed/admin API for now.
        </p>
      </AdminCard>

      <AdminCard>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium">Team &amp; Roles</p>
          {!isSuperAdmin && <span className="text-xs text-neutral-400">Only Super Admins can manage roles</span>}
        </div>
        <div className="divide-y divide-neutral-100">
          {users
            .filter((u) => u.role.name !== "CUSTOMER")
            .map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p>{u.name}</p>
                  <p className="text-xs text-neutral-500">{u.email}</p>
                </div>
                <AdminBadge tone="info">{u.role.name.replace("_", " ")}</AdminBadge>
              </div>
            ))}
        </div>
      </AdminCard>

      <AdminCard>
        <p className="mb-4 text-sm font-medium">Recent Audit Log</p>
        <div className="divide-y divide-neutral-100 text-sm">
          {auditLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between py-2.5">
              <span>
                {log.user?.name ?? "System"} <span className="text-neutral-400">{log.action.toLowerCase()}</span> {log.entity} #{log.entityId.slice(-6)}
              </span>
              <span className="text-xs text-neutral-400">{formatDate(log.createdAt)}</span>
            </div>
          ))}
          {auditLogs.length === 0 && <p className="py-4 text-neutral-400">No audit entries yet.</p>}
        </div>
      </AdminCard>
    </div>
  );
}
