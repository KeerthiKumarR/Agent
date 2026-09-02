import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/agent/catalog
 * Structured AI-readable product catalog with capabilities and semantic attributes.
 */
export async function GET() {
  try {
    const merchant = await db.getMerchant();
    const products = await db.getProducts();

    return NextResponse.json(
      {
        merchant: {
          id: merchant.id,
          name: merchant.name,
          slug: merchant.slug,
          capabilities: merchant.capabilities,
          protocol: "agentic-commerce/v1",
        },
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          currency: p.currency,
          category: p.category,
          description: p.description,
          features: p.features,
          attributes: p.attributes,
          stock: p.stock,
          tags: p.tags,
          image: p.image,
        })),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Agentic-Commerce-Version": "1.0.0",
        },
      },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
