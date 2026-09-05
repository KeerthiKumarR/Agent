import { Cart, IntentScoreBreakdown } from "../types";

/**
 * Calculates transparent 5-factor intent score
 */
export function calculateIntentScore(cart: Cart): IntentScoreBreakdown {
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
  if (cart.inactivityDuration <= 60)
    recentPoints = 10; // active in last hour
  else if (cart.inactivityDuration <= 180)
    recentPoints = 6; // last 3 hours
  else recentPoints = 2;
  score += recentPoints;

  score = Math.min(100, Math.max(0, score));

  const level: "High" | "Medium" | "Low" =
    score >= 75 ? "High" : score >= 45 ? "Medium" : "Low";

  return {
    score,
    level,
    factors: {
      productViews: {
        points: viewsPoints,
        max: 30,
        reason: `Viewed products ${cart.productViews} times (${viewsPoints}/30 pts)`,
      },
      addedToCart: {
        points: cartPoints,
        max: 25,
        reason: `Added ${cart.items.length} product(s) to shopping cart (${cartPoints}/25 pts)`,
      },
      checkoutInitiated: {
        points: checkoutPoints,
        max: 20,
        reason: cart.checkoutInitiated
          ? `Reached final checkout step (${checkoutPoints}/20 pts)`
          : `Has not reached checkout (0/20 pts)`,
      },
      highValueCart: {
        points: highValuePoints,
        max: 10,
        reason: `Cart total of ₹${cart.total.toLocaleString("en-IN")} (${highValuePoints}/10 pts)`,
      },
      recentActivity: {
        points: recentPoints,
        max: 10,
        reason: `Inactivity window of ${cart.inactivityDuration}m (${recentPoints}/10 pts)`,
      },
    },
    summary: `Customer demonstrates ${level.toLowerCase()} purchase intent (${score}/100) across ${cart.items.length} item(s).`,
  };
}
