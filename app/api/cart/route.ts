import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { growthAgent } from "@/lib/agents/growthAgent";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cartId = searchParams.get("cartId");

    let cart;
    if (cartId) {
      cart = await db.getCartById(cartId);
    }
    if (!cart) {
      cart = await db.getActiveCart();
    }

    const upsell = await growthAgent.analyzeCart(cart);

    return NextResponse.json({
      cart,
      upsell,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      productId,
      quantity = 1,
      isUpsell = false,
      cartId,
    } = await req.json();
    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }

    const activeCart = cartId
      ? await db.getCartById(cartId)
      : await db.getActiveCart();
    const targetCartId = activeCart?.id || "cart_active_user";

    const updatedCart = await db.addToCart(
      targetCartId,
      productId,
      quantity,
      isUpsell,
    );

    // Add Audit Log
    const product = await db.getProductById(productId);
    await db.addAuditLog({
      type: isUpsell ? "ACTION" : "EVENT",
      title: isUpsell ? "Growth Upsell Added to Cart" : "Item Added to Cart",
      detail: `${isUpsell ? "AI Recommended Upsell" : "Customer added"} ${product?.name} (₹${product?.price.toLocaleString("en-IN")})`,
      agent: isUpsell ? "GROWTH_AGENT" : "COMMERCE_AGENT",
      payload: {
        productId,
        price: product?.price,
        quantity,
        isUpsell,
        newTotal: updatedCart.total,
      },
    });

    const upsell = await growthAgent.analyzeCart(updatedCart);

    return NextResponse.json({
      cart: updatedCart,
      upsell,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { itemId, cartId } = await req.json();
    const targetCartId = cartId || (await db.getActiveCart()).id;

    const updatedCart = await db.removeFromCart(targetCartId, itemId);
    const upsell = await growthAgent.analyzeCart(updatedCart);

    return NextResponse.json({
      cart: updatedCart,
      upsell,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
