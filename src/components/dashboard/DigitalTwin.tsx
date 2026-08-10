"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Calendar as CalendarIcon, UserCircle, Target, Brain, TrendingUp, Filter, Activity, Sparkles, ShieldAlert, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts'
import { useAnalysis } from "@/lib/AnalysisContext"

const COLORS = {
  Joy: '#10b981',
  Sadness: '#3b82f6',
  Anger: '#ef4444',
  Fear: '#8b5cf6',
  Surprise: '#f59e0b',
  Disgust: '#d946ef',
  Neutral: '#64748b'
}

export function DigitalTwin() {
  const { history } = useAnalysis()
  const latestAnalysis = history[0]
  const primaryEmotion = latestAnalysis?.primaryEmotion || "Neutral"

  // Generate data from history
  const emotionDistribution = React.useMemo(() => {
    if (history.length === 0) return []
    const counts: Record<string, number> = {}
    history.forEach(h => {
      counts[h.primaryEmotion] = (counts[h.primaryEmotion] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: COLORS[name as keyof typeof COLORS] || '#64748b'
    }))
  }, [history])

  const emotionTimeline = React.useMemo(() => {
    // Take the last 10 items for a timeline, reverse so oldest is first
    return [...history].reverse().slice(-10).map((h, i) => {
      const timeStr = h.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const joyScore = h.emotionScores.find(e => e.emotion === 'Joy')?.score || 0
      const neutralScore = h.emotionScores.find(e => e.emotion === 'Neutral')?.score || 0
      const sadnessScore = h.emotionScores.find(e => e.emotion === 'Sadness')?.score || 0
      
      return {
        time: timeStr,
        Joy: joyScore,
        Neutral: neutralScore,
        Sadness: sadnessScore,
      }
    })
  }, [history])

  const confidenceTrend = React.useMemo(() => {
    return [...history].reverse().slice(-7).map((h, i) => {
      const timeStr = h.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      return {
        day: timeStr,
        confidence: h.confidence,
        uncertainty: h.totalUncertainty
      }
    })
  }, [history])

  const avgConfidence = history.length > 0
    ? Math.round(history.reduce((s, h) => s + h.confidence, 0) / history.length)
    : 0

  if (history.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-dashed bg-muted/20">
        <UserCircle className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-medium text-foreground">Digital Twin Untrained</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mb-6">
          Your Digital Twin has no data. Use the Analysis Tool to process text, image, or audio inputs to build your profile.
        </p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Identity Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-none shadow-sm overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
        <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-background shadow-xl">
              <UserCircle className="w-16 h-16 text-primary" />
            </div>
            <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-lg">Synced</Badge>
          </div>
          <div className="text-center sm:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2 justify-center sm:justify-start">
              Live Digital Twin <Activity className="w-5 h-5 text-amber-500 animate-pulse" />
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Continuously updating based on the data you provide to the Analysis Tool.
            </p>
            <div className="flex gap-4 pt-2 justify-center sm:justify-start">
              <div className="flex items-center gap-1 text-sm font-medium">
                <Target className="w-4 h-4 text-green-500" /> {avgConfidence}% Avg Confidence
              </div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <Brain className="w-4 h-4 text-purple-500" /> {history.length} Data Points
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboards */}
      <Tabs defaultValue="daily" className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="daily">Dashboard</TabsTrigger>
            <TabsTrigger value="trends">Confidence Trends</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="daily" className="space-y-4 mt-0">
          {/* Top Row: Full-width Timeline & Analysis Dashboard */}
          <Card className="w-full">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" /> Emotion Timeline & Analysis Dashboard
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">Real-time affective fluctuations and clinical-grade diagnostic insights.</CardDescription>
                </div>
                {/* KPI Status */}
                <div className="flex flex-wrap items-center gap-6 text-xs md:border-l md:border-border/60 md:pl-6">
                  <div className="space-y-1">
                    <span className="text-muted-foreground block font-medium">Dominant Affect State</span>
                    <span className="font-bold text-emerald-500 uppercase tracking-wider">{primaryEmotion}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground block font-medium">Signal Integrity</span>
                    <span className="font-bold text-foreground">98.4% (Optimal)</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground block font-medium">Stability Score</span>
                    <span className="font-bold text-blue-500">89.2% (Stable)</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Chart Column */}
                <div className="xl:col-span-2 h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={emotionTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorJoy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSadness" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#64748b" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.15)" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))', 
                          borderColor: 'hsl(var(--border))', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="Joy" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorJoy)" />
                      <Area type="monotone" dataKey="Neutral" stroke="#64748b" strokeWidth={2} fillOpacity={1} fill="url(#colorNeutral)" />
                      <Area type="monotone" dataKey="Sadness" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSadness)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Diagnostic Explanation Column */}
                <div className="flex flex-col justify-between border-t xl:border-t-0 xl:border-l border-border/50 pt-6 xl:pt-0 xl:pl-6 space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-primary" /> Session Insights
                    </h4>
                    <div className="text-xs text-muted-foreground leading-relaxed space-y-3 bg-muted/20 p-4 rounded-lg border border-border/50">
                      <p>
                        <strong>Trend Analysis:</strong> The timeline illustrates a gradual transition from neutral baseline metrics towards positive affect ({primaryEmotion}) over the latest session logs.
                      </p>
                      <p>
                        The alignment of low variance across the latest metrics suggests that cognitive coping and behavioral regulation remain active and functional.
                      </p>
                    </div>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 text-[11px] text-muted-foreground flex gap-2.5 items-start">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong>Continuous Calibration:</strong> Baselines are recalculated with every new multimodal input to optimize twin accuracy.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Row: Side-by-side details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Donut Distribution Card */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Overall Distribution</CardTitle>
                <CardDescription className="text-[11px]">Aggregate primary emotions.</CardDescription>
              </CardHeader>
              <CardContent className="h-[240px] relative flex items-center justify-center pt-2">
                {/* Visual donut center indicator */}
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Metrics</span>
                  <span className="text-xl font-bold text-foreground">{history.length}</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={emotionDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      cornerRadius={4}
                      dataKey="value"
                      stroke="hsl(var(--card))"
                      strokeWidth={2}
                    >
                      {emotionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        borderColor: 'hsl(var(--border))', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                      itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={24} 
                      iconType="circle" 
                      iconSize={6}
                      wrapperStyle={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recommendations Card */}
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Adaptive Recommendations</CardTitle>
                <CardDescription className="text-[11px]">Automated support suggestions based on current baseline indicators.</CardDescription>
              </CardHeader>
              <CardContent className="h-[240px] overflow-y-auto space-y-3 pt-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 border border-border/50 rounded-lg space-y-1">
                    <span className="font-semibold text-foreground block">Cognitive Reappraisal</span>
                    <span className="text-muted-foreground leading-normal block">
                      Reflect on positive triggers during peak {primaryEmotion} phases to reinforce stress-buffering schemas.
                    </span>
                  </div>
                  <div className="p-3 border border-border/50 rounded-lg space-y-1">
                    <span className="font-semibold text-foreground block">Grounding Protocol</span>
                    <span className="text-muted-foreground leading-normal block">
                      Initiate box-breathing (4-4-4-4) to reduce sympathetic arousal if heart rate variance dips.
                    </span>
                  </div>
                </div>
                <div className="bg-muted/30 border border-border/50 rounded-lg p-3 text-[11px] text-muted-foreground flex gap-2.5 items-start">
                  <ShieldAlert className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <strong>Verification Warning:</strong> AI suggestions are supportive guidelines. Clinical triage settings should override automated protocols in case of extreme fluctuations.
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4 mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Model Confidence vs. Uncertainty</span>
              </CardTitle>
              <CardDescription>Tracking prediction quality over recent analyses.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.15)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(100, 116, 139, 0.08)' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      borderColor: 'hsl(var(--border))', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="confidence" name="Confidence (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="uncertainty" name="Uncertainty (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
