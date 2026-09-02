import { NextRequest, NextResponse } from 'next/server';
import { agentOrchestrator } from '@/lib/agents/agentOrchestrator';

export async function POST(req: NextRequest) {
  try {
    const { cartId, simulateFailure = false } = await req.json();
    if (!cartId) {
      return NextResponse.json({ error: 'cartId is required' }, { status: 400 });
    }

    const result = await agentOrchestrator.runRecoveryWorkflow(cartId, simulateFailure);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
