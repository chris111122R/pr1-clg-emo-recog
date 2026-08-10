"use client"

import * as React from "react"
import { Microscope, ScanFace, GitMerge, Target, Sparkles, Activity } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AttentionHeatmap, HorizontalBarChart, DecisionFlowDiagram } from "@/components/charts/WorkspaceCharts"
import { useAnalysis } from "@/lib/AnalysisContext"

export default function ExplainabilityPage() {
  const { currentResult } = useAnalysis()

  if (!currentResult) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Microscope className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h1 className="text-2xl font-bold tracking-tight mb-2">Explainability Engine</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          No analysis data found. Please run an analysis in the Analysis Tool to view explainability insights.
        </p>
        <Button asChild>
          <Link href="/dashboard">Go to Analysis Tool</Link>
        </Button>
      </div>
    )
  }

  const { modality, featureImportance, attentionHeatmap, primaryEmotion, id, confidence } = currentResult

  const getFlowNodes = () => {
    const nodes = [
      { id: "in", label: `${modality.charAt(0).toUpperCase() + modality.slice(1)} Input`, type: "input", value: "Raw Data" } as const,
      { id: "feat", label: "Feature Extraction", sublabel: modality === "text" ? "DistilBERT" : modality === "image" ? "ResNet-50" : "Wav2Vec2", type: "process" } as const,
      { id: "class", label: "Classification Head", sublabel: "Linear / Softmax", type: "process" } as const,
      { id: "out", label: `Predicted: ${primaryEmotion}`, value: `${confidence}%`, type: "output" } as const,
    ]
    return nodes
  }

  const getFlowEdges = () => {
    return [
      { from: "in", to: "feat" },
      { from: "feat", to: "class", label: "Embeddings" },
      { from: "class", to: "out", label: "Logits" },
    ]
  }

  const getFlowLayout = () => {
    return [
      { id: "in", x: 40, y: 80 },
      { id: "feat", x: 200, y: 80 },
      { id: "class", x: 380, y: 80 },
      { id: "out", x: 560, y: 80 },
    ]
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Microscope className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Explainability Engine</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Interpret model decisions through attention maps, feature attribution scoring, and network execution tracing.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-[10px] uppercase font-mono py-1">Run: {id.split('-')[1]}</Badge>
          <Badge variant="outline" className="text-[10px] uppercase font-mono py-1 bg-primary/5 text-primary border-primary/30">Target: {primaryEmotion}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spatial Attention Heatmap */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <ScanFace className="h-4 w-4 text-primary" /> 
                {modality === "text" ? "Token Attention" : modality === "audio" ? "Spectrogram Attention" : "Spatial Attention"}
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6"><Sparkles className="h-3 w-3 text-muted-foreground"/></Button>
            </div>
            <CardDescription className="text-xs">
              {modality === "text" ? "Attention weights across input tokens." : modality === "audio" ? "Frequency band activation over time." : "Integrated Gradients overlaid on input spatial frame."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="relative w-full max-w-sm mx-auto aspect-square rounded-xl overflow-hidden border border-border/50 bg-slate-900 shadow-inner flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-500 via-slate-800 to-slate-950">
                {modality === "image" && (
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    <ellipse cx="50" cy="50" rx="30" ry="40" stroke="white" strokeWidth="0.5" fill="none" />
                    <path d="M 35 45 Q 40 40 45 45 M 55 45 Q 60 40 65 45 M 40 70 Q 50 75 60 70" stroke="white" strokeWidth="0.5" fill="none"/>
                  </svg>
                )}
                {modality === "text" && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 text-xs font-mono p-4 text-center">
                     [CLS] ... TEXT EMBEDDINGS ... [SEP]
                   </div>
                )}
                {modality === "audio" && (
                   <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                     {Array.from({length: 20}).map((_, i) => (
                       <line key={i} x1="0" y1={i*5} x2="100" y2={i*5} stroke="white" strokeWidth="0.2" opacity="0.3" />
                     ))}
                   </svg>
                )}
              </div>
              
              <div className="relative z-10 w-full h-full p-4">
                <AttentionHeatmap 
                  cells={attentionHeatmap} 
                  rows={8} 
                  cols={8} 
                  width={300}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Importance */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Feature Attribution
            </CardTitle>
            <CardDescription className="text-xs">Relative contribution of features to the final prediction.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center mt-6">
            <div className="space-y-4">
              {featureImportance.map((fi, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">{fi.label}</span>
                    <span className="text-muted-foreground">{Math.round(fi.value * 100)}%</span>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-info' : 'bg-muted-foreground/50'}`}
                      style={{ width: `${fi.value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-4 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-between">
              <span>Methodology: Multi-head Cross-Attention + SHAP</span>
              <span className="font-semibold text-primary">Confidence: {confidence}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Interpretation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Prediction Interpretation
          </CardTitle>
          <CardDescription className="text-xs">Natural language breakdown of the AI's classification reasoning.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-5 rounded-lg border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">Primary Decision: {primaryEmotion}</h3>
              <p className="text-xs text-muted-foreground">Classified via {modality} inputs with {confidence}% confidence.</p>
            </div>
            <Badge variant="outline" className="px-3 py-1 text-sm font-semibold bg-background border-primary/30 text-primary">
              Status: Validated
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Decision Logic</h4>
              <p className="text-sm text-foreground leading-relaxed bg-muted/20 p-4 rounded-lg border border-border/50">
                {currentResult.explanation}
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Explainability Context</h4>
              <div className="text-xs text-muted-foreground leading-relaxed space-y-2 bg-muted/20 p-4 rounded-lg border border-border/50">
                <p>
                  <strong>Integrated Gradients & SHAP:</strong> The attribution highlights feature segments that shifted the classification logit away from the neutral baseline.
                </p>
                <p>
                  For this {modality} prediction, the key activation weights indicate that high intensity patterns matching standard emotional training benchmarks drove the final softmax decision.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
