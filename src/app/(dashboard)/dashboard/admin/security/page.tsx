"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Shield, AlertTriangle, CheckCircle2, XCircle, Eye,
  Plus, Trash2, Ban, Globe, Lock
} from "lucide-react"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminPageShell } from "@/components/admin/AdminPageShell"
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import {
  SECURITY_THREATS, FAILED_LOGINS_CHART, IP_LIST,
  type SecurityThreat, type ThreatSeverity, type ThreatStatus, type IPEntry
} from "@/lib/admin-data"
import { cn } from "@/lib/utils"

const SEV_CFG: Record<ThreatSeverity, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high:     "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium:   "bg-warning/10 text-warning border-warning/20",
  low:      "bg-info/10 text-info border-info/20",
}
const STATUS_CFG: Record<ThreatStatus, { badge: string; dot: string }> = {
  active:        { badge: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive animate-pulse" },
  investigating: { badge: "bg-warning/10 text-warning border-warning/20",             dot: "bg-warning animate-pulse"    },
  resolved:      { badge: "bg-success/10 text-success border-success/20",             dot: "bg-success"                  },
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover/95 backdrop-blur-sm px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-bold text-destructive">{payload[0].value} failed logins</p>
    </div>
  )
}

export default function SecurityPage() {
  const [threats, setThreats] = React.useState<SecurityThreat[]>(SECURITY_THREATS)
  const [ipList, setIpList] = React.useState<IPEntry[]>(IP_LIST)
  const [newIP, setNewIP] = React.useState("")
  const [newReason, setNewReason] = React.useState("")
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [confirmTarget, setConfirmTarget] = React.useState<IPEntry | null>(null)
  const [resolveId, setResolveId] = React.useState<string | null>(null)

  const active = threats.filter(t => t.status === "active").length
  const investigating = threats.filter(t => t.status === "investigating").length
  const maxLogins = Math.max(...FAILED_LOGINS_CHART.map(d => d.count))

  function addBlock() {
    if (!newIP.trim()) return
    setIpList(prev => [...prev, {
      id: `ip-${Date.now()}`, ip: newIP.trim(), type: "block",
      reason: newReason || "Manually blocked", addedAt: new Date().toISOString().slice(0, 10), addedBy: "Dr. Jane Doe"
    }])
    setNewIP(""); setNewReason("")
  }

  function removeIP() {
    if (!confirmTarget) return
    setIpList(prev => prev.filter(i => i.id !== confirmTarget.id))
    setConfirmTarget(null)
  }

  function resolveThreats(id: string) {
    setThreats(prev => prev.map(t => t.id === id ? { ...t, status: "resolved" as ThreatStatus } : t))
  }

  const threatCols: AdminColumn<Record<string, unknown>>[] = [
    {
      key: "severity", header: "Severity", sortable: true,
      render: row => {
        const t = row as unknown as SecurityThreat
        return <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-bold border", SEV_CFG[t.severity])}>{t.severity.toUpperCase()}</span>
      }
    },
    {
      key: "type", header: "Type", sortable: true,
      render: row => <span className="text-sm font-medium">{(row as unknown as SecurityThreat).type}</span>
    },
    {
      key: "source", header: "Source",
      render: row => <span className="text-xs font-mono text-muted-foreground">{(row as unknown as SecurityThreat).source}</span>
    },
    {
      key: "description", header: "Description",
      render: row => <p className="text-xs text-muted-foreground truncate max-w-[280px]">{(row as unknown as SecurityThreat).description}</p>
    },
    {
      key: "timestamp", header: "Time", sortable: true, nowrap: true,
      render: row => <span className="text-xs text-muted-foreground">{(row as unknown as SecurityThreat).timestamp}</span>
    },
    {
      key: "status", header: "Status", sortable: true,
      render: row => {
        const t = row as unknown as SecurityThreat
        const cfg = STATUS_CFG[t.status]
        return (
          <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border", cfg.badge)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
            {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
          </span>
        )
      }
    },
    {
      key: "actions", header: "", align: "right", width: "80px",
      render: row => {
        const t = row as unknown as SecurityThreat
        if (t.status === "resolved") return null
        return (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-success border-success/30 hover:bg-success/10"
            onClick={e => { e.stopPropagation(); resolveThreats(t.id) }}>
            <CheckCircle2 className="h-3 w-3" />Resolve
          </Button>
        )
      }
    },
  ]

  const ipCols: AdminColumn<Record<string, unknown>>[] = [
    {
      key: "ip", header: "IP / CIDR", sortable: true,
      render: row => <span className="text-sm font-mono font-medium">{(row as unknown as IPEntry).ip}</span>
    },
    {
      key: "type", header: "Rule", sortable: true,
      render: row => {
        const e = row as unknown as IPEntry
        return (
          <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border",
            e.type === "allow" ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20")}>
            {e.type === "allow" ? <Globe className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
            {e.type.toUpperCase()}
          </span>
        )
      }
    },
    { key: "reason",  header: "Reason",   render: row => <span className="text-xs text-muted-foreground">{(row as unknown as IPEntry).reason}</span> },
    { key: "addedBy", header: "Added By", sortable: true, render: row => <span className="text-xs">{(row as unknown as IPEntry).addedBy}</span> },
    { key: "addedAt", header: "Date",     sortable: true, nowrap: true, render: row => <span className="text-xs text-muted-foreground">{(row as unknown as IPEntry).addedAt}</span> },
    {
      key: "del", header: "", align: "right", width: "48px",
      render: row => {
        const e = row as unknown as IPEntry
        return (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={e2 => { e2.stopPropagation(); setConfirmTarget(e); setConfirmOpen(true) }}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )
      }
    },
  ]

  return (
    <AdminPageShell
      title="Security Dashboard"
      description="Active threat monitoring, failed login analytics, and IP access control."
      badge={active > 0
        ? <Badge variant="destructive" className="gap-1 animate-pulse"><AlertTriangle className="h-3 w-3" />{active} Active Threat{active > 1 ? "s" : ""}</Badge>
        : <Badge variant="success" className="gap-1"><Shield className="h-3 w-3" />No Active Threats</Badge>}
    >
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active Threats",    value: active,          color: "text-destructive", bg: "bg-destructive/10", icon: AlertTriangle },
          { label: "Investigating",     value: investigating,    color: "text-warning",     bg: "bg-warning/10",     icon: Eye           },
          { label: "Resolved (24h)",    value: threats.filter(t => t.status === "resolved").length, color: "text-success", bg: "bg-success/10", icon: CheckCircle2 },
          { label: "Blocked IPs",       value: ipList.filter(i => i.type === "block").length, color: "text-info",  bg: "bg-info/10",    icon: Ban           },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card><CardContent className="p-4 flex items-center gap-3">
              <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", s.bg)}>
                <s.icon className={cn("h-4.5 w-4.5", s.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      {/* Failed Logins Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Failed Login Attempts — Last 24h</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Spike at 16:00 from brute-force attack (auto-blocked)</p>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FAILED_LOGINS_CHART} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {FAILED_LOGINS_CHART.map((entry, i) => (
                    <Cell key={i} fill={entry.count > 100 ? "hsl(var(--destructive))" : entry.count > 30 ? "hsl(var(--warning))" : "hsl(var(--primary))"} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Threat table */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Threat Intelligence</h2>
        <AdminTable columns={threatCols} rows={threats as unknown as Record<string, unknown>[]} searchKeys={["type", "source", "description"]} searchPlaceholder="Search threats…" defaultPageSize={5} emptyTitle="No threats detected" />
      </div>

      {/* IP List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">IP Allow / Block List</h2>
        </div>
        <Card className="mb-3">
          <CardContent className="p-3 flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[140px]">
              <p className="text-xs text-muted-foreground mb-1">IP Address / CIDR</p>
              <Input value={newIP} onChange={e => setNewIP(e.target.value)} placeholder="e.g. 1.2.3.4 or 10.0.0.0/8" className="h-8 text-xs" />
            </div>
            <div className="flex-1 min-w-[140px]">
              <p className="text-xs text-muted-foreground mb-1">Reason</p>
              <Input value={newReason} onChange={e => setNewReason(e.target.value)} placeholder="Reason for block" className="h-8 text-xs" />
            </div>
            <Button onClick={addBlock} disabled={!newIP} className="h-8 gap-1.5 text-xs shrink-0">
              <Ban className="h-3.5 w-3.5" />Block IP
            </Button>
          </CardContent>
        </Card>
        <AdminTable columns={ipCols} rows={ipList as unknown as Record<string, unknown>[]} searchKeys={["ip", "reason", "addedBy"]} searchPlaceholder="Search IPs…" defaultPageSize={6} emptyTitle="No IP rules" />
      </div>

      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={removeIP} variant="delete" title="Remove IP Rule?" description={`Remove the rule for "${confirmTarget?.ip}"? Traffic from this address will no longer be ${confirmTarget?.type}ed.`} />
    </AdminPageShell>
  )
}
