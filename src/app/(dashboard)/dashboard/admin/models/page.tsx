"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  BrainCircuit, MoreHorizontal, Rocket, RotateCcw, XCircle,
  CheckCircle2, Clock, AlertTriangle
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import { AdminPageShell } from "@/components/admin/AdminPageShell"
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { ADMIN_MODELS, type AdminModel, type ModelStatus } from "@/lib/admin-data"
import { cn } from "@/lib/utils"

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ModelStatus, {
  label: string; icon: React.ComponentType<{ className?: string }>; badge: string
}> = {
  deployed:   { label: "Deployed",   icon: CheckCircle2,  badge: "bg-success/10 text-success border-success/20" },
  staging:    { label: "Staging",    icon: Clock,         badge: "bg-info/10 text-info border-info/20"          },
  deprecated: { label: "Deprecated", icon: AlertTriangle, badge: "bg-warning/10 text-warning border-warning/20" },
  failed:     { label: "Failed",     icon: XCircle,       badge: "bg-destructive/10 text-destructive border-destructive/20" },
}

const FRAMEWORK_COLORS: Record<string, string> = {
  PyTorch:    "bg-orange-500/10 text-orange-500",
  TensorFlow: "bg-amber-500/10 text-amber-600",
  ONNX:       "bg-blue-500/10 text-blue-500",
  HuggingFace:"bg-yellow-400/10 text-yellow-600",
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function ModelStatCard({ label, value, sub, color, delay }: {
  label: string; value: string | number; sub: string; color: string; delay: number
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card>
        <CardContent className="p-4">
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className={cn("text-xs font-semibold", color)}>{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ModelsPage() {
  const [models, setModels] = React.useState<AdminModel[]>(ADMIN_MODELS)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [confirmTarget, setConfirmTarget] = React.useState<AdminModel | null>(null)
  const [confirmVariant, setConfirmVariant] = React.useState<"rollback" | "delete">("rollback")

  const deployed   = models.filter(m => m.status === "deployed").length
  const staging    = models.filter(m => m.status === "staging").length
  const deprecated = models.filter(m => m.status === "deprecated").length
  const failed     = models.filter(m => m.status === "failed").length

  function handleDeploy(model: AdminModel) {
    setModels(prev => prev.map(m =>
      m.id === model.id ? { ...m, status: "deployed" as ModelStatus } : m
    ))
  }

  function handleRollback() {
    if (!confirmTarget) return
    setModels(prev => prev.map(m =>
      m.id === confirmTarget.id ? { ...m, status: "deprecated" as ModelStatus } : m
    ))
    setConfirmTarget(null)
  }

  const columns: AdminColumn<Record<string, unknown>>[] = [
    {
      key: "name",
      header: "Model",
      sortable: true,
      render: (row) => {
        const m = row as unknown as AdminModel
        return (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <BrainCircuit className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.version}</p>
            </div>
          </div>
        )
      }
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const m = row as unknown as AdminModel
        const cfg = STATUS_CONFIG[m.status]
        const Icon = cfg.icon
        return (
          <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border", cfg.badge)}>
            <Icon className="h-3 w-3" />
            {cfg.label}
          </span>
        )
      }
    },
    {
      key: "framework",
      header: "Framework",
      sortable: true,
      render: (row) => {
        const m = row as unknown as AdminModel
        return (
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-md", FRAMEWORK_COLORS[m.framework] ?? "bg-muted text-muted-foreground")}>
            {m.framework}
          </span>
        )
      }
    },
    {
      key: "accuracy",
      header: "Accuracy",
      sortable: true,
      render: (row) => {
        const m = row as unknown as AdminModel
        if (m.accuracy === 0) return <span className="text-xs text-muted-foreground">—</span>
        return (
          <div className="flex items-center gap-2 w-28">
            <Progress value={m.accuracy} className="h-1.5 flex-1" />
            <span className="text-xs font-medium w-12 text-right">{m.accuracy}%</span>
          </div>
        )
      }
    },
    {
      key: "inferenceLatency",
      header: "Latency",
      sortable: true,
      align: "right",
      render: (row) => {
        const m = row as unknown as AdminModel
        return m.inferenceLatency === 0
          ? <span className="text-xs text-muted-foreground">—</span>
          : <span className="text-xs font-mono">{m.inferenceLatency}ms</span>
      }
    },
    {
      key: "deployedAt",
      header: "Deployed",
      sortable: true,
      nowrap: true,
      render: (row) => (
        <span className="text-xs text-muted-foreground">{(row as unknown as AdminModel).deployedAt}</span>
      )
    },
    {
      key: "size",
      header: "Size",
      render: (row) => (
        <span className="text-xs font-mono text-muted-foreground">{(row as unknown as AdminModel).size}</span>
      )
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "48px",
      render: (row) => {
        const m = row as unknown as AdminModel
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {m.status === "staging" && (
                <DropdownMenuItem className="gap-2 text-xs text-success focus:text-success" onClick={() => handleDeploy(m)}>
                  <Rocket className="h-3.5 w-3.5" /> Deploy
                </DropdownMenuItem>
              )}
              {m.status === "deployed" && (
                <DropdownMenuItem
                  className="gap-2 text-xs text-warning focus:text-warning"
                  onClick={() => { setConfirmTarget(m); setConfirmVariant("rollback"); setConfirmOpen(true) }}
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Rollback
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-xs text-destructive focus:text-destructive"
                onClick={() => { setConfirmTarget(m); setConfirmVariant("delete"); setConfirmOpen(true) }}
                disabled={m.status === "deployed"}
              >
                <XCircle className="h-3.5 w-3.5" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    },
  ]

  return (
    <AdminPageShell
      title="Model Registry"
      description="Admin-level model management — deploy, rollback, and audit all AI model versions. Distinct from the user-facing model selector."
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ModelStatCard label="Deployed"   value={deployed}   sub="In production"    color="text-success"     delay={0}    />
        <ModelStatCard label="Staging"    value={staging}    sub="Awaiting approval" color="text-info"        delay={0.06} />
        <ModelStatCard label="Deprecated" value={deprecated} sub="Rolled back"       color="text-warning"     delay={0.12} />
        <ModelStatCard label="Failed"     value={failed}     sub="Deploy error"      color="text-destructive" delay={0.18} />
      </div>

      <AdminTable
        columns={columns}
        rows={models as unknown as Record<string, unknown>[]}
        searchPlaceholder="Search models…"
        searchKeys={["name", "version", "framework", "trainedOn"]}
        defaultPageSize={10}
        emptyTitle="No models found"
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleRollback}
        variant={confirmVariant}
        itemName={confirmTarget ? `${confirmTarget.name} ${confirmTarget.version}` : undefined}
        description={
          confirmVariant === "rollback"
            ? `Rolling back ${confirmTarget?.name} ${confirmTarget?.version} will remove it from production and mark it as deprecated. Users will be switched to the previous stable version.`
            : undefined
        }
      />
    </AdminPageShell>
  )
}
