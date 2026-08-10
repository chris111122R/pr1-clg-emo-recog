"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { FileText, Download, Filter, Search, FileDown, Calendar, MoreVertical, FileBarChart } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const REPORTS = [
  { id: "rep-001", name: "Q2 Affect Model Performance Evaluation", date: "2026-07-01", type: "Evaluation", size: "2.4 MB", format: "PDF" },
  { id: "rep-002", name: "Training Run Log (exp-094)", date: "2026-07-18", type: "Training Log", size: "850 KB", format: "CSV" },
  { id: "rep-003", name: "Bias & Fairness Assessment - Clinical Dataset", date: "2026-06-15", type: "Compliance", size: "4.1 MB", format: "PDF" },
  { id: "rep-004", name: "Feature Importance Extract (July)", date: "2026-07-10", type: "Explainability", size: "1.2 MB", format: "JSON" },
  { id: "rep-005", name: "Synthetic Dataset Validation", date: "2026-06-20", type: "Evaluation", size: "3.2 MB", format: "PDF" },
]

export default function ReportsPage() {
  const [search, setSearch] = React.useState("")
  
  const filtered = REPORTS.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Generated evaluations, training logs, and compliance assessments.</p>
        </div>
        <Button className="gap-2">
          <FileBarChart className="h-4 w-4" /> Generate New Report
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search reports..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filter by Type
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 font-semibold text-muted-foreground">Report Name</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Type</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Generated Date</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Format</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Size</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((rep, i) => (
                <motion.tr 
                  key={rep.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    {rep.name}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="font-normal">{rep.type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> {rep.date}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[10px] font-mono">{rep.format}</Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{rep.size}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <FileDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No reports found matching your search.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
