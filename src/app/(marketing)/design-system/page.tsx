"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Reveal } from "@/components/marketing/Reveal"

const COLORS = [
  { name: "Background", variable: "var(--background)" },
  { name: "Foreground", variable: "var(--foreground)" },
  { name: "Card", variable: "var(--card)" },
  { name: "Card Foreground", variable: "var(--card-foreground)" },
  { name: "Primary", variable: "var(--primary)" },
  { name: "Primary Foreground", variable: "var(--primary-foreground)" },
  { name: "Muted", variable: "var(--muted)" },
  { name: "Muted Foreground", variable: "var(--muted-foreground)" },
  { name: "Accent", variable: "var(--accent)" },
  { name: "Accent Foreground", variable: "var(--accent-foreground)" },
  { name: "Success", variable: "var(--success)" },
  { name: "Warning", variable: "var(--warning)" },
  { name: "Destructive", variable: "var(--destructive)" },
  { name: "Info", variable: "var(--info)" },
]

export default function DesignSystemPage() {
  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl space-y-24">
        
        {/* Header */}
        <section>
          <Reveal>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Design System</h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              The canonical reference for UA-EDT tokens, typography, and motion guidelines.
              Ensuring a cohesive, premium enterprise experience across all viewports.
            </p>
          </Reveal>
        </section>

        {/* Colors */}
        <section className="space-y-8">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight border-b pb-4">1. Semantic Colors</h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {COLORS.map((color, i) => (
              <Reveal key={color.name} delay={i * 0.05}>
                <div className="space-y-3">
                  <div 
                    className="h-24 w-full rounded-xl border shadow-sm"
                    style={{ backgroundColor: `hsl(${color.variable})` }}
                  />
                  <div>
                    <p className="text-sm font-medium">{color.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">hsl({color.variable})</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-8">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight border-b pb-4">2. Typography Scale</h2>
          </Reveal>
          <div className="space-y-12">
            {[
              { label: "Heading 1", class: "text-5xl md:text-7xl font-extrabold tracking-tight", text: "Mathematical Certainty." },
              { label: "Heading 2", class: "text-4xl md:text-5xl font-bold tracking-tight", text: "Never guess why." },
              { label: "Heading 3", class: "text-2xl md:text-3xl font-semibold tracking-tight", text: "Interactive Attribution." },
              { label: "Body Large", class: "text-xl text-muted-foreground leading-relaxed", text: "UA-EDT is the world’s first Uncertainty-Aware platform." },
              { label: "Body Base", class: "text-base text-foreground leading-relaxed", text: "Our architecture maps specific Action Units directly to predictions." },
              { label: "Body Small", class: "text-sm text-muted-foreground", text: "Trusted by leading research institutions worldwide." },
              { label: "Label/Caption", class: "text-xs font-medium tracking-wide uppercase text-muted-foreground", text: "Real-time inference" },
            ].map((type, i) => (
              <Reveal key={type.label} delay={i * 0.1}>
                <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12">
                  <div className="w-32 shrink-0">
                    <p className="text-sm font-medium text-muted-foreground">{type.label}</p>
                  </div>
                  <div className="flex-1">
                    <p className={type.class}>{type.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Motion & Ease */}
        <section className="space-y-8">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight border-b pb-4">3. Motion & Animation</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8">
            <Reveal delay={0.1}>
              <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-4">
                <h3 className="font-semibold text-lg">Premium Easing</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use a custom cubic-bezier curve for all structural transitions, matching Apple-level fluidity. Avoid linear or default ease-in-out for layout changes.
                </p>
                <div className="p-4 bg-muted rounded-xl font-mono text-xs overflow-x-auto">
                  --animate-ease-premium: cubic-bezier(0.32, 0.72, 0, 1);
                </div>
                <div className="h-16 mt-4 relative bg-muted rounded-lg overflow-hidden flex items-center px-4">
                  <motion.div 
                    className="h-8 w-8 rounded-full bg-primary"
                    animate={{ x: [0, 200, 0] }}
                    transition={{ duration: 2, ease: [0.32, 0.72, 0, 1], repeat: Infinity }}
                  />
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-4">
                <h3 className="font-semibold text-lg">Durations</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Consistent timing tokens enforce tempo across the app.
                </p>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between border-b pb-2">
                    <span className="font-medium">Micro (Hover/Press)</span>
                    <span className="text-muted-foreground font-mono">150ms</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span className="font-medium">Standard (Modals/Drawers)</span>
                    <span className="text-muted-foreground font-mono">250ms</span>
                  </li>
                  <li className="flex justify-between pb-2">
                    <span className="font-medium">Page (Route Transitions)</span>
                    <span className="text-muted-foreground font-mono">500ms</span>
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

      </div>
    </div>
  )
}
