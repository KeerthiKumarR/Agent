'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  RotateCcw, 
  Brain, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Eye, 
  TrendingUp, 
  Loader2, 
  Zap, 
  ArrowRight,
  Sliders,
  Sparkles
} from 'lucide-react';
import AgentThinking, { WorkflowStepData } from '@/components/AgentThinking';
import { Cart } from '@/lib/types';
import { OrchestrationResult } from '@/lib/agents/agentOrchestrator';

export default function AbandonedCartRecoveryPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<OrchestrationResult | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStepData[] | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const router = useRouter();

  const fetchAbandonedCarts = async () => {
    try {
      const res = await fetch('/api/merchant');
      if (res.ok) {
        const data = await res.json();
        // Load initial carts
        const cartRes = await fetch('/api/cart');
        const activeData = await cartRes.json();
        
        // Build mock abandoned carts list from server
        const demoCarts: Cart[] = [
          {
            id: "cart_abandoned_01",
            customerId: "cust_demo_01",
            customer: {
              id: "cust_demo_01",
              name: "Rohan Sharma",
              email: "rohan.sharma@example.com",
              phone: "+91 98765 43210",
              messagesSentThisWeek: 1
            },
            items: [
              {
                id: "citem_01",
                productId: "shoe_001",
                product: {
                  id: "shoe_001",
                  name: "AeroRun Waterproof Shoes",
                  slug: "aerorun-waterproof",
                  price: 4999,
                  currency: "INR",
                  category: "Running Shoes",
                  description: "HydroShield waterproof membrane running shoes",
                  features: ["100% Waterproof", "Nitrogen EVA Midsole"],
                  attributes: { waterproof: true, usage: ["running", "outdoor"] },
                  image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
                  stock: 18,
                  tags: ["shoes", "running", "waterproof"]
                },
                quantity: 1,
                price: 4999
              }
            ],
            status: "ABANDONED",
            inactivityDuration: 120,
            productViews: 4,
            timeSpentMinutes: 7.5,
            checkoutInitiated: true,
            total: 4999,
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
          },
          {
            id: "cart_abandoned_02",
            customerId: "cust_demo_02",
            customer: {
              id: "cust_demo_02",
              name: "Priya Patel",
              email: "priya.patel@example.com",
              phone: "+91 98123 45678",
              messagesSentThisWeek: 0
            },
            items: [
              {
                id: "citem_02",
                productId: "shoe_002",
                product: {
                  id: "shoe_002",
                  name: "AeroRun Trail Pro",
                  slug: "aerorun-trail-pro",
                  price: 5799,
                  currency: "INR",
                  category: "Trail Shoes",
                  description: "Rugged high-performance trail running shoes",
                  features: ["5mm Aggressive Lugs", "Carbon Rock Plate"],
                  attributes: { waterproof: true, usage: ["trail", "hiking"] },
                  image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=400&q=80",
                  stock: 12,
                  tags: ["shoes", "trail", "waterproof"]
                },
                quantity: 1,
                price: 5799
              }
            ],
            status: "ABANDONED",
            inactivityDuration: 45,
            productViews: 5,
            timeSpentMinutes: 11.2,
            checkoutInitiated: true,
            total: 5799,
            createdAt: new Date(Date.now() - 60000 * 45).toISOString(),
            updatedAt: new Date(Date.now() - 60000 * 45).toISOString()
          }
        ];
        setCarts(demoCarts);
        setSelectedCart(demoCarts[0]);
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
      const res = await fetch('/api/agent/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId: cart.id })
      });

      if (res.ok) {
        const data: OrchestrationResult = await res.json();
        setAnalysisResult(data);
        
        // Map backend orchestration steps to visual component steps
        const mappedSteps: WorkflowStepData[] = data.steps.map((s, idx) => ({
          step: s.step,
          status: s.status,
          title: `${idx + 1}. ${s.step.replace('_', ' ')}`,
          description: s.description,
          detail: s.detail,
          meta: s.data
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <RotateCcw className="w-6 h-6 text-accent-cyan" />
              Abandoned Cart Recovery Center
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 font-bold uppercase">
              Autonomous Campaign Orchestrator
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Observe → Reason → Policy Check → Act → Verify → Learn. The agent calculates intent and checks merchant boundaries before intervening.
          </p>
        </div>

        <button
          onClick={() => selectedCart && handleAnalyzeCart(selectedCart)}
          disabled={isAnalyzing || !selectedCart}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent-cyan hover:opacity-95 text-white text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Signals...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run Agent Analysis Loop</span>
            </>
          )}
        </button>
      </div>

      {/* TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ABANDONED CARTS QUEUE (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-mono font-bold uppercase">Active Abandoned Carts ({carts.length})</span>
            <span>Click to inspect</span>
          </div>

          <div className="space-y-3">
            {carts.map((cart) => {
              const item = cart.items[0];
              const isSelected = selectedCart?.id === cart.id;
              const intentScore = cart.id === 'cart_abandoned_01' ? 87 : 92;

              return (
                <div
                  key={cart.id}
                  onClick={() => setSelectedCart(cart)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 space-y-3 ${
                    isSelected 
                      ? 'bg-surface-elevated border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/40' 
                      : 'bg-surface/80 border-border hover:border-border/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface shrink-0 border border-border">
                        {item?.product.image && (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white truncate max-w-[180px]">
                          {cart.customer?.name}
                        </h4>
                        <div className="text-[11px] text-text-muted truncate max-w-[180px]">
                          {item?.product.name}
                        </div>
                        <div className="text-xs font-bold text-accent-cyan mt-0.5">
                          ₹{cart.total.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold block">
                        {cart.inactivityDuration}m Inactive
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 block">
                        Intent: {intentScore}%
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">
                      Views: {cart.productViews} • Dwell: {cart.timeSpentMinutes}m
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnalyzeCart(cart);
                      }}
                      disabled={isAnalyzing}
                      className="px-3 py-1 rounded-lg bg-primary/20 hover:bg-primary text-primary-light hover:text-white text-xs font-semibold flex items-center gap-1 transition-all border border-primary/30"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      <span>Ask Agent to Analyze</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED 6-STEP AGENT REASONING WORKSPACE (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {selectedCart && (
            <>
              {/* Telemetry Summary Card */}
              <div className="p-5 rounded-2xl glass-panel border border-border space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Live Telemetry & Intent Factors
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-text-muted">
                    Target: {selectedCart.customer?.name} ({selectedCart.customer?.phone})
                  </span>
                </div>

                {/* 5 Transparent Scoring Factors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between">
                    <span className="text-text-secondary">✓ Product Views ({selectedCart.productViews}x):</span>
                    <span className="font-bold text-emerald-400">+30 pts</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between">
                    <span className="text-text-secondary">✓ Added to Cart:</span>
                    <span className="font-bold text-emerald-400">+25 pts</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between">
                    <span className="text-text-secondary">✓ Checkout Reached:</span>
                    <span className="font-bold text-emerald-400">+20 pts</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between">
                    <span className="text-text-secondary">✓ Cart Value (&gt; ₹4k):</span>
                    <span className="font-bold text-emerald-400">+10 pts</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between sm:col-span-2">
                    <span className="text-text-secondary">✓ Recent Activity ({selectedCart.inactivityDuration}m window):</span>
                    <span className="font-bold text-emerald-400">+2 pts</span>
                  </div>
                </div>

                {/* Intent Score Bar */}
                <div className="p-3.5 rounded-xl bg-surface-elevated border border-primary/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Calculated Intent Score:</div>
                    <div className="text-[11px] text-text-muted">High probability of recovery via non-aggressive message.</div>
                  </div>
                  <div className="text-2xl font-extrabold text-accent-cyan font-mono">
                    87 <span className="text-xs text-text-muted">/ 100</span>
                  </div>
                </div>
              </div>

              {/* 6-STEP AGENT WORKFLOW VISUALIZER */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-text-muted uppercase font-bold tracking-wider">
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
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 via-accent-purple/20 to-accent-cyan/20 border border-primary/40 flex items-center justify-between gap-4 animate-in fade-in">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-accent-cyan" />
                    Personalized WhatsApp Campaign Generated
                  </div>
                  <div className="text-[11px] text-text-secondary">
                    Review non-aggressive message copy, phone mockup, and interactive restoration CTA.
                  </div>
                </div>

                <button
                  onClick={() => router.push('/campaigns')}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md flex items-center gap-1 whitespace-nowrap"
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
