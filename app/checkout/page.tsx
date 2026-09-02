"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Loader2,
  Lock,
  Zap,
  Sparkles,
} from "lucide-react";
import { Cart } from "@/lib/types";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cartIdParam = searchParams.get("cartId");
  const restoredParam = searchParams.get("restored");
  const simulateFailParam = searchParams.get("simulateFailure") === "true";

  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "IDLE" | "SUCCESS" | "FAILED"
  >("IDLE");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch cart
  const loadCart = async () => {
    try {
      const url = cartIdParam ? `/api/cart?cartId=${cartIdParam}` : "/api/cart";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleApproveAndPay = async (simulateDecline = false) => {
    if (!cart || cart.items.length === 0) return;
    setIsProcessingPayment(true);
    setErrorMessage(null);

    const shouldFail = simulateDecline || simulateFailParam;

    try {
      // Step 1: Create Order via Backend API
      const createRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cart.id,
          amount: cart.total,
          simulateFailure: shouldFail,
        }),
      });

      const orderData = await createRes.json();

      if (!createRes.ok || orderData.status === "FAILED" || shouldFail) {
        setPaymentStatus("FAILED");
        setErrorMessage(
          orderData.error ||
            "Payment authorization unsuccessful. Test card declined.",
        );
        setIsProcessingPayment(false);
        return;
      }

      // Step 2: Handle Razorpay Checkout Gateway
      const isRealRazorpay =
        !orderData.isMock && typeof (window as any).Razorpay !== "undefined";

      if (isRealRazorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Velocity Sports",
          description: "Autonomous Agentic Commerce Checkout",
          image:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=120&q=80",
          order_id: orderData.orderId,
          handler: async function (response: any) {
            await verifyPaymentSignature(response, orderData.orderId);
          },
          prefill: {
            name: "Rohan Sharma",
            email: "rohan.sharma@example.com",
            contact: "+919876543210",
          },
          theme: {
            color: "#6366F1",
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (resp: any) {
          setPaymentStatus("FAILED");
          setErrorMessage(
            resp.error?.description || "Payment failed at gateway.",
          );
          setIsProcessingPayment(false);
        });
        rzp.open();
      } else {
        // Safe Demo Gateway Simulation
        setTimeout(async () => {
          await verifyPaymentSignature(
            {
              razorpay_payment_id: `pay_mock_${Date.now()}`,
              razorpay_order_id: orderData.orderId,
              razorpay_signature: `sig_mock_${Date.now()}`,
            },
            orderData.orderId,
          );
        }, 1200);
      }
    } catch (err: any) {
      setPaymentStatus("FAILED");
      setErrorMessage(err.message || "Payment communication failed.");
      setIsProcessingPayment(false);
    }
  };

  const verifyPaymentSignature = async (response: any, orderId: string) => {
    try {
      const verifyRes = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayOrderId: response.razorpay_order_id || orderId,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          cartId: cart?.id,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        setPaymentStatus("SUCCESS");
        setPaymentDetails(verifyData);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        setPaymentStatus("FAILED");
        setErrorMessage(verifyData.message);
      }
    } catch (e) {
      setPaymentStatus("FAILED");
      setErrorMessage("Verification failed.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-xs text-text-muted font-mono">
          Initializing secure checkout decision engine...
        </p>
      </div>
    );
  }

  // SUCCESS STATE
  if (paymentStatus === "SUCCESS") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white">
            Payment Verified & Completed!
          </h1>
          <p className="text-sm text-text-secondary">
            Your Razorpay test-mode transaction was settled successfully.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-border text-left space-y-3 text-xs">
          <div className="flex justify-between py-1 border-b border-border">
            <span className="text-text-muted">Payment ID</span>
            <span className="font-mono text-white font-bold">
              {paymentDetails?.paymentId}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-border">
            <span className="text-text-muted">Razorpay Order ID</span>
            <span className="font-mono text-white">
              {paymentDetails?.orderId}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-border">
            <span className="text-text-muted">Total Paid</span>
            <span className="text-accent-cyan font-bold">
              ₹{cart?.total.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-text-muted">Audit Trail Status</span>
            <span className="text-emerald-400 font-mono font-bold">
              LOGGED & VERIFIED
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href="/audit"
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md"
          >
            Inspect Audit Trail →
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-xs font-semibold hover:bg-surface-elevated transition-all"
          >
            Merchant Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // MAIN CHECKOUT FORM & BOUNDED SUMMARY
  const items = cart?.items || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              Bounded Conversational Checkout
            </h1>
            {restoredParam && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                Restored via WhatsApp CTA
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1">
            Every transaction is explainable and bounded. The AI agent never
            silently charges payment.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <Lock className="w-3.5 h-3.5" />
          <span>Razorpay Test Mode Active</span>
        </div>
      </div>

      {/* FAILURE STATE ALERT BANNER (Scenario 4) */}
      {paymentStatus === "FAILED" && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-left space-y-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">
                Payment could not be completed.
              </h3>
              <p className="text-xs text-rose-200 leading-relaxed">
                {errorMessage || "Payment authorization unsuccessful."}
              </p>
              <div className="text-xs text-text-secondary pt-1 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Your cart has been safely preserved.
                </div>
                <div className="flex items-center gap-1.5 text-text-muted font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  No duplicate charge was made. Safe retry enabled.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => handleApproveAndPay(false)}
              disabled={isProcessingPayment}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Payment</span>
            </button>
            <Link
              href="/audit"
              className="text-xs text-text-muted hover:text-white underline"
            >
              View Failure Audit Log
            </Link>
          </div>
        </div>
      )}

      {/* TWO-COLUMN CHECKOUT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: AGENT DECISION SUMMARY (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Decision Summary Card */}
          <div className="p-6 rounded-2xl glass-panel-glow border border-primary/40 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-primary/20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary-light">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  Agent Decision Summary
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/30 text-accent-cyan font-bold uppercase">
                Action: CREATE_ORDER
              </span>
            </div>

            {/* Items Summary */}
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold text-text-muted uppercase">
                Items To Purchase:
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">
                        {item.product.name}
                      </span>
                      <span className="text-text-muted ml-2">
                        × {item.quantity}
                      </span>
                      {item.isUpsell && (
                        <span className="block text-[10px] text-accent-purple font-mono">
                          Growth Agent Cross-Sell
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-white">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs">
              <div className="font-bold text-primary-light flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Autonomous Recommendation Rationale:
              </div>
              <p className="text-text-secondary leading-relaxed">
                &quot;The additional items were recommended based on category
                relevance (Running Shoes → Moisture-wicking socks) and verified
                historical co-purchase behavior.&quot;
              </p>
            </div>

            {/* Agent Authority Checklist */}
            <div className="p-4 rounded-xl bg-surface/80 border border-border space-y-2.5">
              <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Agent Authority Boundaries:
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Product recommendations allowed</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Cart modifications allowed with customer interaction
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Order creation allowed</span>
                </div>
                <div className="flex items-center gap-2 text-rose-400 font-bold bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Payment strictly requires explicit customer approval
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PAYMENT ACTIONS (5 COLS) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-2xl glass-panel border border-border space-y-5">
            <h3 className="text-base font-bold text-white pb-3 border-b border-border">
              Payment Settlement
            </h3>

            <div className="space-y-3 text-xs text-text-secondary">
              <div className="flex justify-between">
                <span>Customer</span>
                <span className="text-white font-medium">
                  Rohan Sharma (+91 98765 43210)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Gateway</span>
                <span className="text-accent-cyan font-medium">
                  Razorpay Test Mode
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Payable</span>
                <span className="text-xl font-extrabold text-white">
                  ₹{cart?.total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Main CTA Button */}
            <button
              onClick={() => handleApproveAndPay(false)}
              disabled={isProcessingPayment || items.length === 0}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-accent-cyan hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Contacting Gateway...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Approve & Continue to Payment</span>
                </>
              )}
            </button>

            {/* Failure Simulation Demo Button */}
            <div className="pt-2 border-t border-border/60">
              <button
                onClick={() => handleApproveAndPay(true)}
                disabled={isProcessingPayment}
                className="w-full py-2.5 rounded-lg bg-surface hover:bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Simulate Payment Failure & Safe Retry</span>
              </button>
              <p className="text-[10px] text-text-muted text-center mt-1.5">
                Demonstrates safe failure handling with cart preservation
                guarantee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-xs text-text-muted font-mono">
            Loading checkout engine...
          </p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
