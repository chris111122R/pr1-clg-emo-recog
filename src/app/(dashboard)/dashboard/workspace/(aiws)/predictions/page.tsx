"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Target, Image as ImageIcon, Mic, FileText, ChevronDown, ChevronUp,
  ShieldAlert, ShieldCheck, Trash2, RotateCcw, Info
} from "lucide-react"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAnalysis } from "@/lib/AnalysisContext"
import type { AnalysisResult } from "@/lib/AnalysisContext"

// ── Emotion color mapping ──────────────────────────────────────────────────
const EMOTION_COLOR: Record<string, string> = {
  Joy:      "bg-emerald-500",
  Sadness:  "bg-blue-500",
  Anger:    "bg-red-500",
  Fear:     "bg-violet-500",
  Surprise: "bg-amber-500",
  Disgust:  "bg-pink-500",
  Neutral:  "bg-slate-400",
}

const MODALITY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  text:  FileText,
  image: ImageIcon,
  audio: Mic,
}

// ── Single prediction card ─────────────────────────────────────────────────
function PredictionCard({ result, index }: { result: AnalysisResult; index: number }) {
  const [expanded, setExpanded] = React.useState(false)
  const Icon = MODALITY_ICON[result.modality] ?? Target
  const topScores = result.emotionScores.slice(0, 4)
  const isHighUncertainty = result.totalUncertainty > 20
  const ts = result.timestamp.toLocaleString([], {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Card className="overflow-hidden">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 p-4 border-b border-border/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate" title={result.inputSummary}>
                {result.inputSummary.length > 60
                  ? `${result.inputSummary.slice(0, 60)}…`
                  : result.inputSummary}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{result.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isHighUncertainty
              ? <ShieldAlert className="h-4 w-4 text-warning" />
              : <ShieldCheck className="h-4 w-4 text-success" />
            }
            <Badge variant="outline" className="text-[10px] uppercase">{result.modality}</Badge>
          </div>
        </div>

        {/* Primary emotion + confidence */}
        <div className="px-4 py-3 flex items-center justify-between gap-4 bg-muted/20">
          <div className="flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-full ${EMOTION_COLOR[result.primaryEmotion] ?? "bg-slate-400"}`}
            />
            <span className="text-sm font-bold">{result.primaryEmotion}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-mono text-foreground font-semibold">{result.confidence}%</span>
            <span className="text-muted-foreground/60">|</span>
            <span className={isHighUncertainty ? "text-warning font-semibold" : ""}>
              ±{result.totalUncertainty}% uncertainty
            </span>
            <span className="text-muted-foreground/60">|</span>
            <span>{ts}</span>
          </div>
        </div>

        {/* Emotion bars */}
        <div className="px-4 py-3 space-y-2.5">
          {topScores.map((es, i) => (
            <div key={es.emotion}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-foreground">{es.emotion}</span>
                <span className="font-mono text-muted-foreground">{es.score}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${EMOTION_COLOR[es.emotion] ?? "bg-slate-400"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${es.score}%` }}
                  transition={{ delay: index * 0.06 + 0.25 + i * 0.07, duration: 0.7, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Expandable explanation */}
        <div className="border-t border-border/50">
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs text-muted-foreground hover:bg-muted/30 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Info className="h-3 w-3" /> XAI Explanation
            </span>
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="px-4 pb-3 text-xs text-muted-foreground leading-relaxed border-t border-border/30 pt-2 bg-muted/10">
                  {result.explanation || "No explanation available."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function PredictionsPage() {
  const { history, clearHistory } = useAnalysis()
  const [filter, setFilter] = React.useState<"all" | "text" | "image" | "audio">("all")

  const filtered = filter === "all" ? history : history.filter(r => r.modality === filter)

  if (history.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Target className="h-16 w-16 text-muted-foreground/40 mb-4" />
        <h1 className="text-2xl font-bold tracking-tight mb-2">Predictions History</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          No predictions yet. Run an analysis from the Analysis Tool to build your prediction history.
        </p>
        <Button asChild>
          <Link href="/dashboard">Go to Analysis Tool</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Predictions History</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-2 ml-13">
            {history.length} stored prediction{history.length !== 1 ? "s" : ""} across all modalities.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-destructive hover:text-destructive"
          onClick={clearHistory}
        >
          <Trash2 className="h-4 w-4" /> Clear History
        </Button>
      </div>

      {/* Modality filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "text", "image", "audio"] as const).map(m => (
          <button
            key={m}
            onClick={() => setFilter(m)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize
              ${filter === m
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              }`}
          >
            {m === "all" ? `All (${history.length})` : `${m} (${history.filter(r => r.modality === m).length})`}
          </button>
        ))}
      </div>

      {/* Grid of prediction cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <RotateCcw className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">No {filter} predictions yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((result, i) => (
            <PredictionCard key={result.id} result={result} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
