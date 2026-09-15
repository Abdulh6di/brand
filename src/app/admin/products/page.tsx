import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { AdminButton, AdminBadge, AdminPageHeader } from "@/components/admin/ui";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "Products — Admin" };

const STATUS_TONE = { ACTIVE: "success", DRAFT: "neutral", OUT_OF_STOCK: "warning", ARCHIVED: "danger" } as const;

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requirePermission("products.read");
  const { q } = await searchParams;

  const products = await db.product.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : {},
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description={`${products.length} products`}
        action={
          <AdminButton asChild>
            <Link href="/admin/products/new">+ New Product</Link>
          </AdminButton>
        }
      />

      <form className="mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search products..."
          className="h-9 w-72 rounded-md border border-neutral-300 bg-white px-3 text-sm"
        />
      </form>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs text-neutral-500">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const stock = product.variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={product.id} className="border-b border-neutral-100 last:border-none hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{product.sku}</td>
                  <td className="px-4 py-3 text-neutral-500">{product.category.name}</td>
                  <td className="px-4 py-3">{formatMoney(product.salePrice ?? product.price, product.currency)}</td>
                  <td className="px-4 py-3">{stock}</td>
                  <td className="px-4 py-3">
                    <AdminBadge tone={STATUS_TONE[product.status]}>{product.status}</AdminBadge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/products/${product.id}`} className="text-neutral-600 hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
