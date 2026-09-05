"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  RotateCcw,
  ShoppingCart,
  Percent,
  TrendingUp,
  Zap,
  ShieldCheck,
  Eye,
  Sparkles,
  X,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import AuditBadge from "@/components/AuditBadge";
import { RevenueOpportunity, AuditLogEntry, MerchantPolicy } from "@/lib/types";

export default function MerchantDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<RevenueOpportunity | null>(null);
  const [policies, setPolicies] = useState<MerchantPolicy | null>(null);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [policyFeedback, setPolicyFeedback] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/merchant");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setPolicies(json.merchant.policies);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdatePolicy = async (key: keyof MerchantPolicy, val: any) => {
    if (!policies) return;
    const updated = { ...policies, [key]: val };
    setPolicies(updated);
    setSavingPolicy(true);

    try {
      const res = await fetch("/api/merchant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policies: updated }),
      });
      if (res.ok) {
        setPolicyFeedback("Policy updated & verified");
        setTimeout(() => setPolicyFeedback(null), 3000);
      }
    } catch {
      setPolicyFeedback("Failed to update policy");
    } finally {
      setSavingPolicy(false);
    }
  };

  const metrics = data?.metrics || {
    totalRevenue: 0,
    recoveredRevenue: 0,
    abandonedCartsCount: 0,
    recoveryRate: 0,
    upsellRevenue: 0,
    agentActionsToday: 0,
  };

  const opportunities: RevenueOpportunity[] = data?.opportunities || [];
  const activityLogs: AuditLogEntry[] = data?.recentActivity || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#27272a]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Merchant Revenue Dashboard
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              Velocity Sports
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time autonomous commerce analytics, agent interventions, and safety policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/recovery"
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Open Recovery Center</span>
          </Link>
          <Link
            href="/audit"
            className="px-3.5 py-2 rounded-lg bg-[#18181b] hover:bg-[#202024] border border-[#27272a] text-zinc-300 hover:text-white text-xs font-medium transition-colors"
          >
            Audit Trail
          </Link>
        </div>
      </div>

      {/* TOP METRICS 6-CARD GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1 */}
        <div className="p-4 rounded-lg bg-[#121214] border border-[#27272a] space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="text-xl font-bold text-white">
            ₹{metrics.totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-zinc-400 font-medium">
            Real-time verified
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-lg bg-[#121214] border border-zinc-700 space-y-2">
          <div className="flex items-center justify-between text-zinc-300">
            <span className="text-xs font-medium">Recovered by AI</span>
            <RotateCcw className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            ₹{metrics.recoveredRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-zinc-400 font-medium">
            Autonomous recovery
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-lg bg-[#121214] border border-[#27272a] space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Abandoned Carts</span>
            <ShoppingCart className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {metrics.abandonedCartsCount}
          </div>
          <div className="text-[11px] text-amber-400 font-medium">
            Awaiting recovery
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-lg bg-[#121214] border border-[#27272a] space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Recovery Rate</span>
            <Percent className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="text-xl font-bold text-white">
            {metrics.recoveryRate}%
          </div>
          <div className="text-[11px] text-zinc-400 font-medium">
            Conversion ratio
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-4 rounded-lg bg-[#121214] border border-[#27272a] space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Upsell Revenue</span>
            <TrendingUp className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="text-xl font-bold text-white">
            ₹{metrics.upsellRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-zinc-400 font-medium">
            AI recommendations
          </div>
        </div>

        {/* Metric 6 */}
        <div className="p-4 rounded-lg bg-[#121214] border border-[#27272a] space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Agent Actions</span>
            <Zap className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="text-xl font-bold text-white">
            {metrics.agentActionsToday}
          </div>
          <div className="text-[11px] text-zinc-400 font-medium">
            100% Policy Checked
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Growth Trend */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Revenue Trajectory
              </h3>
              <p className="text-xs text-zinc-400">
                Baseline Revenue vs Recovered Revenue
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-zinc-300" /> Total
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Recovered
              </span>
            </div>
          </div>

          {metrics.totalRevenue === 0 && metrics.recoveredRevenue === 0 ? (
            <div className="h-60 w-full flex flex-col items-center justify-center text-center p-6 rounded-lg bg-[#18181b]/40 border border-dashed border-[#27272a]">
              <RotateCcw className="w-6 h-6 text-zinc-600 mb-2" />
              <span className="text-xs font-medium text-zinc-300">No revenue records yet</span>
              <span className="text-[11px] text-zinc-500 max-w-xs mt-1">
                Completed checkouts and recovered carts will automatically populate this revenue trajectory chart.
              </span>
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { month: "Current", total: metrics.totalRevenue, recovered: metrics.recoveredRevenue, upsell: metrics.upsellRevenue }
                  ]}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="month"
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: "6px",
                      color: "#fafafa",
                      fontSize: "12px",
                    }}
                    formatter={(value: any) => [
                      `₹${Number(value).toLocaleString("en-IN")}`,
                      "",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    fill="#ffffff"
                    fillOpacity={0.05}
                  />
                  <Area
                    type="monotone"
                    dataKey="recovered"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    fill="#10b981"
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Campaign Funnel Chart */}
        <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Recovery Funnel
            </h3>
            <p className="text-xs text-zinc-400">
              Outreach → Restoration → Order
            </p>
          </div>

          {metrics.abandonedCartsCount === 0 && (data?.campaigns?.length || 0) === 0 ? (
            <div className="h-60 w-full flex flex-col items-center justify-center text-center p-6 rounded-lg bg-[#18181b]/40 border border-dashed border-[#27272a]">
              <Sparkles className="w-6 h-6 text-zinc-600 mb-2" />
              <span className="text-xs font-medium text-zinc-300">No active recovery funnel</span>
              <span className="text-[11px] text-zinc-500 max-w-xs mt-1">
                Abandon a cart in the AI Shop or trigger a scenario to view real-time conversion stages.
              </span>
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { stage: "Abandoned", count: metrics.abandonedCartsCount, fill: "#e4e4e7" },
                    { stage: "Approved", count: data?.campaigns?.length || 0, fill: "#a1a1aa" },
                    { stage: "Sent", count: data?.campaigns?.filter((c: any) => c.status === "SENT").length || 0, fill: "#71717a" },
                    { stage: "Returned", count: data?.carts?.filter((c: any) => c.status === "RESTORED" || c.status === "CONVERTED").length || 0, fill: "#10b981" },
                    { stage: "Orders", count: data?.carts?.filter((c: any) => c.status === "CONVERTED").length || 0, fill: "#ffffff" },
                  ]}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#27272a"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    stroke="#a1a1aa"
                    fontSize={10}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: "6px",
                      color: "#fafafa",
                      fontSize: "12px",
                    }}
                    formatter={(value: any) => [value, "Carts"]}
                  />
                  <Bar dataKey="count" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* REVENUE OPPORTUNITY FEED & AGENT ACTIVITY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Revenue Opportunity Feed */}
        <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-300" />
              <h3 className="text-sm font-semibold text-white">
                Revenue Opportunities
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              {opportunities.length} Actionable
            </span>
          </div>

          <div className="space-y-2.5">
            {opportunities.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 rounded-lg bg-[#18181b]/50 border border-dashed border-[#27272a]">
                No active revenue opportunities detected. Abandoned carts will automatically appear here.
              </div>
            ) : (
              opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="p-3.5 rounded-lg bg-[#18181b] border border-[#27272a] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase">
                      {opp.urgency} Priority
                    </span>
                    <span className="text-xs font-semibold text-white">
                      ₹{opp.cartValue.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-300">
                    Customer: <span className="text-white font-medium">{opp.customerName}</span> • Intent Score: <span className="text-emerald-400 font-mono font-semibold">{opp.intentScore}%</span>
                  </div>

                  <div className="text-xs text-zinc-400 bg-black/40 p-2 rounded border border-white/5">
                    <span className="text-zinc-200 font-medium">
                      Recommended:
                    </span>{" "}
                    {opp.recommendedAction}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setSelectedOpportunity(opp)}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Agent Reasoning
                    </button>

                    <Link
                      href={`/recovery?cartId=${opp.cartId}`}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium border border-zinc-700 transition-colors"
                    >
                      Trigger Recovery
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Agent Activity Feed */}
        <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-zinc-300" />
              <h3 className="text-sm font-semibold text-white">
                Live Agent Activity Feed
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Active
            </span>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {activityLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 rounded-lg bg-[#18181b]/50 border border-dashed border-[#27272a]">
                No agent activities logged yet. Interactions will stream live into this ledger.
              </div>
            ) : (
              activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-[#18181b] border border-[#27272a] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <AuditBadge type={log.type} size="sm" />
                    <span className="text-[10px] font-mono text-zinc-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-white font-medium text-xs">{log.title}</div>
                  <div className="text-[11px] text-zinc-400">{log.detail}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MERCHANT POLICY ENGINE CONTROLS */}
      {policies && (
        <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#27272a]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-zinc-300" />
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Merchant Policy Safety Engine
                </h3>
                <p className="text-xs text-zinc-400">
                  Configure safety guardrails, communication limits, and discount thresholds
                </p>
              </div>
            </div>
            {policyFeedback && (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                {policyFeedback}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Setting 1 */}
            <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Max Outreach / Week
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={policies.maxWhatsAppPerWeek}
                  onChange={(e) =>
                    handleUpdatePolicy(
                      "maxWhatsAppPerWeek",
                      parseInt(e.target.value) || 2,
                    )
                  }
                  className="w-full px-2.5 py-1 rounded bg-[#121214] border border-[#27272a] text-white text-xs font-mono focus:outline-none focus:border-zinc-500"
                />
                <span className="text-xs text-zinc-500">msgs</span>
              </div>
              <p className="text-[10px] text-zinc-500">
                Prevents message fatigue
              </p>
            </div>

            {/* Setting 2 */}
            <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Min Cart Value For Recovery
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step={100}
                  value={policies.minCartValue}
                  onChange={(e) =>
                    handleUpdatePolicy(
                      "minCartValue",
                      parseFloat(e.target.value) || 500,
                    )
                  }
                  className="w-full px-2.5 py-1 rounded bg-[#121214] border border-[#27272a] text-white text-xs font-mono focus:outline-none focus:border-zinc-500"
                />
                <span className="text-xs text-zinc-500">INR</span>
              </div>
              <p className="text-[10px] text-zinc-500">
                Minimum order qualification
              </p>
            </div>

            {/* Setting 3 */}
            <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Min Inactivity Window
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step={5}
                  value={policies.minInactivityMinutes}
                  onChange={(e) =>
                    handleUpdatePolicy(
                      "minInactivityMinutes",
                      parseInt(e.target.value) || 30,
                    )
                  }
                  className="w-full px-2.5 py-1 rounded bg-[#121214] border border-[#27272a] text-white text-xs font-mono focus:outline-none focus:border-zinc-500"
                />
                <span className="text-xs text-zinc-500">mins</span>
              </div>
              <p className="text-[10px] text-zinc-500">
                Prevents premature triggers
              </p>
            </div>

            {/* Setting 4 */}
            <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Payment Approval
              </label>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-xs font-medium text-zinc-200">
                  Strictly Required
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  ENFORCED
                </span>
              </div>
              <p className="text-[10px] text-zinc-500">
                No autonomous billing
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AGENT REASONING MODAL */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#121214] border border-[#27272a] rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-zinc-300" />
                <h3 className="text-sm font-semibold text-white">
                  Agent Reasoning Breakdown
                </h3>
              </div>
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] space-y-1">
                <div className="text-zinc-400">Target Customer:</div>
                <div className="text-sm font-semibold text-white">
                  {selectedOpportunity.customerName}
                </div>
                <div className="text-zinc-400">
                  Cart Value: ₹
                  {selectedOpportunity.cartValue.toLocaleString("en-IN")}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] space-y-1.5">
                <div className="font-semibold text-zinc-200">
                  Growth Agent Decision Summary:
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  {selectedOpportunity.reasoning}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-between">
                <span>Calculated Intent Score:</span>
                <span className="text-sm font-bold text-emerald-400">
                  {selectedOpportunity.intentScore} / 100
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Link
                href={`/recovery?cartId=${selectedOpportunity.cartId}`}
                className="px-3.5 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
              >
                Go to Recovery Workflow
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
