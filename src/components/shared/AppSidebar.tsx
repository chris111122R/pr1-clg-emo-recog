"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, BrainCircuit, BarChart3, ShieldCheck,
  BookOpen, Settings, ChevronRight, PanelLeftClose, PanelLeftOpen,
  Microscope, Activity, FileBarChart2, Users, Sliders,
  ScrollText, MonitorDot, Database, Shield, ClipboardList, Camera,
  Zap, UserCircle, Cpu, FlaskConical, Target, Gauge, FileText, Home
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type SidebarState = "expanded" | "collapsed"

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Features",
    items: [
      { name: "Landing Page", href: "/", icon: Home },
      { name: "Analysis Tool", href: "/dashboard", icon: LayoutDashboard },
      { name: "Analyze Emotion", href: "/analyze", icon: Zap },
      { name: "Real-Time Feed", href: "/real-time", icon: Camera },
      { name: "Digital Twin", href: "/digital-twin", icon: UserCircle },
      { name: "Uncertainty Quantification", href: "/dashboard/workspace/uncertainty", icon: Activity },
      { name: "Explainable AI", href: "/dashboard/workspace/explainability", icon: Microscope },
      { name: "Preventions & Intervention", href: "/interventions", icon: ShieldCheck },
      { name: "Predictions", href: "/dashboard/workspace/predictions", icon: Target },
    ],
  },
]

interface AppSidebarProps {
  state: SidebarState
  onToggle: () => void
  className?: string
}

export function AppSidebar({ state, onToggle, className }: AppSidebarProps) {
  const pathname = usePathname()
  const isCollapsed = state === "collapsed"

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        layout
        animate={{ width: isCollapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className={cn(
          "hidden md:flex flex-col h-screen bg-card border-r border-border shrink-0 overflow-hidden",
          className
        )}
      >
        {/* Logo row */}
        <div className="flex h-14 items-center border-b border-border px-3 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 min-w-0 group"
          >
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-base shrink-0">
              U
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  key="logo-text"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="font-bold text-base tracking-tight truncate"
                >
                  UA-EDT
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Collapse toggle — only visible when expanded */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.button
                key="toggle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onToggle}
                className="ml-auto p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Expand button — only when collapsed */}
          {isCollapsed && (
            <button
              onClick={onToggle}
              className="ml-auto p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-4 scrollbar-thin">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="px-2">
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.p
                    key={`label-${group.label}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-2 mb-1 text-xs font-semibold tracking-widest uppercase text-muted-foreground/60"
                  >
                    {group.label}
                  </motion.p>
                )}
              </AnimatePresence>

              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.href === "/"
                    ? pathname === "/"
                    : item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : (pathname === item.href || pathname.startsWith(item.href + "/"))
                  const linkContent = (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-150 relative",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <motion.div
                          layoutId={`active-indicator-${item.name}`}
                          className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-full"
                          transition={{ duration: 0.2 }}
                        />
                      )}

                      <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />

                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            key={`label-${item.name}`}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.15 }}
                            className="flex-1 truncate"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {!isCollapsed && item.badge && (
                          <motion.span
                            key={`badge-${item.name}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="ml-auto text-xs font-bold tracking-wider bg-destructive/90 text-destructive-foreground px-1.5 py-0.5 rounded-full"
                          >
                            {item.badge}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  )

                  return (
                    <li key={item.name}>
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                          <TooltipContent side="right" className="font-medium">
                            {item.name}
                            {item.badge && (
                              <span className="ml-2 text-xs font-bold bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        linkContent
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom — version */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              key="version"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-3 border-t border-border"
            >
              <p className="text-xs text-muted-foreground/50">Platform v0.1.0 · Model v2.4.1</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </TooltipProvider>
  )
}
