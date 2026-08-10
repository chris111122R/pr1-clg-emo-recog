import * as React from "react"
import type { Metadata } from "next"
import { AppShell } from "@/components/shared/AppShell"
import { AnalysisProvider } from "@/lib/AnalysisContext"

export const metadata: Metadata = {
  title: {
    template: "%s | UA-EDT Platform",
    default: "Dashboard | UA-EDT Platform",
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AnalysisProvider>
      <AppShell>{children}</AppShell>
    </AnalysisProvider>
  )
}
