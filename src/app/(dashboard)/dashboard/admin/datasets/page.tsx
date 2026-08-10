"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Database, Lock, Globe, EyeOff, MoreHorizontal,
  Archive, ShieldCheck, Trash2, HardDrive
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"

import { AdminPageShell } from "@/components/admin/AdminPageShell"
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import {
  ADMIN_DATASETS, type AdminDataset, type AccessLevel, type DatasetStatus
} from "@/lib/admin-data"
import { cn } from "@/lib/utils"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACCESS_CONFIG: Record<AccessLevel, { label: string; icon: React.ComponentType<{ className?: string }>; badge: string }> = {
  public:     { label: "Public",     icon: Globe,     badge: "bg-success/10 text-success border-success/20"         },
  restricted: { label: "Restricted", icon: ShieldCheck,badge: "bg-warning/10 text-warning border-warning/20"        },
  private:    { label: "Private",    icon: EyeOff,    badge: "bg-destructive/10 text-destructive border-destructive/20" },
}

const STATUS_CONFIG: Record<DatasetStatus, { label: string; badge: string }> = {
  ready:      { label: "Ready",      badge: "bg-success/10 text-success border-success/20" },
  processing: { label: "Processing", badge: "bg-info/10 text-info border-info/20" },
  archived:   { label: "Archived",   badge: "bg-muted text-muted-foreground border-border" },
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(0)} GB`
  return `${(bytes / 1024 ** 2).toFixed(0)} MB`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DatasetsPage() {
  const [datasets, setDatasets] = React.useState<AdminDataset[]>(ADMIN_DATASETS)
  const [accessFilter, setAccessFilter] = React.useState<AccessLevel | "all">("all")
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [confirmTarget, setConfirmTarget] = React.useState<AdminDataset | null>(null)
  const [confirmVariant, setConfirmVariant] = React.useState<"delete" | "revoke">("delete")

  const filtered = accessFilter === "all" ? datasets : datasets.filter(d => d.access === accessFilter)

  const totalBytes = datasets.reduce((s, d) => s + d.sizeBytes, 0)
  const totalMaxBytes = datasets.reduce((s, d) => s + d.maxBytes, 0)
  const totalRecords = datasets.reduce((s, d) => s + d.records, 0)
  const storagePercent = Math.round((totalBytes / totalMaxBytes) * 100)

  function handleArchive(id: string) {
    setDatasets(prev => prev.map(d => d.id === id ? { ...d, status: "archived" as DatasetStatus } : d))
  }

  function handleDeleteConfirm() {
    if (!confirmTarget) return
    if (confirmVariant === "delete") {
      setDatasets(prev => prev.filter(d => d.id !== confirmTarget.id))
    } else {
      setDatasets(prev => prev.map(d =>
        d.id === confirmTarget.id ? { ...d, access: "private" as AccessLevel } : d
      ))
    }
    setConfirmTarget(null)
  }

  const columns: AdminColumn<Record<string, unknown>>[] = [
    {
      key: "name",
      header: "Dataset",
      sortable: true,
      render: (row) => {
        const d = row as unknown as AdminDataset
        return (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
              <Database className="h-4 w-4 text-info" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate max-w-[160px]">{d.name}</p>
              <p className="text-xs text-muted-foreground">{d.type}</p>
            </div>
          </div>
        )
      }
    },
    {
      key: "org",
      header: "Organization",
      sortable: true,
      render: (row) => <span className="text-xs">{(row as unknown as AdminDataset).org}</span>
    },
    {
      key: "records",
      header: "Records",
      sortable: true,
      align: "right",
      render: (row) => (
        <span className="text-xs font-mono">
          {(row as unknown as AdminDataset).records.toLocaleString()}
        </span>
      )
    },
    {
      key: "sizeBytes",
      header: "Storage",
      sortable: true,
      render: (row) => {
        const d = row as unknown as AdminDataset
        const pct = Math.round((d.sizeBytes / d.maxBytes) * 100)
        return (
          <div className="min-w-[120px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">{d.sizeLabel}</span>
              <span className="text-xs text-muted-foreground">{pct}%</span>
            </div>
            <Progress value={pct} className="h-1" />
          </div>
        )
      }
    },
    {
      key: "access",
      header: "Access",
      sortable: true,
      render: (row) => {
        const d = row as unknown as AdminDataset
        const cfg = ACCESS_CONFIG[d.access]
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
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const d = row as unknown as AdminDataset
        const cfg = STATUS_CONFIG[d.status]
        return (
          <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border", cfg.badge)}>
            {cfg.label}
          </span>
        )
      }
    },
    {
      key: "owner",
      header: "Owner",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-muted-foreground">{(row as unknown as AdminDataset).owner}</span>
      )
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "48px",
      render: (row) => {
        const d = row as unknown as AdminDataset
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                className="gap-2 text-xs text-warning focus:text-warning"
                onClick={() => { setConfirmTarget(d); setConfirmVariant("revoke"); setConfirmOpen(true) }}
              >
                <Lock className="h-3.5 w-3.5" /> Restrict Access
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-xs" onClick={() => handleArchive(d.id)}>
                <Archive className="h-3.5 w-3.5 text-muted-foreground" /> Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-xs text-destructive focus:text-destructive"
                onClick={() => { setConfirmTarget(d); setConfirmVariant("delete"); setConfirmOpen(true) }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    },
  ]

  return (
    <AdminPageShell
      title="Dataset Library"
      description="Org-wide dataset management with storage quotas and access control. Admin view includes all datasets across all organizations."
    >
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Database,  label: "Total Datasets",  value: datasets.length,                          color: "text-info",    bg: "bg-info/10"    },
          { icon: HardDrive, label: "Storage Used",    value: formatBytes(totalBytes),                   color: "text-primary", bg: "bg-primary/10" },
          { icon: Globe,     label: "Public",          value: datasets.filter(d => d.access === "public").length,     color: "text-success", bg: "bg-success/10" },
          { icon: Lock,      label: "Private",         value: datasets.filter(d => d.access === "private").length,    color: "text-destructive", bg: "bg-destructive/10" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", s.bg)}>
                  <s.icon className={cn("h-4 w-4", s.color)} />
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Storage overview */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium">Platform Storage Usage</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(totalBytes)} / {formatBytes(totalMaxBytes)} ({storagePercent}%)
              </p>
            </div>
            <Progress value={storagePercent} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <AdminTable
        columns={columns}
        rows={filtered as unknown as Record<string, unknown>[]}
        searchPlaceholder="Search datasets…"
        searchKeys={["name", "org", "owner", "type"]}
        defaultPageSize={10}
        filterSlot={
          <Select value={accessFilter} onValueChange={v => setAccessFilter(v as AccessLevel | "all")}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Access level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All access levels</SelectItem>
              <SelectItem value="public" className="text-xs">Public</SelectItem>
              <SelectItem value="restricted" className="text-xs">Restricted</SelectItem>
              <SelectItem value="private" className="text-xs">Private</SelectItem>
            </SelectContent>
          </Select>
        }
        emptyTitle="No datasets found"
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDeleteConfirm}
        variant={confirmVariant}
        itemName={confirmTarget?.name}
        description={
          confirmVariant === "revoke"
            ? `Restricting access to "${confirmTarget?.name}" will make it private. Users with existing access will lose it immediately.`
            : undefined
        }
      />
    </AdminPageShell>
  )
}
