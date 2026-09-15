import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-1 text-[10px] tracking-editorial uppercase font-medium",
  {
    variants: {
      variant: {
        new: "bg-ink text-warm-white",
        bestseller: "bg-accent text-warm-white",
        limited: "bg-error text-warm-white",
        sale: "bg-charcoal text-warm-white",
        exclusive: "border border-ink text-ink bg-warm-white",
        neutral: "bg-ivory text-charcoal",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
