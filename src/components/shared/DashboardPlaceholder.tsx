"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { BrainCircuit, Activity, ShieldCheck, BarChart3, ArrowRight, Zap } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const STAT_CARDS = [
  { title: "Active Sessions", value: "12", delta: "+3 today", icon: Activity, color: "text-info" },
  { title: "Avg. Confidence", value: "94.2%", delta: "+2.1% vs last week", icon: ShieldCheck, color: "text-success" },
  { title: "Twins Generated", value: "1,438", delta: "+58 this week", icon: BrainCircuit, color: "text-primary" },
  { title: "Reports Exported", value: "24", delta: "8 pending", icon: BarChart3, color: "text-warning" },
]

const RECENT_SESSIONS = [
  { id: "S-007", subject: "Participant 012", emotion: "Neutral", confidence: 91, status: "complete" },
  { id: "S-006", subject: "Participant 009", emotion: "Contemplative", confidence: 78, status: "review" },
  { id: "S-005", subject: "Participant 007", emotion: "Joy", confidence: 97, status: "complete" },
  { id: "S-004", subject: "Participant 003", emotion: "Sadness", confidence: 64, status: "low-conf" },
]

const statusBadge: Record<string, React.ReactNode> = {
  complete: <Badge variant="success">Complete</Badge>,
  review: <Badge variant="info">In Review</Badge>,
  "low-conf": <Badge variant="warning">Low Confidence</Badge>,
}

function StatCard({ title, value, delta, icon: Icon, color, delay }: typeof STAT_CARDS[0] & { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{delta}</p>
        </CardContent>
        {/* Subtle gradient accent */}
        <div className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent ${
          color.replace("text-", "via-").replace("text-", "via-")
        } to-transparent opacity-40`} />
      </Card>
    </motion.div>
  )
}

export function DashboardPlaceholder() {
  const [loaded, setLoaded] = React.useState(false)
  React.useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Good morning, Jane 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's what's happening in your workspace today.
          </p>
        </div>
        <Button className="shrink-0 gap-2">
          <Zap className="h-4 w-4" />
          New Session
        </Button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => (
          <StatCard key={card.title} {...card} delay={i * 0.07} />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent sessions table */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Recent Sessions</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-7">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {!loaded ? (
                <div className="p-4 space-y-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-8 w-16 rounded" />
                      <Skeleton className="h-4 flex-1 rounded" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {RECENT_SESSIONS.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <code className="text-xs font-mono text-muted-foreground w-12 shrink-0">
                        {session.id}
                      </code>
                      <span className="flex-1 text-sm font-medium truncate">{session.subject}</span>
                      <span className="text-sm text-muted-foreground hidden sm:block w-32 truncate">
                        {session.emotion}
                      </span>
                      <div className="hidden md:flex items-center gap-2 w-28">
                        <Progress
                          value={session.confidence}
                          variant={session.confidence >= 80 ? "confidence" : "default"}
                          className="h-1.5 flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {session.confidence}%
                        </span>
                      </div>
                      {statusBadge[session.status]}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right column */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {/* Model status card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Model Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!loaded ? (
                <>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-2 w-full" />
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Inference Latency</span>
                      <span className="font-medium text-success">42ms</span>
                    </div>
                    <Progress value={84} variant="confidence" className="h-1.5" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GPU Utilization</span>
                      <span className="font-medium">67%</span>
                    </div>
                    <Progress value={67} className="h-1.5" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Queue Depth</span>
                      <span className="font-medium text-warning">8 jobs</span>
                    </div>
                    <Progress value={40} className="h-1.5" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Upload Dataset",
                "Schedule Batch Run",
                "Export Monthly Report",
                "Invite Team Member",
              ].map((action) => (
                <Button
                  key={action}
                  variant="ghost"
                  className="w-full justify-start text-sm h-9 gap-2 text-muted-foreground"
                >
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  {action}
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
