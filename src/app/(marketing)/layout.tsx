import * as React from "react"
import { MarketingHeader } from "@/components/marketing/MarketingHeader"

import { PageTransition } from "@/components/shared/PageTransition"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <MarketingHeader />
      <main className="flex-1 pt-20">
        <PageTransition>
          {children}
        </PageTransition>
      </main>

    </div>
  )
}
