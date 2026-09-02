import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaignAgent } from "@/lib/agents/campaignAgent";

export async function GET() {
  try {
    const campaigns = await db.getCampaigns();
    return NextResponse.json({ campaigns });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { cartId, simulateFailure = false } = await req.json();
    if (!cartId) {
      return NextResponse.json(
        { error: "cartId is required" },
        { status: 400 },
      );
    }

    const cart = await db.getCartById(cartId);
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const customer = (await db.getCustomer(cart.customerId)) || {
      id: cart.customerId,
      name: "Rohan Sharma",
      email: "rohan.sharma@example.com",
      phone: "+91 98765 43210",
      messagesSentThisWeek: 1,
      lastMessageAt: null,
    };

    const campaign = await campaignAgent.dispatchCampaign(
      cart,
      customer,
      simulateFailure,
    );

    return NextResponse.json({ campaign });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
