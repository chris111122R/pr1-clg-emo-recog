"use client"

import { AnimatePresence } from "framer-motion"

export function AuthTransitionWrapper({ children }: { children: React.ReactNode }) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>
}
