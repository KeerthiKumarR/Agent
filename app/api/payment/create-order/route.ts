import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay/orders";

export async function POST(req: NextRequest) {
  try {
    const {
      cartId,
      amount,
      simulateFailure = false,
      notes = {},
    } = await req.json();
    if (!cartId || !amount) {
      return NextResponse.json(
        { error: "cartId and amount are required" },
        { status: 400 },
      );
    }

    const orderResult = await createRazorpayOrder({
      cartId,
      amount,
      currency: "INR",
      notes,
      simulateFailure,
    });

    return NextResponse.json(orderResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
