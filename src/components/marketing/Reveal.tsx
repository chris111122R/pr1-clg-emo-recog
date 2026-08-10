"use client"

import * as React from "react"
import { motion, useInView } from "framer-motion"

interface RevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
  direction?: "up" | "down" | "left" | "right" | "none"
}

export function Reveal({ children, delay = 0, className, direction = "up" }: RevealProps) {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const shouldReduceMotion = typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false

  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { y: 20 }
      case "down": return { y: -20 }
      case "left": return { x: 20 }
      case "right": return { x: -20 }
      case "none": return {}
    }
  }

  const getFinalPosition = () => {
    switch (direction) {
      case "up":
      case "down": return { y: 0 }
      case "left":
      case "right": return { x: 0 }
      case "none": return {}
    }
  }

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={isInView ? { opacity: 1, ...getFinalPosition() } : { opacity: 0, ...getInitialPosition() }}
      transition={{ duration: 0.5, delay: delay, ease: [0.32, 0.72, 0, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
