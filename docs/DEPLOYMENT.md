# Deployment

## Recommended stack

- **App:** Vercel (or any Node 20+ host that supports Next.js 16 App Router).
  The app uses standard `next build`/`next start` — no custom server required.
- **Database:** A managed PostgreSQL 16+ provider (Neon, Supabase, RDS,
  Railway). Prisma 7 connects via the `@prisma/adapter-pg` driver adapter
  (`src/lib/db.ts`) — any standard Postgres connection string works.
- **Redis:** Upstash, Redis Cloud, or self-hosted — optional, improves rate
  limiting under multiple app instances.
- **Media storage:** Cloudinary (already integrated) or swap the
  `StorageProvider` interface in `src/server/storage.ts` for S3.
- **Email:** Resend (already integrated) with a verified sending domain.
- **Payments:** Stripe.

## Steps

1. **Provision Postgres.** Create the database, grab the connection string.
2. **Set environment variables** on your hosting platform — see
   `docs/ENVIRONMENT.md` for the full list. At minimum you need
   `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_TRUST_HOST=true`,
   and `NEXT_PUBLIC_SITE_URL`.
3. **Run migrations against production** before or during your first deploy:
   ```bash
   npx prisma migrate deploy
   ```
   (`migrate deploy`, not `migrate dev` — it doesn't prompt and doesn't
   generate new migration files, it only applies existing ones.)
4. **Seed only if this is a fresh environment you want demo data in.**
   Production launches should skip `db:seed` or write a separate
   production-safe seed (roles/permissions only, no fake orders/customers).
   The current `prisma/seed.ts` is a development/demo seed.
5. **Build:** `npm run build`. Confirm it completes with zero TypeScript
   errors (`npm run typecheck`) and zero ESLint errors (`npm run lint`)
   first — CI should gate on both.
6. **Configure the Stripe webhook** to point at
   `https://yourdomain.com/api/webhooks/stripe` and copy the signing secret
   into `STRIPE_WEBHOOK_SECRET`. Without this, card payments will create
   PaymentIntents but orders will never be marked `PAID` automatically.
7. **Verify your sending domain in Resend** and set `EMAIL_FROM` to an
   address on that domain, or transactional emails will be rejected.
8. **Point your domain** at the app, ensure HTTPS is enforced (the app sends
   `Strict-Transport-Security` — see `src/proxy.ts` — but your platform/CDN
   still needs to terminate TLS and redirect HTTP → HTTPS).

## Post-deploy checklist

- [ ] Log in to `/admin` with the seeded (or manually created) admin account
      and **immediately change the password**.
- [ ] Confirm `/sitemap.xml` and `/robots.txt` resolve.
- [ ] Place a real test order end-to-end (COD is the easiest — no Stripe
      test-mode setup required) and confirm the order appears in
      `/admin/orders` with correct inventory deduction.
- [ ] If using Stripe, run a test-mode card payment and confirm the webhook
      flips the order to `PAID` (check Stripe's webhook delivery log if not).
- [ ] Set up database backups on your Postgres provider (point-in-time
      recovery if available) — this app does not manage its own backups.
- [ ] Wire up uptime monitoring and error tracking (Sentry DSN is
      environment-ready but not yet integrated into the codebase).

## Scaling notes

The schema and query patterns are written to scale from a few dozen products
to a large catalog: indexed lookups, paginated admin/storefront lists, and
no N+1 query patterns in the hot paths. The two things to revisit first at
serious scale (thousands of orders/day) are:

1. **Rate limiting** — set `REDIS_URL` so limits are enforced consistently
   across multiple app instances instead of per-instance memory.
2. **Search** — the storefront search (`src/server/search.ts`) is a
   straightforward Postgres `ILIKE`/array-contains query. It's fine for a
   catalog of hundreds to low thousands of SKUs; beyond that, implement
   `SearchProvider` against Algolia or Meilisearch — the interface is
   already there so no calling code changes.
