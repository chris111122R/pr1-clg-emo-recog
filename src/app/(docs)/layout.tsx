import * as React from "react"
import Link from "next/link"
import { Search, BookOpen, Terminal, Activity, Box } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { PageTransition } from "@/components/shared/PageTransition"

const DOCS_NAV = [
  {
    category: "Getting Started",
    links: [
      { name: "Introduction", href: "/docs" },
      { name: "Quickstart", href: "/docs/quickstart" },
      { name: "Authentication", href: "/docs/auth" },
    ]
  },
  {
    category: "Core Concepts",
    links: [
      { name: "Multimodal Fusion", href: "/docs/fusion" },
      { name: "Uncertainty Metrics", href: "/docs/uncertainty" },
      { name: "Explainability Engine", href: "/docs/explainability" },
    ]
  },
  {
    category: "API Reference",
    links: [
      { name: "REST API", href: "/docs/rest-api" },
      { name: "Python SDK", href: "/docs/python" },
      { name: "WebSockets", href: "/docs/websockets" },
    ]
  }
]

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Docs Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-8 mx-auto">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">U</div>
              <span className="font-bold hidden sm:inline-block">UA-EDT Docs</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <Link href="/docs" className="text-foreground transition-colors hover:text-foreground">Guides</Link>
              <Link href="/docs/rest-api" className="transition-colors hover:text-foreground">API Reference</Link>
              <Link href="/dashboard" className="transition-colors hover:text-foreground">Dashboard</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documentation..."
                className="w-full pl-8 h-9 bg-muted/50"
              />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Docs Main Layout */}
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 max-w-screen-2xl px-4 sm:px-8 mx-auto">
        
        {/* Left Sidebar Menu */}
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r border-border/50 py-6 pr-6 md:sticky md:block">
          <div className="w-full">
            {DOCS_NAV.map((group, i) => (
              <div key={i} className="pb-8">
                <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">{group.category}</h4>
                <div className="grid grid-flow-row auto-rows-max text-sm">
                  {group.links.map((link, j) => (
                    <Link
                      key={j}
                      href={link.href}
                      className="group flex w-full items-center rounded-md border border-transparent px-2 py-1.5 text-muted-foreground hover:underline"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_200px]">
          <div className="mx-auto w-full min-w-0">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  )
}
