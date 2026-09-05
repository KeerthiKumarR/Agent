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
          image: "https://cdn.iconscout.com/icon/free/png-256/free-bolt-1-432578.png",
          order_id: orderData.orderId,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  cartId: cart.id,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                setPaymentStatus("SUCCESS");
                setPaymentDetails({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                });
                confetti({ particleCount: 60, spread: 60 });
              } else {
                setPaymentStatus("FAILED");
                setErrorMessage(verifyData.message || "Payment verification failed");
              }
            } catch {
              setPaymentStatus("FAILED");
              setErrorMessage("Server error during verification");
            } finally {
              setIsProcessingPayment(false);
            }
          },
          prefill: {
            name: cart.customer?.name || "Rohan Sharma",
            email: cart.customer?.email || "rohan.sharma@example.com",
            contact: cart.customer?.phone || "+919876543210",
          },
          theme: {
            color: "#18181b",
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          setPaymentStatus("FAILED");
          setErrorMessage(
            response.error?.description || "Payment authorization declined",
          );
          setIsProcessingPayment(false);
        });
        rzp.open();
      } else {
        // Mock fallback verification
        const mockVerifyRes = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpayOrderId: orderData.orderId,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            cartId: cart.id,
          }),
        });

        const verifyData = await mockVerifyRes.json();
        if (verifyData.success) {
          setPaymentStatus("SUCCESS");
          setPaymentDetails({
            orderId: orderData.orderId,
            paymentId: `pay_test_${Date.now()}`,
          });
          confetti({ particleCount: 60, spread: 60 });
        } else {
          setPaymentStatus("FAILED");
          setErrorMessage(verifyData.message || "Payment verification failed");
        }
        setIsProcessingPayment(false);
      }
    } catch (e: any) {
      setPaymentStatus("FAILED");
      setErrorMessage(e?.message || "Transaction could not be processed");
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mx-auto" />
        <p className="text-xs text-zinc-400 font-mono">
          Loading checkout session...
        </p>
      </div>
    );
  }

  // SUCCESS STATE SCREEN
  if (paymentStatus === "SUCCESS") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-white">
            Payment Verified & Completed
          </h1>
          <p className="text-xs text-zinc-400">
            Razorpay test transaction settled successfully.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] text-left space-y-2.5 text-xs">
          <div className="flex justify-between py-1 border-b border-[#27272a]">
            <span className="text-zinc-400">Payment ID</span>
            <span className="font-mono text-white font-medium">
              {paymentDetails?.paymentId}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#27272a]">
            <span className="text-zinc-400">Razorpay Order ID</span>
            <span className="font-mono text-white font-medium">
              {paymentDetails?.orderId}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#27272a]">
            <span className="text-zinc-400">Total Paid</span>
            <span className="text-white font-semibold">
              ₹{cart?.total.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-zinc-400">Audit Status</span>
            <span className="text-emerald-400 font-mono font-medium">
              LOGGED & VERIFIED
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/audit"
            className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors"
          >
            Inspect Audit Trail →
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-[#18181b] border border-[#27272a] text-zinc-300 hover:text-white text-xs font-medium transition-colors"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272a]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Bounded Checkout & Payment
            </h1>
            {restoredParam && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold uppercase">
                Restored via Campaign CTA
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Every transaction is explainable and bounded. The AI agent never silently charges payment.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 bg-[#121214] px-3 py-1.5 rounded-lg border border-[#27272a]">
          <Lock className="w-3.5 h-3.5 text-zinc-400" />
          <span>Razorpay Test Mode</span>
        </div>
      </div>

      {/* FAILURE STATE ALERT BANNER */}
      {paymentStatus === "FAILED" && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/40 text-left space-y-2.5 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-white">
                Payment could not be completed.
              </h3>
              <p className="text-xs text-red-300 leading-relaxed">
                {errorMessage || "Payment authorization unsuccessful."}
              </p>
              <div className="text-xs text-zinc-400 pt-1 space-y-0.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Your cart has been safely preserved.
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                  No duplicate charge. Safe retry enabled.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => handleApproveAndPay(false)}
              disabled={isProcessingPayment}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Payment</span>
            </button>
            <Link
              href="/audit"
              className="text-xs text-zinc-400 hover:text-white underline"
            >
              View Failure Audit Log
            </Link>
          </div>
        </div>
      )}

      {/* TWO-COLUMN CHECKOUT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: AGENT DECISION SUMMARY (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Decision Summary Card */}
          <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-zinc-300">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Agent Decision Summary
                </h3>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold">
                CREATE_ORDER
              </span>
            </div>

            {/* Items Summary */}
            <div className="space-y-2.5">
              <div className="text-xs font-mono text-zinc-400 uppercase font-semibold">
                Items To Purchase:
              </div>
              <div className="space-y-1.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-white">
                        {item.product.name}
                      </span>
                      <span className="text-zinc-500 ml-2">
                        × {item.quantity}
                      </span>
                      {item.isUpsell && (
                        <span className="block text-[10px] text-zinc-400 font-mono">
                          Growth Agent Cross-Sell
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-white">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1 text-xs">
              <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                Autonomous Rationale:
              </div>
              <p className="text-zinc-400 leading-relaxed">
                &quot;The items were evaluated based on category relevance, customer intent scoring, and verified co-purchase behavior.&quot;
              </p>
            </div>

            {/* Agent Authority Checklist */}
            <div className="p-3.5 rounded-lg bg-[#18181b] border border-[#27272a] space-y-2">
              <div className="text-xs font-mono text-white uppercase font-semibold">
                Agent Authority Boundaries:
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Product recommendations allowed</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Order initialization permitted</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-200 bg-zinc-800/80 p-1.5 rounded border border-zinc-700">
                  <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>
                    Payment strictly requires explicit customer authorization
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PAYMENT ACTIONS (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-4">
            <h3 className="text-sm font-semibold text-white pb-3 border-b border-[#27272a]">
              Payment Authorization
            </h3>

            <div className="space-y-2.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Customer</span>
                <span className="text-white font-medium">
                  {cart?.customer?.name || "Rohan Sharma"} ({cart?.customer?.phone || "+91 98765 43210"})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Gateway</span>
                <span className="text-zinc-200 font-medium">
                  Razorpay Test Mode
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Total Payable</span>
                <span className="text-lg font-bold text-white">
                  ₹{cart?.total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Main CTA Button */}
            <button
              onClick={() => handleApproveAndPay(false)}
              disabled={isProcessingPayment || items.length === 0}
              className="w-full py-3 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Contacting Gateway...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Approve & Pay (Test Mode)</span>
                </>
              )}
            </button>

            {/* Failure Simulation Demo Button */}
            <div className="pt-2 border-t border-[#27272a]">
              <button
                onClick={() => handleApproveAndPay(true)}
                disabled={isProcessingPayment}
                className="w-full py-2 rounded-lg bg-[#18181b] hover:bg-zinc-800 border border-[#27272a] text-zinc-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" />
                <span>Simulate Payment Failure & Safe Retry</span>
              </button>
              <p className="text-[10px] text-zinc-500 text-center mt-1">
                Demonstrates safe failure handling with cart preservation guarantee.
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
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mx-auto" />
          <p className="text-xs text-zinc-400 font-mono">
            Loading checkout engine...
          </p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
