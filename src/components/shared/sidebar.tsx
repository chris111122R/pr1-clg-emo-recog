"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Zap, UserCircle, Activity, Microscope, ShieldCheck, Cpu, Sliders, FlaskConical, Target, BrainCircuit, Gauge, FileText, ChevronRight, Menu, Home, Camera } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const items: SidebarItem[] = [
  { name: "Landing Page", href: "/", icon: Home },
  { name: "Analysis Tool", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analyze Emotion", href: "/analyze", icon: Zap },
  { name: "Real-Time Feed", href: "/real-time", icon: Camera },
  { name: "Digital Twin", href: "/digital-twin", icon: UserCircle },
  { name: "Uncertainty Quantification", href: "/dashboard/workspace/uncertainty", icon: Activity },
  { name: "Explainable AI", href: "/dashboard/workspace/explainability", icon: Microscope },
  { name: "Preventions & Intervention", href: "/interventions", icon: ShieldCheck },
  { name: "Predictions", href: "/dashboard/workspace/predictions", icon: Target },
]

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <motion.aside
      className={cn(
        "relative flex flex-col border-r bg-card h-screen transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
      layout
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold tracking-tight text-primary truncate"
          >
            UA-EDT
          </motion.span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md hover:bg-accent hover:text-accent-foreground ml-auto"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-2 p-2 mt-4 overflow-y-auto">
        {items.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : item.href === "/dashboard"
            ? pathname === "/dashboard"
            : (pathname === item.href || pathname.startsWith(item.href + "/"))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative overflow-hidden group",
                isActive
                  ? "text-primary-foreground bg-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && !isCollapsed && (
                <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
              )}
            </Link>
          )
        })}
      </nav>
    </motion.aside>
  )
}
