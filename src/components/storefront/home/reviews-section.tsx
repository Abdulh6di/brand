import { Star } from "lucide-react";
import type { Review, User } from "@/generated/prisma/client";

type ReviewWithUser = Review & { user: Pick<User, "name">; product: { name: string; slug: string } };

export function ReviewsSection({ reviews }: { reviews: ReviewWithUser[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="bg-ivory py-20 md:py-28">
      <div className="container-editorial">
        <div className="mb-12 text-center">
          <p className="kicker mb-4">Client Notes</p>
          <h2 className="font-display text-4xl">Loved, Season After Season</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <div key={review.id} className="border border-line-strong bg-warm-white p-8">
              <div className="mb-4 flex gap-1 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5" fill={i < review.rating ? "currentColor" : "none"} strokeWidth={1.5} />
                ))}
              </div>
              {review.title && <p className="mb-2 font-display text-lg">{review.title}</p>}
              <p className="text-sm leading-relaxed text-charcoal/85">&ldquo;{review.comment}&rdquo;</p>
              <p className="mt-5 kicker">
                {review.user.name ?? "Verified Customer"} · {review.product.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
