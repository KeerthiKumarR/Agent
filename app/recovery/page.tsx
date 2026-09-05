"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  RotateCcw,
  Brain,
  Send,
  Eye,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import AgentThinking, { WorkflowStepData } from "@/components/AgentThinking";
import { Cart } from "@/lib/types";
import { OrchestrationResult } from "@/lib/agents/agentOrchestrator";
import { calculateIntentScore } from "@/lib/agents/intentScore";

export default function AbandonedCartRecoveryPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<OrchestrationResult | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStepData[] | null>(
    null,
  );
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const router = useRouter();

  const fetchAbandonedCarts = async () => {
    try {
      const res = await fetch("/api/merchant");
      if (res.ok) {
        const data = await res.json();
        const dbCarts: Cart[] = (data.carts || []).filter(
          (c: Cart) => c.status === "ABANDONED" || c.status === "ACTIVE",
        );

        if (dbCarts.length > 0) {
          setCarts(dbCarts);
          setSelectedCart(dbCarts[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAbandonedCarts();
  }, []);

  const handleAnalyzeCart = async (cart: Cart) => {
    setSelectedCart(cart);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setCurrentStepIndex(0);

    try {
      const res = await fetch("/api/agent/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId: cart.id }),
      });

      if (res.ok) {
        const data: OrchestrationResult = await res.json();
        setAnalysisResult(data);

        const mappedSteps: WorkflowStepData[] = data.steps.map((s, idx) => ({
          step: s.step,
          status: s.status,
          title: `${idx + 1}. ${s.step.replace("_", " ")}`,
          description: s.description,
          detail: s.detail,
          meta: s.data,
        }));

        setWorkflowSteps(mappedSteps);
        setCurrentStepIndex(mappedSteps.length - 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272a]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-zinc-300" />
              Abandoned Cart Recovery Center
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold uppercase">
              Autonomous Lifecycle
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Observe → Reason → Policy Check → Act → Verify → Learn. Intent analysis with strict policy boundaries.
          </p>
        </div>

        <button
          onClick={() => selectedCart && handleAnalyzeCart(selectedCart)}
          disabled={isAnalyzing || !selectedCart}
          className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors flex items-center gap-2 disabled:opacity-40"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Signals...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Agent Analysis Loop</span>
            </>
          )}
        </button>
      </div>

      {/* TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ABANDONED CARTS QUEUE (5 COLS) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono uppercase font-semibold">
              Abandoned Carts ({carts.length})
            </span>
            <span className="text-zinc-500">Select to inspect</span>
          </div>

          <div className="space-y-2.5">
            {carts.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 rounded-xl bg-[#121214] border border-dashed border-[#27272a]">
                No abandoned carts found in database. When a customer leaves items in their cart, it will automatically appear here.
              </div>
            ) : (
              carts.map((cart) => {
                const item = cart.items[0];
                const isSelected = selectedCart?.id === cart.id;
                const intent = calculateIntentScore(cart);

                return (
                  <div
                    key={cart.id}
                    onClick={() => setSelectedCart(cart)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-colors space-y-3 ${
                      isSelected
                        ? "bg-[#18181b] border-zinc-500 shadow-sm"
                        : "bg-[#121214] border-[#27272a] hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#18181b] shrink-0 border border-[#27272a]">
                          {item?.product?.image && (
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-white truncate max-w-[170px]">
                            {cart.customer?.name || "Customer"}
                          </h4>
                          <div className="text-[11px] text-zinc-400 truncate max-w-[170px]">
                            {item?.product?.name || "Sports Gear"}
                          </div>
                          <div className="text-xs font-semibold text-white mt-0.5">
                            ₹{cart.total.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 block">
                          {cart.inactivityDuration}m Inactive
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-400 block">
                          Intent: {intent.score}%
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#27272a] flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500">
                        Views: {cart.productViews} • Dwell: {cart.timeSpentMinutes}m
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnalyzeCart(cart);
                        }}
                        disabled={isAnalyzing}
                        className="px-2.5 py-1 rounded bg-[#18181b] hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-medium flex items-center gap-1 border border-zinc-700 transition-colors"
                      >
                        <Brain className="w-3 h-3" />
                        <span>Ask Agent to Analyze</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED 6-STEP AGENT REASONING WORKSPACE (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          {!selectedCart ? (
            <div className="p-12 text-center text-xs text-zinc-500 rounded-xl bg-[#121214] border border-dashed border-[#27272a]">
              Select an abandoned cart from the queue to run the 6-step autonomous recovery loop.
            </div>
          ) : (
            <>
              {/* Telemetry Summary Card */}
              {(() => {
                const selectedIntent = calculateIntentScore(selectedCart);
                return (
                  <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] space-y-3.5">
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#27272a]">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-zinc-300" />
                        <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                          Telemetry & Intent Factors
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-zinc-400">
                        Target: {selectedCart.customer?.name || "Customer"} ({selectedCart.customer?.phone || ""})
                      </span>
                    </div>

                    {/* 5 Transparent Scoring Factors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-[#18181b] border border-[#27272a] flex items-center justify-between">
                        <span className="text-zinc-400">
                          Product Views ({selectedCart.productViews}x):
                        </span>
                        <span className="font-semibold text-emerald-400">
                          +{selectedIntent.factors.productViews.points} pts
                        </span>
                      </div>
                      <div className="p-2 rounded bg-[#18181b] border border-[#27272a] flex items-center justify-between">
                        <span className="text-zinc-400">
                          Added to Cart:
                        </span>
                        <span className="font-semibold text-emerald-400">
                          +{selectedIntent.factors.addedToCart.points} pts
                        </span>
                      </div>
                      <div className="p-2 rounded bg-[#18181b] border border-[#27272a] flex items-center justify-between">
                        <span className="text-zinc-400">
                          Checkout Reached:
                        </span>
                        <span className="font-semibold text-emerald-400">
                          +{selectedIntent.factors.checkoutInitiated.points} pts
                        </span>
                      </div>
                      <div className="p-2 rounded bg-[#18181b] border border-[#27272a] flex items-center justify-between">
                        <span className="text-zinc-400">
                          Cart Value:
                        </span>
                        <span className="font-semibold text-emerald-400">
                          +{selectedIntent.factors.highValueCart.points} pts
                        </span>
                      </div>
                      <div className="p-2 rounded bg-[#18181b] border border-[#27272a] flex items-center justify-between sm:col-span-2">
                        <span className="text-zinc-400">
                          Inactivity Window ({selectedCart.inactivityDuration}m):
                        </span>
                        <span className="font-semibold text-emerald-400">
                          +{selectedIntent.factors.recentActivity.points} pts
                        </span>
                      </div>
                    </div>

                    {/* Intent Score Bar */}
                    <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white">
                          Calculated Intent Score:
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {selectedIntent.summary}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-emerald-400 font-mono">
                        {selectedIntent.score} <span className="text-xs text-zinc-500">/ 100</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 6-STEP AGENT WORKFLOW VISUALIZER */}
              <div className="space-y-2.5">
                <div className="text-xs font-mono text-zinc-400 uppercase font-semibold">
                  Autonomous Agent Workflow Execution
                </div>
                <AgentThinking
                  isThinking={isAnalyzing}
                  currentStepIndex={currentStepIndex}
                  steps={workflowSteps || undefined}
                  agentName="Campaign Orchestrator"
                />
              </div>

              {/* Action Banner to View Generated Campaign */}
              <div className="p-3.5 rounded-xl bg-[#121214] border border-[#27272a] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-zinc-300" />
                    Personalized Recovery Campaign Generated
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Review non-aggressive message copy, simulator, and restoration CTA.
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/campaigns?cartId=${selectedCart.id}`)}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  <span>Open Campaign Composer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
