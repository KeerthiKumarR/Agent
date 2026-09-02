"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Filter,
  RotateCcw,
  Search,
  ChevronRight,
  Eye,
  X,
  Code2,
  ShieldCheck,
  Sparkles,
  Download,
  Clock,
} from "lucide-react";
import AuditBadge from "@/components/AuditBadge";
import { AuditLogEntry, AuditLogType } from "@/lib/types";

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/audit");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  const filterOptions = [
    { label: "All Logs", value: "ALL" },
    { label: "Customer Events", value: "EVENT" },
    { label: "Agent Reasoning", value: "REASONING" },
    { label: "Policy Checks", value: "POLICY" },
    { label: "Agent Actions", value: "ACTION" },
    { label: "Successes", value: "SUCCESS" },
    { label: "Failures / Blocked", value: "FAILURE" },
  ];

  const filteredLogs = logs.filter((log) => {
    if (activeFilter !== "ALL" && log.type !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.title.toLowerCase().includes(q) ||
        log.detail.toLowerCase().includes(q) ||
        (log.agent && log.agent.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commercepilot-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary-light" />
              Immutable Explainable Audit Trail
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
              Chronological Ledger
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Every customer signal, reasoning factor, policy boundary decision,
            and payment action recorded with complete explainability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3.5 py-1.5 rounded-lg bg-surface hover:bg-surface-elevated border border-border text-xs text-text-secondary hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={fetchLogs}
            className="px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary text-primary-light hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface p-2.5 rounded-2xl border border-border">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action, agent, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === opt.value
                  ? "bg-primary text-white shadow-sm shadow-primary/20"
                  : "text-text-muted hover:text-white hover:bg-surface-elevated"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* TIMELINE LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-text-muted px-1">
          <span>Showing {filteredLogs.length} Recorded System Entries</span>
          <span className="font-mono text-emerald-400">Live Append Active</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-muted glass-panel rounded-2xl">
            No audit records matching criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl glass-panel border border-border/80 hover:border-primary/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <AuditBadge type={log.type} size="sm" />
                    {log.agent && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/20 text-primary-light border border-primary/30">
                        {log.agent}
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleTimeString()} •{" "}
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-primary-light transition-colors">
                    {log.title}
                  </h4>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    {log.detail}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {log.payload && (
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface border border-border text-xs text-accent-cyan hover:text-white font-mono flex items-center gap-1.5 transition-all"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Inspect Payload</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DEEP-DIVE PAYLOAD INSPECTOR MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-surface-elevated border border-border rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <AuditBadge type={selectedLog.type} size="sm" />
                <h3 className="text-sm font-bold text-white truncate max-w-sm">
                  {selectedLog.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded text-text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
              <div className="text-xs text-text-secondary">
                <span className="font-bold text-white">Detail: </span>
                {selectedLog.detail}
              </div>

              <div className="text-xs text-text-muted font-mono">
                Timestamp: {selectedLog.timestamp}
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-accent-cyan" />
                  Structured Event Payload (JSON):
                </div>
                <pre className="text-[11px] font-mono text-emerald-300 bg-[#060910] p-4 rounded-xl overflow-x-auto border border-border/80 leading-relaxed max-h-[380px]">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-lg bg-surface text-xs font-semibold text-white hover:bg-border border border-border"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
