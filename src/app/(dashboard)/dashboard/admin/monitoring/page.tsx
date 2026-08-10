"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Activity, Cpu, Clock, Layers, CheckCircle2,
  AlertTriangle, Server, Zap, ArrowUpRight
} from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, LineChart, Line
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AdminPageShell } from "@/components/admin/AdminPageShell"
import { MONITORING_TIMESERIES, SERVICE_HEALTH } from "@/lib/admin-data"
import { cn } from "@/lib/utils"

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover/95 backdrop-blur-sm px-3 py-2 shadow-xl text-xs space-y-1">
      <p className="text-muted-foreground font-medium">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function MonitorStatCard({ icon: Icon, label, value, sub, color, bg, delay = 0 }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub?: string
  color: string
  bg: string
  delay?: number
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", bg)}>
              <Icon className={cn("h-4.5 w-4.5", color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold tracking-tight mt-0.5">{value}</p>
              {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Service Health ───────────────────────────────────────────────────────────

function ServiceHealthGrid() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Service Health</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {SERVICE_HEALTH.map((svc, i) => (
            <motion.div
              key={svc.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.04 }}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  svc.status === "healthy" ? "bg-success" : "bg-warning animate-pulse"
                )} />
                <span className="text-sm font-medium truncate">{svc.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted-foreground font-mono">{svc.latency}ms</span>
                <Progress
                  value={svc.uptime}
                  className="w-20 h-1.5"
                />
                <span className="text-xs font-medium w-14 text-right">{svc.uptime}%</span>
                <Badge
                  variant={svc.status === "healthy" ? "success" : "warning"}
                  className="text-xs px-1.5"
                >
                  {svc.status}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MonitoringPage() {
  const degradedCount = SERVICE_HEALTH.filter(s => s.status === "degraded").length
  const totalRequests = MONITORING_TIMESERIES.reduce((s, d) => s + d.requests, 0)
  const totalErrors   = MONITORING_TIMESERIES.reduce((s, d) => s + d.errors, 0)
  const errorRate     = ((totalErrors / totalRequests) * 100).toFixed(2)

  return (
    <AdminPageShell
      title="System Monitoring"
      description="Real-time health overview of all platform services and infrastructure."
      badge={
        degradedCount > 0
          ? <Badge variant="warning" className="gap-1"><AlertTriangle className="h-3 w-3" />{degradedCount} Degraded</Badge>
          : <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" />All Systems Healthy</Badge>
      }
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MonitorStatCard icon={Activity}  label="System Uptime"      value="99.94%"        sub="30-day rolling"      color="text-success"     bg="bg-success/10"     delay={0}    />
        <MonitorStatCard icon={Zap}       label="Error Rate"          value={`${errorRate}%`} sub="Last 24 hours"    color="text-destructive" bg="bg-destructive/10" delay={0.06} />
        <MonitorStatCard icon={Cpu}       label="Active Sessions"     value="47"            sub="vs 50 max"           color="text-primary"     bg="bg-primary/10"     delay={0.12} />
        <MonitorStatCard icon={Layers}    label="Queue Depth"         value="8"             sub="50 capacity"         color="text-info"        bg="bg-info/10"        delay={0.18} />
      </div>

      {/* Main charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Requests chart */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div>
              <CardTitle className="text-base">API Requests</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Rolling 24h · requests per hour</p>
            </div>
            <Badge variant="success" className="shrink-0">Live</Badge>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONITORING_TIMESERIES} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="requests" name="Requests" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#reqGrad)" dot={false} activeDot={{ r: 4, fill: "hsl(var(--primary))" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Error rate + latency chart */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div>
              <CardTitle className="text-base">Errors & Latency</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Error count and avg response time (ms)</p>
            </div>
            <Badge variant="info" className="shrink-0">24h</Badge>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MONITORING_TIMESERIES} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis yAxisId="errors" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="latency" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}ms`} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
                  <Line yAxisId="errors"  type="monotone" dataKey="errors"  name="Errors"   stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line yAxisId="latency" type="monotone" dataKey="latency" name="Latency"  stroke="hsl(var(--warning))"     strokeWidth={1.5} dot={false} strokeDasharray="4 2" activeDot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service health grid */}
      <ServiceHealthGrid />
    </AdminPageShell>
  )
}
