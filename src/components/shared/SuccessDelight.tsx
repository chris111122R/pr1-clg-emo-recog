"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Check } from "lucide-react"

export function SuccessDelight({ onComplete }: { onComplete?: () => void }) {
  const shouldReduceMotion = useReducedMotion()

  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, 2500)
      return () => clearTimeout(timer)
    }
  }, [onComplete])

  if (shouldReduceMotion) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center">
          <Check className="h-8 w-8 text-success" />
        </div>
        <h3 className="text-xl font-semibold">Success!</h3>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          duration: 0.5,
        }}
        className="relative h-20 w-20 flex items-center justify-center rounded-full bg-success/10 text-success"
      >
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="absolute inset-0 rounded-full bg-success/20 -z-10"
        />
        <svg
          className="h-10 w-10 text-success"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          />
        </svg>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="text-center space-y-2"
      >
        <h3 className="text-2xl font-bold tracking-tight">Upload Complete</h3>
        <p className="text-muted-foreground">The dataset has been successfully processed.</p>
      </motion.div>
    </div>
  )
}
