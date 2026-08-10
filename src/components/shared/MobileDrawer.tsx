"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, BrainCircuit, BarChart3, ShieldCheck,
  BookOpen, Settings, Microscope, Activity,
  Users, ScrollText, MonitorDot, Database, Shield, ClipboardList
} from "lucide-react"
import { cn } from "@/lib/utils"

// Same nav config — kept co-located so the drawer is self-contained
const NAV_GROUPS = [
  {
    label: "Core",
    items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "AI Workspace",
    items: [
      { name: "Session Analysis", href: "/dashboard/workspace/session", icon: Microscope },
      { name: "Digital Twin", href: "/dashboard/workspace/twin", icon: BrainCircuit },
      { name: "Live Stream", href: "/dashboard/workspace/live", icon: Activity, badge: "LIVE" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { name: "Emotion Trends", href: "/dashboard/analytics/trends", icon: BarChart3 },
    ],
  },
  {
    label: "Admin",
    items: [
      { name: "Users",       href: "/dashboard/admin/users",      icon: Users        },
      { name: "Roles",       href: "/dashboard/admin/roles",      icon: ShieldCheck  },
      { name: "System Logs", href: "/dashboard/admin/logs",       icon: ScrollText   },
      { name: "Monitoring",  href: "/dashboard/admin/monitoring", icon: MonitorDot   },
      { name: "Datasets",    href: "/dashboard/admin/datasets",   icon: Database     },
      { name: "Security",    href: "/dashboard/admin/security",   icon: Shield       },
      { name: "Audit Logs",  href: "/dashboard/admin/audit",      icon: ClipboardList},
    ],
  },
  {
    label: "System",
    items: [
      { name: "Documentation", href: "/docs", icon: BookOpen },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
]

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname()

  // Close on route change
  React.useEffect(() => { onClose() }, [pathname])

  // Trap focus & prevent body scroll
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col shadow-2xl md:hidden"
          >
            {/* Header */}
            <div className="flex h-14 items-center justify-between px-4 border-b border-border shrink-0">
              <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-base">
                  U
                </div>
                <span className="font-bold text-base tracking-tight">UA-EDT</span>
              </Link>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3 space-y-4">
              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="px-2">
                  <p className="px-2 mb-1 text-xs font-semibold tracking-widest uppercase text-muted-foreground/60">
                    {group.label}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="flex-1">{item.name}</span>
                            {item.badge && (
                              <span className="text-xs font-bold bg-destructive/90 text-destructive-foreground px-1.5 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            <div className="px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground/50">Platform v0.1.0 · Model v2.4.1</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
