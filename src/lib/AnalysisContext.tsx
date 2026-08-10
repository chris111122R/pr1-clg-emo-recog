"use client"

import * as React from "react"

// ── Types ──────────────────────────────────────────────────────────────────

export interface EmotionScore {
  emotion: string
  score: number
}

export interface FeatureImportance {
  label: string
  value: number
}

export interface ConfidenceDistribution {
  label: string
  mean: number
  p10: number
  p25: number
  p75: number
  p90: number
}

export interface HeatmapCell {
  row: number
  col: number
  value: number
}

export interface AnalysisResult {
  id: string
  timestamp: Date
  modality: "text" | "image" | "audio"
  inputSummary: string

  // Emotion results
  primaryEmotion: string
  emotionScores: EmotionScore[]
  confidence: number

  // Uncertainty
  totalUncertainty: number
  epistemicUncertainty: number
  aleatoricUncertainty: number
  confidenceDistribution: ConfidenceDistribution[]

  // Detailed Trace (Master Prompt JSON structure)
  trace: {
    prediction: string
    confidence: number
    uncertainty: {
      total: number
      aleatoric: {
        score: number
        attribution: Record<string, string>
      }
      epistemic: {
        score: number
        attribution: Record<string, string>
      }
      ood: {
        score: number
        is_ood: boolean
      }
      quality_score: number
    }
  }

  // Explainability
  explanation: string
  featureImportance: FeatureImportance[]
  attentionHeatmap: HeatmapCell[]

  // Digital Twin tracking
  trend: string
}

interface AnalysisContextValue {
  /** The most recent analysis result */
  currentResult: AnalysisResult | null
  /** Full history of analysis results (most recent first) */
  history: AnalysisResult[]
  /** Push a new result into the context */
  addResult: (result: AnalysisResult) => void
  /** Clear all history */
  clearHistory: () => void
}

const AnalysisContext = React.createContext<AnalysisContextValue | null>(null)

// ── Provider ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "ua-edt-analysis-history"

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = React.useState<AnalysisResult[]>([])

  // Load from localStorage on mount
  React.useEffect(() => {
    const id = setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as AnalysisResult[]
          // Rehydrate Date objects and provide defaults for new schema fields
          const hydrated = parsed.map((r) => ({
            ...r,
            timestamp: new Date(r.timestamp),
            confidenceDistribution: r.confidenceDistribution || [],
            attentionHeatmap: r.attentionHeatmap || [],
            featureImportance: r.featureImportance || [],
            emotionScores: r.emotionScores || [],
            totalUncertainty: r.totalUncertainty || 0,
            epistemicUncertainty: r.epistemicUncertainty || 0,
            aleatoricUncertainty: r.aleatoricUncertainty || 0,
          }))
          setHistory(hydrated)
        }
      } catch {
        // Ignore parse errors
      }
    }, 0)
    return () => clearTimeout(id)
  }, [])

  // Persist to localStorage whenever history changes
  React.useEffect(() => {
    if (history.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
      } catch {
        // Ignore quota errors
      }
    }
  }, [history])

  const addResult = React.useCallback((result: AnalysisResult) => {
    setHistory((prev) => [result, ...prev].slice(0, 50)) // keep last 50
  }, [])

  const clearHistory = React.useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore
    }
  }, [])

  const currentResult = history.length > 0 ? history[0] : null

  const value = React.useMemo<AnalysisContextValue>(
    () => ({ currentResult, history, addResult, clearHistory }),
    [currentResult, history, addResult, clearHistory]
  )

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  )
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useAnalysis(): AnalysisContextValue {
  const ctx = React.useContext(AnalysisContext)
  if (!ctx) {
    throw new Error("useAnalysis must be used within an <AnalysisProvider>")
  }
  return ctx
}
