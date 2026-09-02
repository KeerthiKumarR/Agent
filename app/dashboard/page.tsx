'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  RotateCcw, 
  ShoppingCart, 
  Percent, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  ArrowUpRight, 
  Eye, 
  Sparkles, 
  Clock, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Sliders
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import AuditBadge from '@/components/AuditBadge';
import { RevenueOpportunity, AuditLogEntry, MerchantPolicy } from '@/lib/types';

const REVENUE_DATA = [
  { month: 'Apr', total: 145000, recovered: 12000, upsell: 5000 },
  { month: 'May', total: 172000, recovered: 18500, upsell: 8200 },
  { month: 'Jun', total: 198000, recovered: 24000, upsell: 11000 },
  { month: 'Jul', total: 220000, recovered: 29000, upsell: 12800 },
  { month: 'Aug', total: 236000, recovered: 31500, upsell: 13900 },
  { month: 'Sep', total: 248500, recovered: 34200, upsell: 14800 },
];

const CAMPAIGN_FUNNEL = [
  { stage: 'Carts Abandoned', count: 125, fill: '#6366F1' },
  { stage: 'Policy Approved', count: 112, fill: '#818CF8' },
  { stage: 'Campaigns Sent', count: 112, fill: '#06B6D4' },
  { stage: 'Customers Returned', count: 48, fill: '#10B981' },
  { stage: 'Orders Completed', count: 23, fill: '#A855F7' },
];

export default function MerchantDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] = useState<RevenueOpportunity | null>(null);
  const [policies, setPolicies] = useState<MerchantPolicy | null>(null);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [policyFeedback, setPolicyFeedback] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/merchant');
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
      const res = await fetch('/api/merchant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policies: updated })
      });
      if (res.ok) {
        setPolicyFeedback('Policy updated & verified by Policy Engine');
        setTimeout(() => setPolicyFeedback(null), 3000);
      }
    } catch (e) {
      setPolicyFeedback('Failed to update policy');
    } finally {
      setSavingPolicy(false);
    }
  };

  const metrics = data?.metrics || {
    totalRevenue: 248500,
    recoveredRevenue: 34200,
    abandonedCartsCount: 23,
    recoveryRate: 18.4,
    upsellRevenue: 14800,
    agentActionsToday: 38
  };

  const opportunities: RevenueOpportunity[] = data?.opportunities || [];
  const activityLogs: AuditLogEntry[] = data?.recentActivity || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Merchant Revenue Dashboard
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Velocity Sports
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Real-time autonomous commerce analytics, agent intervention feed, and bounded safety policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/recovery"
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Open Recovery Center</span>
          </Link>
          <Link
            href="/audit"
            className="px-4 py-2 rounded-lg bg-surface-elevated hover:bg-surface border border-border text-text-primary text-xs font-semibold transition-all"
          >
            Full Audit Logs
          </Link>
        </div>
      </div>

      {/* TOP METRICS 6-CARD GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Metric 1 */}
        <div className="p-4 rounded-xl glass-panel border border-border space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-medium">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-primary-light" />
          </div>
          <div className="text-xl font-bold text-white">₹{metrics.totalRevenue.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" /> +14.8% vs last mo
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl glass-panel border border-primary/40 shadow-sm shadow-primary/10 space-y-2 bg-primary/5">
          <div className="flex items-center justify-between text-primary-light">
            <span className="text-xs font-semibold">Recovered by AI</span>
            <RotateCcw className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="text-xl font-bold text-accent-cyan">₹{metrics.recoveredRevenue.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-text-muted font-medium">
            13.7% of total revenue
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl glass-panel border border-border space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-medium">Abandoned Carts</span>
            <ShoppingCart className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white">{metrics.abandonedCartsCount}</div>
          <div className="text-[11px] text-amber-400 font-medium">
            ₹1,14,500 at risk
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl glass-panel border border-border space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-medium">Recovery Rate</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">{metrics.recoveryRate}%</div>
          <div className="text-[11px] text-emerald-400 font-medium">
            +3.2% above benchmark
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-4 rounded-xl glass-panel border border-border space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-medium">Upsell Revenue</span>
            <TrendingUp className="w-4 h-4 text-accent-purple" />
          </div>
          <div className="text-xl font-bold text-white">₹{metrics.upsellRevenue.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-accent-purple font-medium">
            96% co-purchase match
          </div>
        </div>

        {/* Metric 6 */}
        <div className="p-4 rounded-xl glass-panel border border-border space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-medium">Agent Actions</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white">{metrics.agentActionsToday} Today</div>
          <div className="text-[11px] text-text-muted font-medium">
            100% Policy Checked
          </div>
        </div>

      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Growth Trend */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Autonomous Revenue Trajectory</h3>
              <p className="text-xs text-text-muted">Baseline Revenue vs Recovered Revenue vs Upsells</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-primary-light">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Total
              </span>
              <span className="flex items-center gap-1.5 text-accent-cyan">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan" /> Recovered
              </span>
              <span className="flex items-center gap-1.5 text-accent-purple">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-purple" /> Upsell
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111726', borderColor: '#1F2A44', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="recovered" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorRecovered)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Funnel Chart */}
        <div className="p-5 rounded-2xl glass-panel border border-border space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Campaign Conversion Funnel</h3>
            <p className="text-xs text-text-muted">Outreach → Restoration → Razorpay Order</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CAMPAIGN_FUNNEL} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="stage" stroke="#94A3B8" fontSize={10} tickLine={false} width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111726', borderColor: '#1F2A44', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: any) => [value, 'Carts']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* REVENUE OPPORTUNITY FEED & AGENT ACTIVITY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Revenue Opportunity Feed */}
        <div className="p-5 rounded-2xl glass-panel border border-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-cyan" />
              <h3 className="text-base font-bold text-white">Revenue Opportunity Feed</h3>
            </div>
            <span className="text-[11px] font-mono text-text-muted">
              {opportunities.length} Actionable Opportunities
            </span>
          </div>

          <div className="space-y-3">
            {opportunities.map((opp) => (
              <div 
                key={opp.id}
                className="p-4 rounded-xl bg-surface border border-border/80 hover:border-primary/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                    {opp.urgency} Opportunity
                  </span>
                  <span className="text-sm font-bold text-white">
                    ₹{opp.cartValue.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-xs text-text-secondary">
                  Customer: <span className="text-white font-semibold">{opp.customerName}</span> • Intent Score: <span className="text-accent-cyan font-bold">{opp.intentScore}%</span>
                </div>

                <div className="text-xs text-text-muted bg-black/30 p-2.5 rounded-lg border border-white/5">
                  <span className="text-primary-light font-semibold">Recommended Action:</span> {opp.recommendedAction}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setSelectedOpportunity(opp)}
                    className="text-xs text-accent-cyan hover:text-white flex items-center gap-1 font-semibold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Agent Reasoning
                  </button>

                  <Link
                    href={`/recovery?cartId=${opp.cartId}`}
                    className="px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary text-primary-light hover:text-white text-xs font-semibold transition-all"
                  >
                    Trigger Recovery
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Agent Activity Feed */}
        <div className="p-5 rounded-2xl glass-panel border border-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary-light" />
              <h3 className="text-base font-bold text-white">Real-Time Agent Activity Feed</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Stream
            </span>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {activityLogs.map((log) => (
              <div 
                key={log.id}
                className="p-3 rounded-lg bg-surface/70 border border-border/60 text-xs space-y-1 hover:border-border transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <AuditBadge type={log.type} size="sm" />
                  <span className="text-[10px] font-mono text-text-muted">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="font-semibold text-white">{log.title}</div>
                <div className="text-text-secondary text-[11px] leading-relaxed">{log.detail}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MERCHANT POLICY ENGINE CONTROLS */}
      {policies && (
        <div className="p-6 rounded-2xl glass-panel border border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-bold text-white">Merchant AI Policy Engine</h3>
                <p className="text-xs text-text-muted">Configure safety boundaries, communication limits, and discount thresholds</p>
              </div>
            </div>
            {policyFeedback && (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                {policyFeedback}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Setting 1 */}
            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
              <label className="text-xs font-medium text-text-secondary block">Max WhatsApp Outreach / Wk</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={policies.maxWhatsAppPerWeek}
                  onChange={(e) => handleUpdatePolicy('maxWhatsAppPerWeek', parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface-elevated border border-border text-white text-xs font-mono focus:outline-none focus:border-primary"
                />
                <span className="text-xs text-text-muted whitespace-nowrap">msgs</span>
              </div>
              <p className="text-[10px] text-text-muted">Prevents customer message spam</p>
            </div>

            {/* Setting 2 */}
            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
              <label className="text-xs font-medium text-text-secondary block">Min Cart Value For Recovery</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step={100}
                  value={policies.minCartValue}
                  onChange={(e) => handleUpdatePolicy('minCartValue', parseFloat(e.target.value) || 500)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface-elevated border border-border text-white text-xs font-mono focus:outline-none focus:border-primary"
                />
                <span className="text-xs text-text-muted">INR</span>
              </div>
              <p className="text-[10px] text-text-muted">Threshold to justify agent cost</p>
            </div>

            {/* Setting 3 */}
            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
              <label className="text-xs font-medium text-text-secondary block">Min Inactivity Window</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step={5}
                  value={policies.minInactivityMinutes}
                  onChange={(e) => handleUpdatePolicy('minInactivityMinutes', parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface-elevated border border-border text-white text-xs font-mono focus:outline-none focus:border-primary"
                />
                <span className="text-xs text-text-muted">mins</span>
              </div>
              <p className="text-[10px] text-text-muted">Avoids premature intervention</p>
            </div>

            {/* Setting 4 */}
            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
              <label className="text-xs font-medium text-text-secondary block">Payment Approval</label>
              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-semibold text-emerald-400">Strictly Required</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  LOCKED
                </span>
              </div>
              <p className="text-[10px] text-text-muted">Zero silent charges guaranteed</p>
            </div>

          </div>
        </div>
      )}

      {/* AGENT REASONING MODAL */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-surface-elevated border border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent-cyan" />
                <h3 className="text-base font-bold text-white">Agent Reasoning Breakdown</h3>
              </div>
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="p-1 rounded text-text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-text-secondary">
              <div className="p-3 rounded-lg bg-surface border border-border space-y-1">
                <div className="text-text-muted">Target Customer:</div>
                <div className="text-sm font-bold text-white">{selectedOpportunity.customerName}</div>
                <div className="text-text-muted">Cart Value: ₹{selectedOpportunity.cartValue.toLocaleString('en-IN')}</div>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border space-y-2">
                <div className="font-bold text-primary-light">Growth Agent Decision Summary:</div>
                <p className="text-white leading-relaxed">{selectedOpportunity.reasoning}</p>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border flex items-center justify-between">
                <span>Calculated Intent Score:</span>
                <span className="text-sm font-bold text-accent-cyan">{selectedOpportunity.intentScore} / 100</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Link
                href={`/recovery?cartId=${selectedOpportunity.cartId}`}
                className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all"
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
