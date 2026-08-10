"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { docsConfig } from "@/lib/docs-data"

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-full">
      <div className="pb-4">
        {docsConfig.sidebarNav.map((group, index) => (
          <div key={index} className="mb-8">
            <h4 className="mb-2.5 rounded-md px-2 text-sm font-semibold tracking-tight text-foreground">
              {group.title}
            </h4>
            <div className="grid grid-flow-row auto-rows-max text-sm">
              {group.items.map((item, i) => (
                <Link
                  key={i}
                  href={item.href ?? "#"}
                  className={cn(
                    "group flex w-full items-center rounded-md border border-transparent px-2 py-1.5 transition-colors",
                    item.disabled ? "pointer-events-none opacity-60" : "hover:text-foreground",
                    pathname === item.href
                      ? "font-medium text-primary bg-primary/5"
                      : "text-muted-foreground"
                  )}
                >
                  {item.title}
                  {item.label && (
                    <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground">
                      {item.label}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
