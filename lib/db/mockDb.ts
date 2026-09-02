import { Product, Merchant, Customer, Cart, MerchantPolicy, RevenueOpportunity, CampaignMessage, AuditLogEntry, AgentActionRecord } from '../types';

export const INITIAL_MERCHANT: Merchant = {
  id: "merch_velocity_01",
  name: "Velocity Sports",
  slug: "velocity-sports",
  capabilities: [
    "product_search",
    "conversational_discovery",
    "cart_creation",
    "growth_upsell",
    "abandoned_cart_recovery",
    "order_creation",
    "razorpay_payment",
    "policy_enforcement",
    "audit_trail"
  ],
  policies: {
    maxWhatsAppPerWeek: 2,
    minCartValue: 500,
    minInactivityMinutes: 30,
    maxDiscountPercent: 10,
    maxCampaignBudget: 5000,
    requirePaymentApproval: true
  }
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "shoe_001",
    name: "AeroRun Waterproof Shoes",
    slug: "aerorun-waterproof",
    price: 4999,
    currency: "INR",
    category: "Running Shoes",
    description: "Engineered with HydroShield dual-membrane waterproofing and responsive nitrogen-infused foam for ultra-cushioned marathon and trail running in all weather conditions.",
    features: [
      "100% HydroShield waterproof breathable membrane",
      "Nitrogen-infused ultra-cushion EVA midsole",
      "Dynamic all-terrain high-traction grip rubber sole",
      "Reflective 3M detailing for low-light night running",
      "Ergonomic heel lock collar"
    ],
    attributes: {
      waterproof: true,
      usage: ["running", "trail", "outdoor", "marathon"],
      sizes: [7, 8, 9, 10, 11],
      material: "Ripstop Mesh + HydroShield Membrane",
      weight: "285g per shoe"
    },
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    stock: 18,
    tags: ["shoes", "running", "waterproof", "trail", "aerorun", "footwear", "sports"]
  },
  {
    id: "shoe_002",
    name: "AeroRun Trail Pro",
    slug: "aerorun-trail-pro",
    price: 5799,
    currency: "INR",
    category: "Trail Shoes",
    description: "Rugged high-performance trail running shoes featuring deep multi-directional 5mm lugs, reinforced toe cap protection, and weather-resistant breathable upper.",
    features: [
      "Deep 5mm multi-directional aggressive traction lugs",
      "Carbon-infused rock protection propulsion plate",
      "Gore-Tex all-weather water-resistant upper",
      "Speed-lacing system with hidden lace pocket"
    ],
    attributes: {
      waterproof: true,
      usage: ["trail", "hiking", "ultra-running", "mountain"],
      sizes: [8, 9, 10, 11],
      material: "Vibram MegaGrip + Synthetic Mesh",
      weight: "310g per shoe"
    },
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80",
    stock: 12,
    tags: ["shoes", "trail", "pro", "outdoor", "waterproof", "hiking"]
  },
  {
    id: "acc_001",
    name: "Velocity Performance Socks (3-Pack)",
    slug: "velocity-performance-socks",
    price: 499,
    currency: "INR",
    category: "Accessories",
    description: "Technical anti-blister running socks with targeted arch compression, CoolMax moisture-wicking fibers, and seamless toe construction for frictionless runs.",
    features: [
      "CoolMax moisture-wicking antimicrobial fibers",
      "Targeted arch compression band prevents slippage",
      "Anatomical left/right foot precision fit",
      "Reinforced high-density heel & toe cushioning"
    ],
    attributes: {
      usage: ["running", "training", "daily"],
      sizes: [7, 8, 9, 10],
      material: "75% CoolMax, 20% Nylon, 5% Spandex"
    },
    image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80",
    stock: 45,
    tags: ["socks", "accessories", "running", "anti-blister", "upsell"]
  },
  {
    id: "acc_002",
    name: "HydroGrip Sports Water Bottle (750ml)",
    slug: "hydrogrip-sports-bottle",
    price: 699,
    currency: "INR",
    category: "Accessories",
    description: "Insulated food-grade stainless steel sports bottle with leakproof one-touch fast-flow spout and textured ergonomic silicone grip.",
    features: [
      "Double-wall vacuum insulation keeps cold 24h / hot 12h",
      "100% BPA-free food-grade 18/8 stainless steel",
      "One-click fast-flow sports lock spout",
      "Sweat-free powder-coated exterior"
    ],
    attributes: {
      capacity: "750ml",
      usage: ["running", "gym", "cycling", "outdoor"],
      material: "18/8 Pro Grade Stainless Steel"
    },
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
    stock: 30,
    tags: ["bottle", "hydration", "accessories", "gym", "running"]
  },
  {
    id: "app_001",
    name: "UltraBreeze Lightweight Running Jacket",
    slug: "ultrabreeze-running-jacket",
    price: 2499,
    currency: "INR",
    category: "Apparel",
    description: "Ultra-packable windbreaker and water-repellent jacket weighing only 120g with laser-cut underarm ventilation and packable zip pocket.",
    features: [
      "DWR water-repellent windproof micro-ripstop shell",
      "Laser-cut underarm airflow cooling vents",
      "Self-packing into zippered chest pocket",
      "360-degree high-visibility reflective striping"
    ],
    attributes: {
      waterproof: false,
      waterRepellent: true,
      usage: ["running", "cycling", "monsoon", "travel"],
      sizes: ["S", "M", "L", "XL"],
      weight: "120g"
    },
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
    stock: 15,
    tags: ["jacket", "apparel", "running", "windbreaker", "lightweight"]
  },
  {
    id: "gear_001",
    name: "Apex Pulse Smart Fitness Band",
    slug: "apex-pulse-fitness-band",
    price: 3999,
    currency: "INR",
    category: "Wearables",
    description: "High-precision GPS fitness tracker with continuous VO2 Max, SpO2, HRV heart rate monitoring, 5ATM swim proofing, and 14-day battery life.",
    features: [
      "1.47-inch Curved AMOLED vibrant always-on display",
      "Continuous heart rate, SpO2 & VO2 Max tracking",
      "5ATM water resistance up to 50 meters",
      "14-day ultra-long battery life with fast magnetic charge"
    ],
    attributes: {
      waterproof: true,
      batteryLife: "14 days",
      usage: ["fitness", "running", "swimming", "health"],
      sensors: ["HR", "SpO2", "Accelerometer", "Barometer"]
    },
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=80",
    stock: 22,
    tags: ["wearables", "fitness", "smartwatch", "tracker", "heart-rate"]
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust_demo_01",
    name: "Rohan Sharma",
    email: "rohan.sharma@example.com",
    phone: "+91 98765 43210",
    messagesSentThisWeek: 1,
    lastMessageAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: "cust_demo_02",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+91 98123 45678",
    messagesSentThisWeek: 0,
    lastMessageAt: null
  },
  {
    id: "cust_demo_03",
    name: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    phone: "+91 97654 32109",
    messagesSentThisWeek: 2,
    lastMessageAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

export const INITIAL_CARTS: Cart[] = [
  {
    id: "cart_abandoned_01",
    customerId: "cust_demo_01",
    customer: INITIAL_CUSTOMERS[0],
    items: [
      {
        id: "citem_01",
        productId: "shoe_001",
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        price: 4999
      }
    ],
    status: "ABANDONED",
    inactivityDuration: 120, // 2 hours
    productViews: 4,
    timeSpentMinutes: 7.5,
    checkoutInitiated: true,
    total: 4999,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "cart_abandoned_02",
    customerId: "cust_demo_02",
    customer: INITIAL_CUSTOMERS[1],
    items: [
      {
        id: "citem_02",
        productId: "shoe_002",
        product: INITIAL_PRODUCTS[1],
        quantity: 1,
        price: 5799
      }
    ],
    status: "ABANDONED",
    inactivityDuration: 45, // 45 mins
    productViews: 5,
    timeSpentMinutes: 11.2,
    checkoutInitiated: true,
    total: 5799,
    createdAt: new Date(Date.now() - 60000 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 60000 * 45).toISOString()
  }
];

export const INITIAL_OPPORTUNITIES: RevenueOpportunity[] = [
  {
    id: "opp_01",
    cartId: "cart_abandoned_01",
    customerName: "Rohan Sharma",
    cartValue: 4999,
    customerIntent: "High",
    intentScore: 87,
    urgency: "High",
    recommendedAction: "Personalized WhatsApp Recovery",
    reasoning: "Customer viewed AeroRun Waterproof 4 times, spent 7.5 mins, reached checkout step, and has only received 1 message this week. Cart value is ₹4,999 with 87% intent score.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "opp_02",
    cartId: "cart_abandoned_02",
    customerName: "Priya Patel",
    cartValue: 5799,
    customerIntent: "High",
    intentScore: 92,
    urgency: "High",
    recommendedAction: "Personalized WhatsApp Recovery with Trail Bundle",
    reasoning: "High-value trail shoes cart inactive for 45 minutes. Customer spent 11 mins browsing with 0 messages sent this week. Policy fully satisfied.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 60000 * 30).toISOString()
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "audit_init_01",
    type: "EVENT",
    title: "Customer Added Product to Cart",
    detail: "Rohan Sharma added AeroRun Waterproof Shoes (₹4,999) to cart.",
    agent: "COMMERCE_AGENT",
    payload: { productId: "shoe_001", quantity: 1, price: 4999 },
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString()
  },
  {
    id: "audit_init_02",
    type: "ACTION",
    title: "Growth Upsell Recommended",
    detail: "Growth Agent analyzed cart category and identified Velocity Performance Socks as 96% co-purchase match.",
    agent: "GROWTH_AGENT",
    payload: { baseProduct: "shoe_001", upsellProduct: "acc_001", confidence: 0.96 },
    timestamp: new Date(Date.now() - 3600000 * 2.4).toISOString()
  },
  {
    id: "audit_init_03",
    type: "EVENT",
    title: "Cart Inactivity Detected",
    detail: "Cart cart_abandoned_01 has been inactive for 120 minutes.",
    agent: "ORCHESTRATOR",
    payload: { cartId: "cart_abandoned_01", inactivityMinutes: 120 },
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "audit_init_04",
    type: "REASONING",
    title: "Customer Intent Evaluated (87/100)",
    detail: "Intent score calculated based on 4 product views (+30), cart addition (+25), checkout initiation (+20), cart value (+10), and recency (+2). Outreach recommended.",
    agent: "GROWTH_AGENT",
    payload: { intentScore: 87, decision: "SEND_CAMPAIGN" },
    timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString()
  },
  {
    id: "audit_init_05",
    type: "POLICY",
    title: "Policy Engine Verification Passed",
    detail: "Checked communication frequency (1/2 this week), minimum cart value (₹4,999 >= ₹500), and inactivity threshold (120m >= 30m). Result: ALLOWED.",
    agent: "POLICY_ENGINE",
    payload: { status: "ALLOWED", maxMessages: 2, messagesSent: 1, minCart: 500, actualCart: 4999 },
    timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString()
  }
];
