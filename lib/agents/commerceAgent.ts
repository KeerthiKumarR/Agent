import { Product } from "../types";
import { db } from "../db";
import { generateAICompletion } from "../ai/llm";

export interface ShoppingIntent {
  rawQuery: string;
  category?: string;
  maxBudget?: number;
  minBudget?: number;
  features: string[];
  isWaterproofRequired?: boolean;
  intentSummary: string;
}

export interface RankedProductRecommendation {
  product: Product;
  matchScore: number; // 0 to 100
  whyRecommended: string;
  matchedFeatures: string[];
}

export const commerceAgent = {
  /**
   * Parses natural language shopping prompts (e.g. "I need waterproof running shoes under ₹6000")
   */
  analyzeShoppingIntent: (query: string): ShoppingIntent => {
    const q = query.toLowerCase();

    // Budget extraction (e.g. "under 6000", "under ₹6,000", "<6000", "below 5000")
    let maxBudget: number | undefined;
    const budgetMatch = q.match(
      /(?:under|below|<|less than|within|around)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i,
    );
    if (budgetMatch && budgetMatch[1]) {
      maxBudget = parseInt(budgetMatch[1].replace(/,/g, ""), 10);
    }

    // Waterproof requirement
    const isWaterproofRequired =
      q.includes("waterproof") ||
      q.includes("water-proof") ||
      q.includes("rain") ||
      q.includes("monsoon") ||
      q.includes("hydro");

    // Category detection
    let category: string | undefined;
    if (
      q.includes("shoe") ||
      q.includes("sneaker") ||
      q.includes("footwear") ||
      q.includes("running")
    ) {
      category = "Running Shoes";
    } else if (
      q.includes("trail") ||
      q.includes("hiking") ||
      q.includes("mountain")
    ) {
      category = "Trail Shoes";
    } else if (
      q.includes("jacket") ||
      q.includes("windbreaker") ||
      q.includes("apparel") ||
      q.includes("cloth")
    ) {
      category = "Apparel";
    } else if (
      q.includes("sock") ||
      q.includes("bottle") ||
      q.includes("accessory")
    ) {
      category = "Accessories";
    } else if (
      q.includes("watch") ||
      q.includes("band") ||
      q.includes("tracker") ||
      q.includes("fitness")
    ) {
      category = "Wearables";
    }

    // Features extracted
    const features: string[] = [];
    if (isWaterproofRequired) features.push("Waterproof");
    if (q.includes("cushion") || q.includes("comfort"))
      features.push("Cushioning");
    if (q.includes("trail") || q.includes("grip"))
      features.push("All-Terrain Grip");
    if (q.includes("marathon") || q.includes("long distance"))
      features.push("Long Distance");
    if (q.includes("lightweight") || q.includes("light"))
      features.push("Lightweight");
    if (q.includes("gps") || q.includes("heart") || q.includes("pulse"))
      features.push("Heart Rate/GPS");

    return {
      rawQuery: query,
      category,
      maxBudget,
      isWaterproofRequired,
      features,
      intentSummary: `Looking for ${category || "sports gear"}${isWaterproofRequired ? " with waterproof protection" : ""}${maxBudget ? ` within budget of ₹${maxBudget.toLocaleString("en-IN")}` : ""}.`,
    };
  },

  /**
   * Searches the structured AI catalog based on intent
   */
  searchCatalog: async (
    intent: ShoppingIntent,
  ): Promise<RankedProductRecommendation[]> => {
    const allProducts = await db.getProducts();

    const scored = allProducts.map((product) => {
      let score = 50; // Base score
      const matchedFeatures: string[] = [];
      const reasons: string[] = [];

      // Budget check
      if (intent.maxBudget) {
        if (product.price <= intent.maxBudget) {
          score += 25;
          reasons.push(
            `Priced at ₹${product.price.toLocaleString("en-IN")} (fits within your ₹${intent.maxBudget.toLocaleString("en-IN")} budget)`,
          );
        } else {
          score -= 30;
          reasons.push(
            `Slightly above specified budget at ₹${product.price.toLocaleString("en-IN")}`,
          );
        }
      }

      // Waterproof check
      if (intent.isWaterproofRequired) {
        if (product.attributes?.waterproof) {
          score += 25;
          matchedFeatures.push("HydroShield Waterproof");
          reasons.push("Features verified 100% waterproof membrane");
        } else {
          score -= 20;
        }
      }

      // Category / Usage check
      const productText =
        `${product.name} ${product.category} ${product.description} ${product.tags.join(" ")}`.toLowerCase();

      const keywords = intent.rawQuery
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3);
      let keywordHits = 0;
      keywords.forEach((kw) => {
        if (productText.includes(kw)) {
          keywordHits++;
        }
      });

      score += Math.min(25, keywordHits * 8);

      if (
        intent.category &&
        product.category.toLowerCase().includes(intent.category.toLowerCase())
      ) {
        score += 15;
      }

      // Cap match score between 15 and 99
      const normalizedScore = Math.min(99, Math.max(15, score));

      const whyRecommended =
        reasons.length > 0
          ? reasons.join(". ") + "."
          : `Matches your specifications for ${product.category.toLowerCase()} with high customer satisfaction.`;

      return {
        product: {
          ...product,
          aiMatchScore: normalizedScore,
          whyRecommended,
        },
        matchScore: normalizedScore,
        whyRecommended,
        matchedFeatures,
      };
    });

    // Sort descending by match score
    scored.sort((a, b) => b.matchScore - a.matchScore);

    return scored;
  },

  /**
   * Formats AI conversational explanation using real LLM if configured, or semantic engine fallback
   */
  explainRecommendation: async (
    intent: ShoppingIntent,
    topMatches: RankedProductRecommendation[],
  ): Promise<string> => {
    if (topMatches.length === 0) {
      return "I couldn't find any products strictly matching that criteria in Velocity Sports' catalog. Could you adjust your budget or requirements?";
    }

    const best = topMatches[0];

    // Attempt real LLM generation
    const systemPrompt = `You are CommercePilot AI Assistant for Velocity Sports. You help customers discover sports gear based on machine-readable catalog attributes. Respond concisely, enthusiastically, and explain why the top recommended product matches their exact criteria (budget, waterproofing, use-case). Mention price in INR (₹). Keep to 2-3 sentences.`;

    const userPrompt = `User request: "${intent.rawQuery}". Top match: "${best.product.name}" at ₹${best.product.price} (Match score: ${best.matchScore}%). Key features: ${best.product.features.join(", ")}. Attributes: ${JSON.stringify(best.product.attributes)}.`;

    const llmRes = await generateAICompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.6,
    });

    if (llmRes.text) {
      return llmRes.text;
    }

    // Semantic Fallback
    let explanation = `Based on your requirement`;
    if (intent.isWaterproofRequired)
      explanation += ` for waterproof protection`;
    if (intent.maxBudget)
      explanation += ` under ₹${intent.maxBudget.toLocaleString("en-IN")}`;

    explanation += `, I found ${topMatches.length} matching gear options in our catalog.`;
    explanation += `\n\nTop Recommendation: **${best.product.name}** (₹${best.product.price.toLocaleString("en-IN")}) with a **${best.matchScore}% Match Score**.\n${best.whyRecommended}`;

    return explanation;
  },
};
