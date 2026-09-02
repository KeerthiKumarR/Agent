import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayPayment } from "@/lib/razorpay/verification";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      cartId,
      simulateFailure = false,
    } = await req.json();

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        { error: "razorpayOrderId and razorpayPaymentId are required" },
        { status: 400 },
      );
    }

    const verification = await verifyRazorpayPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      cartId,
      simulateFailure,
    });

    return NextResponse.json(verification);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
