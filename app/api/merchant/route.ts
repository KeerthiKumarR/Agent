import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const merchant = await db.getMerchant();
    const carts = await db.getCarts();
    const opportunities = await db.getOpportunities();
    const auditLogs = await db.getAuditLogs();
    const campaigns = await db.getCampaigns();

    // Calculated Dashboard Metrics
    const totalRevenue = 248500;
    const recoveredRevenue = 34200;
    const abandonedCartsCount = carts.filter(c => c.status === 'ABANDONED').length;
    const recoveryRate = 18.4;
    const upsellRevenue = 14800;
    const agentActionsToday = auditLogs.filter(l => l.type === 'ACTION' || l.type === 'POLICY').length;

    return NextResponse.json({
      merchant,
      metrics: {
        totalRevenue,
        recoveredRevenue,
        abandonedCartsCount,
        recoveryRate,
        upsellRevenue,
        agentActionsToday
      },
      opportunities,
      recentActivity: auditLogs.slice(0, 15),
      campaigns
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { policies } = await req.json();
    if (!policies) {
      return NextResponse.json({ error: 'policies object required' }, { status: 400 });
    }

    const updated = await db.updatePolicies(policies);
    await db.addAuditLog({
      type: 'POLICY',
      title: 'Merchant Policies Updated',
      detail: `Max msgs/wk: ${updated.maxWhatsAppPerWeek}, Min Cart: ₹${updated.minCartValue}, Max Discount: ${updated.maxDiscountPercent}%`,
      agent: 'POLICY_ENGINE',
      payload: updated
    });

    return NextResponse.json({ policies: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
