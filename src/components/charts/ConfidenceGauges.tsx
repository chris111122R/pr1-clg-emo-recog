"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { CONFIDENCE_GAUGES } from "@/lib/dashboard-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CountUp } from "@/components/shared/CountUp"

interface GaugeProps {
  value: number    // 0–100
  label: string
  color: string
  aleatoric: number
  epistemic: number
  size?: number
  delay?: number
}

function RadialGauge({ value, label, color, aleatoric, epistemic, size = 120, delay = 0 }: GaugeProps) {
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  // Arc goes from -135deg to +135deg (270deg total sweep)
  const sweep = 270
  const dashTotal = (sweep / 360) * circumference
  const dashOffset = dashTotal - (value / 100) * dashTotal

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative" style={{ width: size, height: size * 0.75 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(135deg)" }}
          className="absolute top-0 left-0"
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashTotal} ${circumference - dashTotal}`}
            strokeLinecap="round"
          />
          {/* Fill */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashTotal} ${circumference - dashTotal}`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: dashTotal }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, delay: delay + 0.2, ease: "easeOut" }}
          />
        </svg>

        {/* Center text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ paddingTop: size * 0.12 }}
        >
          <span className="text-2xl font-bold tracking-tight tabular-nums" style={{ color }}>
            <CountUp to={value} decimals={1} suffix="%" duration={1.4} />
          </span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs font-semibold text-foreground leading-tight">{label}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>A: ±{aleatoric.toFixed(1)}%</span>
          <span className="text-border">|</span>
          <span>E: ±{epistemic.toFixed(1)}%</span>
        </div>
      </div>
    </motion.div>
  )
}

export function ConfidenceGaugesPanel() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Uncertainty Bounds</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">A = aleatoric · E = epistemic</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6 place-items-center">
          {CONFIDENCE_GAUGES.map((gauge, i) => (
            <RadialGauge
              key={gauge.label}
              value={gauge.mean}
              label={gauge.label}
              color={gauge.color}
              aleatoric={gauge.aleatoric}
              epistemic={gauge.epistemic}
              size={130}
              delay={i * 0.1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
