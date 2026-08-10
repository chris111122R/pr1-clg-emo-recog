"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Filter, ChevronDown, ChevronRight, Download,
  Microscope, CheckCircle2, Clock, AlertTriangle, X,
  BarChart3, Activity, BrainCircuit, User, Calendar
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartTooltip } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

// ── Mock Data ──────────────────────────────────────────────────────────────
interface Session {
  id: string
  subjectId: string
  date: string
  duration: string
  confidence: number
  valence: number
  arousal: number
  status: "completed" | "processing" | "error"
  modalities: string[]
  flags: number
  sparks: Array<{ t: number; v: number; a: number; c: number }>
  facsAttribution: Array<{ au: string; name: string; weight: number }>
}

const SESSIONS: Session[] = [
  {
    id: "S-001A", subjectId: "SUB-4421", date: "2026-07-19 10:32", duration: "14m 22s",
    confidence: 96.2, valence: 0.62, arousal: 0.44, status: "completed",
    modalities: ["Video", "Audio"], flags: 0,
    sparks: Array.from({ length: 20 }, (_, i) => ({
      t: i, v: 0.55 + Math.sin(i * 0.4) * 0.12,
      a: 0.4 + Math.cos(i * 0.3) * 0.1, c: 92 + Math.sin(i * 0.5) * 5
    })),
    facsAttribution: [
      { au: "AU6", name: "Cheek Raiser", weight: 0.82 },
      { au: "AU12", name: "Lip Corner Puller", weight: 0.74 },
      { au: "AU25", name: "Lips Part", weight: 0.51 },
      { au: "AU4", name: "Brow Lowerer", weight: 0.29 },
      { au: "AU1", name: "Inner Brow Raise", weight: 0.18 },
    ]
  },
  {
    id: "S-002B", subjectId: "SUB-8834", date: "2026-07-19 09:15", duration: "9m 04s",
    confidence: 88.7, valence: -0.21, arousal: 0.72, status: "completed",
    modalities: ["Video", "Audio", "Text"], flags: 1,
    sparks: Array.from({ length: 20 }, (_, i) => ({
      t: i, v: -0.1 + Math.sin(i * 0.6) * 0.2,
      a: 0.65 + Math.cos(i * 0.4) * 0.15, c: 85 + Math.sin(i * 0.7) * 8
    })),
    facsAttribution: [
      { au: "AU15", name: "Lip Corner Depressor", weight: 0.88 },
      { au: "AU17", name: "Chin Raiser", weight: 0.66 },
      { au: "AU4", name: "Brow Lowerer", weight: 0.63 },
      { au: "AU23", name: "Lip Tightener", weight: 0.41 },
      { au: "AU7", name: "Lid Tightener", weight: 0.22 },
    ]
  },
  {
    id: "S-003C", subjectId: "SUB-2217", date: "2026-07-18 16:44", duration: "22m 11s",
    confidence: 91.4, valence: 0.08, arousal: 0.31, status: "completed",
    modalities: ["Video"], flags: 0,
    sparks: Array.from({ length: 20 }, (_, i) => ({
      t: i, v: 0.05 + Math.sin(i * 0.2) * 0.08,
      a: 0.28 + Math.cos(i * 0.5) * 0.06, c: 89 + Math.sin(i * 0.3) * 4
    })),
    facsAttribution: [
      { au: "AU1", name: "Inner Brow Raise", weight: 0.55 },
      { au: "AU2", name: "Outer Brow Raise", weight: 0.49 },
      { au: "AU5", name: "Upper Lid Raiser", weight: 0.38 },
      { au: "AU26", name: "Jaw Drop", weight: 0.27 },
      { au: "AU20", name: "Lip Stretcher", weight: 0.14 },
    ]
  },
  {
    id: "S-004D", subjectId: "SUB-6612", date: "2026-07-18 14:02", duration: "—",
    confidence: 0, valence: 0, arousal: 0, status: "processing",
    modalities: ["Video", "Audio"], flags: 0,
    sparks: [], facsAttribution: []
  },
  {
    id: "S-005E", subjectId: "SUB-3390", date: "2026-07-17 11:55", duration: "7m 38s",
    confidence: 62.1, valence: -0.55, arousal: 0.85, status: "error",
    modalities: ["Audio"], flags: 3,
    sparks: Array.from({ length: 20 }, (_, i) => ({
      t: i, v: -0.5 + Math.sin(i * 0.8) * 0.25,
      a: 0.8 + Math.cos(i * 0.6) * 0.15, c: 60 + Math.sin(i * 0.9) * 12
    })),
    facsAttribution: [
      { au: "AU20", name: "Lip Stretcher", weight: 0.71 },
      { au: "AU26", name: "Jaw Drop", weight: 0.58 },
      { au: "AU4", name: "Brow Lowerer", weight: 0.44 },
      { au: "AU5", name: "Upper Lid Raiser", weight: 0.33 },
      { au: "AU7", name: "Lid Tightener", weight: 0.21 },
    ]
  },
  {
    id: "S-006F", subjectId: "SUB-9901", date: "2026-07-17 09:30", duration: "18m 47s",
    confidence: 94.8, valence: 0.48, arousal: 0.55, status: "completed",
    modalities: ["Video", "Audio", "Text"], flags: 0,
    sparks: Array.from({ length: 20 }, (_, i) => ({
      t: i, v: 0.42 + Math.sin(i * 0.35) * 0.1,
      a: 0.5 + Math.cos(i * 0.45) * 0.09, c: 93 + Math.sin(i * 0.4) * 3
    })),
    facsAttribution: [
      { au: "AU6", name: "Cheek Raiser", weight: 0.79 },
      { au: "AU12", name: "Lip Corner Puller", weight: 0.72 },
      { au: "AU25", name: "Lips Part", weight: 0.44 },
      { au: "AU2", name: "Outer Brow Raise", weight: 0.31 },
      { au: "AU1", name: "Inner Brow Raise", weight: 0.19 },
    ]
  },
]

const STATUS_CONFIG = {
  completed:  { label: "Completed",  icon: CheckCircle2, variant: "success"     as const, color: "text-success" },
  processing: { label: "Processing", icon: Clock,        variant: "info"        as const, color: "text-info" },
  error:      { label: "Error",      icon: AlertTriangle, variant: "destructive" as const, color: "text-destructive" },
}

// ── Sparkline ──────────────────────────────────────────────────────────────
function ConfidenceSparkline({ data }: { data: Array<{ t: number; c: number }> }) {
  if (!data.length) return <div className="w-24 h-10 flex items-center justify-center text-muted-foreground text-xs">—</div>
  return (
    <div className="w-24 h-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="c" stroke="hsl(var(--primary))" strokeWidth={1.5} fill="url(#confGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Detail Timeline ────────────────────────────────────────────────────────
function SessionTimeline({ session }: { session: Session }) {
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={session.sparks} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="arGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="t" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <RechartTooltip
            contentStyle={{ fontSize: 11, borderRadius: 8 }}
            formatter={(val: unknown, name: unknown) => [(Number(val)).toFixed(2), name === "v" ? "Valence" : "Arousal"] as [string, string]}
          />
          <Area type="monotone" dataKey="v" name="v" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#valGrad)" dot={false} />
          <Area type="monotone" dataKey="a" name="a" stroke="hsl(var(--info))" strokeWidth={2} fill="url(#arGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── FACS Bars ──────────────────────────────────────────────────────────────
function FACSBars({ attribution }: { attribution: Session["facsAttribution"] }) {
  return (
    <div className="space-y-2">
      {attribution.map((item) => (
        <div key={item.au} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-mono font-semibold text-primary">{item.au}</span>
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-semibold">{(item.weight * 100).toFixed(0)}%</span>
          </div>
          <Progress value={item.weight * 100} className="h-1.5" />
        </div>
      ))}
    </div>
  )
}

// ── Session Row ────────────────────────────────────────────────────────────
function SessionRow({ session, isExpanded, onToggle }: {
  session: Session
  isExpanded: boolean
  onToggle: () => void
}) {
  const sc = STATUS_CONFIG[session.status]
  const StatusIcon = sc.icon

  return (
    <>
      <tr
        className={`border-b border-border transition-colors cursor-pointer hover:bg-muted/30 ${isExpanded ? "bg-muted/20" : ""}`}
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.div>
            <span className="font-mono text-sm font-semibold text-primary">{session.id}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">{session.subjectId}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{session.date}</td>
        <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums">{session.duration}</td>
        <td className="px-4 py-3">
          <ConfidenceSparkline data={session.sparks} />
        </td>
        <td className="px-4 py-3">
          {session.status === "completed" ? (
            <span className={`text-sm font-bold tabular-nums ${
              session.confidence >= 90 ? "text-success" : session.confidence >= 75 ? "text-warning" : "text-destructive"
            }`}>
              {session.confidence.toFixed(1)}%
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {session.modalities.map(m => (
              <Badge key={m} variant="secondary" className="text-xs h-5">{m}</Badge>
            ))}
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge variant={sc.variant} className="text-xs gap-1">
            <StatusIcon className="h-3 w-3" />
            {sc.label}
          </Badge>
        </td>
        <td className="px-4 py-3">
          {session.flags > 0 && (
            <Badge variant="destructive" className="text-xs">{session.flags} flag{session.flags > 1 ? "s" : ""}</Badge>
          )}
        </td>
      </tr>

      <AnimatePresence>
        {isExpanded && session.status === "completed" && (
          <tr>
            <td colSpan={9} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                style={{ overflow: "hidden" }}
              >
                <div className="px-6 py-5 bg-muted/10 border-b border-border grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Timeline */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-sm">Valence / Arousal Timeline</h4>
                    </div>
                    <SessionTimeline session={session} />
                    <div className="flex gap-4 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-4 rounded-full bg-primary inline-block" />
                        Valence
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-4 rounded-full bg-info inline-block" />
                        Arousal
                      </span>
                    </div>
                  </div>

                  {/* FACS */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-sm">FACS Attribution</h4>
                    </div>
                    <FACSBars attribution={session.facsAttribution} />
                  </div>

                  {/* Stats */}
                  <div className="lg:col-span-2 grid grid-cols-4 gap-4 pt-3 border-t border-border">
                    {[
                      { label: "Avg Valence", value: session.valence.toFixed(2), color: session.valence >= 0 ? "text-success" : "text-destructive" },
                      { label: "Avg Arousal", value: session.arousal.toFixed(2), color: "text-info" },
                      { label: "Confidence", value: `${session.confidence.toFixed(1)}%`, color: "text-primary" },
                      { label: "Flags", value: session.flags.toString(), color: session.flags > 0 ? "text-destructive" : "text-success" },
                    ].map(stat => (
                      <div key={stat.label} className="text-center">
                        <p className={`text-xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function SessionAnalysisPage() {
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "completed" | "processing" | "error">("all")

  const filtered = SESSIONS.filter(s => {
    const matchSearch = s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.subjectId.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || s.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Microscope className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Session Analysis</h1>
            <p className="text-sm text-muted-foreground">{SESSIONS.length} sessions · Click a row to expand details</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2 h-9">
          <Download className="h-3.5 w-3.5" />
          Export All
        </Button>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { label: "Total Sessions", value: SESSIONS.length, color: "text-foreground" },
          { label: "Completed", value: SESSIONS.filter(s => s.status === "completed").length, color: "text-success" },
          { label: "Avg Confidence", value: `${(SESSIONS.filter(s => s.confidence > 0).reduce((a, b) => a + b.confidence, 0) / SESSIONS.filter(s => s.confidence > 0).length).toFixed(1)}%`, color: "text-primary" },
          { label: "Active Flags", value: SESSIONS.reduce((a, b) => a + b.flags, 0), color: "text-destructive" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.05 }}
          >
            <Card className="text-center py-4">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
      >
        <Card>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by session ID or subject…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {(["all", "completed", "processing", "error"] as const).map(s => (
                <Button
                  key={s}
                  variant={statusFilter === s ? "default" : "outline"}
                  size="sm"
                  className="h-9 capitalize"
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Session ID", "Subject", "Date", "Duration", "Confidence", "Score", "Modalities", "Status", "Flags"].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted-foreground">
                      No sessions match your filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map(session => (
                    <SessionRow
                      key={session.id}
                      session={session}
                      isExpanded={expandedId === session.id}
                      onToggle={() => setExpandedId(expandedId === session.id ? null : session.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {SESSIONS.length} sessions
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" disabled>Next</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
