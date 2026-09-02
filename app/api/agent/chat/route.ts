import { NextRequest, NextResponse } from "next/server";
import { commerceAgent } from "@/lib/agents/commerceAgent";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Step 1: Analyze Intent
    const intent = commerceAgent.analyzeShoppingIntent(message);

    // Step 2: Search & Score Catalog
    const rankedMatches = await commerceAgent.searchCatalog(intent);

    // Step 3: Generate Explanation
    const explanation = await commerceAgent.explainRecommendation(
      intent,
      rankedMatches,
    );

    // Step 4: Audit Log
    await db.addAuditLog({
      type: "EVENT",
      title: "AI Commerce Assistant Queried",
      detail: `Buyer asked: "${message.length > 60 ? message.substring(0, 60) + "..." : message}". Identified intent: ${intent.intentSummary}`,
      agent: "COMMERCE_AGENT",
      payload: {
        query: message,
        intent,
        topMatch: rankedMatches[0]?.product.name,
        matchScore: rankedMatches[0]?.matchScore,
      },
    });

    return NextResponse.json({
      intent,
      explanation,
      recommendations: rankedMatches.slice(0, 3),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
