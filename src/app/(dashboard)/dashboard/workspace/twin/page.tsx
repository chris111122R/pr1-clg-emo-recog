"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BrainCircuit, Download, Copy, Check, RefreshCw,
  Activity, Zap, ScanFace, ChevronDown, ChevronUp, Info
} from "lucide-react"
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// ── Mock session data ──────────────────────────────────────────────────────
const SESSIONS = ["S-001A", "S-002B", "S-003C", "S-006F"]
const SESSION_DATA: Record<string, {
  valence: number; arousal: number; confidence: number
  epistemic: number; aleatoric: number
  facs: Array<{ au: string; name: string; weight: number; category: string }>
  vocal: Array<{ feature: string; value: number; unit: string }>
}> = {
  "S-001A": {
    valence: 0.62, arousal: 0.44, confidence: 96.2,
    epistemic: 0.04, aleatoric: 0.08,
    facs: [
      { au: "AU6",  name: "Cheek Raiser",        weight: 0.82, category: "Positive" },
      { au: "AU12", name: "Lip Corner Puller",    weight: 0.74, category: "Positive" },
      { au: "AU25", name: "Lips Part",            weight: 0.51, category: "Neutral"  },
      { au: "AU4",  name: "Brow Lowerer",         weight: 0.29, category: "Negative" },
      { au: "AU1",  name: "Inner Brow Raise",     weight: 0.18, category: "Neutral"  },
      { au: "AU2",  name: "Outer Brow Raise",     weight: 0.12, category: "Neutral"  },
    ],
    vocal: [
      { feature: "Pitch",        value: 187, unit: "Hz"  },
      { feature: "Jitter",       value: 2.1, unit: "%"   },
      { feature: "Shimmer",      value: 4.8, unit: "%"   },
      { feature: "Speaking Rate",value: 142, unit: "wpm" },
      { feature: "HNR",          value: 18.4,unit: "dB"  },
    ]
  },
  "S-002B": {
    valence: -0.21, arousal: 0.72, confidence: 88.7,
    epistemic: 0.11, aleatoric: 0.14,
    facs: [
      { au: "AU15", name: "Lip Corner Depressor", weight: 0.88, category: "Negative" },
      { au: "AU17", name: "Chin Raiser",           weight: 0.66, category: "Negative" },
      { au: "AU4",  name: "Brow Lowerer",          weight: 0.63, category: "Negative" },
      { au: "AU23", name: "Lip Tightener",         weight: 0.41, category: "Negative" },
      { au: "AU7",  name: "Lid Tightener",         weight: 0.22, category: "Neutral"  },
    ],
    vocal: [
      { feature: "Pitch",        value: 210, unit: "Hz"  },
      { feature: "Jitter",       value: 3.8, unit: "%"   },
      { feature: "Shimmer",      value: 6.2, unit: "%"   },
      { feature: "Speaking Rate",value: 168, unit: "wpm" },
      { feature: "HNR",          value: 14.1,unit: "dB"  },
    ]
  },
  "S-003C": {
    valence: 0.08, arousal: 0.31, confidence: 91.4,
    epistemic: 0.07, aleatoric: 0.09,
    facs: [
      { au: "AU1",  name: "Inner Brow Raise", weight: 0.55, category: "Neutral" },
      { au: "AU2",  name: "Outer Brow Raise", weight: 0.49, category: "Neutral" },
      { au: "AU5",  name: "Upper Lid Raiser", weight: 0.38, category: "Neutral" },
      { au: "AU26", name: "Jaw Drop",         weight: 0.27, category: "Neutral" },
      { au: "AU20", name: "Lip Stretcher",    weight: 0.14, category: "Negative"},
    ],
    vocal: [
      { feature: "Pitch",        value: 155, unit: "Hz"  },
      { feature: "Jitter",       value: 1.6, unit: "%"   },
      { feature: "Shimmer",      value: 3.9, unit: "%"   },
      { feature: "Speaking Rate",value: 128, unit: "wpm" },
      { feature: "HNR",          value: 20.2,unit: "dB"  },
    ]
  },
  "S-006F": {
    valence: 0.48, arousal: 0.55, confidence: 94.8,
    epistemic: 0.05, aleatoric: 0.07,
    facs: [
      { au: "AU6",  name: "Cheek Raiser",        weight: 0.79, category: "Positive" },
      { au: "AU12", name: "Lip Corner Puller",    weight: 0.72, category: "Positive" },
      { au: "AU25", name: "Lips Part",            weight: 0.44, category: "Neutral"  },
      { au: "AU2",  name: "Outer Brow Raise",     weight: 0.31, category: "Neutral"  },
      { au: "AU1",  name: "Inner Brow Raise",     weight: 0.19, category: "Neutral"  },
    ],
    vocal: [
      { feature: "Pitch",        value: 174, unit: "Hz"  },
      { feature: "Jitter",       value: 1.9, unit: "%"   },
      { feature: "Shimmer",      value: 4.1, unit: "%"   },
      { feature: "Speaking Rate",value: 138, unit: "wpm" },
      { feature: "HNR",          value: 19.7,unit: "dB"  },
    ]
  },
}

// ── Animated Face SVG ──────────────────────────────────────────────────────
function TwinFace({ valence, arousal, facsData }: {
  valence: number; arousal: number
  facsData: typeof SESSION_DATA["S-001A"]["facs"]
}) {
  // Map AU codes to face region highlight positions
  const auPositions: Record<string, { cx: number; cy: number; r: number }> = {
    AU1:  { cx: 140, cy: 110, r: 14 },
    AU2:  { cx: 160, cy: 108, r: 14 },
    AU4:  { cx: 150, cy: 112, r: 16 },
    AU5:  { cx: 150, cy: 118, r: 18 },
    AU6:  { cx: 142, cy: 138, r: 12 },
    AU7:  { cx: 148, cy: 122, r: 10 },
    AU12: { cx: 145, cy: 158, r: 14 },
    AU15: { cx: 144, cy: 162, r: 12 },
    AU17: { cx: 150, cy: 170, r: 12 },
    AU20: { cx: 150, cy: 160, r: 14 },
    AU23: { cx: 150, cy: 156, r: 10 },
    AU25: { cx: 150, cy: 162, r: 13 },
    AU26: { cx: 150, cy: 168, r: 15 },
  }
  const catColor = (cat: string) =>
    cat === "Positive" ? "hsl(var(--success))" : cat === "Negative" ? "hsl(var(--destructive))" : "hsl(var(--info))"

  // Smile curve: influenced by valence
  const smileD = `M 128 ${162 - valence * 8} Q 150 ${168 + valence * 12} 172 ${162 - valence * 8}`
  // Brow tilt: influenced by arousal
  const browLeft  = `M 120 ${112 - arousal * 6} Q 132 ${108 - arousal * 4} 144 ${110 - arousal * 3}`
  const browRight = `M 156 ${110 - arousal * 3} Q 168 ${108 - arousal * 4} 180 ${112 - arousal * 6}`

  return (
    <div className="flex justify-center">
      <svg width="300" height="300" viewBox="80 70 140 170" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head outline */}
        <ellipse cx="150" cy="148" rx="58" ry="72" stroke="hsl(var(--border))" strokeWidth="1.5" fill="hsl(var(--card))" />
        {/* Grid overlay */}
        {[90,110,130,150,170,190,210].map(y => (
          <line key={y} x1="92" y1={y} x2="208" y2={y} stroke="hsl(var(--border))" strokeWidth="0.4" strokeDasharray="3 4" />
        ))}
        {[100,120,140,160,180,200].map(x => (
          <line key={x} x1={x} y1="76" x2={x} y2="220" stroke="hsl(var(--border))" strokeWidth="0.4" strokeDasharray="3 4" />
        ))}
        {/* Ears */}
        <ellipse cx="92" cy="148" rx="8" ry="14" stroke="hsl(var(--border))" strokeWidth="1.5" fill="hsl(var(--card))" />
        <ellipse cx="208" cy="148" rx="8" ry="14" stroke="hsl(var(--border))" strokeWidth="1.5" fill="hsl(var(--card))" />
        {/* Eyes */}
        <ellipse cx="135" cy="138" rx="11" ry="8" fill="hsl(var(--primary)/0.12)" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        <ellipse cx="165" cy="138" rx="11" ry="8" fill="hsl(var(--primary)/0.12)" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        <circle cx="135" cy="138" r="4" fill="hsl(var(--primary))" />
        <circle cx="165" cy="138" r="4" fill="hsl(var(--primary))" />
        {/* Nose */}
        <path d="M 148 148 L 144 160 Q 150 163 156 160 L 152 148" stroke="hsl(var(--muted-foreground))" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Dynamic brows */}
        <path d={browLeft}  stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d={browRight} stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Dynamic mouth */}
        <path d={smileD} stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* AU hotspots */}
        {facsData.slice(0, 4).map((item, i) => {
          const pos = auPositions[item.au]
          if (!pos) return null
          return (
            <motion.circle
              key={item.au}
              cx={pos.cx}
              cy={pos.cy}
              r={pos.r}
              fill={catColor(item.category)}
              fillOpacity={0.18 + item.weight * 0.22}
              stroke={catColor(item.category)}
              strokeWidth="1"
              strokeOpacity={0.6}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4, type: "spring" }}
            />
          )
        })}
        {/* Landmark dots */}
        {[[135,138],[165,138],[150,155],[144,162],[156,162],[150,170]].map(([x,y], i) => (
          <motion.circle key={i} cx={x} cy={y} r="2" fill="hsl(var(--primary))"
            initial={{ opacity: 0 }} animate={{ opacity: 0.7 }}
            transition={{ delay: 0.6 + i * 0.05 }} />
        ))}
      </svg>
    </div>
  )
}

// ── Valence / Arousal Gauge ────────────────────────────────────────────────
function VAGauge({ label, value, color }: { label: string; value: number; color: string }) {
  const normalized = ((value + 1) / 2) * 100 // -1..1 → 0..100
  const formatted = value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2)
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
            startAngle={220} endAngle={-40} data={[{ value: normalized }]}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: "hsl(var(--muted))" }}
              dataKey="value" angleAxisId={0}
              fill={color} cornerRadius={8}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tabular-nums" style={{ color }}>{formatted}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}

// ── Confidence Ring ────────────────────────────────────────────────────────
function ConfidenceRing({ value }: { value: number }) {
  const color = value >= 90 ? "hsl(var(--success))" : value >= 75 ? "hsl(var(--warning))" : "hsl(var(--destructive))"
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
            startAngle={220} endAngle={-40} data={[{ value }]}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: "hsl(var(--muted))" }} dataKey="value" angleAxisId={0} fill={color} cornerRadius={8} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tabular-nums" style={{ color }}>{value.toFixed(1)}%</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">Confidence</span>
    </div>
  )
}

// ── Uncertainty Panel ──────────────────────────────────────────────────────
function UncertaintyPanel({ epistemic, aleatoric }: { epistemic: number; aleatoric: number }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3 w-3" /> Epistemic (model)
          </span>
          <span className={`font-semibold ${epistemic > 0.1 ? "text-warning" : "text-success"}`}>
            {(epistemic * 100).toFixed(1)}%
          </span>
        </div>
        <Progress value={epistemic * 100} className="h-1.5" />
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Activity className="h-3 w-3" /> Aleatoric (data)
          </span>
          <span className={`font-semibold ${aleatoric > 0.12 ? "text-warning" : "text-success"}`}>
            {(aleatoric * 100).toFixed(1)}%
          </span>
        </div>
        <Progress value={aleatoric * 100} className="h-1.5" />
      </div>
    </div>
  )
}

// ── FACS Attribution ───────────────────────────────────────────────────────
const catColors: Record<string, string> = {
  Positive: "bg-success",
  Negative: "bg-destructive",
  Neutral:  "bg-info",
}
function FACsList({ facs }: { facs: typeof SESSION_DATA["S-001A"]["facs"] }) {
  return (
    <div className="space-y-2.5">
      {facs.map((item, i) => (
        <motion.div key={item.au}
          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + i * 0.06 }}
          className="space-y-1"
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-primary w-10">{item.au}</span>
              <span className="text-muted-foreground">{item.name}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${catColors[item.category]}`} />
            </div>
            <span className="font-semibold tabular-nums">{(item.weight * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${catColors[item.category]}`}
              initial={{ width: 0 }} animate={{ width: `${item.weight * 100}%` }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      ))}
      {/* Legend */}
      <div className="flex gap-3 pt-1 text-xs text-muted-foreground">
        {["Positive", "Neutral", "Negative"].map(c => (
          <span key={c} className="flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${catColors[c]}`} />
            {c}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Vocal Features ─────────────────────────────────────────────────────────
function VocalPanel({ vocal }: { vocal: typeof SESSION_DATA["S-001A"]["vocal"] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {vocal.map((v, i) => (
        <motion.div key={v.feature}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.07 }}
          className="rounded-lg bg-muted/40 px-3 py-2.5"
        >
          <p className="text-lg font-bold tabular-nums text-foreground">
            {v.value}
            <span className="text-xs font-normal text-muted-foreground ml-1">{v.unit}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{v.feature}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function DigitalTwinPage() {
  const [selectedSession, setSelectedSession] = React.useState("S-001A")
  const [copied, setCopied] = React.useState(false)
  const data = SESSION_DATA[selectedSession]

  function copyReport() {
    const text = JSON.stringify({ session: selectedSession, ...data }, null, 2)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BrainCircuit className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Digital Twin Viewer</h1>
            <p className="text-sm text-muted-foreground">Parametric face reconstruction with FACS attribution</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-9" onClick={copyReport}>
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy JSON"}
          </Button>
          <Button variant="outline" size="sm" className="gap-2 h-9">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </motion.div>

      {/* Session selector */}
      <div className="flex flex-wrap gap-2">
        {SESSIONS.map(sid => (
          <button key={sid}
            onClick={() => setSelectedSession(sid)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              selectedSession === sid
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/50"
            }`}
          >
            {sid}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={selectedSession}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
        >
          {/* ── Twin Face ── */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ScanFace className="h-4 w-4 text-primary" /> Face Reconstruction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TwinFace valence={data.valence} arousal={data.arousal} facsData={data.facs} />

              {/* VA gauges */}
              <div className="flex justify-around pt-2 border-t border-border">
                <VAGauge label="Valence" value={data.valence}
                  color={data.valence >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"} />
                <VAGauge label="Arousal" value={data.arousal} color="hsl(var(--info))" />
                <ConfidenceRing value={data.confidence} />
              </div>
            </CardContent>
          </Card>

          {/* ── Analysis tabs ── */}
          <Card className="lg:col-span-2">
            <CardContent className="pt-5">
              <Tabs defaultValue="facs">
                <TabsList className="mb-4">
                  <TabsTrigger value="facs">FACS Attribution</TabsTrigger>
                  <TabsTrigger value="vocal">Vocal Prosody</TabsTrigger>
                  <TabsTrigger value="uncertainty">Uncertainty</TabsTrigger>
                </TabsList>

                <TabsContent value="facs" className="mt-0">
                  <FACsList facs={data.facs} />
                </TabsContent>

                <TabsContent value="vocal" className="mt-0">
                  <VocalPanel vocal={data.vocal} />
                </TabsContent>

                <TabsContent value="uncertainty" className="mt-0">
                  <div className="space-y-5">
                    <UncertaintyPanel epistemic={data.epistemic} aleatoric={data.aleatoric} />
                    <div className="rounded-xl bg-muted/30 border border-border p-4 text-xs text-muted-foreground leading-relaxed space-y-2">
                      <p><strong className="text-foreground">Epistemic uncertainty</strong> reflects the model's knowledge gap — higher values indicate the input is out-of-distribution relative to the training set.</p>
                      <p><strong className="text-foreground">Aleatoric uncertainty</strong> is inherent in the data — poor lighting, occlusion, or background noise irreducible by additional training data.</p>
                      <p>Total uncertainty: <strong className="text-foreground font-mono">{((data.epistemic + data.aleatoric) * 100 / 2).toFixed(1)}%</strong></p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* ── Interpretation Card ── */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Interpretation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Primary Affect",   value: data.valence > 0.3 ? "Positive" : data.valence < -0.2 ? "Negative" : "Neutral", color: data.valence > 0.3 ? "text-success" : data.valence < -0.2 ? "text-destructive" : "text-muted-foreground" },
                  { label: "Activation Level", value: data.arousal > 0.6 ? "High" : data.arousal > 0.35 ? "Moderate" : "Low", color: data.arousal > 0.6 ? "text-warning" : "text-info" },
                  { label: "Model Confidence", value: data.confidence >= 90 ? "Reliable" : data.confidence >= 75 ? "Moderate" : "Low", color: data.confidence >= 90 ? "text-success" : data.confidence >= 75 ? "text-warning" : "text-destructive" },
                  { label: "Leading AU",       value: data.facs[0]?.au ?? "—", color: "text-primary" },
                ].map(item => (
                  <div key={item.label} className="rounded-xl bg-muted/30 px-4 py-3 text-center">
                    <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
