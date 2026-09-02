import { NextRequest, NextResponse } from 'next/server';
import { policyEngine } from '@/lib/agents/policyEngine';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { actionType, cartId, proposedDiscount, paymentAmount } = await req.json();
    
    let cart = cartId ? await db.getCartById(cartId) : undefined;
    let customer = cart ? await db.getCustomer(cart.customerId) : undefined;

    const result = await policyEngine.evaluate({
      actionType: actionType || 'SEND_CAMPAIGN',
      cart,
      customer,
      proposedDiscount,
      paymentAmount
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
