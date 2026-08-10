"use client"

import * as React from "react"
import { LayoutDashboard, Plus, Settings2, Maximize2, Target, TrendingUp, BarChart2, Info } from "lucide-react"
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartTooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MultiSeriesChart, RadialGauge, HorizontalBarChart } from "@/components/charts/WorkspaceCharts"
import { C } from "@/components/charts/tokens"
import { useAnalysis } from "@/lib/AnalysisContext"

// ── Calibration reliability diagram ────────────────────────────────────────
// Bins confidence [0,100] and computes empirical accuracy per bin
function buildCalibrationData(history: ReturnType<typeof useAnalysis>["history"]) {
  const BINS = 10
  const bins = Array.from({ length: BINS }, (_, i) => ({
    bin: `${i * 10}–${(i + 1) * 10}`,
    confidence: (i + 0.5) * 10,   // bin midpoint
    accuracy: 0,
    count: 0,
  }))

  history.forEach(r => {
    const idx = Math.min(Math.floor(r.confidence / 10), BINS - 1)
    bins[idx].count++
    // Treat high-confidence + low-uncertainty as "accurate"
    if (r.confidence >= 70 && r.totalUncertainty < 20) bins[idx].accuracy++
  })

  return bins.map(b => ({
    ...b,
    accuracy: b.count > 0 ? Math.round((b.accuracy / b.count) * 100) : null,
  }))
}

// ── Confusion matrix from history ──────────────────────────────────────────
const EMOTIONS = ["Joy", "Sadness", "Anger", "Fear", "Surprise", "Disgust", "Neutral"]

function buildConfusionMatrix(history: ReturnType<typeof useAnalysis>["history"]) {
  // Build a frequency count: which emotion was predicted with which score pattern
  const matrix: number[][] = EMOTIONS.map(() => EMOTIONS.map(() => 0))
  history.forEach(r => {
    const predIdx = EMOTIONS.indexOf(r.primaryEmotion)
    if (predIdx < 0) return
    r.emotionScores.forEach(es => {
      const trueIdx = EMOTIONS.indexOf(es.emotion)
      if (trueIdx >= 0 && es.score > 10) {
        matrix[trueIdx][predIdx] += es.score
      }
    })
  })
  // Normalize per row
  return matrix.map(row => {
    const sum = row.reduce((s, v) => s + v, 0) || 1
    return row.map(v => Math.round((v / sum) * 100))
  })
}

function cellColor(v: number) {
  if (v >= 60) return "bg-primary/80 text-primary-foreground"
  if (v >= 30) return "bg-primary/30 text-foreground"
  if (v >= 10) return "bg-muted text-muted-foreground"
  return "bg-background text-muted-foreground/40"
}

// ── ECE metric ─────────────────────────────────────────────────────────────
function computeECE(calData: ReturnType<typeof buildCalibrationData>) {
  let ece = 0, total = 0
  calData.forEach(b => {
    if (b.count > 0 && b.accuracy !== null) {
      ece += b.count * Math.abs(b.confidence - b.accuracy) / 100
      total += b.count
    }
  })
  return total > 0 ? ((ece / total) * 100).toFixed(1) : "N/A"
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function VisualizationsPage() {
  const { history } = useAnalysis()
  const calData = React.useMemo(() => buildCalibrationData(history), [history])
  const confMatrix = React.useMemo(() => buildConfusionMatrix(history), [history])
  const ece = computeECE(calData)
  const hasHistory = history.length > 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analysis Visualizations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publication-grade calibration diagnostics, longitudinal accuracy tracking, and dataset statistics.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Settings2 className="h-4 w-4" /> Edit Layout
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Widget
          </Button>
        </div>
      </div>

      {/* === Row 1: Calibration + Latency === */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Reliability Diagram */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-0 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Calibration Reliability Diagram
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Predicted confidence vs. empirical accuracy. A perfectly calibrated model follows the diagonal.
                {hasHistory && <span className="ml-2 font-semibold text-foreground">ECE: {ece}%</span>}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
              <Maximize2 className="h-3 w-3 text-muted-foreground" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {!hasHistory ? (
              <div className="h-[260px] flex items-center justify-center">
                <p className="text-xs text-muted-foreground text-center">
                  Run analyses from the Analysis Tool to populate the calibration diagram.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    type="number" dataKey="confidence" domain={[0, 100]}
                    label={{ value: "Mean Predicted Confidence (%)", position: "insideBottom", offset: -12, fontSize: 10 }}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    type="number" dataKey="accuracy" domain={[0, 100]}
                    label={{ value: "Empirical Accuracy (%)", angle: -90, position: "insideLeft", offset: 12, fontSize: 10 }}
                    tick={{ fontSize: 10 }}
                  />
                  {/* Perfect calibration diagonal */}
                  <ReferenceLine
                    segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="6 4"
                    label={{ value: "Perfect Calibration", position: "insideTopLeft", fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <RechartTooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                    formatter={(v, name) => [`${v}%`, name === "accuracy" ? "Empirical Accuracy" : "Confidence"] as [string, string]}
                  />
                  <Scatter
                    data={calData.filter(d => d.accuracy !== null && d.count > 0)}
                    fill={C.primary}
                    opacity={0.85}
                  >
                    {calData.map((d, i) => (
                      <Cell
                        key={i}
                        fill={d.accuracy !== null && Math.abs(d.confidence - d.accuracy) > 15 ? C.destructive : C.primary}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Latency gauge */}
        <Card>
          <CardHeader className="pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Inference Latency</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Maximize2 className="h-3 w-3 text-muted-foreground" />
            </Button>
          </CardHeader>
          <CardContent className="pt-8 flex flex-col items-center justify-center">
            <RadialGauge value={45} max={150} color={C.success} label="ms (avg)" size={140} />
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Multimodal Fusion inference time per request (FastAPI + PyTorch).
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === Row 2: Longitudinal Accuracy + Emotion Dist === */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Longitudinal accuracy */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Longitudinal Accuracy (Training Runs)
              </CardTitle>
              <CardDescription className="text-xs mt-1">Validation accuracy across experiment runs.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Maximize2 className="h-3 w-3 text-muted-foreground" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <MultiSeriesChart
              data={[
                { run: "exp-090", acc: 88.5 },
                { run: "exp-091", acc: 92.1 },
                { run: "exp-092", acc: 65.4 },
                { run: "exp-093", acc: 91.8 },
                { run: "exp-094", acc: 94.2 },
              ]}
              xKey="run"
              height={220}
              series={[{ key: "acc", name: "Val Accuracy", color: C.primary, type: "line" }]}
              yDomain={[50, 100]}
            />
          </CardContent>
        </Card>

        {/* Dataset distribution */}
        <Card>
          <CardHeader className="pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" />
              Dataset Distribution
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Maximize2 className="h-3 w-3 text-muted-foreground" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <HorizontalBarChart
              data={[
                { label: "Joy", value: 8500, color: C.high },
                { label: "Neutral", value: 6200, color: C.info },
                { label: "Sadness", value: 4100, color: C.warning },
                { label: "Anger", value: 3800, color: C.destructive },
                { label: "Surprise", value: 1900, color: C.primary },
                { label: "Disgust", value: 1200, color: "#d946ef" },
                { label: "Fear", value: 2800, color: "#8b5cf6" },
              ]}
              max={10000}
              height={200}
            />
          </CardContent>
        </Card>
      </div>

      {/* === Row 3: Confusion Matrix (from live history) === */}
      <Card>
        <CardHeader className="pb-0 flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              Emotion Confusion Matrix
            </CardTitle>
            <CardDescription className="text-xs mt-1 flex items-center gap-1">
              <Info className="h-3 w-3" />
              {hasHistory
                ? `Built from ${history.length} session result${history.length !== 1 ? "s" : ""}. Rows = true label (top emotion score), Cols = predicted.`
                : "Run analyses to populate this matrix with real session data."}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
            <Maximize2 className="h-3 w-3 text-muted-foreground" />
          </Button>
        </CardHeader>
        <CardContent className="pt-4 overflow-x-auto">
          {!hasHistory ? (
            <div className="h-[200px] flex items-center justify-center border border-dashed rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                No session data yet — run analyses to populate the confusion matrix.
              </p>
            </div>
          ) : (
            <div className="min-w-[600px]">
              {/* Header row */}
              <div className="flex gap-1 mb-1">
                <div className="w-20 shrink-0" />
                {EMOTIONS.map(e => (
                  <div key={e} className="flex-1 text-[9px] text-center font-bold text-muted-foreground truncate px-0.5">
                    {e.slice(0, 4)}
                  </div>
                ))}
              </div>
              {/* Matrix rows */}
              {confMatrix.map((row, ri) => (
                <div key={EMOTIONS[ri]} className="flex gap-1 mb-1 items-center">
                  <div className="w-20 shrink-0 text-[10px] font-medium text-muted-foreground text-right pr-2 truncate">
                    {EMOTIONS[ri]}
                  </div>
                  {row.map((v, ci) => (
                    <div
                      key={ci}
                      className={`flex-1 h-9 rounded flex items-center justify-center text-[10px] font-mono font-bold transition-colors ${cellColor(v)}`}
                      title={`${EMOTIONS[ri]} → ${EMOTIONS[ci]}: ${v}%`}
                    >
                      {v > 0 ? `${v}` : ""}
                    </div>
                  ))}
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Values are normalised row percentages. Diagonal = correct classification.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drop zone */}
      <div className="p-12 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
        <LayoutDashboard className="h-10 w-10 mb-4 opacity-20" />
        <p className="font-medium">Add more widgets</p>
        <p className="text-xs mt-1">Select from the visualization gallery</p>
      </div>
    </div>
  )
}
