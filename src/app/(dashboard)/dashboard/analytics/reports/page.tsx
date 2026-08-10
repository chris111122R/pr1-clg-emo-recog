"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  FileBarChart2, FileText, Download, Calendar, Filter, Search,
  CheckCircle2, Clock, AlertTriangle
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MultiSeriesChart, HorizontalBarChart } from "@/components/charts/WorkspaceCharts"
import { C } from "@/components/charts/tokens"

const MOCK_REPORTS = [
  { id: "R-842", title: "Q3 Clinical Trial Efficacy Report", type: "Clinical", date: "2026-07-15", status: "ready", size: "4.2 MB", format: "pdf" },
  { id: "R-843", title: "Platform Usage & API Quotas", type: "Usage", date: "2026-07-18", status: "ready", size: "1.1 MB", format: "csv" },
  { id: "R-844", title: "Bias & Fairness Assessment", type: "Compliance", date: "2026-07-20", status: "processing", size: "--", format: "pdf" },
  { id: "R-845", title: "Model Drift Analysis (30 Days)", type: "System", date: "2026-07-10", status: "error", size: "--", format: "pdf" },
  { id: "R-846", title: "Session Metadata Extract", type: "Export", date: "2026-07-01", status: "ready", size: "18.5 MB", format: "csv" },
]

export default function PlatformReportsPage() {
  const [search, setSearch] = React.useState("")
  const filtered = MOCK_REPORTS.filter(r => r.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileBarChart2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Platform Reports</h1>
            <p className="text-sm text-muted-foreground mt-1">Generate, view, and export aggregate platform analytics.</p>
          </div>
        </div>
        <Button className="gap-2">
          <FileText className="h-4 w-4" /> Generate New Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Generation Activity */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Generated Reports Archive</CardTitle>
              <div className="flex gap-2">
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input 
                    className="pl-8 h-8 text-xs" 
                    placeholder="Search reports..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" className="h-8 gap-1"><Filter className="h-3.5 w-3.5"/> Filter</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-2 font-medium text-muted-foreground">Title</th>
                      <th className="px-4 py-2 font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-2 font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-2 font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-2 font-medium text-muted-foreground text-right">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map(report => (
                      <tr key={report.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium flex items-center gap-2">
                          <FileText className={report.format === 'pdf' ? "h-4 w-4 text-destructive" : "h-4 w-4 text-success"} />
                          {report.title}
                        </td>
                        <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{report.type}</Badge></td>
                        <td className="px-4 py-3 text-muted-foreground tabular-nums flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5"/> {report.date}</td>
                        <td className="px-4 py-3">
                          {report.status === "ready" && <span className="inline-flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-3.5 w-3.5"/> Ready</span>}
                          {report.status === "processing" && <span className="inline-flex items-center gap-1 text-xs text-warning"><Clock className="h-3.5 w-3.5 animate-pulse"/> Generating...</span>}
                          {report.status === "error" && <span className="inline-flex items-center gap-1 text-xs text-destructive"><AlertTriangle className="h-3.5 w-3.5"/> Failed</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" disabled={report.status !== "ready"} className="h-8 gap-1">
                            <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{report.size}</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && <div className="text-center text-muted-foreground py-8">No reports found.</div>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Aggregate Insights */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-sm">Reports Generated (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <MultiSeriesChart 
                data={[
                  { day: "W1", clinical: 12, usage: 4, compliance: 2 },
                  { day: "W2", clinical: 18, usage: 5, compliance: 1 },
                  { day: "W3", clinical: 15, usage: 3, compliance: 5 },
                  { day: "W4", clinical: 22, usage: 8, compliance: 2 },
                ]}
                xKey="day"
                height={160}
                series={[
                  { key: "clinical", name: "Clinical", color: C.primary, type: "area" },
                  { key: "usage", name: "Usage", color: C.info, type: "line" },
                  { key: "compliance", name: "Compliance", color: C.warning, type: "line" }
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-sm">Storage by Type</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <HorizontalBarChart 
                data={[
                  { label: "Clinical Trials", value: 450, unit: "MB", color: C.primary },
                  { label: "Session Extracts", value: 320, unit: "MB", color: C.success },
                  { label: "System Audits", value: 110, unit: "MB", color: C.info },
                  { label: "Compliance", value: 55, unit: "MB", color: C.warning },
                ]}
                max={500}
                height={160}
                barSize={14}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
