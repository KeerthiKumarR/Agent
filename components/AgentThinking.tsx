"use client";

import React from "react";
import {
  Eye,
  Brain,
  ShieldCheck,
  Zap,
  CheckCircle2,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";

export interface WorkflowStepData {
  step: "OBSERVE" | "REASON" | "POLICY_CHECK" | "ACT" | "VERIFY" | "LEARN";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED" | "FAILED";
  title: string;
  description: string;
  detail?: string;
  meta?: Record<string, any>;
}

interface AgentThinkingProps {
  currentStepIndex?: number; // 0 to 5
  steps?: WorkflowStepData[];
  isThinking?: boolean;
  agentName?: string;
}

const DEFAULT_STEPS: WorkflowStepData[] = [
  {
    step: "OBSERVE",
    status: "COMPLETED",
    title: "1. OBSERVE",
    description: "Cart inactive for 45 minutes. 4 product views detected.",
    detail: "Telemetry: 7.5 mins dwell time, checkout page reached.",
  },
  {
    step: "REASON",
    status: "COMPLETED",
    title: "2. REASON",
    description: "Purchase intent score calculated at 87 / 100.",
    detail:
      "Decision: SEND_CAMPAIGN. High value order with high conversion probability.",
  },
  {
    step: "POLICY_CHECK",
    status: "COMPLETED",
    title: "3. POLICY CHECK",
    description: "Policy Engine verified: 1 / 2 weekly messages sent.",
    detail:
      "Constraints: Cart ₹4,999 > min ₹500, inactivity 45m > min 30m. Status: ALLOWED.",
  },
  {
    step: "ACT",
    status: "COMPLETED",
    title: "4. ACT",
    description:
      "Autonomous generation of personalized WhatsApp recovery message.",
    detail: "Target: Rohan Sharma (+91 98765 43210). Hero: AeroRun Waterproof.",
  },
  {
    step: "VERIFY",
    status: "COMPLETED",
    title: "5. VERIFY",
    description: "WhatsApp delivery confirmed by CampaignProvider.",
    detail: "Delivery status: DELIVERED (id: msg_098273).",
  },
  {
    step: "LEARN",
    status: "IN_PROGRESS",
    title: "6. LEARN",
    description: "Listening for customer clickthrough & cart restoration.",
    detail: "Awaiting conversion signal for reinforcement weighting.",
  },
];

export default function AgentThinking({
  currentStepIndex = 5,
  steps = DEFAULT_STEPS,
  isThinking = false,
  agentName = "CommercePilot Orchestrator",
}: AgentThinkingProps) {
  const getStepIcon = (
    step: WorkflowStepData["step"],
    status: WorkflowStepData["status"],
  ) => {
    if (status === "IN_PROGRESS") {
      return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
    }
    if (status === "BLOCKED" || status === "FAILED") {
      return <AlertCircle className="w-4 h-4 text-rose-400" />;
    }
    switch (step) {
      case "OBSERVE":
        return <Eye className="w-4 h-4 text-blue-400" />;
      case "REASON":
        return <Brain className="w-4 h-4 text-purple-400" />;
      case "POLICY_CHECK":
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      case "ACT":
        return <Zap className="w-4 h-4 text-cyan-400" />;
      case "VERIFY":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "LEARN":
        return <TrendingUp className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="rounded-xl glass-panel border border-border p-5 relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute inset-0 opacity-75" />
            <div className="w-3 h-3 rounded-full bg-emerald-500 relative" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Autonomous Agent Lifecycle
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/20 text-primary-light border border-primary/30">
                {agentName}
              </span>
            </h4>
            <p className="text-xs text-text-muted">
              Observe → Reason → Policy Check → Act → Verify → Learn
            </p>
          </div>
        </div>
        {isThinking && (
          <div className="flex items-center gap-2 text-xs text-accent-cyan font-mono font-medium animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Processing Signals...
          </div>
        )}
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {steps.map((item, idx) => {
          const isActive = idx <= currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={item.step}
              className={`p-3.5 rounded-lg border transition-all duration-300 ${
                isCurrent
                  ? "bg-primary/10 border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/40"
                  : isActive
                    ? "bg-surface-elevated/80 border-border/80 text-white"
                    : "bg-surface/40 border-border/40 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold tracking-wider text-text-primary flex items-center gap-1.5">
                  {getStepIcon(item.step, item.status)}
                  {item.title}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    item.status === "COMPLETED"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : item.status === "IN_PROGRESS"
                        ? "bg-primary/20 text-primary-light border border-primary/40 animate-pulse"
                        : item.status === "BLOCKED"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-xs font-medium text-text-secondary leading-snug mb-1">
                {item.description}
              </p>
              {item.detail && (
                <p
                  className="text-[11px] font-mono text-text-muted bg-black/30 px-2 py-1 rounded border border-white/5 truncate"
                  title={item.detail}
                >
                  {item.detail}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
