"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/shared/theme-toggle"

// --- Animated Brand Background ---
function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />

      {/* Floating orbs */}
      <motion.div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  )
}

interface AuthShellProps {
  children: React.ReactNode
  title: string
  description?: string
  showLogo?: boolean
  maxWidth?: string
}

export function AuthShell({
  children,
  title,
  description,
  showLogo = true,
  maxWidth = "max-w-md",
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <AuthBackground />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg group-hover:opacity-90 transition-opacity">
            U
          </div>
          <span className="font-bold text-lg tracking-tight">UA-EDT</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Card */}
      <motion.div
        key={title}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className={`w-full ${maxWidth}`}
      >
        {showLogo && (
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
          {!showLogo && (
            <div className="mb-6">
              <h1 className="text-xl font-bold tracking-tight">{title}</h1>
              {description && (
                <p className="text-muted-foreground mt-1 text-sm">{description}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </motion.div>
    </div>
  )
}

// --- Field-level error message ---
export function FieldError({ message, id }: { message?: string, id?: string }) {
  if (!message) return null
  return (
    <motion.p
      id={id}
      role="alert"
      aria-live="assertive"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-sm text-destructive mt-1.5 flex items-center gap-1"
    >
      {message}
    </motion.p>
  )
}

// --- Form-level error banner ---
export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <motion.div
      role="alert"
      aria-live="assertive"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
    >
      {message}
    </motion.div>
  )
}
