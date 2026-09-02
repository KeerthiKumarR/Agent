"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sliders,
  X,
  Sparkles,
  ShoppingCart,
  RotateCcw,
  Send,
  CreditCard,
  AlertOctagon,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Zap,
  Play,
} from "lucide-react";

export default function DemoControlsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-demo-controls", handleOpen);
    return () => window.removeEventListener("open-demo-controls", handleOpen);
  }, []);

  const notify = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleReset = async () => {
    setLoadingAction("reset");
    try {
      await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_ALL" }),
      });
      notify("Demo store & audit trail reset to benchmark state!");
      router.refresh();
    } catch (e) {
      notify("Failed to reset store");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAddProduct = async () => {
    setLoadingAction("add_product");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "shoe_001", quantity: 1 }),
      });
      if (res.ok) {
        notify(
          "Added AeroRun Waterproof Shoes to cart! Growth Agent will detect upsell.",
        );
        router.push("/cart");
      }
    } catch (e) {
      notify("Failed to add product");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSimulateAbandonment = async () => {
    setLoadingAction("abandon");
    try {
      await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SIMULATE_ABANDONMENT",
          payload: { inactivityMinutes: 75 },
        }),
      });
      notify("Simulated 75 min cart abandonment! Navigate to Recovery Center.");
      router.push("/recovery");
    } catch (e) {
      notify("Failed to simulate abandonment");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRunAgentRecovery = async () => {
    setLoadingAction("recovery");
    try {
      const res = await fetch("/api/agent/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId: "cart_abandoned_01" }),
      });
      if (res.ok) {
        notify("6-Step Agent Loop executed: WhatsApp campaign dispatched!");
        router.push("/campaigns");
      }
    } catch (e) {
      notify("Failed to run agent recovery");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSimulatePaymentFailure = async () => {
    setLoadingAction("pay_fail");
    try {
      const createRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: "cart_abandoned_01",
          amount: 4999,
          simulateFailure: true,
        }),
      });
      notify(
        "Simulating payment decline on checkout page with cart preservation guarantee.",
      );
      router.push("/checkout?simulateFailure=true");
    } catch (e) {
      notify("Failed to trigger payment failure");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary via-accent-purple to-accent-cyan text-white text-xs font-bold shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all glow-border"
      >
        <Sliders className="w-4 h-4 animate-spin-slow" />
        <span>Demo Controls</span>
      </button>

      {/* Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full sm:max-w-xl bg-surface-elevated border border-border sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary-light">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Interactive Demo Controls
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold uppercase">
                      Presenter Ready
                    </span>
                  </h3>
                  <p className="text-xs text-text-muted">
                    Trigger live agent workflows, edge cases, and autonomous
                    commerce loops.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-surface-elevated"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification banner */}
            {feedbackMessage && (
              <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-2.5 flex items-center gap-2 text-xs font-medium text-emerald-300 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feedbackMessage}</span>
              </div>
            )}

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Flow Steps */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold font-mono uppercase text-text-muted tracking-wider">
                  1-Click Scenario Triggers
                </div>

                {/* Scenario 1: Conversational AI & Add to Cart */}
                <div className="p-3.5 rounded-xl bg-surface border border-border/80 hover:border-primary/50 transition-colors flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        1. Add AeroRun Shoes + Trigger Growth Upsell
                      </div>
                      <div className="text-[11px] text-text-muted">
                        Adds shoes to cart & activates Growth Agent to recommend
                        Performance Socks (96% match).
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleAddProduct}
                    disabled={loadingAction === "add_product"}
                    className="px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary text-primary-light hover:text-white text-xs font-semibold whitespace-nowrap transition-all border border-primary/30"
                  >
                    {loadingAction === "add_product" ? "Adding..." : "Run Step"}
                  </button>
                </div>

                {/* Scenario 2: Simulate Cart Abandonment */}
                <div className="p-3.5 rounded-xl bg-surface border border-border/80 hover:border-amber-500/50 transition-colors flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        2. Simulate Cart Abandonment
                      </div>
                      <div className="text-[11px] text-text-muted">
                        Simulates 75 mins inactivity, calculates 87% intent
                        score, and logs audit observation.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSimulateAbandonment}
                    disabled={loadingAction === "abandon"}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-600 text-amber-300 hover:text-white text-xs font-semibold whitespace-nowrap transition-all border border-amber-500/30"
                  >
                    {loadingAction === "abandon" ? "Simulating..." : "Abandon"}
                  </button>
                </div>

                {/* Scenario 3: Run 6-Step Agent Recovery */}
                <div className="p-3.5 rounded-xl bg-surface border border-border/80 hover:border-cyan-500/50 transition-colors flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 mt-0.5">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        3. Execute Autonomous Agent Recovery
                      </div>
                      <div className="text-[11px] text-text-muted">
                        Runs Observe → Reason → Policy Check → Act → Verify →
                        Learn loop & creates WhatsApp message.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleRunAgentRecovery}
                    disabled={loadingAction === "recovery"}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-600 text-cyan-300 hover:text-white text-xs font-semibold whitespace-nowrap transition-all border border-cyan-500/30"
                  >
                    {loadingAction === "recovery" ? "Executing..." : "Dispatch"}
                  </button>
                </div>

                {/* Scenario 4: Simulate Payment Failure & Safe Recovery */}
                <div className="p-3.5 rounded-xl bg-surface border border-border/80 hover:border-rose-500/50 transition-colors flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 mt-0.5">
                      <AlertOctagon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        4. Simulate Payment Failure & Safe Retry
                      </div>
                      <div className="text-[11px] text-text-muted">
                        Demonstrates safe failure handling: cart preserved, zero
                        double-charge, safe retry button.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSimulatePaymentFailure}
                    disabled={loadingAction === "pay_fail"}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold whitespace-nowrap transition-all border border-rose-500/30"
                  >
                    {loadingAction === "pay_fail"
                      ? "Loading..."
                      : "Simulate Fail"}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-surface flex items-center justify-between">
              <button
                onClick={handleReset}
                disabled={loadingAction === "reset"}
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-colors"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loadingAction === "reset" ? "animate-spin" : ""}`}
                />
                Reset Store to Benchmark State
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-surface-elevated text-xs font-semibold text-white hover:bg-border border border-border"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
