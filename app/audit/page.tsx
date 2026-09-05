"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  RotateCcw,
  Search,
  X,
  Code2,
  Download,
  Clock,
} from "lucide-react";
import AuditBadge from "@/components/AuditBadge";
import { AuditLogEntry } from "@/lib/types";

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
    { label: "All", value: "ALL" },
    { label: "Events", value: "EVENT" },
    { label: "Reasoning", value: "REASONING" },
    { label: "Policy", value: "POLICY" },
    { label: "Actions", value: "ACTION" },
    { label: "Success", value: "SUCCESS" },
    { label: "Failures", value: "FAILURE" },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272a]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-zinc-300" />
              Explainable Audit Trail
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold uppercase">
              Chronological Ledger
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Every signal, reasoning factor, policy check, and bounded payment recorded with explainability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-zinc-800 border border-[#27272a] text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={fetchLogs}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#121214] p-2.5 rounded-xl border border-[#27272a]">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, agent, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === opt.value
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* TIMELINE LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
          <span>Showing {filteredLogs.length} Records</span>
          <span className="font-mono text-zinc-500">Live Append Active</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 bg-[#121214] rounded-xl border border-[#27272a]">
            No audit records matching criteria.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-[#121214] border border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <AuditBadge type={log.type} size="sm" />
                    {log.agent && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {log.agent}
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white">
                    {log.title}
                  </h4>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {log.detail}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {log.payload && (
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2.5 py-1 rounded bg-[#18181b] hover:bg-zinc-800 border border-[#27272a] text-xs text-zinc-300 hover:text-white font-mono flex items-center gap-1 transition-colors"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Payload</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-[#121214] border border-[#27272a] rounded-xl shadow-2xl p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
              <div className="flex items-center gap-2">
                <AuditBadge type={selectedLog.type} size="sm" />
                <h3 className="text-xs font-semibold text-white truncate max-w-sm">
                  {selectedLog.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
              <div className="text-xs text-zinc-300">
                <span className="font-semibold text-white">Detail: </span>
                {selectedLog.detail}
              </div>

              <div className="text-xs text-zinc-500 font-mono">
                Timestamp: {selectedLog.timestamp}
              </div>

              <div className="space-y-1 pt-2">
                <div className="text-xs font-mono font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-zinc-400" />
                  Structured Payload (JSON):
                </div>
                <pre className="text-[11px] font-mono text-zinc-300 bg-[#09090b] p-3 rounded-lg overflow-x-auto border border-[#27272a] leading-relaxed max-h-[340px]">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 border-t border-[#27272a] flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-3 py-1.5 rounded bg-[#18181b] text-xs font-medium text-zinc-300 hover:text-white border border-[#27272a]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
