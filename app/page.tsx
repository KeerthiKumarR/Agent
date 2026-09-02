"use client";

import React from "react";
import Link from "next/link";
import {
  Bot,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Zap,
  Activity,
  ChevronRight,
  Layers,
  FileText,
  Sliders,
} from "lucide-react";

export default function LandingPage() {
  const workflowSteps = [
    {
      title: "AI Buyer",
      role: "Conversational Request",
      icon: Bot,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/30",
    },
    {
      title: "Commerce Agent",
      role: "Catalog Match & Score",
      icon: Zap,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/30",
    },
    {
      title: "Growth Agent",
      role: "Smart Upsell & Intent",
      icon: TrendingUp,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/30",
    },
    {
      title: "Policy Engine",
      role: "Safety Boundaries",
      icon: ShieldCheck,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/30",
    },
    {
      title: "Razorpay",
      role: "Bounded Payment",
      icon: CreditCard,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/30",
    },
    {
      title: "Audit Trail",
      role: "Explainable Ledger",
      icon: FileText,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/30",
    },
  ];

  return (
    <div className="relative overflow-hidden pt-6 pb-20">
      {/* Glow gradient blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-primary/20 via-accent-cyan/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-80 right-10 w-[400px] h-[400px] bg-accent-purple/10 blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* HERO SECTION */}
        <section className="text-center space-y-8 pt-8 md:pt-16 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-elevated border border-primary/40 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-ping" />
            <span className="text-xs font-semibold tracking-wide gradient-text-indigo">
              Autonomous Growth & Agentic Commerce Platform
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Turn Every Customer Signal Into{" "}
            <span className="gradient-text-indigo">Revenue.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto font-normal leading-relaxed">
            CommercePilot makes merchants AI-native and deploys autonomous
            growth agents to recover lost revenue, personalize campaigns, and
            drive intelligent commerce with explainable trust boundaries.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary via-indigo-500 to-accent-cyan text-white font-bold text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Bot className="w-5 h-5" />
              <span>Launch Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-surface-elevated hover:bg-surface border border-border hover:border-primary/40 text-text-primary font-bold text-base transition-all flex items-center justify-center gap-2"
            >
              <span>View Merchant Dashboard</span>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>
          </div>

          {/* Live Platform Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-border/60">
            <div className="p-4 rounded-xl glass-panel text-left">
              <div className="text-2xl font-extrabold text-white">
                ₹2,48,500
              </div>
              <div className="text-xs text-text-muted font-medium">
                Merchant Revenue
              </div>
            </div>
            <div className="p-4 rounded-xl glass-panel text-left">
              <div className="text-2xl font-extrabold text-accent-emerald">
                ₹34,200
              </div>
              <div className="text-xs text-text-muted font-medium">
                Recovered by Agents
              </div>
            </div>
            <div className="p-4 rounded-xl glass-panel text-left">
              <div className="text-2xl font-extrabold text-accent-cyan">
                18.4%
              </div>
              <div className="text-xs text-text-muted font-medium">
                Cart Recovery Rate
              </div>
            </div>
            <div className="p-4 rounded-xl glass-panel text-left">
              <div className="text-2xl font-extrabold text-primary-light">
                100%
              </div>
              <div className="text-xs text-text-muted font-medium">
                Bounded & Explainable
              </div>
            </div>
          </div>
        </section>

        {/* VISUAL WORKFLOW PIPELINE */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              The Autonomous Commerce Pipeline
            </h2>
            <p className="text-sm text-text-muted max-w-xl mx-auto">
              Every customer action is seamlessly coordinated across specialized
              agents bounded by safety policies.
            </p>
          </div>

          {/* Workflow Graph */}
          <div className="glass-panel-glow rounded-2xl p-6 sm:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 relative">
              {workflowSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="flex flex-col items-center text-center p-4 rounded-xl bg-surface/80 border border-border/80 hover:border-primary transition-all duration-200 hover:-translate-y-1 group"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 border ${step.bg}`}
                    >
                      <Icon
                        className={`w-6 h-6 ${step.color} group-hover:scale-110 transition-transform`}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-text-muted mb-1">
                      0{idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white mb-0.5">
                      {step.title}
                    </h3>
                    <p className="text-[11px] text-text-secondary leading-tight">
                      {step.role}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Lifecycle banner */}
            <div className="mt-6 pt-5 border-t border-border/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-2 text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Agent Core Loop:</span>
                <span className="text-white font-bold">
                  Observe → Reason → Policy Check → Act → Verify → Learn
                </span>
              </div>
              <Link
                href="/audit"
                className="text-primary-light hover:text-white flex items-center gap-1 font-semibold"
              >
                Inspect Live Audit Trail <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 4 CORE VALUE PILLARS */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Enterprise Agentic Architecture
            </h2>
            <p className="text-sm text-text-muted">
              Built for production resilience, zero hallucinated charges, and
              maximum merchant revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1: AI-Native Commerce */}
            <div className="p-6 sm:p-8 rounded-2xl glass-panel hover:border-primary/50 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                AI-Native Commerce & Catalog
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Publish machine-readable catalogs at{" "}
                <code className="text-xs bg-black/40 px-1.5 py-0.5 rounded text-accent-cyan">
                  /api/agent/catalog
                </code>
                . AI agents parse natural language requests, match buyer
                specifications, and calculate transparent match scores.
              </p>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Semantic feature indexing (e.g. HydroShield waterproofing,
                  marathon usage)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Instant conversational recommendation rationale
                </li>
              </ul>
            </div>

            {/* Pillar 2: Autonomous Revenue Recovery */}
            <div className="p-6 sm:p-8 rounded-2xl glass-panel hover:border-primary/50 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Autonomous Revenue Recovery
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                When shoppers abandon carts, the Growth Agent scores intent
                across 5 transparent telemetry factors before dispatching
                personalized, non-aggressive WhatsApp recovery campaigns.
              </p>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  5-factor intent scoring (views, cart adds, dwell time, cart
                  value, recency)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  One-click WhatsApp CTA restoring customer cart state
                </li>
              </ul>
            </div>

            {/* Pillar 3: Safe Agent Actions */}
            <div className="p-6 sm:p-8 rounded-2xl glass-panel hover:border-primary/50 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Bounded Policy Engine
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                AI agents are never given unconstrained authority. Every
                sensitive action is checked against merchant-configured rules:
                frequency limits, minimum cart thresholds, and discount caps.
              </p>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Strict 2 message/week anti-spam guardrail
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Zero silent charging: Payments require explicit human customer
                  approval
                </li>
              </ul>
            </div>

            {/* Pillar 4: Explainable Payments */}
            <div className="p-6 sm:p-8 rounded-2xl glass-panel hover:border-primary/50 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Explainable Razorpay Payments
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Secure Razorpay Test Mode integration with detailed Agent
                Decision Summaries before payment. If a transaction fails, carts
                are preserved with zero duplicate billing.
              </p>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Real Razorpay Test Mode & HMAC verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Resilient failure simulation and safe cart recovery
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="p-8 sm:p-12 rounded-3xl glass-panel-glow text-center space-y-6 relative overflow-hidden">
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Experience the Future of Agentic Commerce
            </h2>
            <p className="text-text-secondary text-sm sm:text-base">
              Explore the conversational shop, inspect growth upsells, simulate
              cart abandonment, and test bounded recovery workflows in
              real-time.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-lg shadow-primary/30 transition-all"
            >
              Start Conversational Shopping
            </Link>
            <Link
              href="/recovery"
              className="px-8 py-3.5 rounded-xl bg-surface border border-border hover:border-primary text-text-primary font-bold text-sm transition-all"
            >
              Explore Recovery Center
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
