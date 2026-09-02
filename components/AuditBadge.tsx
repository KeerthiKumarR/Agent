import React from 'react';
import { AuditLogType } from '@/lib/types';
import { 
  Bell, 
  Brain, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface AuditBadgeProps {
  type: AuditLogType | string;
  size?: 'sm' | 'md';
}

export default function AuditBadge({ type, size = 'md' }: AuditBadgeProps) {
  const getBadgeConfig = () => {
    switch (type) {
      case 'EVENT':
        return {
          label: 'CUSTOMER EVENT',
          icon: Bell,
          className: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
        };
      case 'REASONING':
        return {
          label: 'AGENT REASONING',
          icon: Brain,
          className: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
        };
      case 'POLICY':
        return {
          label: 'POLICY CHECK',
          icon: ShieldCheck,
          className: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        };
      case 'ACTION':
        return {
          label: 'AGENT ACTION',
          icon: Zap,
          className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
        };
      case 'SUCCESS':
        return {
          label: 'SUCCESS',
          icon: CheckCircle2,
          className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        };
      case 'FAILURE':
        return {
          label: 'FAILURE / BLOCKED',
          icon: XCircle,
          className: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        };
      default:
        return {
          label: type,
          icon: AlertTriangle,
          className: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;
  const isSmall = size === 'sm';

  return (
    <span className={`inline-flex items-center gap-1 font-mono font-semibold uppercase rounded border ${
      isSmall ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1'
    } ${config.className}`}>
      <Icon className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {config.label}
    </span>
  );
}
