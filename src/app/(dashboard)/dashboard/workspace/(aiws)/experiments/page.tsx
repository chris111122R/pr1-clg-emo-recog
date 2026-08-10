"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FlaskConical, Search, Filter, GitCommit, Clock, CheckCircle2, XCircle, ChevronDown, ChevronRight, Scale } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const EXPERIMENTS = [
  { id: "exp-094", name: "Fusion-X Lr Search", model: "FusionAffect-X L", status: "completed", duration: "14h 22m", valAcc: 94.2, valLoss: 0.184, date: "2026-07-18", bs: 32, lr: 0.001, dropout: 0.2 },
  { id: "exp-093", name: "Fusion-X Base Baseline", model: "FusionAffect-X Base", status: "completed", duration: "4h 15m", valAcc: 91.8, valLoss: 0.210, date: "2026-07-16", bs: 64, lr: 0.003, dropout: 0.1 },
  { id: "exp-092", name: "Audio Prosody Tune", model: "VocalProsody-Net", status: "failed", duration: "1h 10m", valAcc: 65.4, valLoss: 0.890, date: "2026-07-15", bs: 16, lr: 0.01, dropout: 0.3 },
  { id: "exp-091", name: "FaceMesh Pretrain", model: "FaceMesh-Affect", status: "completed", duration: "22h 45m", valAcc: 92.1, valLoss: 0.198, date: "2026-07-10", bs: 128, lr: 0.0005, dropout: 0.2 },
  { id: "exp-090", name: "Fusion-X No Audio", model: "FusionAffect-X L", status: "completed", duration: "12h 05m", valAcc: 88.5, valLoss: 0.312, date: "2026-07-08", bs: 32, lr: 0.001, dropout: 0.2 },
]

export default function ExperimentsPage() {
  const [search, setSearch] = React.useState("")
  const [expanded, setExpanded] = React.useState<string | null>(null)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  
  const filtered = EXPERIMENTS.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()))

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Experiment Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">Compare hyperparameter configurations and validation metrics across runs.</p>
        </div>
        <Button disabled={selected.size < 2} className="gap-2">
          <Scale className="h-4 w-4" /> Compare Selected ({selected.size})
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search experiments by name or ID..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3 font-semibold text-muted-foreground w-10"></th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Run ID & Name</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Base Model</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Val Acc</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Val Loss</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Duration</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((exp) => (
                <React.Fragment key={exp.id}>
                  <tr className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selected.has(exp.id)}
                        onChange={() => toggleSelect(exp.id)}
                        className="rounded border-primary text-primary focus:ring-primary h-4 w-4 cursor-pointer" 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => setExpanded(expanded === exp.id ? null : exp.id)}
                        className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                      >
                        {expanded === exp.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{exp.id}</span>
                        <span>{exp.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{exp.model}</td>
                    <td className={`px-4 py-3 text-right font-bold tabular-nums ${exp.status === 'failed' ? 'text-muted-foreground' : exp.valAcc > 90 ? 'text-success' : 'text-warning'}`}>
                      {exp.valAcc.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {exp.valLoss.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> {exp.duration}
                    </td>
                    <td className="px-4 py-3">
                      {exp.status === "completed" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-success font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-destructive font-medium">
                          <XCircle className="h-3.5 w-3.5" /> Failed
                        </span>
                      )}
                    </td>
                  </tr>
                  
                  {/* Expanded Row */}
                  <AnimatePresence>
                    {expanded === exp.id && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-muted/10 border-b border-border/50 overflow-hidden"
                          >
                            <div className="p-6 pl-24 grid grid-cols-1 sm:grid-cols-3 gap-6">
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Hyperparameters</h4>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                  <dt className="text-muted-foreground">Batch Size:</dt>
                                  <dd className="font-mono font-medium">{exp.bs}</dd>
                                  <dt className="text-muted-foreground">Learning Rate:</dt>
                                  <dd className="font-mono font-medium">{exp.lr}</dd>
                                  <dt className="text-muted-foreground">Dropout:</dt>
                                  <dd className="font-mono font-medium">{exp.dropout}</dd>
                                </dl>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Commit & Logs</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-foreground">
                                    <GitCommit className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-mono text-primary">a4f9b21</span> Update loss weighting
                                  </div>
                                  <Button variant="link" className="h-auto p-0 text-xs">View TensorBoard Logs</Button>
                                  <Button variant="link" className="h-auto p-0 text-xs block">Download Checkpoint</Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No experiments found matching your search.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
