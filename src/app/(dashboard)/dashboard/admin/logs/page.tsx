"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, ChevronRight, Server, AlertTriangle,
  Info, AlertCircle, Bug, Terminal
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { AdminPageShell } from "@/components/admin/AdminPageShell"
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable"
import { SYSTEM_LOGS, type LogEntry, type LogSeverity } from "@/lib/admin-data"
import { cn } from "@/lib/utils"

// ─── Severity config ──────────────────────────────────────────────────────────

const SEV_CONFIG: Record<LogSeverity, {
  label: string; icon: React.ComponentType<{ className?: string }>;
  badge: string; row: string; dot: string
}> = {
  critical: { label: "Critical", icon: AlertCircle,   badge: "bg-destructive/10 text-destructive border-destructive/20", row: "bg-destructive/5 hover:bg-destructive/8", dot: "bg-destructive" },
  error:    { label: "Error",    icon: AlertTriangle,  badge: "bg-orange-500/10 text-orange-500 border-orange-500/20",    row: "bg-orange-500/5 hover:bg-orange-500/8", dot: "bg-orange-500" },
  warning:  { label: "Warning",  icon: AlertTriangle,  badge: "bg-warning/10 text-warning border-warning/20",             row: "hover:bg-muted/40",                     dot: "bg-warning"    },
  info:     { label: "Info",     icon: Info,           badge: "bg-info/10 text-info border-info/20",                      row: "hover:bg-muted/40",                     dot: "bg-info"       },
  debug:    { label: "Debug",    icon: Bug,            badge: "bg-muted text-muted-foreground border-border",             row: "hover:bg-muted/40",                     dot: "bg-muted-foreground" },
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function LogDetailDrawer({ log, onClose }: { log: LogEntry | null; onClose: () => void }) {
  if (!log) return null
  const sev = SEV_CONFIG[log.severity]
  const SevIcon = sev.icon

  return (
    <AnimatePresence>
      {log && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[520px] bg-card border-l border-border flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2.5">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", sev.badge)}>
                  <SevIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{log.service}</p>
                  <p className="text-xs text-muted-foreground font-mono">{log.timestamp}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Message</p>
                <p className="text-sm font-medium leading-relaxed">{log.message}</p>
              </div>

              <div className={cn("rounded-lg border p-4", sev.badge)}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2">Details</p>
                <p className="text-sm leading-relaxed">{log.details}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Severity",  value: sev.label },
                  { label: "Service",   value: log.service },
                  { label: "Trace ID",  value: log.traceId },
                  { label: "User",      value: log.userId ?? "system" },
                  { label: "IP",        value: log.ip ?? "—" },
                  { label: "Log ID",    value: log.id },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-muted/40 px-3 py-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className="text-xs font-mono mt-0.5 break-all">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-border shrink-0">
              <Button variant="outline" size="sm" onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LogsPage() {
  const [severityFilter, setSeverityFilter] = React.useState<LogSeverity | "all">("all")
  const [selectedLog, setSelectedLog] = React.useState<LogEntry | null>(null)

  const filtered = severityFilter === "all"
    ? SYSTEM_LOGS
    : SYSTEM_LOGS.filter(l => l.severity === severityFilter)

  const counts = {
    critical: SYSTEM_LOGS.filter(l => l.severity === "critical").length,
    error:    SYSTEM_LOGS.filter(l => l.severity === "error").length,
    warning:  SYSTEM_LOGS.filter(l => l.severity === "warning").length,
    info:     SYSTEM_LOGS.filter(l => l.severity === "info").length,
    debug:    SYSTEM_LOGS.filter(l => l.severity === "debug").length,
  }

  const columns: AdminColumn<Record<string, unknown>>[] = [
    {
      key: "severity",
      header: "Severity",
      sortable: true,
      nowrap: true,
      render: (row) => {
        const log = row as unknown as LogEntry
        const sev = SEV_CONFIG[log.severity]
        const SevIcon = sev.icon
        return (
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border",
            sev.badge
          )}>
            <SevIcon className="h-3 w-3" />
            {sev.label}
          </span>
        )
      }
    },
    {
      key: "timestamp",
      header: "Timestamp",
      sortable: true,
      nowrap: true,
      render: (row) => (
        <span className="text-xs font-mono text-muted-foreground">
          {(row as unknown as LogEntry).timestamp}
        </span>
      )
    },
    {
      key: "service",
      header: "Service",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Server className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-xs font-medium">{(row as unknown as LogEntry).service}</span>
        </div>
      )
    },
    {
      key: "message",
      header: "Message",
      render: (row) => (
        <p className="text-sm truncate max-w-[340px]">{(row as unknown as LogEntry).message}</p>
      )
    },
    {
      key: "arrow",
      header: "",
      width: "32px",
      render: () => <ChevronRight className="h-4 w-4 text-muted-foreground" />
    },
  ]

  return (
    <>
      <AdminPageShell
        title="System Logs"
        description="Operational event log from all platform services. Click any row for full details."
      >
        {/* Severity summary chips */}
        <div className="flex flex-wrap gap-2">
          {(Object.entries(counts) as [LogSeverity, number][]).map(([sev, count]) => {
            const cfg = SEV_CONFIG[sev]
            const SevIcon = cfg.icon
            return (
              <button
                key={sev}
                onClick={() => setSeverityFilter(severityFilter === sev ? "all" : sev)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                  severityFilter === sev ? cfg.badge : "bg-card text-muted-foreground border-border hover:border-muted-foreground/30"
                )}
              >
                <SevIcon className="h-3 w-3" />
                {cfg.label} ({count})
              </button>
            )
          })}
          {severityFilter !== "all" && (
            <button
              onClick={() => setSeverityFilter("all")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-muted-foreground border border-border hover:bg-muted/40"
            >
              <X className="h-3 w-3" /> Clear filter
            </button>
          )}
        </div>

        <AdminTable
          columns={columns}
          rows={filtered as unknown as Record<string, unknown>[]}
          searchPlaceholder="Search logs…"
          searchKeys={["message", "service", "traceId"]}
          defaultPageSize={10}
          onRowClick={row => setSelectedLog(row as unknown as LogEntry)}
          emptyTitle="No log entries"
          emptyDescription="Try changing the severity filter."
        />
      </AdminPageShell>

      <LogDetailDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
    </>
  )
}
