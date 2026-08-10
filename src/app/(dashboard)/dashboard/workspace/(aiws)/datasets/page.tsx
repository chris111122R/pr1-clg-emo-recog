"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Database, Search, Filter, Plus, FileText, Image as ImageIcon,
  Video, Mic, MoreVertical, CheckCircle2, Clock, AlertTriangle, ArrowUpDown
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const MOCK_DATASETS = [
  { id: "ds-01", name: "AffectNet Subset 2026", type: "image", size: "4.2 GB", rows: "24,500", modified: "2026-07-18", status: "ready" },
  { id: "ds-02", name: "Clinical Video Interviews", type: "video", size: "18.5 GB", rows: "1,200", modified: "2026-07-15", status: "ready" },
  { id: "ds-03", name: "Call Center Audio (Q2)", type: "audio", size: "8.1 GB", rows: "45,000", modified: "2026-07-10", status: "processing" },
  { id: "ds-04", name: "Customer Feedback Text", type: "text", size: "120 MB", rows: "150,000", modified: "2026-07-02", status: "ready" },
  { id: "ds-05", name: "Driver Monitoring DB", type: "video", size: "32.0 GB", rows: "8,500", modified: "2026-06-28", status: "error" },
  { id: "ds-06", name: "Synthetic Faces v3", type: "image", size: "2.1 GB", rows: "10,000", modified: "2026-06-15", status: "ready" },
]

const TYPE_ICONS = {
  image: ImageIcon,
  video: Video,
  audio: Mic,
  text: FileText,
}

const STATUS_CONFIG = {
  ready: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Ready" },
  processing: { icon: Clock, color: "text-warning", bg: "bg-warning/10", label: "Processing" },
  error: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", label: "Error" },
}

export default function DatasetsPage() {
  const [search, setSearch] = React.useState("")
  
  const filtered = MOCK_DATASETS.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dataset Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage training and evaluation data across modalities.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New Dataset
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search datasets..." 
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
                <th className="px-4 py-3 font-semibold text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Type</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Size</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Records</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Last Modified</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((ds, i) => {
                const TypeIcon = TYPE_ICONS[ds.type as keyof typeof TYPE_ICONS]
                const Status = STATUS_CONFIG[ds.status as keyof typeof STATUS_CONFIG]
                const SIcon = Status.icon
                return (
                  <motion.tr 
                    key={ds.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{ds.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="gap-1 capitalize">
                        <TypeIcon className="h-3 w-3 text-muted-foreground" />
                        {ds.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{ds.size}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{ds.rows}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{ds.modified}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium ${Status.bg} ${Status.color}`}>
                        <SIcon className="h-3 w-3" />
                        {Status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No datasets found matching your search.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
