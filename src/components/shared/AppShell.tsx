"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

import { AppSidebar, type SidebarState } from "@/components/shared/AppSidebar"
import { AppTopbar, useCommandPalette } from "@/components/shared/AppTopbar"
import { MobileDrawer } from "@/components/shared/MobileDrawer"
import { AdminAccentBar } from "@/components/admin/AdminAccentBar"
import { PageTransition } from "@/components/shared/PageTransition"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarState, setSidebarState] = React.useState<SidebarState>("expanded")
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette()

  function toggleSidebar() {
    setSidebarState((s) => (s === "expanded" ? "collapsed" : "expanded"))
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <AppSidebar state={sidebarState} onToggle={toggleSidebar} />

      {/* Mobile Drawer */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppTopbar
          onMobileMenuOpen={() => setMobileOpen(true)}
          commandPaletteOpen={cmdOpen}
          setCommandPaletteOpen={setCmdOpen}
        />

        <AdminAccentBar />

        {/* Scrollable content with page transition */}
        <main className="flex-1 overflow-y-auto">
          <PageTransition className="flex-1 min-h-0 flex flex-col">
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
