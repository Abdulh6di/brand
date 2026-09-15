import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/client";

const HAPPY_PATH: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "Order Placed" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PROCESSING", label: "Processing" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "DELIVERED", label: "Delivered" },
];

const TERMINAL_LABELS: Partial<Record<OrderStatus, string>> = {
  CANCELLED: "Cancelled",
  RETURN_REQUESTED: "Return Requested",
  RETURNED: "Returned",
  REFUNDED: "Refunded",
};

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (TERMINAL_LABELS[status]) {
    return (
      <div className="border border-error/40 bg-error-soft px-4 py-3 text-sm text-error">
        {TERMINAL_LABELS[status]}
      </div>
    );
  }

  const effectiveStatus = ["PAID", "PAYMENT_PENDING"].includes(status) ? "CONFIRMED" : status;
  const effectiveStatus2 = ["IN_PRODUCTION", "CUSTOMIZATION", "READY"].includes(effectiveStatus) ? "PROCESSING" : effectiveStatus;
  const effectiveStatus3 = effectiveStatus2 === "OUT_FOR_DELIVERY" ? "SHIPPED" : effectiveStatus2;

  const currentIndex = HAPPY_PATH.findIndex((s) => s.status === effectiveStatus3);

  return (
    <div className="flex flex-col gap-0 sm:flex-row sm:items-center">
      {HAPPY_PATH.map((step, i) => {
        const isComplete = i <= currentIndex;
        const isLast = i === HAPPY_PATH.length - 1;
        return (
          <div key={step.status} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2 text-center sm:flex-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs",
                  isComplete ? "border-ink bg-ink text-warm-white" : "border-line-strong text-taupe",
                )}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : i + 1}
              </div>
              <span className={cn("text-xs", isComplete ? "text-ink" : "text-taupe")}>{step.label}</span>
            </div>
            {!isLast && <div className={cn("mx-2 hidden h-px flex-1 sm:block", isComplete ? "bg-ink" : "bg-line")} />}
          </div>
        );
      })}
    </div>
  );
}
