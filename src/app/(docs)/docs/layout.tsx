import * as React from "react"
import { DocsNavbar } from "@/components/docs/DocsNavbar"
import { DocsSidebar } from "@/components/docs/DocsSidebar"

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DocsNavbar />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 max-w-screen-2xl mx-auto px-4 md:px-8">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block overflow-y-auto pt-8">
          <DocsSidebar />
        </aside>
        <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
          <div className="mx-auto w-full min-w-0">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}
