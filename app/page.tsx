"use client";

import React from "react";
import Link from "next/link";
import {
  Bot,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Zap,
  CheckCircle2,
  ChevronRight,
  FileText,
  RotateCcw,
  Send,
} from "lucide-react";

export default function LandingPage() {
  const workflowSteps = [
    {
      title: "AI Buyer",
      role: "Conversational Discovery",
      icon: Bot,
    },
    {
      title: "Commerce Agent",
      role: "Catalog Matching",
      icon: Zap,
    },
    {
      title: "Growth Agent",
      role: "Smart Upsell & Intent",
      icon: TrendingUp,
    },
    {
      title: "Policy Engine",
      role: "Safety Boundaries",
      icon: ShieldCheck,
    },
    {
      title: "Razorpay",
      role: "Bounded Checkout",
      icon: CreditCard,
    },
    {
      title: "Audit Trail",
      role: "Explainable Ledger",
      icon: FileText,
    },
  ];

  return (
    <div className="relative overflow-hidden pt-8 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* HERO SECTION */}
        <section className="text-center space-y-6 pt-10 md:pt-16 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-zinc-300">
              Autonomous Growth & Bounded Commerce
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.15]">
            Autonomous Commerce & Revenue Recovery for Modern Merchants
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Commerce Agent deploys autonomous agents to observe cart telemetry, calculate purchase intent, enforce merchant policies, and recover lost sales with strict auditability.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore AI Commerce Shop</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#18181b] hover:bg-[#202024] border border-[#27272a] text-zinc-200 font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Merchant Dashboard</span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>
          </div>

          {/* Key Capabilities */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-8 border-t border-[#27272a]">
            <div className="p-3.5 rounded-lg bg-[#121214] border border-[#27272a] text-left">
              <div className="text-xs font-semibold text-white">Live Telemetry</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Real-time cart dwell & intent scoring</div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#121214] border border-[#27272a] text-left">
              <div className="text-xs font-semibold text-white">Deterministic Guardrails</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Zero spam & strict merchant policy caps</div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#121214] border border-[#27272a] text-left">
              <div className="text-xs font-semibold text-white">Bounded Payments</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Zero silent charges, HMAC-verified</div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#121214] border border-[#27272a] text-left">
              <div className="text-xs font-semibold text-white">Explainable Ledger</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Immutable audit trail in Supabase</div>
            </div>
          </div>
        </section>

        {/* WORKFLOW PIPELINE */}
        <section className="space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Agent Architecture & Lifecycle
            </h2>
            <p className="text-xs text-zinc-400 max-w-lg mx-auto">
              Telemetry flows continuously from observation to verified bounded action.
            </p>
          </div>

          {/* Steps */}
          <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {workflowSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="flex flex-col items-center text-center p-3.5 rounded-lg bg-[#18181b] border border-[#27272a]"
                  >
                    <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-2.5 text-zinc-200">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 mb-0.5">
                      0{idx + 1}
                    </span>
                    <h3 className="text-xs font-semibold text-white mb-0.5">
                      {step.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 leading-tight">
                      {step.role}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Lifecycle banner */}
            <div className="mt-5 pt-4 border-t border-[#27272a] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Lifecycle:</span>
                <span className="text-zinc-200 font-mono font-medium">
                  Observe → Reason → Policy Check → Act → Verify → Learn
                </span>
              </div>
              <Link
                href="/audit"
                className="text-zinc-300 hover:text-white flex items-center gap-1 font-medium transition-colors"
              >
                Inspect Audit Trail <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 4 CORE VALUE PILLARS */}
        <section className="space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Enterprise Platform Capabilities
            </h2>
            <p className="text-xs text-zinc-400">
              Designed for reliability, strict policy enforcement, and seamless merchant control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pillar 1 */}
            <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white">
                AI-Native Catalog & Natural Language Commerce
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Machine-readable catalog endpoints allow autonomous buyer agents and customers to discover products with structured semantic attribute matching.
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Direct semantic scoring and intent attribution
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Cart creation and dynamic cross-sell recommendations
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                <RotateCcw className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Autonomous Abandoned Cart Recovery
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Evaluates 5 distinct behavioral factors (dwell time, product views, checkout initiation, cart value, and inactivity) to trigger high-probability recovery.
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Personalized WhatsApp recovery campaigns
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  1-Click cart restoration flow
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Deterministic Policy Safety Engine
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Merchant boundaries prevent spam and protect margins with weekly frequency caps, minimum cart value thresholds, and inactivity guardrails.
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Hard guardrails on discount percentages and message volume
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Full audit logging of every policy check
                </li>
              </ul>
            </div>

            {/* Pillar 4 */}
            <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Bounded Razorpay Payment Trust
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Zero silent charges: payment authorization requires explicit user consent, backed by server-side HMAC signature verification and cart preservation.
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Razorpay Test Mode integration with secure server orders
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Preserves shopping cart upon payment retry or decline
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="bg-[#121214] border border-[#27272a] rounded-xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">
            Ready to test the autonomous commerce workflow?
          </h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Experience the complete flow from AI shopping to cart recovery and bounded payment.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/shop"
              className="px-5 py-2.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
            >
              Start in AI Shop
            </Link>
            <Link
              href="/recovery"
              className="px-5 py-2.5 rounded-lg bg-[#18181b] border border-[#27272a] text-zinc-300 hover:text-white text-xs font-medium transition-colors"
            >
              Open Recovery Center
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
