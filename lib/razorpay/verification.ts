import crypto from "crypto";
import { db } from "../db";

export interface VerifyPaymentParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  cartId: string;
  simulateFailure?: boolean;
}

export interface VerificationResult {
  success: boolean;
  message: string;
  orderId: string;
  paymentId: string;
  cartPreserved?: boolean;
}

export async function verifyRazorpayPayment({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  cartId,
  simulateFailure = false,
}: VerifyPaymentParams): Promise<VerificationResult> {
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "demo_secret_key_abcdef";
  const isDemo =
    keySecret === "demo_secret_key_abcdef" ||
    razorpayOrderId.startsWith("order_cp_") ||
    !razorpaySignature;

  // Handle Failure Simulation
  if (simulateFailure) {
    await db.addAuditLog({
      type: "FAILURE",
      title: "Payment Authorization Unsuccessful (Simulated)",
      detail:
        "Payment authorization declined by issuer. Cart has been preserved with zero duplicate charge.",
      agent: "ORCHESTRATOR",
      payload: {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        recoveryStrategy: "Cart preserved in active state, safe retry enabled.",
      },
    });

    return {
      success: false,
      message:
        "Payment could not be completed. Your cart has been preserved and no charge was made.",
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      cartPreserved: true,
    };
  }

  // Signature verification for real Razorpay
  if (!isDemo && razorpaySignature) {
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      await db.addAuditLog({
        type: "FAILURE",
        title: "Payment Signature Mismatch",
        detail: "Razorpay HMAC signature verification failed.",
        agent: "POLICY_ENGINE",
        payload: { razorpayOrderId, razorpayPaymentId },
      });

      return {
        success: false,
        message: "Invalid payment signature. Verification failed.",
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        cartPreserved: true,
      };
    }
  }

  // Mark Cart as CONVERTED
  await db.updateCartStatus(cartId, "CONVERTED");

  // Add Successful Audit Log
  await db.addAuditLog({
    type: "SUCCESS",
    title: "Payment Verified & Order Completed",
    detail: `Order successfully settled via Razorpay (Payment ID: ${razorpayPaymentId}). Cart converted to paid order.`,
    agent: "ORCHESTRATOR",
    payload: {
      razorpayOrderId,
      razorpayPaymentId,
      cartId,
      status: "PAID",
    },
  });

  return {
    success: true,
    message: "Payment verified successfully! Thank you for your purchase.",
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
  };
}
