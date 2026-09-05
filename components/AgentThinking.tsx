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
  currentStepIndex?: number;
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
      return <Loader2 className="w-3.5 h-3.5 text-zinc-300 animate-spin" />;
    }
    if (status === "BLOCKED" || status === "FAILED") {
      return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
    }
    switch (step) {
      case "OBSERVE":
        return <Eye className="w-3.5 h-3.5 text-zinc-300" />;
      case "REASON":
        return <Brain className="w-3.5 h-3.5 text-zinc-300" />;
      case "POLICY_CHECK":
        return <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />;
      case "ACT":
        return <Zap className="w-3.5 h-3.5 text-zinc-300" />;
      case "VERIFY":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case "LEARN":
        return <TrendingUp className="w-3.5 h-3.5 text-zinc-300" />;
    }
  };

  return (
    <div className="rounded-xl bg-[#121214] border border-[#27272a] p-5">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#27272a]">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wide uppercase flex items-center gap-2">
              Autonomous Agent Lifecycle
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                {agentName}
              </span>
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Observe → Reason → Policy Check → Act → Verify → Learn
            </p>
          </div>
        </div>
        {isThinking && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
            Analyzing telemetry...
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
              className={`p-3.5 rounded-lg border transition-colors ${
                isCurrent
                  ? "bg-[#18181b] border-zinc-500 shadow-sm"
                  : isActive
                    ? "bg-[#141416] border-[#27272a] text-white"
                    : "bg-[#0f0f11] border-[#27272a]/50 opacity-40"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-medium tracking-wide text-zinc-200 flex items-center gap-1.5">
                  {getStepIcon(item.step, item.status)}
                  {item.title}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-medium ${
                    item.status === "COMPLETED"
                      ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50"
                      : item.status === "IN_PROGRESS"
                        ? "bg-zinc-800 text-zinc-200 border border-zinc-600"
                        : item.status === "BLOCKED"
                          ? "bg-red-950/60 text-red-400 border border-red-800/50"
                          : "bg-zinc-900 text-zinc-500"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-snug mb-1">
                {item.description}
              </p>
              {item.detail && (
                <p
                  className="text-[11px] font-mono text-zinc-400 bg-black/40 px-2 py-1 rounded border border-white/5 truncate"
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
