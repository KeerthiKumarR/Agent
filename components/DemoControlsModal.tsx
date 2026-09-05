"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sliders,
  X,
  ShoppingCart,
  RotateCcw,
  Send,
  AlertOctagon,
  RefreshCw,
  CheckCircle2,
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
      notify("Demo store & audit trail reset to benchmark state.");
      router.refresh();
    } catch {
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
        notify("Added AeroRun Shoes to cart. Growth Agent upsell active.");
        router.push("/cart");
      }
    } catch {
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
      notify("Simulated 75 min cart abandonment. Ready in Recovery Center.");
      router.push("/recovery");
    } catch {
      notify("Failed to simulate abandonment");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRunAgentRecovery = async () => {
    setLoadingAction("recovery");
    try {
      const merchantRes = await fetch("/api/merchant");
      const merchantData = await merchantRes.json();
      const targetCart =
        merchantData.carts?.find((c: any) => c.status === "ABANDONED") ||
        merchantData.carts?.[0];
      const targetCartId = targetCart?.id || "cart_abandoned_01";

      const res = await fetch("/api/agent/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId: targetCartId }),
      });
      if (res.ok) {
        notify("Agent loop executed: WhatsApp campaign generated.");
        router.push(`/campaigns?cartId=${targetCartId}`);
      }
    } catch {
      notify("Failed to run agent recovery");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSimulatePaymentFailure = async () => {
    setLoadingAction("pay_fail");
    try {
      const cartRes = await fetch("/api/cart");
      const cartData = await cartRes.json();
      const activeCart = cartData.cart;
      const targetCartId = activeCart?.id || "cart_abandoned_01";

      notify("Simulating payment decline with cart preservation guarantee.");
      router.push(`/checkout?cartId=${targetCartId}&simulateFailure=true`);
    } catch {
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
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white text-black text-xs font-semibold shadow-lg hover:bg-zinc-200 transition-colors"
      >
        <Sliders className="w-3.5 h-3.5" />
        <span>Demo Controls</span>
      </button>

      {/* Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full sm:max-w-lg bg-[#121214] border border-[#27272a] sm:rounded-xl rounded-t-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Demo Controls & Scenarios
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Trigger live agent workflows and edge cases.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification banner */}
            {feedbackMessage && (
              <div className="bg-emerald-950/80 border-b border-emerald-800/60 px-4 py-2 flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{feedbackMessage}</span>
              </div>
            )}

            {/* Body */}
            <div className="p-4 space-y-3 overflow-y-auto">
              {/* Scenario 1 */}
              <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-zinc-800 text-zinc-300 mt-0.5">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">
                      1. Add AeroRun Shoes + Growth Upsell
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Adds shoes to cart & triggers Growth Agent upsell recommendations.
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleAddProduct}
                  disabled={loadingAction === "add_product"}
                  className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium border border-zinc-700 whitespace-nowrap transition-colors"
                >
                  {loadingAction === "add_product" ? "Adding..." : "Run"}
                </button>
              </div>

              {/* Scenario 2 */}
              <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-zinc-800 text-zinc-300 mt-0.5">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">
                      2. Simulate Cart Abandonment
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Simulates 75m inactivity, calculates intent score, and logs observation.
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSimulateAbandonment}
                  disabled={loadingAction === "abandon"}
                  className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium border border-zinc-700 whitespace-nowrap transition-colors"
                >
                  {loadingAction === "abandon" ? "Simulating..." : "Abandon"}
                </button>
              </div>

              {/* Scenario 3 */}
              <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-zinc-800 text-zinc-300 mt-0.5">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">
                      3. Execute Autonomous Agent Recovery
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Executes 6-step lifecycle and dispatches WhatsApp campaign.
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleRunAgentRecovery}
                  disabled={loadingAction === "recovery"}
                  className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium border border-zinc-700 whitespace-nowrap transition-colors"
                >
                  {loadingAction === "recovery" ? "Executing..." : "Dispatch"}
                </button>
              </div>

              {/* Scenario 4 */}
              <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-zinc-800 text-zinc-300 mt-0.5">
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">
                      4. Simulate Payment Failure
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Simulates card decline with cart preservation guarantee.
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSimulatePaymentFailure}
                  disabled={loadingAction === "pay_fail"}
                  className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium border border-zinc-700 whitespace-nowrap transition-colors"
                >
                  {loadingAction === "pay_fail" ? "Loading..." : "Simulate"}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-[#27272a] bg-[#18181b] flex items-center justify-between">
              <button
                onClick={handleReset}
                disabled={loadingAction === "reset"}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loadingAction === "reset" ? "animate-spin" : ""}`}
                />
                Reset Demo State
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 rounded bg-[#121214] text-xs font-medium text-zinc-300 hover:text-white border border-[#27272a]"
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
