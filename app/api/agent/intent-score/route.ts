import { NextRequest, NextResponse } from 'next/server';
import { growthAgent } from '@/lib/agents/growthAgent';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { cartId } = await req.json();
    if (!cartId) {
      return NextResponse.json({ error: 'cartId is required' }, { status: 400 });
    }

    const cart = await db.getCartById(cartId);
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const scoreBreakdown = growthAgent.calculateIntentScore(cart);

    return NextResponse.json(scoreBreakdown);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
