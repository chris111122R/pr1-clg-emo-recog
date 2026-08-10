"use client"
// Shared reusable chart primitives for the AI Workspace
// All chart colors are token-driven via tokens.ts — never hardcoded

import * as React from "react"
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, Cell, LabelList,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts"
import { C } from "./tokens"

// ── Shared Tooltip ─────────────────────────────────────────────────────────
interface TooltipPayload {
  name: string
  value: number
  color: string
  unit?: string
}
function ChartTooltip({ active, payload, label, formatter }: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
  formatter?: (v: number, name: string) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border bg-popover/95 backdrop-blur-sm px-3 py-2.5 shadow-xl text-xs space-y-1.5 min-w-[120px]">
      {label && <p className="font-semibold text-foreground mb-1 border-b border-border pb-1">{label}</p>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-muted-foreground">{p.name}</span>
          </span>
          <span className="font-mono font-semibold text-foreground">
            {formatter ? formatter(p.value, p.name) : p.value?.toFixed(3)}
            {p.unit}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Multi-series Area/Line Chart
// ─────────────────────────────────────────────────────────────────────────────
export interface SeriesDef {
  key: string
  name: string
  color: string
  type?: "area" | "line"
  strokeDash?: string
}

interface MultiSeriesChartProps {
  data: Record<string, unknown>[]
  series: SeriesDef[]
  xKey?: string
  height?: number
  yDomain?: [number | string, number | string]
  yFormatter?: (v: number) => string
  tooltipFormatter?: (v: number, name: string) => string
  referenceLines?: Array<{ y: number; color: string; label: string }>
  showGrid?: boolean
  className?: string
}

export function MultiSeriesChart({
  data, series, xKey = "x", height = 220, yDomain, yFormatter,
  tooltipFormatter, referenceLines = [], showGrid = true, className
}: MultiSeriesChartProps) {
  const hasArea = series.some(s => s.type !== "line")
  const ChartComponent = hasArea ? AreaChart : LineChart
  const gradientIds = series.map((s, i) => `grad-ms-${i}`)

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <defs>
            {series.map((s, i) => (
              <linearGradient key={i} id={gradientIds[i]} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={s.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          {showGrid && (
            <CartesianGrid {...C.grid} vertical={false} />
          )}
          <XAxis dataKey={xKey} tick={C.axisText} axisLine={false} tickLine={false} />
          <YAxis tick={C.axisText} axisLine={false} tickLine={false}
            domain={yDomain} tickFormatter={yFormatter} />
          <Tooltip
            content={<ChartTooltip formatter={tooltipFormatter} />}
            cursor={{ stroke: C.border, strokeWidth: 1 }}
          />
          {referenceLines.map(r => (
            <ReferenceLine key={r.label} y={r.y} stroke={r.color}
              strokeDasharray="4 4" strokeOpacity={0.6}
              label={{ value: r.label, position: "right", fontSize: 9, fill: r.color }} />
          ))}
          {series.map((s, i) =>
            s.type === "line" ? (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.name}
                stroke={s.color} strokeWidth={2} dot={false}
                strokeDasharray={s.strokeDash}
                activeDot={{ r: 4, fill: s.color }} />
            ) : (
              <Area key={s.key} type="monotone" dataKey={s.key} name={s.name}
                stroke={s.color} strokeWidth={2} fill={`url(#${gradientIds[i]})`}
                dot={false} activeDot={{ r: 4, fill: s.color }} />
            )
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Horizontal Bar Chart
// ─────────────────────────────────────────────────────────────────────────────
interface HBarItem {
  label: string
  value: number
  color?: string
  unit?: string
}

export function HorizontalBarChart({
  data, max = 100, height, barSize = 18, showLabels = true, className
}: {
  data: HBarItem[]
  max?: number
  height?: number
  barSize?: number
  showLabels?: boolean
  className?: string
}) {
  const h = height ?? data.length * (barSize + 16) + 24
  return (
    <div className={className} style={{ height: h }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }}>
          <XAxis type="number" domain={[0, max]} tick={C.axisText} axisLine={false} tickLine={false}
            tickFormatter={v => `${v}${data[0]?.unit ?? ""}`} />
          <YAxis type="category" dataKey="label" tick={{ ...C.axisText, fontSize: 11 }}
            width={120} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }}
            formatter={(v: unknown) => [`${v}${data[0]?.unit ?? ""}`, "Value"]} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={barSize}>
            {showLabels && (
              <LabelList dataKey="value" position="right" formatter={(v: unknown) => `${v}${data[0]?.unit ?? ""}`}
                style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            )}
            {data.map((item, i) => (
              <Cell key={i} fill={item.color ?? C.primary} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Radial Gauge
// ─────────────────────────────────────────────────────────────────────────────
export function RadialGauge({
  value, max = 100, color, label, size = 100
}: {
  value: number; max?: number; color?: string; label?: string; size?: number
}) {
  const pct = (value / max) * 100
  const clr = color ?? C.primary
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div style={{ width: size, height: size }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="72%" outerRadius="100%"
            startAngle={220} endAngle={-40} data={[{ value: pct }]}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: "hsl(var(--muted))" }} dataKey="value"
              angleAxisId={0} fill={clr} cornerRadius={6} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold tabular-nums" style={{ fontSize: size * 0.17, color: clr }}>
            {value.toFixed(value < 10 ? 1 : 0)}{max === 100 && value > 1 ? "%" : ""}
          </span>
        </div>
      </div>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Attention Heatmap (custom SVG)
// ─────────────────────────────────────────────────────────────────────────────
export interface HeatmapCell {
  row: number; col: number; value: number  // value 0-1
}

export function AttentionHeatmap({
  cells, rows, cols, labels, width = 320, className
}: {
  cells: HeatmapCell[]
  rows: number
  cols: number
  labels?: { rows: string[]; cols: string[] }
  width?: number
  className?: string
}) {
  const LABEL_W = labels?.rows ? 48 : 4
  const LABEL_H = labels?.cols ? 20 : 4
  const cellW = (width - LABEL_W) / cols
  const cellH = cellW * 0.75
  const svgH = cellH * rows + LABEL_H + 8

  function cellColor(v: number) {
    // Token-based gradient: low (rose) → medium (amber) → high (teal)
    if (v < 0.33) {
      // rose fade  — blend from transparent to rose
      const t = v / 0.33
      const r = Math.round(244 * t), g = Math.round(63 * t), b = Math.round(94 * t)
      return `rgba(${r},${g},${b},${0.1 + v * 0.7})`
    } else if (v < 0.67) {
      // amber zone
      const t = (v - 0.33) / 0.34
      const r = 234, g = Math.round(179 + t * (179 - 179)), bv = 8
      return `rgba(${r},${g},${bv},${0.35 + t * 0.35})`
    } else {
      // teal zone
      const t = (v - 0.67) / 0.33
      return `rgba(20,184,166,${0.5 + t * 0.45})`
    }
  }

  return (
    <div className={className}>
      <svg width="100%" viewBox={`0 0 ${width} ${svgH}`} className="overflow-visible">
        {/* Col labels */}
        {labels?.cols?.map((l, ci) => (
          <text key={ci} x={LABEL_W + ci * cellW + cellW / 2} y={LABEL_H - 4}
            textAnchor="middle" fontSize={8} fill="hsl(var(--muted-foreground))"
            fontFamily="var(--font-mono)">{l}</text>
        ))}
        {/* Row labels */}
        {labels?.rows?.map((l, ri) => (
          <text key={ri} x={LABEL_W - 4} y={LABEL_H + ri * cellH + cellH / 2}
            textAnchor="end" dominantBaseline="middle" fontSize={8}
            fill="hsl(var(--muted-foreground))" fontFamily="var(--font-mono)">{l}</text>
        ))}
        {/* Cells */}
        {cells.map((c, i) => (
          <g key={i}>
            <rect
              x={LABEL_W + c.col * cellW + 1}
              y={LABEL_H + c.row * cellH + 1}
              width={cellW - 2} height={cellH - 2}
              rx={3} ry={3}
              fill={cellColor(c.value)}
              stroke="hsl(var(--border))" strokeWidth={0.5}
            />
            {cellW > 28 && (
              <text
                x={LABEL_W + c.col * cellW + cellW / 2}
                y={LABEL_H + c.row * cellH + cellH / 2}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={7} fontFamily="var(--font-mono)"
                fill={c.value > 0.5 ? "rgba(255,255,255,0.9)" : "hsl(var(--muted-foreground))"}
              >
                {c.value.toFixed(2)}
              </text>
            )}
          </g>
        ))}
      </svg>
      {/* Gradient legend */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-muted-foreground">Low</span>
        <div className="flex-1 h-2 rounded-full" style={{
          background: "linear-gradient(to right, #f43f5e40, #eab30880, #14b8a6cc)"
        }} />
        <span className="text-xs text-muted-foreground">High</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Confidence Band / Distribution Chart (violin-inspired)
// ─────────────────────────────────────────────────────────────────────────────
export interface DistributionSeries {
  label: string
  mean: number      // 0-100
  p10: number       // 10th percentile
  p25: number
  p75: number
  p90: number       // 90th percentile
  color: string
}

export function ConfidenceBandChart({
  series, height = 260, className
}: {
  series: DistributionSeries[]
  height?: number
  className?: string
}) {
  const W = 600, H = height
  const LABEL_W = 90, PAD_R = 16, PAD_T = 20, PAD_B = 36
  const plotW = W - LABEL_W - PAD_R
  const plotH = H - PAD_T - PAD_B
  const bandH = Math.min(plotH / series.length - 12, 52)
  const scale = (v: number) => (v / 100) * plotW

  // Tick positions
  const ticks = [0, 25, 50, 75, 100]

  return (
    <div className={className} style={{ height: H }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        {/* Axis ticks */}
        {ticks.map(t => (
          <g key={t}>
            <line x1={LABEL_W + scale(t)} y1={PAD_T - 4}
              x2={LABEL_W + scale(t)} y2={H - PAD_B + 4}
              stroke="hsl(var(--border))" strokeWidth={0.8} strokeDasharray="3 4" />
            <text x={LABEL_W + scale(t)} y={H - PAD_B + 14}
              textAnchor="middle" fontSize={9} fill="hsl(var(--muted-foreground))">
              {t}%
            </text>
          </g>
        ))}
        {/* Axis label */}
        <text x={LABEL_W + plotW / 2} y={H - 4}
          textAnchor="middle" fontSize={9} fill="hsl(var(--muted-foreground))">
          Confidence
        </text>

        {/* Distribution bands */}
        {series.map((s, i) => {
          const cy = PAD_T + (i + 0.5) * (plotH / series.length)
          const hw = bandH / 2
          const x10 = LABEL_W + scale(s.p10)
          const x25 = LABEL_W + scale(s.p25)
          const x75 = LABEL_W + scale(s.p75)
          const x90 = LABEL_W + scale(s.p90)
          const xMean = LABEL_W + scale(s.mean)

          return (
            <g key={i}>
              {/* Row label */}
              <text x={LABEL_W - 8} y={cy} textAnchor="end" dominantBaseline="middle"
                fontSize={11} fontWeight={500} fill="hsl(var(--foreground))">{s.label}</text>

              {/* Whisker lines (p10-p25, p75-p90) */}
              <line x1={x10} y1={cy} x2={x25} y2={cy}
                stroke={s.color} strokeWidth={1.5} />
              <line x1={x75} y1={cy} x2={x90} y2={cy}
                stroke={s.color} strokeWidth={1.5} />
              {/* End caps */}
              {[x10, x90].map((x, ci) => (
                <line key={ci} x1={x} y1={cy - hw * 0.4} x2={x} y2={cy + hw * 0.4}
                  stroke={s.color} strokeWidth={1.5} />
              ))}

              {/* IQR box (p25-p75) */}
              <rect x={x25} y={cy - hw * 0.65} width={x75 - x25} height={hw * 1.3}
                rx={4} fill={s.color} fillOpacity={0.18} stroke={s.color} strokeWidth={1.2} />

              {/* Mean dot */}
              <circle cx={xMean} cy={cy} r={5} fill={s.color} />
              <circle cx={xMean} cy={cy} r={3} fill="hsl(var(--card))" />
              <circle cx={xMean} cy={cy} r={1.5} fill={s.color} />

              {/* Mean label */}
              <text x={xMean} y={cy - hw * 0.65 - 4} textAnchor="middle"
                fontSize={8} fill={s.color} fontWeight={600}>{s.mean.toFixed(1)}%</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Decision Flow Diagram (custom SVG tree)
// ─────────────────────────────────────────────────────────────────────────────
export interface FlowNode {
  id: string
  label: string
  sublabel?: string
  value?: string
  type: "input" | "process" | "gate" | "output"
  confidence?: number
}

export interface FlowEdge {
  from: string; to: string; label?: string
}

const NODE_COLORS: Record<FlowNode["type"], string> = {
  input:   "hsl(var(--info))",
  process: "hsl(var(--primary))",
  gate:    "hsl(var(--warning))",
  output:  "hsl(var(--success))",
}

export function DecisionFlowDiagram({
  nodes, edges, layout, className
}: {
  nodes: FlowNode[]
  edges: FlowEdge[]
  layout: Array<{ id: string; x: number; y: number }>
  className?: string
}) {
  const W = 560, H = 320
  const posMap = Object.fromEntries(layout.map(l => [l.id, l]))
  const nodeW = 120, nodeH = 44

  return (
    <div className={className} style={{ height: H }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 z" fill="hsl(var(--muted-foreground))" fillOpacity={0.6} />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((e, i) => {
          const from = posMap[e.from], to = posMap[e.to]
          if (!from || !to) return null
          const x1 = from.x + nodeW / 2, y1 = from.y + nodeH
          const x2 = to.x + nodeW / 2,   y2 = to.y
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
          return (
            <g key={i}>
              <path
                d={`M ${x1} ${y1} C ${x1} ${y1 + 20} ${x2} ${y2 - 20} ${x2} ${y2}`}
                stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} fill="none"
                strokeOpacity={0.5} markerEnd="url(#arrow)" />
              {e.label && (
                <text x={mx} y={my} textAnchor="middle" fontSize={8}
                  fill="hsl(var(--muted-foreground))" fontStyle="italic">{e.label}</text>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const pos = posMap[node.id]
          if (!pos) return null
          const color = NODE_COLORS[node.type]
          const isGate = node.type === "gate"
          return (
            <g key={node.id}>
              {isGate ? (
                // Diamond for gate nodes
                <polygon
                  points={`${pos.x + nodeW / 2},${pos.y} ${pos.x + nodeW},${pos.y + nodeH / 2} ${pos.x + nodeW / 2},${pos.y + nodeH} ${pos.x},${pos.y + nodeH / 2}`}
                  fill={`${color}22`} stroke={color} strokeWidth={1.5} rx={4}
                />
              ) : (
                <rect x={pos.x} y={pos.y} width={nodeW} height={nodeH}
                  rx={node.type === "output" ? 22 : 8}
                  fill={`${color}18`} stroke={color} strokeWidth={1.5} />
              )}
              <text x={pos.x + nodeW / 2} y={pos.y + (isGate ? nodeH / 2 - 5 : nodeH / 2 - 6)}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={10} fontWeight={600} fill="hsl(var(--foreground))">
                {node.label}
              </text>
              {node.sublabel && (
                <text x={pos.x + nodeW / 2} y={pos.y + (isGate ? nodeH / 2 + 7 : nodeH / 2 + 8)}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={8} fill="hsl(var(--muted-foreground))">
                  {node.sublabel}
                </text>
              )}
              {node.value && (
                <text x={pos.x + nodeW - 4} y={pos.y + 4}
                  textAnchor="end" dominantBaseline="hanging"
                  fontSize={7} fill={color} fontWeight={700} fontFamily="var(--font-mono)">
                  {node.value}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
        {(Object.entries(NODE_COLORS) as [FlowNode["type"], string][]).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1.5 capitalize">
            <span className="h-2 w-2 rounded-sm" style={{ background: color }} />{type}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Chart Legend Row
// ─────────────────────────────────────────────────────────────────────────────
export function ChartLegend({ items }: {
  items: Array<{ color: string; label: string; dash?: boolean }>
}) {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
      {items.map(item => (
        <span key={item.label} className="flex items-center gap-1.5">
          {item.dash
            ? <span className="inline-block h-px w-5 border-t-2 border-dashed" style={{ borderColor: item.color }} />
            : <span className="inline-block h-2 w-5 rounded-full" style={{ background: item.color }} />
          }
          {item.label}
        </span>
      ))}
    </div>
  )
}
