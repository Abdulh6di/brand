# AELIA — Luxury Fashion E-Commerce Platform

A production-architected luxury fashion e-commerce platform: editorial storefront,
full commerce backend (cart, checkout, payments, orders, inventory), customer
accounts, made-to-order workflow, and a business admin dashboard.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind
CSS v4 · PostgreSQL 16 · Prisma 7 · Auth.js v5 · Stripe · Cloudinary · Resend ·
Redis (optional).

See [`TODO.md`](./TODO.md) for what's fully wired up versus scaffolded pending
live credentials, and the docs below for setup detail.

## Quick Start

```bash
npm install

# 1. Point DATABASE_URL at a Postgres 16 instance (see docs/DATABASE.md)
cp .env.example .env

# 2. Create schema + seed realistic demo data
npm run db:migrate
npm run db:seed

# 3. Run
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin`
for the admin dashboard. Seeded admin login: the email/password from
`ADMIN_EMAIL` / `ADMIN_PASSWORD` in your `.env` (defaults printed by the seed
script).

## Scripts

| Script              | Purpose                                       |
| -------------------- | ---------------------------------------------- |
| `npm run dev`         | Start the dev server (Turbopack)              |
| `npm run build`       | Production build                              |
| `npm run start`       | Run the production build                       |
| `npm run lint`        | ESLint                                         |
| `npm run typecheck`   | `tsc --noEmit`                                 |
| `npm run db:migrate`  | Create/apply a Prisma migration               |
| `npm run db:generate` | Regenerate the Prisma client                  |
| `npm run db:seed`     | Seed demo data (categories, products, orders…) |
| `npm run db:studio`   | Prisma Studio — browse the database visually  |
| `npm run test`        | Vitest                                        |

## Project Structure

```
src/
  app/               Next.js routes
    (storefront)/    Public storefront pages (shares header/footer layout)
    admin/           Admin dashboard (separate visual system, RBAC-gated)
    api/             Route handlers (REST-ish JSON API)
  components/
    ui/              Design-system primitives (Button, Input, Badge…)
    layout/          Header, footer, site chrome
    storefront/      Feature components (product, cart, checkout, account…)
    admin/           Admin-only components
  server/            Server-only business logic (cart, orders, payments,
                     coupons, shipping, email, storage, search, audit log)
  lib/               Shared utilities (db client, auth, permissions, utils)
  validations/       Zod schemas — the single source of truth for input
                     shape shared between forms and API routes
  emails/            Transactional email templates
  config/            Site-wide config (nav, contact info, categories)
  generated/prisma/  Generated Prisma client (gitignored)
prisma/
  schema.prisma      Full data model
  seed.ts            Demo data generator
  migrations/
docs/                Deployment, database, environment, and security docs
```

## Documentation

- [`docs/DATABASE.md`](./docs/DATABASE.md) — schema design, key relationships,
  inventory/order lifecycle
- [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md) — every environment variable
  explained
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — production deployment guide
- [`docs/SECURITY.md`](./docs/SECURITY.md) — security posture and practices
- [`TODO.md`](./TODO.md) — build status, phase by phase

## Architecture Notes

- **Money** is stored as integer minor units (cents) everywhere — never
  floating point — computed server-side at every step (cart, checkout,
  coupons, shipping). The client never supplies a price the server trusts.
- **Payments** go through a `PaymentGateway` interface
  (`src/server/payments`) with a Stripe implementation and a Cash-on-Delivery
  / Bank-Transfer no-op implementation. Adding a new gateway means
  implementing the interface, not touching checkout logic.
- **RBAC** is database-driven: `Role` → `RolePermission` → `Permission`,
  seeded with sensible defaults per role in `src/lib/permissions.ts`. Admin
  API routes call `requirePermission("resource.action")`.
- **Inventory** tracks `stock` (on-hand) and `reservedStock` (allocated to
  unfulfilled orders) separately, with every change logged to
  `InventoryTransaction`. See `docs/DATABASE.md` for the full lifecycle.
- **Search, cache, storage, and WhatsApp automation** are behind small
  provider interfaces so Algolia/Meilisearch, Redis, S3, and the WhatsApp
  Business API can be swapped in without touching calling code — see
  `TODO.md` for exactly what's live vs. scaffolded.
