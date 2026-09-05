import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const merchant = await db.getMerchant();
    const carts = await db.getCarts();
    const opportunities = await db.getOpportunities();
    const auditLogs = await db.getAuditLogs();
    const campaigns = await db.getCampaigns();

    // Calculated Real Database Metrics
    const totalRevenue = carts
      .filter((c) => c.status === "CONVERTED")
      .reduce((sum, c) => sum + (c.total || c.items?.reduce((isum, item) => isum + item.price * item.quantity, 0) || 0), 0);
    const recoveredRevenue = totalRevenue;
    const abandonedCartsCount = carts.filter(
      (c) => c.status === "ABANDONED",
    ).length;
    const recoveredCount = carts.filter((c) => c.status === "CONVERTED" || c.status === "RESTORED").length;
    const totalCartsEvaluated = abandonedCartsCount + recoveredCount;
    const recoveryRate = totalCartsEvaluated > 0
      ? Math.round((recoveredCount / totalCartsEvaluated) * 100 * 10) / 10
      : 0;
    const upsellRevenue = carts
      .filter((c) => (c.status === "CONVERTED" || c.status === "RESTORED") && c.items && c.items.length > 1)
      .reduce((sum, c) => sum + (c.items[c.items.length - 1]?.price || 0), 0);
    const agentActionsToday = auditLogs.filter(
      (l) => l.type === "ACTION" || l.type === "POLICY",
    ).length;

    return NextResponse.json({
      merchant,
      carts,
      metrics: {
        totalRevenue,
        recoveredRevenue,
        abandonedCartsCount,
        recoveryRate,
        upsellRevenue,
        agentActionsToday,
      },
      opportunities,
      recentActivity: auditLogs.slice(0, 15),
      campaigns,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { policies } = await req.json();
    if (!policies) {
      return NextResponse.json(
        { error: "policies object required" },
        { status: 400 },
      );
    }

    const updated = await db.updatePolicies(policies);
    await db.addAuditLog({
      type: "POLICY",
      title: "Merchant Policies Updated",
      detail: `Max msgs/wk: ${updated.maxWhatsAppPerWeek}, Min Cart: ₹${updated.minCartValue}, Max Discount: ${updated.maxDiscountPercent}%`,
      agent: "POLICY_ENGINE",
      payload: updated,
    });

    return NextResponse.json({ policies: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
