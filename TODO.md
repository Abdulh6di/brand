# AELIA — Build Plan & Status

Luxury fashion e-commerce platform. Next.js 16 (App Router) · React 19 · TypeScript ·
Tailwind v4 · PostgreSQL 16 · Prisma 7 · Auth.js v5 · Stripe · Cloudinary · Resend.

Legend: `[x]` done · `[~]` scaffolded/abstracted (interface ready, needs live credentials
to fully activate) · `[ ]` not started.

## Phase 1 — Architecture, design system, dependencies
- [x] Next.js app scaffolded (App Router, TS, Tailwind v4, ESLint)
- [x] Local PostgreSQL 16 provisioned for development
- [x] Core dependencies installed (Prisma, Auth.js, Zod, Stripe, Resend, Cloudinary,
      ioredis, Radix primitives, Framer Motion, GSAP, Recharts, react-hook-form)
- [x] Design tokens (color, type, spacing) via Tailwind v4 `@theme`
- [x] Typography: Bodoni Moda (display serif) + Inter (sans/UI)
- [x] Project structure: `src/{app,components,lib,server,features,hooks,types,
      validations,emails,config}`, `prisma/`, `docs/`, `tests/`
- [x] Site config (`src/config/site.ts`) — nav, contact, categories, no hard-coded copy
      scattered through components

## Phase 2 — Database + auth
- [x] Full Prisma schema (see `docs/DATABASE.md` for ERD notes)
- [x] Initial migration applied to local Postgres
- [x] Seed script — realistic demo data (categories, collections, products, variants,
      reviews, coupons, orders, users)
- [x] Auth.js v5 credentials provider + Prisma adapter, RBAC (SUPER_ADMIN, ADMIN,
      MANAGER, EDITOR, CUSTOMER), password hashing (bcrypt), session callbacks with role

## Phase 3 — Core storefront layout
- [x] Header (sticky, transparent-over-hero → solid on scroll, mobile drawer)
- [x] Footer (shop / care / about / newsletter / payment icons)
- [x] Homepage: hero, featured collection, bestsellers, brand story, shop-by-category,
      lookbook teaser, custom order CTA, reviews, newsletter
- [x] Reusable UI primitives (Button, Input, Badge, Dialog, Select, Tabs, etc.)

## Phase 4 — Product system
- [x] Shop page: filters (category, collection, price, size, color, availability),
      sort, pagination, grid/list toggle
- [x] Product detail page: gallery w/ zoom, variant/size/color selection, WhatsApp
      inquiry link, related products
- [x] Category & collection listing pages
- [x] Search page (DB-backed now; abstracted behind a `SearchProvider` interface so
      Algolia/Meilisearch can be swapped in later without touching UI code)

## Phase 5 — Cart, wishlist, checkout
- [x] Cart (server-persisted for logged-in users, cookie-token cart for guests)
- [x] Wishlist
- [x] Multi-step checkout (info → shipping → payment → review)
- [x] Server-side price recalculation (never trusts client totals)
- [x] Payment abstraction layer: `PaymentProvider` interface with `StripeProvider` and
      `CashOnDeliveryProvider` implementations

## Phase 6 — Orders + payments backend
- [x] Order creation as a DB transaction (stock reservation, coupon validation)
- [x] Order status enum + timeline
- [x] Stripe webhook handler (signature-verified, source of truth for payment state)
- [x] Order confirmation + track-order pages

## Phase 7 — Customer account
- [x] Register / login / logout / password reset request flow
- [x] Account dashboard, orders, order detail, addresses, profile
- [x] Custom order request form
- [x] Static content pages: about, contact, size-guide, shipping, returns, FAQ,
      privacy, terms, blog (+ post), lookbook

## Phase 8 — Admin dashboard
- [x] `/admin` layout with RBAC guard (middleware + server-side check)
- [x] Overview: KPIs, revenue/orders charts, recent orders, low stock
- [x] Products CRUD (+ variants, images)
- [x] Categories & Collections CRUD
- [x] Orders management (status updates, timeline, internal notes)
- [x] Customers list/detail
- [x] Coupons CRUD
- [x] Reviews moderation
- [x] Custom order requests workflow

## Phase 9 — SEO, emails, security, docs
- [x] `sitemap.xml`, `robots.txt`, JSON-LD (Product, Organization, WebSite, Breadcrumb)
- [x] Transactional email templates (order confirmation, shipped, welcome, password
      reset, custom order received) via Resend abstraction
- [x] Security headers middleware, rate limiting abstraction (Redis-ready, in-memory
      fallback), Zod validation on every API input, admin route protection
- [x] `README.md`, `DEPLOYMENT.md`, `DATABASE.md`, `ENVIRONMENT.md`, `SECURITY.md`
- [x] `.env.example`
- [x] `npm run build` verified clean, `npm run lint` clean, `tsc --noEmit` clean
- [x] Representative test suite (Vitest): money formatting, slugs, permission
      matrix, coupon validation (integration test against the seeded DB)

## Explicitly out of scope for this pass (interfaces are in place, not live)
These need real credentials/infrastructure the sandbox doesn't have. Each has a typed
abstraction so wiring in production is a config change, not a rewrite:
- Cloudinary/S3 — `src/server/storage` interface; falls back to storing given URLs
- Redis — `src/server/cache` interface; falls back to in-process memory cache
- WhatsApp Business API — deep-link message generation is live; API-based automated
  messaging is stubbed in `src/server/whatsapp`
- Algolia/Meilisearch — `SearchProvider` interface; DB full-text search is the default
- Full automated email delivery — templates + Resend client are wired; needs a real
  `RESEND_API_KEY` to actually send
- GA / GTM / Meta Pixel — script injection is env-gated, needs real IDs
- Sentry / uptime monitoring — config stub only
- i18n (Urdu/Arabic) — copy is centralized (not hard-coded per component) to make this
  a translation-file exercise later, not a refactor
- End-to-end test suite — a representative set of unit/integration tests is included,
  not exhaustive coverage of every flow
