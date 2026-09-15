# Environment Variables

Copy `.env.example` to `.env` and fill in what you need. Everything below is
grouped by feature; unset optional groups degrade gracefully (see
`TODO.md` for exactly what each one unlocks).

## Required to run at all

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used at runtime |
| `DIRECT_URL` | Same as above; used by Prisma Migrate. Only needs to differ if you put a connection pooler in front of Postgres in production |
| `NEXTAUTH_SECRET` | Encrypts session JWTs. Generate with `openssl rand -base64 32`. **Must** be set to a real secret in production |
| `NEXTAUTH_URL` | Canonical app URL, e.g. `https://aelia.com` |
| `AUTH_TRUST_HOST` | Set `true` — required for Auth.js to trust the host header behind a reverse proxy (Vercel, most PaaS) |
| `NEXT_PUBLIC_SITE_URL` | Used for canonical URLs, sitemap, OG tags, JSON-LD |

## Seed-only

| Variable | Purpose |
| --- | --- |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used only by `prisma/seed.ts` to create the initial admin account. Change the password immediately after first login in any real deployment; never commit real credentials here |

## Payments (Stripe)

| Variable | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Server-side Stripe key. Without it, card payments are disabled — the checkout page automatically hides the option and only offers COD/Bank Transfer |
| `STRIPE_WEBHOOK_SECRET` | Verifies webhook signatures at `/api/webhooks/stripe`. **This is the only thing that marks an order PAID** — never trust the client-side payment confirmation alone |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side key for Stripe Elements |

Register the webhook endpoint in the Stripe dashboard (or `stripe listen
--forward-to localhost:3000/api/webhooks/stripe` locally) for
`payment_intent.succeeded`, `payment_intent.payment_failed`, and
`charge.refunded`.

## Media storage (Cloudinary)

| Variable | Purpose |
| --- | --- |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Used by `/api/uploads` for product images and custom-order reference photos. Without these, upload attempts return a clear "not configured" error rather than failing silently |

## Email (Resend)

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Without it, transactional emails (order confirmation, password reset, welcome, shipped, custom-order-received) log a warning instead of sending — the app keeps working, emails just don't go out |
| `EMAIL_FROM` | From address, e.g. `AELIA <no-reply@yourdomain.com>` — must be a domain verified in Resend |

## WhatsApp

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Powers every "Ask on WhatsApp" click-to-chat link storefront-wide — works with zero other config |
| `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | Only needed for *automated* server-initiated messages via the Meta Cloud API (`src/server/whatsapp.ts`) — not required for the click-to-chat links |

## Redis (optional)

| Variable | Purpose |
| --- | --- |
| `REDIS_URL` | Enables a shared, multi-instance rate limiter (`src/server/rate-limit.ts`). Without it, rate limiting still works via an in-process fallback — fine for local dev or a single server instance, but resets on redeploy and doesn't share state across instances |

## Analytics (optional)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel |

Each script only loads when its ID is present (`src/components/shared/analytics-scripts.tsx`).
Event tracking (add-to-cart, purchase, newsletter signup, etc.) is wired via
`src/lib/analytics.ts#trackEvent`, which no-ops safely when nothing is
configured.

## Monitoring (optional)

| Variable | Purpose |
| --- | --- |
| `SENTRY_DSN` | Reserved for error monitoring integration — not yet wired into the app; add the Sentry Next.js SDK and use this DSN when you're ready |
