"use client";

import * as React from "react";
import { Star, Check, X } from "lucide-react";
import { toast } from "sonner";
import { AdminCard, AdminBadge } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";
import type { Review, User, Product } from "@/generated/prisma/client";

type ReviewRow = Review & { user: Pick<User, "name" | "email">; product: Pick<Product, "name" | "slug"> };

export function ReviewsManager({ initial }: { initial: ReviewRow[] }) {
  const [reviews, setReviews] = React.useState(initial);

  async function onModerate(id: string, status: "APPROVED" | "REJECTED") {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setReviews((prev) => prev.map((r) => (r.id === id ? json.data.review : r)));
      toast.success(`Review ${status.toLowerCase()}`);
    } catch {
      toast.error("Unable to update review");
    }
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <AdminCard key={review.id} className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex gap-0.5 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5" fill={i < review.rating ? "currentColor" : "none"} strokeWidth={1.5} />
              ))}
            </div>
            {review.title && <p className="font-medium">{review.title}</p>}
            <p className="mt-1 text-sm text-neutral-600">{review.comment}</p>
            <p className="mt-2 text-xs text-neutral-400">
              {review.user.name} on {review.product.name} · {formatDate(review.createdAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <AdminBadge tone={review.status === "APPROVED" ? "success" : review.status === "REJECTED" ? "danger" : "warning"}>
              {review.status}
            </AdminBadge>
            {review.status !== "APPROVED" && (
              <button onClick={() => onModerate(review.id, "APPROVED")} className="rounded p-1.5 text-green-600 hover:bg-green-50">
                <Check className="h-4 w-4" />
              </button>
            )}
            {review.status !== "REJECTED" && (
              <button onClick={() => onModerate(review.id, "REJECTED")} className="rounded p-1.5 text-red-600 hover:bg-red-50">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </AdminCard>
      ))}
      {reviews.length === 0 && <p className="text-sm text-neutral-400">No reviews yet</p>}
    </div>
  );
}
