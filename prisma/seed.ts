import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/password";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS, ROLE_NAMES } from "../src/lib/permissions";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const IMG = (seed: string, w = 1200, h = 1500) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

async function seedRolesAndPermissions() {
  console.log("→ Roles & permissions");

  for (const key of PERMISSIONS) {
    await db.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });
  }

  const roleRecords: Record<string, string> = {};
  for (const name of ROLE_NAMES) {
    const role = await db.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    roleRecords[name] = role.id;

    const permKeys = DEFAULT_ROLE_PERMISSIONS[name];
    const perms = await db.permission.findMany({ where: { key: { in: permKeys } } });
    await db.rolePermission.deleteMany({ where: { roleId: role.id } });
    if (perms.length) {
      await db.rolePermission.createMany({
        data: perms.map((p) => ({ roleId: role.id, permissionId: p.id })),
        skipDuplicates: true,
      });
    }
  }

  return roleRecords;
}

async function seedUsers(roleIds: Record<string, string>) {
  console.log("→ Users");

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@aelia.dev";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Aelia Admin",
      passwordHash: await hashPassword(adminPassword),
      roleId: roleIds.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  });

  const manager = await db.user.upsert({
    where: { email: "manager@aelia.dev" },
    update: {},
    create: {
      email: "manager@aelia.dev",
      name: "Studio Manager",
      passwordHash: await hashPassword("ChangeMe123!"),
      roleId: roleIds.MANAGER,
      emailVerified: new Date(),
    },
  });

  const customerNames = [
    "Sofia Reyes",
    "Amara Khan",
    "Isabelle Laurent",
    "Noor Fatima",
    "Chiara Moretti",
    "Elena Petrova",
    "Layla Haddad",
    "Grace Kim",
    "Zainab Ahmed",
    "Camille Dubois",
  ];

  const customers = [];
  for (let i = 0; i < customerNames.length; i++) {
    const name = customerNames[i];
    const email = `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
    const customer = await db.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name,
        passwordHash: await hashPassword("Password123!"),
        roleId: roleIds.CUSTOMER,
        emailVerified: new Date(),
        cart: { create: {} },
        wishlist: { create: {} },
      },
    });
    customers.push(customer);
  }

  return { admin, manager, customers };
}

const CATEGORY_SEED = [
  { name: "Bridal", slug: "bridal", description: "Heirloom bridal couture, hand-finished for the most important day." },
  { name: "Party Wear", slug: "party-wear", description: "Statement eveningwear cut for candlelit rooms." },
  { name: "Luxury Pret", slug: "luxury-pret", description: "Ready-to-wear with couture-level detailing." },
  { name: "Ready to Wear", slug: "ready-to-wear", description: "Everyday elegance, considered down to the seam." },
  { name: "Made to Order", slug: "made-to-order", description: "Built to your measurements, one atelier appointment at a time." },
  { name: "New Arrivals", slug: "new-arrivals", description: "The latest from the atelier." },
  { name: "Accessories", slug: "accessories", description: "The finishing note — clutches, jewelry, and veils." },
  { name: "Outerwear", slug: "outerwear", description: "Tailored coats and capes in rare wool and silk blends." },
];

async function seedCategories() {
  console.log("→ Categories");
  const categories = [];
  for (let i = 0; i < CATEGORY_SEED.length; i++) {
    const c = CATEGORY_SEED[i];
    const category = await db.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        ...c,
        imageUrl: IMG(`cat-${c.slug}`, 1200, 900),
        sortOrder: i,
        seoTitle: `${c.name} — AELIA`,
        seoDescription: c.description,
      },
    });
    categories.push(category);
  }
  return categories;
}

const COLLECTION_SEED = [
  { name: "The Autumn Edit", slug: "the-autumn-edit", description: "Rich textures and warm neutrals for the season ahead." },
  { name: "Bridal Atelier 2026", slug: "bridal-atelier-2026", description: "This year's bridal capsule, hand-beaded in-house." },
  { name: "Noir Soirée", slug: "noir-soiree", description: "Evening silhouettes in black silk and velvet." },
  { name: "Heritage Weaves", slug: "heritage-weaves", description: "A tribute to traditional handloom techniques." },
  { name: "Bestsellers", slug: "bestsellers", description: "The pieces our clients return for, season after season." },
];

async function seedCollections() {
  console.log("→ Collections");
  const collections = [];
  for (let i = 0; i < COLLECTION_SEED.length; i++) {
    const c = COLLECTION_SEED[i];
    const collection = await db.collection.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        ...c,
        heroImageUrl: IMG(`col-${c.slug}`, 1600, 1000),
        bannerImageUrl: IMG(`col-banner-${c.slug}`, 1920, 800),
        status: "ACTIVE",
        sortOrder: i,
        seoTitle: `${c.name} — AELIA`,
        seoDescription: c.description,
      },
    });
    collections.push(collection);
  }
  return collections;
}

const PRODUCT_NAMES = [
  "Aurélie Embroidered Gown",
  "Camille Silk Slip Dress",
  "Noor Hand-Beaded Lehenga",
  "Ines Velvet Wrap Coat",
  "Seraphine Tulle Ballgown",
  "Marguerite Chiffon Kaftan",
  "Odette Corseted Bodysuit",
  "Valentina Sequin Cape Dress",
  "Rosalind Organza Blouse",
  "Genevieve Draped Sari Gown",
  "Colette Tailored Blazer Dress",
  "Amara Zardozi Anarkali",
  "Fleur Pleated Midi Dress",
  "Beatrix Brocade Sherwani Coat",
  "Delphine Feather-Trim Gown",
  "Josephine Mikado Wedding Gown",
  "Rania Threadwork Kurta Set",
  "Vivienne Satin Column Dress",
  "Elowen Hand-Cut Lace Gown",
  "Zara Metallic Georgette Saree",
  "Margaux Structured Cape",
  "Ottilie Beaded Clutch",
  "Solene Crystal Choker",
  "Imogen Silk Veil",
  "Théa Pearl Drop Earrings",
  "Wren Tasseled Dupatta",
  "Adalyn Quilted Shawl",
  "Petra Hand-Stitched Juttis",
  "Céline Ostrich Feather Stole",
  "Marisol Two-Piece Co-ord",
];

const COLORS = ["Ivory", "Emerald", "Black", "Champagne", "Blush", "Midnight", "Bronze", "Rosewood"];
const FABRICS = ["Silk", "Organza", "Velvet", "Chiffon", "Tulle", "Georgette", "Raw Silk"];
const SIZES = ["XS", "S", "M", "L", "XL"];

function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

async function seedProducts(categories: Awaited<ReturnType<typeof seedCategories>>, collections: Awaited<ReturnType<typeof seedCollections>>) {
  console.log("→ Products");
  const products = [];

  for (let i = 0; i < PRODUCT_NAMES.length; i++) {
    const name = PRODUCT_NAMES[i];
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const category = pick(categories, i);
    const basePrice = 18000 + i * 3700; // cents
    const onSale = i % 5 === 0;
    const isAccessory = category.slug === "accessories";

    const product = await db.product.upsert({
      where: { slug },
      update: {},
      create: {
        sku: `AEL-${String(1000 + i)}`,
        name,
        slug,
        description:
          `The ${name} is cut from ${pick(FABRICS, i).toLowerCase()} and finished entirely by hand in our atelier, ` +
          `with hand-set embroidery detail along the neckline and hem. Each piece takes an average of forty hours to complete.`,
        shortDescription: `Hand-finished ${pick(FABRICS, i).toLowerCase()} piece from the atelier.`,
        price: basePrice,
        salePrice: onSale ? Math.round(basePrice * 0.8) : null,
        costPrice: Math.round(basePrice * 0.4),
        categoryId: category.id,
        fabric: pick(FABRICS, i),
        status: "ACTIVE",
        isFeatured: i < 8,
        isBestseller: i % 4 === 0,
        isNew: i % 6 === 0,
        isLimited: i % 9 === 0,
        isExclusive: i % 11 === 0,
        isCustomizable: !isAccessory,
        availableSizes: isAccessory ? [] : SIZES,
        availableColors: [pick(COLORS, i), pick(COLORS, i + 2), pick(COLORS, i + 4)],
        tags: [category.slug, pick(FABRICS, i).toLowerCase()],
        seoTitle: `${name} — AELIA`,
        seoDescription: `Shop the ${name}, hand-finished luxury from AELIA.`,
        publishedAt: new Date(),
        images: {
          create: [0, 1, 2].map((n) => ({
            url: IMG(`${slug}-${n}`),
            altText: `${name} — view ${n + 1}`,
            sortOrder: n,
            isPrimary: n === 0,
          })),
        },
        collections: {
          connect: [{ id: pick(collections, i).id }, ...(i % 3 === 0 ? [{ id: collections[4].id }] : [])],
        },
      },
    });

    if (!isAccessory) {
      const colors = [pick(COLORS, i), pick(COLORS, i + 2)];
      for (const color of colors) {
        for (const size of SIZES) {
          await db.productVariant.upsert({
            where: { sku: `${product.sku}-${color.slice(0, 3).toUpperCase()}-${size}` },
            update: {},
            create: {
              productId: product.id,
              sku: `${product.sku}-${color.slice(0, 3).toUpperCase()}-${size}`,
              color,
              size,
              stock: 5 + ((i + size.length) % 15),
            },
          });
        }
      }

      if (product.isCustomizable) {
        const sleeves = await db.productCustomizationOption.create({
          data: { productId: product.id, type: "SLEEVES", label: "Sleeve Style", sortOrder: 0 },
        });
        await db.productCustomizationChoice.createMany({
          data: [
            { optionId: sleeves.id, label: "Full Sleeve", priceDelta: 0, sortOrder: 0 },
            { optionId: sleeves.id, label: "Half Sleeve", priceDelta: 0, sortOrder: 1 },
            { optionId: sleeves.id, label: "Sleeveless", priceDelta: -1500, sortOrder: 2 },
          ],
        });
        const embroidery = await db.productCustomizationOption.create({
          data: { productId: product.id, type: "EMBROIDERY", label: "Embroidery Density", sortOrder: 1 },
        });
        await db.productCustomizationChoice.createMany({
          data: [
            { optionId: embroidery.id, label: "Standard", priceDelta: 0, sortOrder: 0 },
            { optionId: embroidery.id, label: "Heavy Handwork (+)", priceDelta: 8500, sortOrder: 1 },
          ],
        });
      }
    } else {
      await db.productVariant.upsert({
        where: { sku: `${product.sku}-STD` },
        update: {},
        create: { productId: product.id, sku: `${product.sku}-STD`, stock: 20 },
      });
    }

    products.push(product);
  }

  return products;
}

async function seedReviews(products: Awaited<ReturnType<typeof seedProducts>>, customers: { id: string }[]) {
  console.log("→ Reviews");
  const comments = [
    "The craftsmanship is extraordinary — every seam is perfect.",
    "Fit exactly as promised after the measurement guide. Worth every penny.",
    "This arrived more beautiful than the photos. Compliments all night.",
    "The fabric quality is unlike anything I've bought before.",
    "Customer service helped me customize the sleeves — seamless experience.",
    "A true investment piece. I will be back for the bridal capsule.",
  ];

  let count = 0;
  for (let i = 0; i < 20; i++) {
    const product = products[i % products.length];
    const customer = customers[i % customers.length];
    await db.review.create({
      data: {
        productId: product.id,
        userId: customer.id,
        rating: 4 + (i % 2),
        title: i % 3 === 0 ? "Exceeded expectations" : undefined,
        comment: comments[i % comments.length],
        status: i % 6 === 0 ? "PENDING" : "APPROVED",
        isVerifiedPurchase: i % 2 === 0,
      },
    });
    count++;
  }
  console.log(`   seeded ${count} reviews`);
}

async function seedCoupons() {
  console.log("→ Coupons");
  await db.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      firstOrderOnly: true,
      isActive: true,
      usageLimit: 500,
      perUserLimit: 1,
    },
  });
  await db.coupon.upsert({
    where: { code: "AELIA50" },
    update: {},
    create: {
      code: "AELIA50",
      type: "FIXED",
      value: 5000,
      minOrderAmount: 30000,
      isActive: true,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
    },
  });
}

async function seedOrders(products: Awaited<ReturnType<typeof seedProducts>>, customers: { id: string; name: string | null; email: string }[]) {
  console.log("→ Orders");
  const statuses = ["DELIVERED", "SHIPPED", "PROCESSING", "PAID", "PENDING", "CANCELLED"] as const;

  for (let i = 0; i < 20; i++) {
    const customer = customers[i % customers.length];
    const product = products[i % products.length];
    const variant = await db.productVariant.findFirst({ where: { productId: product.id } });
    const quantity = 1 + (i % 2);
    const unitPrice = product.salePrice ?? product.price;
    const subtotal = unitPrice * quantity;
    const shipping = subtotal > 50000 ? 0 : 1500;
    const total = subtotal + shipping;
    const status = statuses[i % statuses.length];

    await db.order.create({
      data: {
        orderNumber: `AEL-${String(100000 + i)}`,
        userId: customer.id,
        status,
        subtotal,
        shippingAmount: shipping,
        total,
        paymentMethod: i % 3 === 0 ? "COD" : "CARD",
        shippingAddress: {
          fullName: customer.name ?? "Customer",
          phone: "+1 555 010 0000",
          country: "United States",
          city: "New York",
          addressLine1: "123 Fifth Avenue",
          postalCode: "10160",
        },
        items: {
          create: [
            {
              productId: product.id,
              variantId: variant?.id,
              productName: product.name,
              variantLabel: variant ? `${variant.color ?? ""} / ${variant.size ?? ""}`.trim() : null,
              sku: variant?.sku ?? product.sku,
              unitPrice,
              quantity,
              lineTotal: subtotal,
            },
          ],
        },
        statusHistory: {
          create: [{ status: "PENDING" }, { status }],
        },
        payments: {
          create: [
            {
              provider: i % 3 === 0 ? "COD" : "STRIPE",
              amount: total,
              status: status === "CANCELLED" ? "FAILED" : "SUCCESS",
              method: i % 3 === 0 ? "cod" : "card",
            },
          ],
        },
      },
    });
  }
}

async function seedHomepageSections() {
  console.log("→ Homepage sections");
  const sections = [
    { key: "hero", sortOrder: 0 },
    { key: "featured_collection", sortOrder: 1 },
    { key: "bestsellers", sortOrder: 2 },
    { key: "brand_story", sortOrder: 3 },
    { key: "shop_by_category", sortOrder: 4 },
    { key: "lookbook", sortOrder: 5 },
    { key: "custom_order", sortOrder: 6 },
    { key: "reviews", sortOrder: 7 },
    { key: "instagram", sortOrder: 8 },
    { key: "newsletter", sortOrder: 9 },
  ];
  for (const s of sections) {
    await db.homepageSection.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, sortOrder: s.sortOrder, isPublished: true, config: {} },
    });
  }
}

async function seedShipping() {
  console.log("→ Shipping zones");
  const zone = await db.shippingZone.upsert({
    where: { id: "seed-domestic-zone" },
    update: {},
    create: { id: "seed-domestic-zone", name: "Domestic", countries: ["United States"] },
  });
  const existing = await db.shippingRate.findFirst({ where: { zoneId: zone.id, method: "Standard" } });
  if (!existing) {
    await db.shippingRate.createMany({
      data: [
        { zoneId: zone.id, method: "Standard", price: 1500, freeShippingThreshold: 50000, estimatedDaysMin: 5, estimatedDaysMax: 9 },
        { zoneId: zone.id, method: "Express", price: 4500, estimatedDaysMin: 2, estimatedDaysMax: 3 },
      ],
    });
  }

  const intlZone = await db.shippingZone.upsert({
    where: { id: "seed-international-zone" },
    update: {},
    create: { id: "seed-international-zone", name: "International", countries: ["United Kingdom", "United Arab Emirates", "Pakistan", "Canada"] },
  });
  const existingIntl = await db.shippingRate.findFirst({ where: { zoneId: intlZone.id, method: "International Standard" } });
  if (!existingIntl) {
    await db.shippingRate.create({
      data: { zoneId: intlZone.id, method: "International Standard", price: 6500, estimatedDaysMin: 9, estimatedDaysMax: 16 },
    });
  }
}

async function seedBlog(admin: { id: string }) {
  console.log("→ Blog");
  const category = await db.blogCategory.upsert({
    where: { slug: "fabric-guide" },
    update: {},
    create: { name: "Fabric Guide", slug: "fabric-guide" },
  });

  const posts = [
    { title: "How to Care for Hand-Embroidered Silk", slug: "how-to-care-for-hand-embroidered-silk" },
    { title: "A Guide to Choosing Your Bridal Fabric", slug: "a-guide-to-choosing-your-bridal-fabric" },
    { title: "Inside the Atelier: Our Embroidery Process", slug: "inside-the-atelier-our-embroidery-process" },
  ];

  for (const p of posts) {
    await db.blogPost.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        excerpt: "A closer look at the craftsmanship behind every AELIA piece.",
        content:
          "Every AELIA garment begins as a hand-drawn pattern before it ever touches fabric. In this piece, we walk through " +
          "the techniques our artisans use to preserve delicate embroidery, choose the right cut for your body, and understand " +
          "what separates a couture finish from a factory one.",
        coverImageUrl: IMG(p.slug, 1600, 900),
        authorId: admin.id,
        categoryId: category.id,
        status: "PUBLISHED",
        publishedAt: new Date(),
        tags: ["craftsmanship", "fabric"],
      },
    });
  }
}

async function seedLookbook(products: Awaited<ReturnType<typeof seedProducts>>) {
  console.log("→ Lookbook");
  const lookbook = await db.lookbook.upsert({
    where: { slug: "autumn-2026" },
    update: {},
    create: {
      title: "Autumn 2026",
      slug: "autumn-2026",
      description: "Editorial imagery from the Autumn Edit campaign.",
      coverImageUrl: IMG("lookbook-cover", 1600, 2000),
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  for (let i = 0; i < 6; i++) {
    const existing = await db.lookbookImage.findFirst({ where: { lookbookId: lookbook.id, sortOrder: i } });
    if (existing) continue;
    const image = await db.lookbookImage.create({
      data: { lookbookId: lookbook.id, imageUrl: IMG(`lookbook-${i}`, 1400, 1750), sortOrder: i },
    });
    await db.lookbookImageProduct.create({
      data: { lookbookImageId: image.id, productId: products[i % products.length].id, xPosition: 0.5, yPosition: 0.6 },
    });
  }
}

async function main() {
  const roleIds = await seedRolesAndPermissions();
  const { admin, customers } = await seedUsers(roleIds);
  const categories = await seedCategories();
  const collections = await seedCollections();
  const products = await seedProducts(categories, collections);
  await seedReviews(products, customers);
  await seedCoupons();
  await seedOrders(products, customers);
  await seedHomepageSections();
  await seedShipping();
  await seedBlog(admin);
  await seedLookbook(products);

  console.log("\n✔ Seed complete.");
  console.log(`  Admin login: ${process.env.ADMIN_EMAIL ?? "admin@aelia.dev"} / ${process.env.ADMIN_PASSWORD ?? "ChangeMe123!"}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
