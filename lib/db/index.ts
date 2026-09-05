import { prisma } from "../prisma";
import {
  Product,
  Merchant,
  Customer,
  Cart,
  CartItem,
  MerchantPolicy,
  RevenueOpportunity,
  CampaignMessage,
  AuditLogEntry,
  AgentActionRecord,
} from "../types";
import {
  INITIAL_MERCHANT,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_CARTS,
  INITIAL_OPPORTUNITIES,
  INITIAL_AUDIT_LOGS,
} from "./mockDb";

// Safe JSON parser helper
function safeJsonParse<T>(val: any, fallback: T): T {
  if (typeof val !== "string") return val || fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// ──────────────────────────────────────────
// Entity Mappers: Prisma -> Domain Types
// ──────────────────────────────────────────

export function mapPrismaProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    currency: p.currency || "INR",
    category: p.category,
    description: p.description,
    features: safeJsonParse(p.features, []),
    attributes: safeJsonParse(p.attributes, {}),
    image: p.image,
    stock: p.stock,
    tags: safeJsonParse(p.tags, []),
  };
}

export function mapPrismaCustomer(c: any): Customer {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    messagesSentThisWeek: c.messagesSentThisWeek,
    lastMessageAt: c.lastMessageAt
      ? new Date(c.lastMessageAt).toISOString()
      : null,
  };
}

export function mapPrismaCart(c: any): Cart {
  const items: CartItem[] = (c.items || []).map((item: any) => ({
    id: item.id,
    productId: item.productId,
    product: item.product ? mapPrismaProduct(item.product) : ({} as any),
    quantity: item.quantity,
    price: item.price,
    isUpsell: false,
  }));

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    id: c.id,
    customerId: c.customerId,
    customer: c.customer ? mapPrismaCustomer(c.customer) : undefined,
    items,
    status: c.status as any,
    inactivityDuration: c.inactivityDuration || 0,
    productViews: c.productViews || 1,
    timeSpentMinutes: c.timeSpentMinutes || 2.0,
    checkoutInitiated: c.checkoutInitiated || false,
    total,
    createdAt: new Date(c.createdAt).toISOString(),
    updatedAt: new Date(c.updatedAt).toISOString(),
  };
}

export function mapPrismaAuditLog(l: any): AuditLogEntry {
  return {
    id: l.id,
    type: l.type as any,
    title: l.title,
    detail: l.detail,
    agent: l.agent || undefined,
    payload: safeJsonParse(l.payload, undefined),
    timestamp: new Date(l.timestamp).toISOString(),
  };
}

export function mapPrismaOpportunity(o: any): RevenueOpportunity {
  return {
    id: o.id,
    cartId: o.cartId,
    customerName: o.customerName,
    cartValue: o.cartValue,
    customerIntent: o.customerIntent as any,
    intentScore: o.intentScore,
    urgency: o.urgency as any,
    recommendedAction: o.recommendedAction,
    reasoning: o.reasoning,
    status: o.status as any,
    createdAt: new Date(o.createdAt).toISOString(),
  };
}

// ──────────────────────────────────────────
// Database Abstraction Implementation (Prisma + Supabase)
// ──────────────────────────────────────────

export const db = {
  // ── Merchant & Policies ──────────────────
  getMerchant: async (): Promise<Merchant> => {
    try {
      const merchant = await prisma.merchant.findFirst({
        include: { policies: true },
      });

      if (!merchant) {
        return INITIAL_MERCHANT;
      }

      const policy = merchant.policies?.[0];
      return {
        id: merchant.id,
        name: merchant.name,
        slug: merchant.slug,
        capabilities: safeJsonParse(merchant.capabilities, []),
        policies: policy
          ? {
              id: policy.id,
              merchantId: policy.merchantId,
              maxWhatsAppPerWeek: policy.maxWhatsAppPerWeek,
              minCartValue: policy.minCartValue,
              minInactivityMinutes: policy.minInactivityMinutes,
              maxDiscountPercent: policy.maxDiscountPercent,
              maxCampaignBudget: policy.maxCampaignBudget,
              requirePaymentApproval: policy.requirePaymentApproval,
            }
          : INITIAL_MERCHANT.policies,
      };
    } catch (e) {
      console.warn("Prisma getMerchant error, using mock:", e);
      return INITIAL_MERCHANT;
    }
  },

  updatePolicies: async (
    newPolicies: Partial<MerchantPolicy>,
  ): Promise<MerchantPolicy> => {
    try {
      const merchant = await prisma.merchant.findFirst({
        include: { policies: true },
      });

      if (!merchant) throw new Error("Merchant not found");

      const existingPolicy = merchant.policies?.[0];

      if (existingPolicy) {
        const updated = await prisma.policy.update({
          where: { id: existingPolicy.id },
          data: {
            maxWhatsAppPerWeek: newPolicies.maxWhatsAppPerWeek,
            minCartValue: newPolicies.minCartValue,
            minInactivityMinutes: newPolicies.minInactivityMinutes,
            maxDiscountPercent: newPolicies.maxDiscountPercent,
            maxCampaignBudget: newPolicies.maxCampaignBudget,
            requirePaymentApproval: newPolicies.requirePaymentApproval,
          },
        });

        return {
          id: updated.id,
          merchantId: updated.merchantId,
          maxWhatsAppPerWeek: updated.maxWhatsAppPerWeek,
          minCartValue: updated.minCartValue,
          minInactivityMinutes: updated.minInactivityMinutes,
          maxDiscountPercent: updated.maxDiscountPercent,
          maxCampaignBudget: updated.maxCampaignBudget,
          requirePaymentApproval: updated.requirePaymentApproval,
        };
      } else {
        const created = await prisma.policy.create({
          data: {
            merchantId: merchant.id,
            maxWhatsAppPerWeek: newPolicies.maxWhatsAppPerWeek ?? 2,
            minCartValue: newPolicies.minCartValue ?? 500,
            minInactivityMinutes: newPolicies.minInactivityMinutes ?? 30,
            maxDiscountPercent: newPolicies.maxDiscountPercent ?? 10,
            maxCampaignBudget: newPolicies.maxCampaignBudget ?? 5000,
            requirePaymentApproval: newPolicies.requirePaymentApproval ?? true,
          },
        });

        return {
          id: created.id,
          merchantId: created.merchantId,
          maxWhatsAppPerWeek: created.maxWhatsAppPerWeek,
          minCartValue: created.minCartValue,
          minInactivityMinutes: created.minInactivityMinutes,
          maxDiscountPercent: created.maxDiscountPercent,
          maxCampaignBudget: created.maxCampaignBudget,
          requirePaymentApproval: created.requirePaymentApproval,
        };
      }
    } catch (e) {
      console.warn("Prisma updatePolicies fallback:", e);
      return { ...INITIAL_MERCHANT.policies!, ...newPolicies };
    }
  },

  // ── Products ─────────────────────────────
  getProducts: async (): Promise<Product[]> => {
    try {
      const products = await prisma.product.findMany();
      if (products.length > 0) {
        return products.map(mapPrismaProduct);
      }
      return INITIAL_PRODUCTS;
    } catch (e) {
      console.warn("Prisma getProducts fallback:", e);
      return INITIAL_PRODUCTS;
    }
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    try {
      const product = await prisma.product.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
        },
      });
      if (product) return mapPrismaProduct(product);
      return INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id);
    } catch (e) {
      console.warn("Prisma getProductById fallback:", e);
      return INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id);
    }
  },

  // ── Customers ────────────────────────────
  getCustomer: async (id: string): Promise<Customer | undefined> => {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id },
      });
      if (customer) return mapPrismaCustomer(customer);
      return INITIAL_CUSTOMERS.find((c) => c.id === id);
    } catch (e) {
      console.warn("Prisma getCustomer fallback:", e);
      return INITIAL_CUSTOMERS.find((c) => c.id === id);
    }
  },

  // ── Carts ────────────────────────────────
  getCarts: async (status?: string): Promise<Cart[]> => {
    try {
      const carts = await prisma.cart.findMany({
        where: status ? { status } : undefined,
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      if (carts.length > 0) {
        return carts.map(mapPrismaCart);
      }
      return INITIAL_CARTS;
    } catch (e) {
      console.warn("Prisma getCarts fallback:", e);
      return INITIAL_CARTS;
    }
  },

  getCartById: async (id: string): Promise<Cart | undefined> => {
    try {
      const cart = await prisma.cart.findUnique({
        where: { id },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      if (cart) return mapPrismaCart(cart);
      return INITIAL_CARTS.find((c) => c.id === id);
    } catch (e) {
      console.warn("Prisma getCartById fallback:", e);
      return INITIAL_CARTS.find((c) => c.id === id);
    }
  },

  getActiveCart: async (): Promise<Cart> => {
    const activeUserCartId = "cart_active_user";
    try {
      let cart = await prisma.cart.findUnique({
        where: { id: activeUserCartId },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart) {
        // Ensure default customer exists
        const defaultCust = await prisma.customer.findFirst();
        const customerId = defaultCust ? defaultCust.id : "cust_demo_01";

        cart = await prisma.cart.create({
          data: {
            id: activeUserCartId,
            customerId,
            status: "ACTIVE",
            inactivityDuration: 0,
            productViews: 1,
            timeSpentMinutes: 1,
            checkoutInitiated: false,
          },
          include: {
            customer: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      }

      return mapPrismaCart(cart);
    } catch (e) {
      console.warn("Prisma getActiveCart fallback:", e);
      return {
        id: activeUserCartId,
        customerId: "cust_demo_01",
        customer: INITIAL_CUSTOMERS[0],
        items: [],
        status: "ACTIVE",
        inactivityDuration: 0,
        productViews: 1,
        timeSpentMinutes: 1,
        checkoutInitiated: false,
        total: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  addToCart: async (
    cartId: string,
    productId: string,
    quantity = 1,
    isUpsell = false,
  ): Promise<Cart> => {
    try {
      // 1. Ensure target cart exists
      let cart = await prisma.cart.findUnique({
        where: { id: cartId },
      });

      if (!cart) {
        const defaultCust = await prisma.customer.findFirst();
        const customerId = defaultCust ? defaultCust.id : "cust_demo_01";

        cart = await prisma.cart.create({
          data: {
            id: cartId,
            customerId,
            status: "ACTIVE",
          },
        });
      }

      // 2. Fetch product for price
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) throw new Error("Product not found");

      // 3. Upsert CartItem
      const existingItem = await prisma.cartItem.findFirst({
        where: { cartId, productId },
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + quantity,
          },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            id: `citem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            cartId,
            productId,
            quantity,
            price: product.price,
          },
        });
      }

      // 4. Update cart timestamp
      await prisma.cart.update({
        where: { id: cartId },
        data: { updatedAt: new Date() },
      });

      // 5. Return fresh cart
      const updatedCart = await db.getCartById(cartId);
      if (!updatedCart) throw new Error("Could not retrieve updated cart");
      return updatedCart;
    } catch (e) {
      console.warn("Prisma addToCart error:", e);
      throw e;
    }
  },

  removeFromCart: async (cartId: string, itemId: string): Promise<Cart> => {
    try {
      await prisma.cartItem.deleteMany({
        where: {
          cartId,
          OR: [{ id: itemId }, { productId: itemId }],
        },
      });

      await prisma.cart.update({
        where: { id: cartId },
        data: { updatedAt: new Date() },
      });

      const updatedCart = await db.getCartById(cartId);
      if (!updatedCart) throw new Error("Cart not found after removal");
      return updatedCart;
    } catch (e) {
      console.warn("Prisma removeFromCart error:", e);
      throw e;
    }
  },

  updateCartStatus: async (
    cartId: string,
    status: Cart["status"],
    inactivityMinutes?: number,
  ): Promise<Cart> => {
    try {
      await prisma.cart.update({
        where: { id: cartId },
        data: {
          status,
          ...(inactivityMinutes !== undefined
            ? { inactivityDuration: inactivityMinutes }
            : {}),
          updatedAt: new Date(),
        },
      });

      const updatedCart = await db.getCartById(cartId);
      if (!updatedCart) throw new Error("Cart not found");
      return updatedCart;
    } catch (e) {
      console.warn("Prisma updateCartStatus error:", e);
      throw e;
    }
  },

  clearCart: async (cartId: string): Promise<Cart> => {
    try {
      await prisma.cartItem.deleteMany({
        where: { cartId },
      });

      await prisma.cart.update({
        where: { id: cartId },
        data: {
          status: "ACTIVE",
          updatedAt: new Date(),
        },
      });

      const updatedCart = await db.getCartById(cartId);
      if (!updatedCart) throw new Error("Cart not found");
      return updatedCart;
    } catch (e) {
      console.warn("Prisma clearCart error:", e);
      throw e;
    }
  },

  // ── Opportunities ────────────────────────
  getOpportunities: async (): Promise<RevenueOpportunity[]> => {
    try {
      const opps = await prisma.revenueOpportunity.findMany({
        orderBy: { createdAt: "desc" },
      });

      if (opps.length > 0) {
        return opps.map(mapPrismaOpportunity);
      }
      return INITIAL_OPPORTUNITIES;
    } catch (e) {
      console.warn("Prisma getOpportunities fallback:", e);
      return INITIAL_OPPORTUNITIES;
    }
  },

  // ── Campaigns ────────────────────────────
  getCampaigns: async (): Promise<CampaignMessage[]> => {
    try {
      const campaigns = await prisma.campaign.findMany({
        include: {
          customer: true,
          cart: {
            include: {
              items: {
                include: { product: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const allProducts = await db.getProducts();

      return campaigns.map((camp) => {
        let product = allProducts[0];
        if (camp.recommendedProductId) {
          const matched = allProducts.find(
            (p) => p.id === camp.recommendedProductId,
          );
          if (matched) product = matched;
        } else if (camp.cart?.items?.[0]?.product) {
          product = mapPrismaProduct(camp.cart.items[0].product);
        }

        return {
          id: camp.id,
          customerId: camp.customerId,
          customerName: camp.customer?.name || "Customer",
          customerPhone: camp.customer?.phone || "",
          cartId: camp.cartId,
          product,
          message: camp.personalizedMessage,
          ctaText: "View My Cart",
          ctaUrl: `/checkout?cartId=${camp.cartId}&restored=true`,
          discountPercent: camp.discountPercent,
          deliveryStatus: camp.deliveryStatus as any,
          deliveryError: camp.deliveryError || undefined,
          clicked: camp.clicked,
          createdAt: new Date(camp.createdAt).toISOString(),
        };
      });
    } catch (e) {
      console.warn("Prisma getCampaigns fallback:", e);
      return [];
    }
  },

  saveCampaign: async (campaign: CampaignMessage): Promise<CampaignMessage> => {
    try {
      // 1. Create Campaign in Supabase
      const created = await prisma.campaign.create({
        data: {
          id: campaign.id,
          customerId: campaign.customerId,
          cartId: campaign.cartId,
          channel: "WHATSAPP",
          personalizedMessage: campaign.message,
          recommendedProductId: campaign.product?.id || null,
          discountPercent: campaign.discountPercent || 0,
          deliveryStatus: campaign.deliveryStatus || "SENT",
          deliveryError: campaign.deliveryError || null,
          clicked: campaign.clicked || false,
        },
      });

      // 2. Increment Customer messagesSentThisWeek
      try {
        await prisma.customer.update({
          where: { id: campaign.customerId },
          data: {
            messagesSentThisWeek: { increment: 1 },
            lastMessageAt: new Date(),
          },
        });
      } catch (err) {
        console.warn("Customer message count update skipped:", err);
      }

      return campaign;
    } catch (e) {
      console.warn("Prisma saveCampaign error:", e);
      return campaign;
    }
  },

  // ── Audit Logs ───────────────────────────
  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    try {
      const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: "desc" },
        take: 100,
      });

      if (logs.length > 0) {
        return logs.map(mapPrismaAuditLog);
      }
      return INITIAL_AUDIT_LOGS;
    } catch (e) {
      console.warn("Prisma getAuditLogs fallback:", e);
      return INITIAL_AUDIT_LOGS;
    }
  },

  addAuditLog: async (
    entry: Omit<AuditLogEntry, "id" | "timestamp">,
  ): Promise<AuditLogEntry> => {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const timestamp = new Date().toISOString();

    try {
      const created = await prisma.auditLog.create({
        data: {
          id,
          type: entry.type,
          title: entry.title,
          detail: entry.detail,
          agent: entry.agent || null,
          payload: entry.payload ? JSON.stringify(entry.payload) : null,
          timestamp: new Date(timestamp),
        },
      });

      return {
        id: created.id,
        type: created.type as any,
        title: created.title,
        detail: created.detail,
        agent: created.agent || undefined,
        payload: safeJsonParse(created.payload, undefined),
        timestamp: new Date(created.timestamp).toISOString(),
      };
    } catch (e) {
      console.warn("Prisma addAuditLog fallback:", e);
      return {
        id,
        timestamp,
        ...entry,
      };
    }
  },

  // ── Agent Actions ────────────────────────
  logAgentAction: async (
    action: Omit<AgentActionRecord, "id" | "timestamp">,
  ): Promise<AgentActionRecord> => {
    const id = `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const timestamp = new Date().toISOString();

    try {
      const created = await prisma.agentAction.create({
        data: {
          id,
          actionType: action.action,
          agent: action.agent,
          reason: action.reason,
          confidence: action.confidence,
          policyStatus: action.policyStatus,
          result: action.result,
          payload: action.payload ? JSON.stringify(action.payload) : null,
          createdAt: new Date(timestamp),
        },
      });

      return {
        id: created.id,
        actionId: created.id,
        agent: created.agent as any,
        action: created.actionType as any,
        reason: created.reason,
        confidence: created.confidence,
        policyStatus: created.policyStatus as any,
        result: created.result as any,
        payload: safeJsonParse(created.payload, undefined),
        timestamp: new Date(created.createdAt).toISOString(),
      };
    } catch (e) {
      console.warn("Prisma logAgentAction fallback:", e);
      return {
        id,
        timestamp,
        ...action,
      };
    }
  },

  // ── Reset ────────────────────────────────
  resetStore: async () => {
    try {
      // Re-seed benchmark data into Supabase
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

      // Seed Products
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

      // Seed Customers
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

      // Reset active cart
      await prisma.cartItem.deleteMany({
        where: { cartId: "cart_active_user" },
      });
      await prisma.cart.upsert({
        where: { id: "cart_active_user" },
        update: {
          status: "ACTIVE",
          inactivityDuration: 0,
          productViews: 1,
          timeSpentMinutes: 1,
          checkoutInitiated: false,
        },
        create: {
          id: "cart_active_user",
          customerId: "cust_demo_01",
          status: "ACTIVE",
          inactivityDuration: 0,
          productViews: 1,
          timeSpentMinutes: 1,
          checkoutInitiated: false,
        },
      });
    } catch (e) {
      console.warn("resetStore error:", e);
    }
  },
};
