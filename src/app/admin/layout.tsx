import { requireAdminSession } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();

  return (
    <div className="flex min-h-screen bg-neutral-50 font-sans text-neutral-900 antialiased">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminTopbar userName={session.user.name ?? "Admin"} role={session.user.role} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
