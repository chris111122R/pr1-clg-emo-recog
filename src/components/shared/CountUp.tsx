"use client"

import * as React from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"

interface CountUpProps {
  to: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function CountUp({
  to,
  duration = 1.2,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: CountUpProps) {
  const count = useMotionValue(0)
  const [display, setDisplay] = React.useState("0")

  React.useEffect(() => {
    const controls = animate(count, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => {
        setDisplay(
          decimals > 0
            ? v.toFixed(decimals)
            : Math.floor(v).toLocaleString()
        )
      },
    })
    return controls.stop
  }, [to])

  return (
    <span className={className}>
      {prefix}{display}{suffix}
    </span>
  )
}
