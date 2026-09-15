# Database

PostgreSQL 16 + Prisma 7 (using the `@prisma/adapter-pg` driver adapter — Prisma
7 requires an explicit driver adapter rather than a bare connection string on
`PrismaClient`; see `src/lib/db.ts`).

## Core entity groups

**Auth & RBAC** — `User`, `Role`, `Permission`, `RolePermission`, plus the
standard Auth.js tables (`Account`, `Session`, `VerificationToken`) and
`PasswordResetToken`. Roles are seeded (`SUPER_ADMIN`, `ADMIN`, `MANAGER`,
`EDITOR`, `CUSTOMER`) with a default permission matrix in
`src/lib/permissions.ts` — SUPER_ADMIN implicitly has every permission;
everyone else is explicit rows in `RolePermission`. Only `SUPER_ADMIN` should
manage roles in a real deployment (there's currently no UI to reassign a
user's role — see below).

**Catalog** — `Category` (one per product, self-referential for
subcategories) → `Product` → `ProductVariant` (color/size/stock),
`ProductImage`, `ProductVideo`, and `ProductCustomizationOption` /
`ProductCustomizationChoice` for admin-configurable made-to-order options
(sleeve style, embroidery density, etc. — price deltas, never hard-coded).
`Collection` is many-to-many with `Product` (a piece can appear in "Bestsellers"
and "The Autumn Edit" simultaneously).

**Cart & Wishlist** — `Cart` belongs to either a `userId` or a `guestToken`
(httpOnly cookie, see `src/server/cart.ts`), never both. `CartItem.customization`
stores a snapshot of selected options (label + price delta) so historical
carts/orders don't break if the product's options change later.

**Orders & Payments** — `Order` → `OrderItem` (line-item snapshots: name, SKU,
price — again, snapshotted so catalog edits don't rewrite history) →
`OrderStatusHistory` (the visual timeline) and `Payment` (provider-agnostic;
`PaymentProvider` enum + `rawResponse` Json for the gateway's raw payload).
`Coupon` / `CouponUsage` enforce per-user and total usage limits.

**Custom orders** — `CustomOrder` + `CustomOrderImage`, independent of the
main `Order` flow since a custom piece doesn't have a price until it's quoted.

**Content/CMS** — `BlogPost` / `BlogCategory`, `Lookbook` / `LookbookImage` /
`LookbookImageProduct` (shop-the-look tagging), `Banner`, `HomepageSection`
(a `key` + `config` Json blob per homepage block — hero, bestsellers, etc. —
so section content/order can change without a deploy, though the visual
drag-and-drop editor described in the brief isn't built yet; see `TODO.md`).

**Operational** — `Notification`, `AuditLog` (every admin mutation that
matters — price changes, status changes — records old/new value + actor +
IP), `SiteSetting` (generic key/value store for future config), `ShippingZone`
/ `ShippingRate`.

## Inventory lifecycle

`ProductVariant.stock` is total on-hand inventory. `reservedStock` is the
portion allocated to unfulfilled orders. Available-to-sell is always
`stock - reservedStock`.

1. **Checkout** — reserves stock (`reservedStock += qty`), logs an
   `InventoryTransaction` (`ORDER_DEDUCTION`). Nothing is removed from
   `stock` yet — the item is still physically in the warehouse.
2. **Order ships** (admin marks `SHIPPED`/`OUT_FOR_DELIVERY`/`DELIVERED`) —
   the reservation is finalized: both `stock` and `reservedStock` decrement
   by the order quantity (see `src/server/admin-orders.ts`).
3. **Cancelled before shipping** — the reservation is simply released
   (`reservedStock` decrements, `stock` untouched).
4. **Cancelled/returned after shipping** — physical stock is restored
   (`stock` increments).

This is a deliberate simplification: it does not model partial shipments,
split fulfillment across warehouses, or backorders. For a real deployment
selling into the thousands of orders/day, consider a dedicated `Inventory`
ledger keyed by warehouse.

## Money

Every price/amount column is an `Int` in minor units (cents). Never store or
compute money as `Float`. `src/lib/utils.ts#formatMoney` is the only place
formatting happens; `Intl.NumberFormat` handles currency display rules
(including zero-decimal currencies like PKR).

## Migrations

```bash
npm run db:migrate -- --name describe_your_change
npm run db:generate   # usually automatic, but explicit after schema edits
```

`prisma.config.ts` (not `schema.prisma`, per Prisma 7) is where
`DATABASE_URL` is read for the CLI; `PrismaClient` itself takes the URL via
the `@prisma/adapter-pg` adapter in `src/lib/db.ts`.

## Indexing

Indexes exist on every foreign key used in a hot-path query, plus `slug`,
`sku`, `email`, order `status`/`createdAt`, and audit log `entity`+`entityId`.
Run `EXPLAIN ANALYZE` against slow admin list queries as the catalog grows
past a few thousand products — the current queries are straightforward
`findMany`/`count` pairs with no N+1 issues, but very large collections
(`availableSizes`/`availableColors` array filters) may eventually want a GIN
index.
