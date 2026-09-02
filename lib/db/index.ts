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
  AuditLogType,
  AgentName
} from '../types';
import { 
  INITIAL_MERCHANT, 
  INITIAL_PRODUCTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_CARTS, 
  INITIAL_OPPORTUNITIES, 
  INITIAL_AUDIT_LOGS 
} from './mockDb';

// Persistent in-process state store
class MemoryStore {
  public merchant: Merchant = JSON.parse(JSON.stringify(INITIAL_MERCHANT));
  public products: Product[] = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
  public customers: Customer[] = JSON.parse(JSON.stringify(INITIAL_CUSTOMERS));
  public carts: Cart[] = JSON.parse(JSON.stringify(INITIAL_CARTS));
  public opportunities: RevenueOpportunity[] = JSON.parse(JSON.stringify(INITIAL_OPPORTUNITIES));
  public campaigns: CampaignMessage[] = [];
  public auditLogs: AuditLogEntry[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
  public agentActions: AgentActionRecord[] = [];

  // Active user session cart
  public activeUserCartId: string = "cart_active_user";

  constructor() {
    this.initActiveCart();
  }

  private initActiveCart() {
    const existing = this.carts.find(c => c.id === this.activeUserCartId);
    if (!existing) {
      this.carts.push({
        id: this.activeUserCartId,
        customerId: "cust_demo_01",
        customer: this.customers[0],
        items: [],
        status: "ACTIVE",
        inactivityDuration: 0,
        productViews: 1,
        timeSpentMinutes: 1,
        checkoutInitiated: false,
        total: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  public reset() {
    this.merchant = JSON.parse(JSON.stringify(INITIAL_MERCHANT));
    this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    this.customers = JSON.parse(JSON.stringify(INITIAL_CUSTOMERS));
    this.carts = JSON.parse(JSON.stringify(INITIAL_CARTS));
    this.opportunities = JSON.parse(JSON.stringify(INITIAL_OPPORTUNITIES));
    this.campaigns = [];
    this.auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
    this.agentActions = [];
    this.initActiveCart();
  }
}

// Global singleton instance for Next.js API runtime
declare global {
  var __commercePilotStore: MemoryStore | undefined;
}

export const store = globalThis.__commercePilotStore || new MemoryStore();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__commercePilotStore = store;
}

// Database API helper functions
export const db = {
  // Merchant & Policies
  getMerchant: async (): Promise<Merchant> => {
    return store.merchant;
  },
  
  updatePolicies: async (newPolicies: Partial<MerchantPolicy>): Promise<MerchantPolicy> => {
    if (!store.merchant.policies) {
      store.merchant.policies = { ...INITIAL_MERCHANT.policies! };
    }
    store.merchant.policies = { ...store.merchant.policies, ...newPolicies };
    return store.merchant.policies;
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    return store.products;
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    return store.products.find(p => p.id === id || p.slug === id);
  },

  // Carts
  getCarts: async (): Promise<Cart[]> => {
    return store.carts;
  },

  getCartById: async (id: string): Promise<Cart | undefined> => {
    return store.carts.find(c => c.id === id);
  },

  getActiveCart: async (): Promise<Cart> => {
    let cart = store.carts.find(c => c.id === store.activeUserCartId);
    if (!cart) {
      cart = {
        id: store.activeUserCartId,
        customerId: "cust_demo_01",
        customer: store.customers[0],
        items: [],
        status: "ACTIVE",
        inactivityDuration: 0,
        productViews: 1,
        timeSpentMinutes: 1,
        checkoutInitiated: false,
        total: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.carts.push(cart);
    }
    return cart;
  },

  addToCart: async (cartId: string, productId: string, quantity = 1, isUpsell = false): Promise<Cart> => {
    let cart = store.carts.find(c => c.id === cartId);
    if (!cart) {
      cart = await db.getActiveCart();
    }

    const product = store.products.find(p => p.id === productId);
    if (!product) throw new Error("Product not found");

    const existingItem = cart.items.find(i => i.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        id: `citem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        productId,
        product,
        quantity,
        price: product.price,
        isUpsell
      });
    }

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.updatedAt = new Date().toISOString();
    return cart;
  },

  removeFromCart: async (cartId: string, itemId: string): Promise<Cart> => {
    const cart = store.carts.find(c => c.id === cartId);
    if (!cart) throw new Error("Cart not found");

    cart.items = cart.items.filter(i => i.id !== itemId && i.productId !== itemId);
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.updatedAt = new Date().toISOString();
    return cart;
  },

  updateCartStatus: async (cartId: string, status: Cart['status'], inactivityMinutes?: number): Promise<Cart> => {
    const cart = store.carts.find(c => c.id === cartId);
    if (!cart) throw new Error("Cart not found");

    cart.status = status;
    if (inactivityMinutes !== undefined) {
      cart.inactivityDuration = inactivityMinutes;
    }
    cart.updatedAt = new Date().toISOString();
    return cart;
  },

  clearCart: async (cartId: string): Promise<Cart> => {
    const cart = store.carts.find(c => c.id === cartId);
    if (!cart) throw new Error("Cart not found");

    cart.items = [];
    cart.total = 0;
    cart.status = "ACTIVE";
    cart.updatedAt = new Date().toISOString();
    return cart;
  },

  // Opportunities
  getOpportunities: async (): Promise<RevenueOpportunity[]> => {
    return store.opportunities;
  },

  // Campaigns
  getCampaigns: async (): Promise<CampaignMessage[]> => {
    return store.campaigns;
  },

  saveCampaign: async (campaign: CampaignMessage): Promise<CampaignMessage> => {
    store.campaigns.unshift(campaign);
    // Increment customer message count
    const customer = store.customers.find(c => c.id === campaign.customerId);
    if (customer) {
      customer.messagesSentThisWeek += 1;
      customer.lastMessageAt = new Date().toISOString();
    }
    return campaign;
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    return store.auditLogs;
  },

  addAuditLog: async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> => {
    const newEntry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    store.auditLogs.unshift(newEntry);
    return newEntry;
  },

  // Agent Actions
  logAgentAction: async (action: Omit<AgentActionRecord, 'id' | 'timestamp'>): Promise<AgentActionRecord> => {
    const record: AgentActionRecord = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      ...action
    };
    store.agentActions.unshift(record);
    return record;
  },

  // Customers
  getCustomer: async (id: string): Promise<Customer | undefined> => {
    return store.customers.find(c => c.id === id);
  },

  // Reset
  resetStore: async () => {
    store.reset();
  }
};
