"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Zap, Info, ArrowRight } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAnalysis } from "@/lib/AnalysisContext"

export function AnalyzeEmotion() {
  const { currentResult } = useAnalysis()

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input Summary Section */}
      <div className="space-y-6">
        <Card className="border-primary/10 shadow-md h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">Current Input</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
            {!currentResult ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">No data has been analyzed yet.</p>
                <Link href="/dashboard" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2">
                  Go to Analysis Tool <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="text-center space-y-4 w-full">
                <Badge variant="outline" className="mb-2 text-sm px-3 py-1 uppercase tracking-widest">
                  {currentResult.modality}
                </Badge>
                <div className="bg-muted/50 p-6 rounded-lg w-full text-left break-words overflow-hidden text-sm border shadow-sm">
                  <span className="font-semibold block mb-2 text-muted-foreground">Input Data Summary:</span>
                  <p className="italic text-foreground">
                    {currentResult.modality === 'text'
                      ? `"${currentResult.inputSummary}"`
                      : currentResult.inputSummary}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Analyzed at {currentResult.timestamp.toLocaleTimeString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {!currentResult && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-xl border-dashed bg-muted/20"
            >
              <Zap className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">Ready for Prediction</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                Submit an input in the Analysis Tool to view the emotion classification.
              </p>
            </motion.div>
          )}

          {currentResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="border-green-500/20 shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-full -z-10 blur-2xl"></div>
                <CardHeader className="pb-4 border-b bg-muted/20">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-muted-foreground">Predicted Emotion</CardTitle>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Synced via Tool</Badge>
                  </div>
                  <div className="text-4xl font-extrabold tracking-tight mt-2 flex items-baseline gap-4">
                    {currentResult.primaryEmotion}
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      {currentResult.trend}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Confidence Score</span>
                        <span className="text-sm font-bold text-green-600">{currentResult.confidence}%</span>
                      </div>
                      <Progress value={currentResult.confidence} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Uncertainty</span>
                        <span className="text-sm font-bold text-amber-500">{currentResult.totalUncertainty}%</span>
                      </div>
                      <Progress value={currentResult.totalUncertainty} className="h-2" />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                      <Info className="h-4 w-4" /> Explainable AI Summary
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed bg-muted/40 p-4 rounded-lg border">
                      {currentResult.explanation}
                    </p>
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
