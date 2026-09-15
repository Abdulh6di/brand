import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][],
    );
    params.set("page", String(p));
    return `?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="mt-16 flex items-center justify-center gap-2" aria-label="Pagination">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn("px-3 py-2 text-xs uppercase tracking-editorial", page === 1 && "pointer-events-none opacity-30")}
      >
        Prev
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          className={cn(
            "flex h-9 w-9 items-center justify-center text-sm",
            p === page ? "bg-ink text-warm-white" : "text-charcoal hover:bg-ivory",
          )}
        >
          {p}
        </Link>
      ))}
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn("px-3 py-2 text-xs uppercase tracking-editorial", page === totalPages && "pointer-events-none opacity-30")}
      >
        Next
      </Link>
    </nav>
  );
}
