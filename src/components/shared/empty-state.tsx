import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  actionHref,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && <Icon className="mb-6 h-10 w-10 text-taupe" strokeWidth={1} />}
      <h3 className="font-display text-2xl">{title}</h3>
      {description && <p className="mt-3 max-w-sm text-sm text-charcoal/70">{description}</p>}
      {actionLabel && actionHref && (
        <Button asChild variant="outline" className="mt-8">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
