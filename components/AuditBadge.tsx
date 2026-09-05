import React from "react";
import { AuditLogType } from "@/lib/types";
import {
  Bell,
  Brain,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface AuditBadgeProps {
  type: AuditLogType | string;
  size?: "sm" | "md";
}

export default function AuditBadge({ type, size = "md" }: AuditBadgeProps) {
  const getBadgeConfig = () => {
    switch (type) {
      case "EVENT":
        return {
          label: "EVENT",
          icon: Bell,
          className: "bg-zinc-800 text-zinc-300 border-zinc-700",
        };
      case "REASONING":
        return {
          label: "REASONING",
          icon: Brain,
          className: "bg-zinc-800 text-zinc-300 border-zinc-700",
        };
      case "POLICY":
        return {
          label: "POLICY CHECK",
          icon: ShieldCheck,
          className: "bg-amber-950/60 text-amber-400 border-amber-800/50",
        };
      case "ACTION":
        return {
          label: "ACTION",
          icon: Zap,
          className: "bg-zinc-800 text-white border-zinc-600",
        };
      case "SUCCESS":
        return {
          label: "SUCCESS",
          icon: CheckCircle2,
          className: "bg-emerald-950/60 text-emerald-400 border-emerald-800/50",
        };
      case "FAILURE":
        return {
          label: "FAILURE / BLOCKED",
          icon: XCircle,
          className: "bg-red-950/60 text-red-400 border-red-800/50",
        };
      default:
        return {
          label: type,
          icon: AlertTriangle,
          className: "bg-zinc-800 text-zinc-400 border-zinc-700",
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;
  const isSmall = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-medium uppercase rounded border ${
        isSmall ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5"
      } ${config.className}`}
    >
      <Icon className={isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {config.label}
    </span>
  );
}
