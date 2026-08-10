"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Radio, Square, AlertTriangle, CheckCircle2, Clock, Volume2 } from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer,
  ReferenceLine, Tooltip as RechartTooltip
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// ── Types ──────────────────────────────────────────────────────────────────
interface DataPoint {
  t: string
  valence: number
  arousal: number
  confidence: number
  ts: number
}

interface EventLog {
  id: string
  ts: string
  type: "info" | "warning" | "success"
  message: string
}

// ── Seed initial history ───────────────────────────────────────────────────
function generatePoint(t: number): DataPoint {
  return {
    t: `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`,
    ts: t,
    valence:    parseFloat((0.1 + Math.sin(t * 0.12) * 0.45).toFixed(3)),
    arousal:    parseFloat((0.5 + Math.cos(t * 0.09) * 0.35).toFixed(3)),
    confidence: parseFloat((88 + Math.sin(t * 0.15) * 8).toFixed(1)),
  }
}

const INITIAL_HISTORY: DataPoint[] = Array.from({ length: 30 }, (_, i) => generatePoint(i * 2))

const INITIAL_EVENTS: EventLog[] = [
  { id: "e1", ts: "00:00", type: "info",    message: "Stream initialised — Multimodal Fusion v2.4.1" },
  { id: "e2", ts: "00:14", type: "success", message: "Calibration complete — baseline established" },
  { id: "e3", ts: "00:42", type: "warning", message: "Low-light condition detected — visual confidence reduced" },
  { id: "e4", ts: "01:08", type: "info",    message: "Vocal pitch variance above baseline +22%" },
  { id: "e5", ts: "01:33", type: "success", message: "Confidence restored — 94.2%" },
]

const EVENT_ICON = { info: Clock, warning: AlertTriangle, success: CheckCircle2 }
const EVENT_COLOR = { info: "text-info", warning: "text-warning", success: "text-success" }

// ── Animated readout ───────────────────────────────────────────────────────
function AnimatedNumber({ value, unit = "", decimals = 2, color = "text-foreground" }: {
  value: number; unit?: string; decimals?: number; color?: string
}) {
  return (
    <motion.span
      key={value.toFixed(decimals)}
      initial={{ opacity: 0.4, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`text-3xl font-bold tabular-nums tracking-tight ${color}`}
    >
      {value >= 0 && unit !== "%" ? "+" : ""}{value.toFixed(decimals)}{unit}
    </motion.span>
  )
}

// ── Video Feed Placeholder ─────────────────────────────────────────────────
function VideoFeed({ running }: { running: boolean }) {
  const [frame, setFrame] = React.useState(0)
  React.useEffect(() => {
    if (!running) return
    const id = setInterval(() => setFrame(f => (f + 1) % 4), 250)
    return () => clearInterval(id)
  }, [running])

  const grainFrames = [
    "from-slate-800 via-slate-700 to-slate-900",
    "from-slate-900 via-slate-800 to-slate-700",
    "from-slate-700 via-slate-900 to-slate-800",
    "from-slate-800 via-slate-600 to-slate-900",
  ]

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-border">
      {/* Simulated video noise */}
      <div className={`absolute inset-0 bg-gradient-to-br ${grainFrames[frame]} opacity-30 transition-none`} />
      {/* Face wireframe overlay */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet">
        {/* Face outline */}
        <ellipse cx="160" cy="90" rx="52" ry="65" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" strokeOpacity="0.6" />
        {/* Eyes */}
        <ellipse cx="140" cy="78" rx="11" ry="7" stroke="hsl(var(--primary))" strokeWidth="0.8" fill="none" strokeOpacity="0.7" />
        <ellipse cx="180" cy="78" rx="11" ry="7" stroke="hsl(var(--primary))" strokeWidth="0.8" fill="none" strokeOpacity="0.7" />
        {/* Nose */}
        <path d="M 158 90 L 154 104 Q 160 107 166 104 L 162 90" stroke="hsl(var(--primary))" strokeWidth="0.8" fill="none" strokeOpacity="0.5" />
        {/* Mouth */}
        <path d="M 146 112 Q 160 120 174 112" stroke="hsl(var(--primary))" strokeWidth="1.2" fill="none" strokeOpacity="0.7" />
        {/* Tracking dots */}
        {running && [[160,55],[140,78],[180,78],[160,98],[150,113],[170,113],[160,125]].map(([x,y], i) => (
          <motion.circle key={i} cx={x} cy={y} r="2.5" fill="hsl(var(--primary))"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, delay: i * 0.12, repeat: Infinity }} />
        ))}
        {/* Mesh lines */}
        {running && (
          <>
            <path d="M 108 90 L 212 90" stroke="hsl(var(--primary))" strokeWidth="0.4" strokeOpacity="0.25" />
            <path d="M 160 25 L 160 155" stroke="hsl(var(--primary))" strokeWidth="0.4" strokeOpacity="0.25" />
          </>
        )}
        {/* Bounding box */}
        <rect x="100" y="22" width="120" height="136" stroke="hsl(var(--primary))" strokeWidth="0.6" fill="none"
          strokeOpacity="0.4" strokeDasharray="4 4" />
      </svg>
      {/* Top-left labels */}
      {running && (
        <div className="absolute top-3 left-3 space-y-1">
          <div className="flex items-center gap-1.5 bg-black/60 rounded-md px-2 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-white font-mono font-bold">LIVE</span>
          </div>
          <div className="bg-black/60 rounded-md px-2 py-1">
            <span className="text-xs text-cyan-400 font-mono">FPS 30 · 1920×1080</span>
          </div>
        </div>
      )}
      {!running && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-muted border border-border flex items-center justify-center mx-auto">
              <Square className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Stream paused</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function LiveStreamPage() {
  const [running, setRunning] = React.useState(true)
  const [elapsed, setElapsed] = React.useState(58) // seconds
  const [history, setHistory] = React.useState<DataPoint[]>(INITIAL_HISTORY)
  const [events, setEvents] = React.useState<EventLog[]>(INITIAL_EVENTS)
  const logRef = React.useRef<HTMLDivElement>(null)

  // Tick: add new data points when running
  React.useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setElapsed(e => e + 2)
      setHistory(prev => {
        const t = prev.length * 2
        const next = [...prev.slice(-59), generatePoint(t)]
        return next
      })
    }, 2000)
    return () => clearInterval(id)
  }, [running])

  // Random event injection
  React.useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const templates = [
        { type: "info"    as const, message: "Blink rate elevated — possible cognitive load" },
        { type: "success" as const, message: "High-confidence window detected" },
        { type: "warning" as const, message: "Micro-expression cluster: surprise AU1+2+5" },
        { type: "info"    as const, message: "Vocal frequency shift +12 Hz from baseline" },
        { type: "warning" as const, message: "Epistemic uncertainty spike — 14.2%" },
      ]
      const tpl = templates[Math.floor(Math.random() * templates.length)]
      const mins = Math.floor(elapsed / 60)
      const secs = elapsed % 60
      setEvents(prev => [
        ...prev,
        { id: String(Date.now()), ts: `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`, ...tpl }
      ])
    }, 6000)
    return () => clearInterval(id)
  }, [running, elapsed])

  // Auto-scroll log
  React.useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [events])

  const latest = history[history.length - 1]
  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const elapsedStr = `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Radio className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Live Stream</h1>
              {running && (
                <Badge variant="destructive" className="gap-1 animate-pulse text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" /> LIVE
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Real-time inference · {elapsedStr} elapsed</p>
          </div>
        </div>
        <Button
          variant={running ? "destructive" : "default"}
          className="gap-2 h-9"
          onClick={() => setRunning(r => !r)}
        >
          {running ? <><Square className="h-4 w-4" /> Stop</> : <><Activity className="h-4 w-4" /> Resume</>}
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* ── Left: Video + live readouts ── */}
        <div className="xl:col-span-1 space-y-4">
          <VideoFeed running={running} />

          {/* Live VA readouts */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Valence",
                value: latest?.valence ?? 0,
                color: (latest?.valence ?? 0) >= 0 ? "text-success" : "text-destructive",
                unit: ""
              },
              {
                label: "Arousal",
                value: latest?.arousal ?? 0,
                color: "text-info",
                unit: ""
              },
              {
                label: "Confidence",
                value: latest?.confidence ?? 0,
                color: (latest?.confidence ?? 0) >= 90 ? "text-success" : "text-warning",
                unit: "%"
              },
            ].map(stat => (
              <Card key={stat.label} className="text-center py-3 px-2">
                <AnimatedNumber value={stat.value} unit={stat.unit} color={stat.color} />
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* ── Right: Chart + event log ── */}
        <div className="xl:col-span-2 space-y-4">
          {/* Confidence chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Live Confidence · Valence · Arousal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 4, right: 12, bottom: 0, left: -20 }}>
                    <XAxis dataKey="t" tick={{ fontSize: 9 }} tickLine={false} axisLine={false}
                      interval={Math.floor(history.length / 6)} />
                    <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} domain={[-1.1, 110]} />
                    <RechartTooltip
                      contentStyle={{ fontSize: 11, borderRadius: 8 }}
                      formatter={(val: unknown, name: unknown) => [Number(val).toFixed(2), String(name)]}
                    />
                    <ReferenceLine y={80} stroke="hsl(var(--warning))" strokeDasharray="4 4" strokeOpacity={0.5} />
                    <Line type="monotone" dataKey="confidence" name="Confidence" dot={false}
                      stroke="hsl(var(--primary))" strokeWidth={2} isAnimationActive={false} />
                    <Line type="monotone" dataKey="valence" name="Valence" dot={false}
                      stroke="hsl(var(--success))" strokeWidth={1.5} isAnimationActive={false} />
                    <Line type="monotone" dataKey="arousal" name="Arousal" dot={false}
                      stroke="hsl(var(--info))" strokeWidth={1.5} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 text-xs mt-2 text-muted-foreground">
                {[["hsl(var(--primary))","Confidence"],["hsl(var(--success))","Valence"],["hsl(var(--info))","Arousal"]].map(([c,l]) => (
                  <span key={l} className="flex items-center gap-1.5">
                    <span className="h-2 w-4 rounded-full inline-block" style={{ background: c }} />{l}
                  </span>
                ))}
                <span className="flex items-center gap-1.5 ml-auto">
                  <span className="h-px w-4 inline-block bg-warning" style={{ borderTop: "2px dashed" }} />
                  80% threshold
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Event log */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" /> Real-time Event Log
                <Badge variant="secondary" className="ml-auto text-xs">{events.length} events</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={logRef} className="space-y-1 max-h-44 overflow-y-auto scrollbar-thin pr-1">
                <AnimatePresence initial={false}>
                  {events.map(ev => {
                    const Icon = EVENT_ICON[ev.type]
                    return (
                      <motion.div key={ev.id}
                        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-start gap-2.5 py-1.5 border-b border-border/50 last:border-0"
                      >
                        <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${EVENT_COLOR[ev.type]}`} />
                        <span className="font-mono text-xs text-muted-foreground shrink-0">{ev.ts}</span>
                        <span className="text-xs text-foreground">{ev.message}</span>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
