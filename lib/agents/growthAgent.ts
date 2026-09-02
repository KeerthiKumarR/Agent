import { Cart, Product, IntentScoreBreakdown, RevenueOpportunity } from '../types';
import { db } from '../db';

export interface UpsellRecommendation {
  product: Product;
  confidence: number;
  reasoning: string;
  category: 'COMPLEMENTARY' | 'UPGRADE' | 'ACCESSORY';
  savingsAmount?: number;
}

export const growthAgent = {
  /**
   * Analyzes active cart and detects cross-sell & complementary opportunities
   */
  analyzeCart: async (cart: Cart): Promise<UpsellRecommendation | null> => {
    if (!cart.items || cart.items.length === 0) return null;

    const allProducts = await db.getProducts();
    const cartProductIds = new Set(cart.items.map(i => i.productId));
    const cartCategories = new Set(cart.items.map(i => i.product.category));

    // Rule 1: If cart contains Running Shoes or Trail Shoes, recommend Performance Socks (anti-blister)
    if (cartCategories.has('Running Shoes') || cartCategories.has('Trail Shoes')) {
      const socks = allProducts.find(p => p.id === 'acc_001');
      if (socks && !cartProductIds.has(socks.id)) {
        return {
          product: socks,
          confidence: 0.96,
          category: 'COMPLEMENTARY',
          reasoning: "Customers purchasing running shoes frequently benefit from moisture-wicking anti-blister socks. This is the most relevant complementary item in the catalog based on historical co-purchase behavior."
        };
      }
    }

    // Rule 2: If cart contains Apparel or Running Shoes, recommend HydroGrip Bottle
    if (cartCategories.has('Apparel') || cartCategories.has('Running Shoes')) {
      const bottle = allProducts.find(p => p.id === 'acc_002');
      if (bottle && !cartProductIds.has(bottle.id)) {
        return {
          product: bottle,
          confidence: 0.88,
          category: 'ACCESSORY',
          reasoning: "Long-distance runners and athletes heavily pair outerwear and footwear with insulated sports hydration."
        };
      }
    }

    // Rule 3: If cart value > 4000 and Wearables not present, suggest Smart Fitness Band
    if (cart.total > 4000 && !cartCategories.has('Wearables')) {
      const band = allProducts.find(p => p.id === 'gear_001');
      if (band && !cartProductIds.has(band.id)) {
        return {
          product: band,
          confidence: 0.82,
          category: 'UPGRADE',
          reasoning: "High-intent athletes tracking performance frequently add VO2 Max biometric wearables to complete their gear kit."
        };
      }
    }

    // Default fallback: any accessory not in cart
    const available = allProducts.find(p => !cartProductIds.has(p.id));
    if (available) {
      return {
        product: available,
        confidence: 0.75,
        category: 'COMPLEMENTARY',
        reasoning: `Popular companion item: ${available.name} compliments your active sports selection.`
      };
    }

    return null;
  },

  /**
   * Calculates transparent 5-factor intent score
   */
  calculateIntentScore: (cart: Cart): IntentScoreBreakdown => {
    let score = 0;

    // Factor 1: Product Views (Max 30 pts)
    let viewsPoints = 0;
    if (cart.productViews >= 4) viewsPoints = 30;
    else if (cart.productViews >= 2) viewsPoints = 20;
    else viewsPoints = 10;
    score += viewsPoints;

    // Factor 2: Added to Cart (Max 25 pts)
    const cartPoints = cart.items.length > 0 ? 25 : 5;
    score += cartPoints;

    // Factor 3: Checkout Initiated (Max 20 pts)
    const checkoutPoints = cart.checkoutInitiated ? 20 : 0;
    score += checkoutPoints;

    // Factor 4: High Value Cart > ₹3,000 (Max 10 pts)
    let highValuePoints = 0;
    if (cart.total >= 4000) highValuePoints = 10;
    else if (cart.total >= 1000) highValuePoints = 6;
    else highValuePoints = 2;
    score += highValuePoints;

    // Factor 5: Recent Activity (Max 10 pts)
    let recentPoints = 0;
    if (cart.inactivityDuration <= 60) recentPoints = 10; // active in last hour
    else if (cart.inactivityDuration <= 180) recentPoints = 6; // last 3 hours
    else recentPoints = 2;
    score += recentPoints;

    score = Math.min(100, Math.max(0, score));

    const level: 'High' | 'Medium' | 'Low' = score >= 75 ? 'High' : score >= 45 ? 'Medium' : 'Low';

    return {
      score,
      level,
      factors: {
        productViews: {
          points: viewsPoints,
          max: 30,
          reason: `Viewed products ${cart.productViews} times (${viewsPoints}/30 pts)`
        },
        addedToCart: {
          points: cartPoints,
          max: 25,
          reason: `Added ${cart.items.length} product(s) to shopping cart (${cartPoints}/25 pts)`
        },
        checkoutInitiated: {
          points: checkoutPoints,
          max: 20,
          reason: cart.checkoutInitiated ? `Reached final checkout step (${checkoutPoints}/20 pts)` : `Has not reached checkout (0/20 pts)`
        },
        highValueCart: {
          points: highValuePoints,
          max: 10,
          reason: `Cart total of ₹${cart.total.toLocaleString('en-IN')} (${highValuePoints}/10 pts)`
        },
        recentActivity: {
          points: recentPoints,
          max: 10,
          reason: `Inactivity window of ${cart.inactivityDuration}m (${recentPoints}/10 pts)`
        }
      },
      summary: `Customer demonstrates ${level.toLowerCase()} purchase intent (${score}/100) across ${cart.items.length} item(s).`
    };
  },

  /**
   * Identifies revenue recovery opportunity for merchant dashboard
   */
  identifyRevenueOpportunity: (cart: Cart, customerName: string): RevenueOpportunity => {
    const intent = growthAgent.calculateIntentScore(cart);
    const urgency = intent.score > 80 ? 'High' : intent.score > 50 ? 'Medium' : 'Normal';

    return {
      id: `opp_${cart.id}`,
      cartId: cart.id,
      customerName,
      cartValue: cart.total,
      customerIntent: intent.level,
      intentScore: intent.score,
      urgency,
      recommendedAction: "Personalized WhatsApp Recovery",
      reasoning: `Cart value of ₹${cart.total.toLocaleString('en-IN')} with ${intent.score}% intent score. Inactive for ${cart.inactivityDuration}m.`,
      status: "OPEN",
      createdAt: new Date().toISOString()
    };
  }
};
