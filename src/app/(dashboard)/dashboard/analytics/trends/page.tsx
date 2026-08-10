"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, TrendingDown, Minus, Info } from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  Tooltip as RechartTooltip, CartesianGrid, Legend, Cell
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// ── Mock trend data ────────────────────────────────────────────────────────
function genTrend(days: number, baseV: number, baseA: number) {
  return Array.from({ length: days }, (_, i) => {
    const noise = () => (Math.random() - 0.5) * 0.18
    return {
      date: (() => {
        const d = new Date("2026-07-19")
        d.setDate(d.getDate() - (days - 1 - i))
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      })(),
      valence:    parseFloat((baseV + noise()).toFixed(3)),
      arousal:    parseFloat((baseA + noise()).toFixed(3)),
      confidence: parseFloat((88 + Math.sin(i * 0.4) * 7).toFixed(1)),
      sessions:   Math.floor(3 + Math.random() * 5),
    }
  })
}

const RANGE_DATA = {
  "7D":  genTrend(7,  0.28, 0.46),
  "30D": genTrend(30, 0.24, 0.48),
  "90D": genTrend(90, 0.19, 0.50),
}

const CLUSTER_DATA = [
  { name: "Joy",      value: 31, color: "#22c55e" },
  { name: "Neutral",  value: 24, color: "#94a3b8" },
  { name: "Surprise", value: 18, color: "#3b82f6" },
  { name: "Sadness",  value: 12, color: "#f97316" },
  { name: "Fear",     value:  8, color: "#a855f7" },
  { name: "Anger",    value:  7, color: "#ef4444" },
]

const DELTA_DATA = [
  { session: "S-001A", valence: 0.62, vDelta: +0.14, arousal: 0.44, aDelta: -0.06, confidence: 96.2 },
  { session: "S-002B", valence:-0.21, vDelta: -0.08, arousal: 0.72, aDelta: +0.18, confidence: 88.7 },
  { session: "S-003C", valence: 0.08, vDelta: +0.03, arousal: 0.31, aDelta: -0.02, confidence: 91.4 },
  { session: "S-006F", valence: 0.48, vDelta: +0.11, arousal: 0.55, aDelta: +0.09, confidence: 94.8 },
]

// ── Delta arrow ────────────────────────────────────────────────────────────
function Delta({ value }: { value: number }) {
  if (Math.abs(value) < 0.005) return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
  return value > 0
    ? <TrendingUp className="h-3.5 w-3.5 text-success inline" />
    : <TrendingDown className="h-3.5 w-3.5 text-destructive inline" />
}

// ── Custom tooltip ─────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border bg-card shadow-lg px-3 py-2 text-xs space-y-1">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground">{p.name}</span>
          </span>
          <span className="font-mono font-semibold">{Number(p.value).toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Insight card ───────────────────────────────────────────────────────────
function InsightCard({ title, body, variant }: { title: string; body: string; variant: "positive" | "neutral" | "warning" }) {
  const styles = {
    positive: "border-success/30 bg-success/5",
    neutral:  "border-border bg-muted/20",
    warning:  "border-warning/30 bg-warning/5",
  }
  return (
    <div className={`rounded-xl border p-4 space-y-1 ${styles[variant]}`}>
      <div className="flex items-center gap-2">
        <Info className={`h-4 w-4 ${variant === "positive" ? "text-success" : variant === "warning" ? "text-warning" : "text-muted-foreground"}`} />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function EmotionTrendsPage() {
  const [range, setRange] = React.useState<"7D" | "30D" | "90D">("30D")
  const data = RANGE_DATA[range]
  const avgValence    = data.reduce((a, b) => a + b.valence, 0)    / data.length
  const avgArousal    = data.reduce((a, b) => a + b.arousal, 0)    / data.length
  const avgConfidence = data.reduce((a, b) => a + b.confidence, 0) / data.length

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Emotion Trends</h1>
            <p className="text-sm text-muted-foreground">Longitudinal analysis across all sessions</p>
          </div>
        </div>
        {/* Range tabs */}
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(["7D","30D","90D"] as const).map(r => (
            <button key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                range === r ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </motion.div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Avg Valence",    value: avgValence.toFixed(3),    color: avgValence >= 0 ? "text-success" : "text-destructive" },
          { label: "Avg Arousal",    value: avgArousal.toFixed(3),    color: "text-info" },
          { label: "Avg Confidence", value: `${avgConfidence.toFixed(1)}%`, color: "text-primary" },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}>
            <Card className="text-center py-4">
              <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Multi-line area chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Valence · Arousal · Confidence over time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <defs>
                    {[
                      { id:"vGrad", color:"hsl(var(--success))" },
                      { id:"aGrad", color:"hsl(var(--info))" },
                      { id:"cGrad", color:"hsl(var(--primary))" },
                    ].map(g => (
                      <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={g.color} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                    interval={Math.floor(data.length / 5)} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <RechartTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="valence" name="Valence"
                    stroke="hsl(var(--success))" strokeWidth={2} fill="url(#vGrad)" dot={false} />
                  <Area type="monotone" dataKey="arousal" name="Arousal"
                    stroke="hsl(var(--info))" strokeWidth={2} fill="url(#aGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Emotion cluster distribution */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Emotion Cluster Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CLUSTER_DATA} layout="vertical" margin={{ left: 0, right: 24 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                      tickFormatter={v => `${v}%`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} tickLine={false} axisLine={false} />
                    <RechartTooltip formatter={(v: unknown) => [`${v}%`, "Share"]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                      {CLUSTER_DATA.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Session comparison table */}
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Session-to-session Deltas</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="pb-2 text-left font-semibold">Session</th>
                    <th className="pb-2 text-right font-semibold">Valence</th>
                    <th className="pb-2 text-right font-semibold">Δ</th>
                    <th className="pb-2 text-right font-semibold">Arousal</th>
                    <th className="pb-2 text-right font-semibold">Δ</th>
                    <th className="pb-2 text-right font-semibold">Conf.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {DELTA_DATA.map(row => (
                    <tr key={row.session} className="text-xs">
                      <td className="py-2.5 font-mono font-semibold text-primary">{row.session}</td>
                      <td className="py-2.5 text-right tabular-nums">{row.valence >= 0 ? "+" : ""}{row.valence.toFixed(2)}</td>
                      <td className="py-2.5 text-right"><Delta value={row.vDelta} /></td>
                      <td className="py-2.5 text-right tabular-nums">{row.arousal.toFixed(2)}</td>
                      <td className="py-2.5 text-right"><Delta value={row.aDelta} /></td>
                      <td className={`py-2.5 text-right font-semibold tabular-nums ${row.confidence >= 90 ? "text-success" : "text-warning"}`}>
                        {row.confidence}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Insights */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InsightCard variant="positive"
          title="Positive valence trend"
          body={`Average valence over the ${range} window is ${avgValence >= 0 ? "positive" : "negative"} (${avgValence >= 0 ? "+" : ""}${avgValence.toFixed(3)}), indicating predominantly favourable affective states.`}
        />
        <InsightCard variant="neutral"
          title="Stable arousal levels"
          body={`Arousal range spans ${(Math.max(...data.map(d=>d.arousal)) - Math.min(...data.map(d=>d.arousal))).toFixed(2)} units. Moderate variance suggests consistent engagement levels.`}
        />
        <InsightCard variant="warning"
          title="Session S-002B outlier"
          body="S-002B shows negative valence (−0.21) with high arousal (0.72) — a stress-adjacent profile. Consider flagging for clinical review."
        />
      </motion.div>
    </div>
  )
}
