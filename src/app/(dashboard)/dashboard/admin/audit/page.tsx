"use client"

import * as React from "react"
import { ShieldCheck, Search, Filter, Download, ArrowRight, User } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const MOCK_AUDIT_LOGS = [
  { id: "LOG-9921", ts: "2026-07-20 09:14:22", user: "sarah.chen@ua-edt.org", action: "UPDATE_CONFIG", target: "Global_Model_Fallback", status: "success" },
  { id: "LOG-9920", ts: "2026-07-20 08:05:11", user: "api-service-prod", action: "BULK_DELETE", target: "Dataset_AffectNet_2025", status: "success" },
  { id: "LOG-9919", ts: "2026-07-19 18:32:04", user: "mjohnson@ua-edt.org", action: "LOGIN", target: "System", status: "success" },
  { id: "LOG-9918", ts: "2026-07-19 18:30:12", user: "mjohnson@ua-edt.org", action: "LOGIN_FAILED", target: "System", status: "failure" },
  { id: "LOG-9917", ts: "2026-07-18 14:12:00", user: "erodriguez@ua-edt.org", action: "EXPORT_DATA", target: "Report_R-842_PDF", status: "success" },
  { id: "LOG-9916", ts: "2026-07-18 09:44:33", user: "system", action: "AUTO_PRUNE", target: "Temp_Storage_Volume", status: "success" },
]

export default function AuditLogPage() {
  const [search, setSearch] = React.useState("")
  const filtered = MOCK_AUDIT_LOGS.filter(l => l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Security Audit Log</h1>
            <p className="text-sm text-muted-foreground mt-1">Immutable ledger of all platform administrative actions and data access events.</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2 border-warning/50 text-warning hover:bg-warning/10 hover:text-warning">
          <Download className="h-4 w-4" /> Export CSV (Last 30 Days)
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by user email or action..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filter Events
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-3 font-semibold text-muted-foreground">Timestamp (UTC)</th>
                  <th className="px-6 py-3 font-semibold text-muted-foreground">Actor</th>
                  <th className="px-6 py-3 font-semibold text-muted-foreground">Event Action</th>
                  <th className="px-6 py-3 font-semibold text-muted-foreground">Target Resource</th>
                  <th className="px-6 py-3 font-semibold text-muted-foreground">Status</th>
                  <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-xs">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-3 text-muted-foreground whitespace-nowrap">{log.ts}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <User className="h-3.5 w-3.5 text-muted-foreground" /> {log.user}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-bold text-primary">{log.action}</span>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{log.target}</td>
                    <td className="px-6 py-3">
                      {log.status === "success" 
                        ? <Badge variant="outline" className="text-success border-success/30 bg-success/10 font-mono">SUCCESS</Badge>
                        : <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10 font-mono">FAILURE</Badge>
                      }
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-muted-foreground font-sans">
                No log entries found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
