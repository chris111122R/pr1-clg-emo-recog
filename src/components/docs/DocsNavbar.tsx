"use client"

import * as React from "react"
import Link from "next/link"
import { Search, Menu, BrainCircuit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DocsSidebar } from "@/components/docs/DocsSidebar"

export function DocsNavbar() {
  const [open, setOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 md:px-8">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center gap-2">
            <div className="flex items-center justify-center rounded-lg bg-primary/10 p-1">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold hidden sm:inline-block">
              UA-EDT Docs
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/docs" className="transition-colors hover:text-foreground/80 text-foreground">
              Documentation
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Platform
            </Link>
          </nav>
        </div>
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="flex items-center gap-2 mb-8 mt-2">
              <div className="flex items-center justify-center rounded-lg bg-primary/10 p-1">
                <BrainCircuit className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold">UA-EDT Docs</span>
            </div>
            <DocsSidebar />
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button
              variant="outline"
              className="relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
            >
              <span className="hidden lg:inline-flex">Search documentation...</span>
              <span className="inline-flex lg:hidden">Search...</span>
              <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>
          <nav className="flex items-center">
            <Link href="/dashboard">
              <Button size="sm" className="h-8">Dashboard</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
