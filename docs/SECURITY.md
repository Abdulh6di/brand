# Security

## Authentication & authorization

- Passwords are hashed with bcrypt (`cost 12`, `src/lib/password.ts`). Plain
  passwords are never logged or stored.
- Sessions are JWT-based (Auth.js v5), encrypted with `NEXTAUTH_SECRET`.
  **Rotate this secret and it invalidates every session** — treat it like
  any other credential.
- Admin routes (`/admin/**`) and account routes (`/account/**`) are gated in
  `src/proxy.ts` (Next.js's edge middleware convention) before any page
  code runs, and re-checked server-side in `src/lib/admin-auth.ts` for
  defense in depth (a leaked/forged request that somehow bypasses the edge
  check still hits `requireAdminSession()`/`requirePermission()`).
- Authorization is granular and database-driven: `Role` → `RolePermission` →
  `Permission` (e.g. `products.delete`, `orders.update`). Admin API routes
  call `requirePermission("resource.action")`, not just "is this an admin."
- Login attempts are rate-limited per IP+email (`src/lib/auth.ts`) to slow
  down credential stuffing/brute force.

## Input validation

Every API route validates its input with Zod before touching the database —
see `src/validations/*`. Validation schemas are the single source of truth
shared between forms and route handlers, so client and server never
disagree about what's a valid payload.

## Trusting the client — what we never do

- **Prices, discounts, shipping costs, and totals are always recomputed
  server-side** at cart, checkout, and coupon-apply time
  (`src/server/cart.ts`, `src/server/orders.ts`, `src/server/coupons.ts`).
  The client can send whatever it wants; only server-side product/variant/
  coupon records are used to compute what a customer is actually charged.
- **Stock availability is checked server-side** at add-to-cart and at order
  creation, inside a database transaction, before stock is reserved.
- **Payment success is never inferred from the browser.** Only a
  signature-verified Stripe webhook event (`/api/webhooks/stripe`) flips an
  order to `PAID`. The client-side Stripe Elements confirmation only tells
  the *browser* the card was accepted; the server doesn't act on that.

## Rate limiting

`src/server/rate-limit.ts` implements a fixed-window limiter, backed by
Redis when `REDIS_URL` is set (shared across instances) or an in-process
`Map` otherwise (fine for a single instance / local dev). Applied to:
login, registration, password reset request, newsletter signup, contact
form, custom order submission, checkout, cart mutations, and file uploads.

## File uploads

`/api/uploads` (used by the custom-order form and admin product images)
validates MIME type (JPEG/PNG/WebP only) and a hard 8MB size cap before
ever reading the file into memory, and uploads go straight to Cloudinary —
nothing is ever written to local disk or served from a user-controlled
path.

## Security headers

Set on every response in `src/proxy.ts`: `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`, and
`Strict-Transport-Security`. A Content-Security-Policy is not yet
configured — see "Known gaps" below.

## Audit logging

Every meaningful admin mutation (product create/update/archive, order status
changes, etc.) writes an `AuditLog` row: actor, action, entity, entity ID,
old value, new value, IP address, timestamp (`src/server/audit-log.ts`).
Reviewable in `/admin/settings`.

## Secrets

No secret is ever sent to the client. `NEXT_PUBLIC_*` variables are the only
ones inlined into the browser bundle by Next.js, and none of the current
`NEXT_PUBLIC_*` values are sensitive (site URL, WhatsApp number, Stripe
*publishable* key, analytics IDs). `.env` is gitignored; `.env.example`
contains no real values.

## Dependency audit notes

`npm audit` currently reports vulnerabilities confined to Prisma CLI's own
*dev-time* transitive dependencies (a bundled `mysql2` driver used by
`@prisma/config`'s multi-database tooling, and `deepmerge-ts`) — this
project only uses the PostgreSQL driver adapter (`@prisma/adapter-pg`) at
runtime, so these paths are never exercised in the deployed app. Re-run
`npm audit` periodically and re-evaluate; a Prisma major upgrade (6.x) would
clear them at the cost of losing the Prisma 7 client generator used here.

## Known gaps / next steps for a production launch

- No Content-Security-Policy header yet — recommend adding one scoped to
  the actual third-party script origins in use (Stripe.js, analytics) before
  launch.
- No CSRF token on top of Auth.js's own (Auth.js credentials sign-in already
  includes CSRF protection; custom form-posting API routes rely on
  same-origin fetch + SameSite cookies rather than a separate token).
- No automated dependency-vulnerability scanning wired into CI yet.
- No WAF/DDoS layer — put this behind a CDN (Cloudflare, Vercel's edge
  network) in production.
- End-to-end test coverage is representative, not exhaustive (see
  `TODO.md`) — expand before a real launch, especially around checkout and
  payment edge cases (partial refunds, webhook retries/idempotency).
