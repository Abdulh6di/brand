import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { AdminPageHeader } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Customers — Admin" };

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requirePermission("customers.read");
  const { q } = await searchParams;

  const customers = await db.user.findMany({
    where: {
      role: { name: "CUSTOMER" },
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}),
    },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <AdminPageHeader title="Customers" description={`${customers.length} customers`} />
      <form className="mb-4">
        <input name="q" defaultValue={q} placeholder="Search by name or email..." className="h-9 w-72 rounded-md border border-neutral-300 bg-white px-3 text-sm" />
      </form>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs text-neutral-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-neutral-100 last:border-none hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/customers/${customer.id}`} className="hover:underline">
                    {customer.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-500">{customer.email}</td>
                <td className="px-4 py-3">{customer._count.orders}</td>
                <td className="px-4 py-3 text-neutral-500">{formatDate(customer.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
