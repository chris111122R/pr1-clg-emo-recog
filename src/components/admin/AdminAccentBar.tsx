"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { ShieldAlert } from "lucide-react"

export function AdminAccentBar() {
  const pathname = usePathname()
  if (!pathname.startsWith("/dashboard/admin")) return null

  return (
    <div className="shrink-0 z-20">
      {/* Amber gradient accent strip */}
      <div className="h-[3px] w-full bg-gradient-to-r from-warning via-amber-400 to-orange-400" />
      {/* Context header */}
      <div className="flex items-center gap-2.5 px-6 py-2 bg-warning/5 border-b border-warning/20">
        <ShieldAlert className="h-3.5 w-3.5 text-warning shrink-0" />
        <span className="text-xs font-bold text-warning uppercase tracking-widest">
          Admin Console
        </span>
        <span className="h-3 w-px bg-warning/30 mx-0.5" />
        <span className="text-xs text-warning/60 hidden sm:inline">
          Elevated-privilege zone — changes affect all platform users
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-warning" />
          </span>
          <span className="text-xs font-medium text-warning/70 hidden md:inline">Active Session</span>
        </div>
      </div>
    </div>
  )
}
