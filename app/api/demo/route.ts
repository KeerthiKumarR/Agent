import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { action, payload } = await req.json();

    switch (action) {
      case "RESET_ALL": {
        await db.resetStore();
        await db.addAuditLog({
          type: "EVENT",
          title: "Demo Environment Reset",
          detail:
            "Demo database and memory state reset to initial Velocity Sports benchmark state.",
          agent: "ORCHESTRATOR",
        });
        return NextResponse.json({
          success: true,
          message: "Store reset to initial state",
        });
      }

      case "SIMULATE_ABANDONMENT": {
        const cart = await db.getActiveCart();
        if (cart.items.length === 0) {
          // Add default shoe if cart empty
          await db.addToCart(cart.id, "shoe_001", 1);
        }
        await db.updateCartStatus(
          cart.id,
          "ABANDONED",
          payload?.inactivityMinutes || 75,
        );
        await db.addAuditLog({
          type: "EVENT",
          title: "Cart Abandonment Simulated",
          detail: `Customer session timed out after ${payload?.inactivityMinutes || 75}m of inactivity. Cart marked ABANDONED.`,
          agent: "ORCHESTRATOR",
          payload: {
            cartId: cart.id,
            inactivityMinutes: payload?.inactivityMinutes || 75,
          },
        });
        return NextResponse.json({ success: true, cart });
      }

      case "SIMULATE_RESTORE_CART": {
        const cartId = payload?.cartId || "cart_abandoned_01";
        await db.updateCartStatus(cartId, "RESTORED");
        await db.addAuditLog({
          type: "EVENT",
          title: "Customer Returned via WhatsApp CTA",
          detail: `Customer clicked "View My Cart" from recovery campaign. Cart ${cartId} restored.`,
          agent: "ORCHESTRATOR",
          payload: { cartId },
        });
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: "Unknown demo simulation action" },
          { status: 400 },
        );
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
