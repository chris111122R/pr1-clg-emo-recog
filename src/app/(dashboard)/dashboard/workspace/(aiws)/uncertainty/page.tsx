"use client"

import * as React from "react"
import { Gauge, ShieldAlert, AlertCircle, Info, ShieldCheck } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConfidenceBandChart } from "@/components/charts/WorkspaceCharts"
import { C } from "@/components/charts/tokens"
import { Progress } from "@/components/ui/progress"
import { useAnalysis } from "@/lib/AnalysisContext"

export default function UncertaintyAnalysisPage() {
  const { currentResult } = useAnalysis()

  if (!currentResult) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Gauge className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h1 className="text-2xl font-bold tracking-tight mb-2">Uncertainty Analysis</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          No analysis data found. Please run an analysis in the Analysis Tool to view uncertainty metrics.
        </p>
        <Button asChild>
          <Link href="/dashboard">Go to Analysis Tool</Link>
        </Button>
      </div>
    )
  }

  const { totalUncertainty, epistemicUncertainty, aleatoricUncertainty, confidenceDistribution, primaryEmotion } = currentResult

  const formattedDistData = confidenceDistribution.map(d => ({
    ...d,
    color: d.label === primaryEmotion ? C.high : (d.mean > 15 ? C.medium : C.low)
  }))

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Gauge className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Uncertainty Analysis</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Epistemic and Aleatoric uncertainty metrics calculated via Monte Carlo Dropout approximations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Cards */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Uncertainty</p>
                <p className="text-3xl font-bold text-foreground">{totalUncertainty}%</p>
              </div>
              <div className={`p-2 rounded-lg ${totalUncertainty < 15 ? 'bg-success/10' : 'bg-warning/10'}`}>
                {totalUncertainty < 15 
                  ? <ShieldCheck className="h-5 w-5 text-success" />
                  : <AlertCircle className="h-5 w-5 text-warning" />
                }
              </div>
            </div>
            <Progress value={totalUncertainty} max={50} className={`h-2 [&>div]:${totalUncertainty < 15 ? 'bg-success' : 'bg-warning'}`} />
            <p className="text-xs text-muted-foreground mt-3">
              {totalUncertainty < 15 ? "Well below the 15% safety threshold. High reliability." : "Moderate uncertainty detected. Model is less confident."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  Epistemic (Model) <Info className="h-3 w-3 text-muted-foreground/50"/>
                </p>
                <p className="text-3xl font-bold text-foreground">{epistemicUncertainty}%</p>
              </div>
            </div>
            <Progress value={epistemicUncertainty} max={25} className="h-2 [&>div]:bg-primary" />
            <p className="text-xs text-muted-foreground mt-3">
              {epistemicUncertainty < 10 ? "Model recognizes this data distribution well." : "Potential out-of-distribution sample detected."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  Aleatoric (Data) <Info className="h-3 w-3 text-muted-foreground/50"/>
                </p>
                <p className="text-3xl font-bold text-foreground">{aleatoricUncertainty}%</p>
              </div>
            </div>
            <Progress value={aleatoricUncertainty} max={25} className="h-2 [&>div]:bg-info" />
            <p className="text-xs text-muted-foreground mt-3">
              {aleatoricUncertainty < 10 ? "Clean input signal with minimal noise." : "Inherent noise in input signal (e.g. motion blur, background noise)."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-0 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Class Confidence Distributions
              </CardTitle>
              <CardDescription className="text-xs mt-1">Variance across stochastic forward passes.</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: C.high }} /> Primary Emotion
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: C.medium }} /> Secondary
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: C.low }} /> Suppressed
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8 pb-4 overflow-x-auto space-y-6">
          <div className="min-w-[500px]">
            <ConfidenceBandChart series={formattedDistData} height={320} />
          </div>
          
          <div className="pt-4 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chart Explanation</h4>
              <p className="text-muted-foreground leading-relaxed">
                This chart displays the confidence distribution for each emotion category across 15 stochastic forward passes (Monte Carlo Dropout runs). The shaded band bounds the 25th to 75th percentile ranges, while the solid center tick denotes the median confidence score.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Predictive Stability</h4>
              <p className="text-muted-foreground leading-relaxed">
                A highly compressed, narrow band represents a stable prediction with low variance (high consensus). A wider, stretched band indicates conflicting signals, alerting clinicians that the model is processing mixed indicators.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
