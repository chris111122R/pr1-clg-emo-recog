"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ListOrdered, Play, Pause, X, CheckCircle2, Clock, 
  Activity, Zap, MoreVertical
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface Job {
  id: string
  name: string
  stage: string
  progress: number
  eta: string
  status: "running" | "queued" | "completed" | "failed" | "paused"
  type: "inference" | "training" | "preprocessing"
}

const INITIAL_JOBS: Job[] = [
  { id: "j1", name: "Clinical Video Batch 01", stage: "Feature Extraction (FACS)", progress: 45, eta: "2m 15s", status: "running", type: "inference" },
  { id: "j2", name: "Audio Prosody Baseline", stage: "Waiting for GPU...", progress: 0, eta: "--", status: "queued", type: "preprocessing" },
  { id: "j3", name: "AffectNet Fine-tune v4", stage: "Epoch 12/50", progress: 24, eta: "1h 45m", status: "running", type: "training" },
  { id: "j4", name: "Synthetic Faces Eval", stage: "Completed", progress: 100, eta: "--", status: "completed", type: "inference" },
]

export default function ProcessingQueuePage() {
  const [jobs, setJobs] = React.useState<Job[]>(INITIAL_JOBS)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setJobs(current => current.map(job => {
        if (job.status !== "running") return job
        const increment = job.type === "training" ? 0.5 : 2
        const next = Math.min(job.progress + increment, 100)
        if (next === 100) {
          return { ...job, progress: 100, status: "completed", stage: "Completed", eta: "--" }
        }
        
        let newEta = job.eta
        if (job.eta !== "--") {
          const parts = job.eta.split(" ")
          let secs = parseInt(parts.pop()?.replace("s", "") || "0")
          let mins = parseInt(parts.pop()?.replace("m", "") || "0")
          secs -= 2
          if (secs < 0) {
            secs += 60
            mins -= 1
          }
          if (mins < 0) newEta = "few seconds"
          else newEta = `${mins}m ${secs}s`
        }

        return { ...job, progress: next, eta: newEta }
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const togglePause = (id: string) => {
    setJobs(jobs.map(j => {
      if (j.id === id) {
        if (j.status === "running") return { ...j, status: "paused" }
        if (j.status === "paused") return { ...j, status: "running" }
      }
      return j
    }))
  }

  const removeJob = (id: string) => {
    setJobs(jobs.filter(j => j.id !== id))
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Processing Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor and manage background tasks and model inference jobs.</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">GPU Utilization:</span>
          <span className="font-bold text-foreground">84%</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            <AnimatePresence>
              {jobs.map(job => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center hover:bg-muted/10 transition-colors"
                >
                  {/* Icon */}
                  <div className="h-10 w-10 shrink-0 rounded-full bg-secondary flex items-center justify-center">
                    {job.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : job.status === "running" ? (
                      <Activity className="h-5 w-5 text-primary animate-pulse" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">{job.name}</h3>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-5 px-1.5 py-0">
                        {job.type}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs text-muted-foreground">
                      <span className="flex-1 truncate">{job.stage}</span>
                      {job.status === "running" && (
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
                          ETA: {job.eta}
                        </span>
                      )}
                      {job.status === "paused" && <span className="text-warning">Paused</span>}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full sm:w-48 flex items-center gap-3 shrink-0">
                    <Progress 
                      value={job.progress} 
                      className={`h-2 flex-1 ${job.status === "completed" ? "[&>div]:bg-success" : job.status === "paused" ? "[&>div]:bg-warning" : ""}`} 
                    />
                    <span className="text-xs font-mono w-9 text-right font-medium">
                      {Math.round(job.progress)}%
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1 shrink-0 w-24">
                    {(job.status === "running" || job.status === "paused") && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => togglePause(job.id)}>
                        {job.status === "running" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeJob(job.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {jobs.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <ListOrdered className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No active jobs in the queue.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
