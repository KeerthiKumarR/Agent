import { PrismaClient } from "@prisma/client";
import {
  INITIAL_MERCHANT,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_CARTS,
  INITIAL_OPPORTUNITIES,
  INITIAL_AUDIT_LOGS,
} from "../lib/db/mockDb";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Supabase database with initial CommercePilot data...");

  // 1. Merchant & Policy
  const merchant = await prisma.merchant.upsert({
    where: { slug: INITIAL_MERCHANT.slug },
    update: {
      name: INITIAL_MERCHANT.name,
      capabilities: JSON.stringify(INITIAL_MERCHANT.capabilities),
    },
    create: {
      id: INITIAL_MERCHANT.id,
      name: INITIAL_MERCHANT.name,
      slug: INITIAL_MERCHANT.slug,
      capabilities: JSON.stringify(INITIAL_MERCHANT.capabilities),
    },
  });
  console.log(`✅ Merchant created: ${merchant.name} (${merchant.id})`);

  if (INITIAL_MERCHANT.policies) {
    const existingPolicy = await prisma.policy.findFirst({
      where: { merchantId: merchant.id },
    });
    if (!existingPolicy) {
      await prisma.policy.create({
        data: {
          merchantId: merchant.id,
          maxWhatsAppPerWeek: INITIAL_MERCHANT.policies.maxWhatsAppPerWeek,
          minCartValue: INITIAL_MERCHANT.policies.minCartValue,
          minInactivityMinutes: INITIAL_MERCHANT.policies.minInactivityMinutes,
          maxDiscountPercent: INITIAL_MERCHANT.policies.maxDiscountPercent,
          maxCampaignBudget: INITIAL_MERCHANT.policies.maxCampaignBudget,
          requirePaymentApproval:
            INITIAL_MERCHANT.policies.requirePaymentApproval,
        },
      });
      console.log("✅ Merchant policies created");
    }
  }

  // 2. Products
  for (const p of INITIAL_PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        price: p.price,
        currency: p.currency,
        category: p.category,
        description: p.description,
        features: JSON.stringify(p.features),
        attributes: JSON.stringify(p.attributes),
        image: p.image,
        stock: p.stock,
        tags: JSON.stringify(p.tags),
      },
      create: {
        id: p.id,
        merchantId: merchant.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        currency: p.currency,
        category: p.category,
        description: p.description,
        features: JSON.stringify(p.features),
        attributes: JSON.stringify(p.attributes),
        image: p.image,
        stock: p.stock,
        tags: JSON.stringify(p.tags),
      },
    });
  }
  console.log(`✅ ${INITIAL_PRODUCTS.length} Products seeded`);

  // 3. Customers
  for (const c of INITIAL_CUSTOMERS) {
    await prisma.customer.upsert({
      where: { email: c.email },
      update: {
        name: c.name,
        phone: c.phone,
        messagesSentThisWeek: c.messagesSentThisWeek,
        lastMessageAt: c.lastMessageAt ? new Date(c.lastMessageAt) : null,
      },
      create: {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        messagesSentThisWeek: c.messagesSentThisWeek,
        lastMessageAt: c.lastMessageAt ? new Date(c.lastMessageAt) : null,
      },
    });
  }
  console.log(`✅ ${INITIAL_CUSTOMERS.length} Customers seeded`);

  // 4. Sample Carts
  for (const cart of INITIAL_CARTS) {
    await prisma.cart.upsert({
      where: { id: cart.id },
      update: {
        status: cart.status,
        inactivityDuration: cart.inactivityDuration,
        productViews: cart.productViews,
        timeSpentMinutes: cart.timeSpentMinutes,
        checkoutInitiated: cart.checkoutInitiated,
      },
      create: {
        id: cart.id,
        customerId: cart.customerId,
        status: cart.status,
        inactivityDuration: cart.inactivityDuration,
        productViews: cart.productViews,
        timeSpentMinutes: cart.timeSpentMinutes,
        checkoutInitiated: cart.checkoutInitiated,
      },
    });

    for (const item of cart.items) {
      const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId: item.productId },
      });
      if (!existingItem) {
        await prisma.cartItem.create({
          data: {
            id: item.id,
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });
      }
    }
  }
  console.log(`✅ ${INITIAL_CARTS.length} Carts seeded`);

  console.log("🚀 Supabase database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
