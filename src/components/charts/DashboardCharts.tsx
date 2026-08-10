"use client"

import * as React from "react"
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, LineChart, Line
} from "recharts"
import { PREDICTION_VOLUME } from "@/lib/dashboard-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover/95 backdrop-blur-sm px-3 py-2 shadow-xl text-xs space-y-1.5">
      <p className="text-muted-foreground font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">
            {p.name === "Confidence" ? `${p.value}%` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function useMediaQuery(query: string) {
  const subscribe = React.useCallback(
    (callback: () => void) => {
      const media = window.matchMedia(query)
      media.addEventListener("change", callback)
      return () => media.removeEventListener("change", callback)
    },
    [query]
  )

  const getSnapshot = () => {
    return window.matchMedia(query).matches
  }

  const getServerSnapshot = () => {
    return false
  }

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function PredictionVolumeChart() {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Prediction Volume & Confidence</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Rolling 24 hours · Updated every 2 min</p>
        </div>
        <Badge variant="success" className="shrink-0">Live</Badge>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="sr-only">
          <table aria-label="Prediction Volume and Confidence Data">
            <thead>
              <tr>
                <th>Time</th>
                <th>Sessions</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {PREDICTION_VOLUME.map((point) => (
                <tr key={point.time}>
                  <td>{point.time}</td>
                  <td>{point.sessions}</td>
                  <td>{point.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="h-[220px]" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PREDICTION_VOLUME} margin={{ top: 4, right: isMobile ? 0 : 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="sessionsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                strokeOpacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                interval={2}
              />
              <YAxis
                yAxisId="sessions"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                domain={[0, "auto"]}
              />
              <YAxis
                yAxisId="confidence"
                orientation="right"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                domain={[80, 100]}
                tickFormatter={(v) => `${v}%`}
                hide={isMobile}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
              {!isMobile && (
                <ReferenceLine
                  yAxisId="confidence"
                  y={95}
                  stroke="hsl(var(--success))"
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                  label={{ value: "Target", position: "right", fontSize: 12, fill: "hsl(var(--success))" }}
                />
              )}
              <Area
                yAxisId="sessions"
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#sessionsGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
              />
              <Line
                yAxisId="confidence"
                type="monotone"
                dataKey="confidence"
                name="Confidence"
                stroke="hsl(var(--success))"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="0"
                activeDot={{ r: 3, fill: "hsl(var(--success))" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// Tiny inline sparkline for stat cards
interface SparklineProps {
  data: Array<{ i: number; v: number }>
  color: string
}

export function Sparkline({ data, color }: SparklineProps) {
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${color})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
