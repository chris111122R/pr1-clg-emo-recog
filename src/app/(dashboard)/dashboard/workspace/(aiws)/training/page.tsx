"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { TrendingUp, Cpu, Server, Database, Terminal, Square, Activity, AlertTriangle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MultiSeriesChart, RadialGauge } from "@/components/charts/WorkspaceCharts"
import { C } from "@/components/charts/tokens"

const TOTAL_EPOCHS = 50

interface LogEntry {
  ts: string
  level: "INFO" | "WARN" | "ERROR" | "DEBUG"
  msg: string
}

function generateMetrics(epoch: number) {
  const t = epoch / TOTAL_EPOCHS
  // Smooth curve for loss decreasing and accuracy increasing
  const trainLoss = 2.5 * Math.exp(-4 * t) + 0.1 + (Math.random() * 0.05)
  const valLoss = 2.4 * Math.exp(-3.5 * t) + 0.15 + (Math.random() * 0.08)
  
  const trainAcc = 100 - (60 * Math.exp(-5 * t)) + (Math.random() * 1.5)
  const valAcc = 100 - (65 * Math.exp(-4.5 * t)) + (Math.random() * 2)

  return {
    epoch,
    trainLoss,
    valLoss,
    trainAcc: Math.min(trainAcc, 100),
    valAcc: Math.min(valAcc, 100)
  }
}

export default function TrainingStatusPage() {
  const [running, setRunning] = React.useState(true)
  const [epoch, setEpoch] = React.useState(12)
  const [metrics, setMetrics] = React.useState(() => 
    Array.from({ length: 12 }, (_, i) => generateMetrics(i + 1))
  )
  const [logs, setLogs] = React.useState<LogEntry[]>([
    { ts: "00:00:01", level: "INFO", msg: "Initialized FusionAffect-X Large configuration." },
    { ts: "00:00:03", level: "INFO", msg: "Loading dataset AffectNet Subset 2026..." },
    { ts: "00:00:15", level: "INFO", msg: "Dataset loaded. 24,500 records found." },
    { ts: "00:00:16", level: "INFO", msg: "Building computational graph for 1.2B parameters." },
    { ts: "00:00:42", level: "WARN", msg: "Memory utilization high on GPU 0 (85%). Consider reducing batch size." },
    { ts: "00:01:05", level: "INFO", msg: "Starting training loop. Max epochs: 50." },
  ])
  const logEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!running || epoch >= TOTAL_EPOCHS) return
    const id = setInterval(() => {
      setEpoch(e => {
        const next = e + 1
        setMetrics(m => [...m, generateMetrics(next)])
        
        // Add log
        const date = new Date()
        const ts = `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}:${String(date.getSeconds()).padStart(2,'0')}`
        setLogs(l => [...l, { ts, level: "INFO", msg: `Epoch ${next}/${TOTAL_EPOCHS} completed in 14.2s. loss: ${generateMetrics(next).trainLoss.toFixed(4)}` }])
        
        return next
      })
    }, 3000)
    return () => clearInterval(id)
  }, [running, epoch])

  React.useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  const latest = metrics[metrics.length - 1]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Training Status</h1>
            {running && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Training
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Run ID: <span className="font-mono text-foreground">trn_948a2f1c</span> · Started 4m 12s ago</p>
        </div>
        <Button variant={running ? "destructive" : "default"} onClick={() => setRunning(!running)} className="gap-2">
          {running ? <><Square className="h-4 w-4" /> Stop Run</> : <><Activity className="h-4 w-4" /> Resume</>}
        </Button>
      </div>

      {/* Top row: Progress & Hardware */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Epoch Progress</span>
              <span className="font-mono text-primary">{epoch} / {TOTAL_EPOCHS}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={(epoch / TOTAL_EPOCHS) * 100} className="h-3" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>0</span>
              <span>ETA: {Math.round((TOTAL_EPOCHS - epoch) * 14.2 / 60)}m left</span>
              <span>{TOTAL_EPOCHS}</span>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mt-6">
              {[
                { label: "Train Loss", val: latest?.trainLoss.toFixed(4), color: "text-foreground" },
                { label: "Val Loss", val: latest?.valLoss.toFixed(4), color: "text-primary" },
                { label: "Train Acc", val: `${latest?.trainAcc.toFixed(1)}%`, color: "text-success" },
                { label: "Val Acc", val: `${latest?.valAcc.toFixed(1)}%`, color: "text-warning" },
              ].map(stat => (
                <div key={stat.label} className="bg-muted/30 p-3 rounded-lg border border-border/50 text-center">
                  <p className={`text-xl font-bold font-mono tracking-tighter ${stat.color}`}>{stat.val}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Hardware Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-around pt-2">
              <RadialGauge value={88} size={90} color={C.primary} label="GPU 0" />
              <RadialGauge value={92} size={90} color={C.info} label="GPU 1" />
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground"><Cpu className="h-3.5 w-3.5"/> CPU</span>
                <span className="font-mono font-medium">45%</span>
              </div>
              <Progress value={45} className="h-1.5 [&>div]:bg-info" />
              
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground"><Server className="h-3.5 w-3.5"/> RAM</span>
                <span className="font-mono font-medium">42GB / 64GB</span>
              </div>
              <Progress value={65} className="h-1.5 [&>div]:bg-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-sm">Loss Curve</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <MultiSeriesChart 
              data={metrics} 
              xKey="epoch"
              height={200}
              series={[
                { key: "trainLoss", name: "Training", color: C.muted, type: "line" },
                { key: "valLoss", name: "Validation", color: C.primary, type: "line" }
              ]}
              tooltipFormatter={(v) => v.toFixed(4)}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-sm">Accuracy Curve</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <MultiSeriesChart 
              data={metrics} 
              xKey="epoch"
              height={200}
              series={[
                { key: "trainAcc", name: "Training", color: C.success, type: "area" },
                { key: "valAcc", name: "Validation", color: C.warning, type: "area" }
              ]}
              yDomain={[40, 100]}
              tooltipFormatter={(v) => `${v.toFixed(1)}%`}
            />
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Logs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Terminal className="h-4 w-4 text-muted-foreground" /> Console Output
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-[#0c0c0c] border border-border/20 rounded-lg h-64 overflow-y-auto p-4 font-mono text-xs shadow-inner">
            {logs.map((log, i) => {
              const colors = {
                INFO: "text-blue-400",
                WARN: "text-yellow-400",
                ERROR: "text-red-400",
                DEBUG: "text-gray-500"
              }
              return (
                <div key={i} className="flex items-start gap-3 mb-1.5 leading-relaxed hover:bg-white/5 px-1 -mx-1 rounded">
                  <span className="text-gray-500 shrink-0 w-16">{log.ts}</span>
                  <span className={`${colors[log.level]} shrink-0 w-10 font-bold`}>{log.level}</span>
                  <span className="text-gray-300 break-all">{log.msg}</span>
                </div>
              )
            })}
            <div ref={logEndRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
