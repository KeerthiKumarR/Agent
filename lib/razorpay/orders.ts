import Razorpay from 'razorpay';
import { db } from '../db';
import { policyEngine } from '../agents/policyEngine';

export interface CreateOrderParams {
  cartId: string;
  amount: number;
  currency?: string;
  notes?: Record<string, string>;
  simulateFailure?: boolean;
}

export interface OrderCreationResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  isMock: boolean;
  status: 'CREATED' | 'FAILED';
  error?: string;
}

export async function createRazorpayOrder({
  cartId,
  amount,
  currency = 'INR',
  notes = {},
  simulateFailure = false
}: CreateOrderParams): Promise<OrderCreationResult> {
  const cart = await db.getCartById(cartId);
  if (!cart) throw new Error("Cart not found");

  // Run Policy Check on payment creation
  const policyCheck = await policyEngine.evaluate({
    actionType: 'INITIATE_PAYMENT',
    cart,
    paymentAmount: amount
  });

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_demo12345678';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'demo_secret_key_abcdef';

  const isRealRazorpay = keyId.startsWith('rzp_test_') && keyId !== 'rzp_test_demo12345678' && keySecret !== 'demo_secret_key_abcdef';

  if (simulateFailure) {
    await db.addAuditLog({
      type: 'FAILURE',
      title: 'Payment Initialization Failed (Simulation)',
      detail: `Simulated payment failure triggered for order total ₹${amount.toLocaleString('en-IN')}. Cart preserved.`,
      agent: 'POLICY_ENGINE',
      payload: { cartId, amount, reason: 'Payment authorization simulated error' }
    });

    return {
      orderId: `order_fail_${Date.now()}`,
      amount: amount * 100,
      currency,
      keyId,
      isMock: true,
      status: 'FAILED',
      error: 'Simulated payment failure: payment processor declined test card.'
    };
  }

  try {
    let razorpayOrderId = `order_cp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    if (isRealRazorpay) {
      const instance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });

      const rzpOrder = await instance.orders.create({
        amount: Math.round(amount * 100), // amount in paise
        currency,
        receipt: `rcpt_${Date.now()}`,
        notes: {
          cartId,
          store: 'Velocity Sports',
          ...notes
        }
      });
      razorpayOrderId = rzpOrder.id;
    }

    // Log to Audit Trail
    await db.addAuditLog({
      type: 'ACTION',
      title: 'Razorpay Order Created',
      detail: `Razorpay Test Mode Order ID: ${razorpayOrderId} generated for ₹${amount.toLocaleString('en-IN')}.`,
      agent: 'ORCHESTRATOR',
      payload: {
        orderId: razorpayOrderId,
        amount,
        currency,
        cartId,
        itemsCount: cart.items.length,
        isRealGateway: isRealRazorpay
      }
    });

    return {
      orderId: razorpayOrderId,
      amount: Math.round(amount * 100),
      currency,
      keyId,
      isMock: !isRealRazorpay,
      status: 'CREATED'
    };
  } catch (error: any) {
    await db.addAuditLog({
      type: 'FAILURE',
      title: 'Razorpay Order Creation Failed',
      detail: `Failed to create order: ${error?.message || 'Gateway communication timeout'}.`,
      agent: 'ORCHESTRATOR',
      payload: { error: error?.message, amount }
    });

    throw error;
  }
}
