"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertTriangle, Info, Clock } from "lucide-react"

export interface ActivityItem {
  id: string
  title: string
  description?: string
  timestamp: string
  status: "success" | "warning" | "info" | "default"
}

export function ActivityFeed({
  items,
  className,
}: {
  items: ActivityItem[]
  className?: string
}) {
  return (
    <div className={cn("space-y-6 border-l-2 border-muted ml-3", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="relative pl-6">
          <div className="absolute -left-[11px] top-1">
            {item.status === "success" && (
              <CheckCircle2 className="h-5 w-5 text-success bg-background rounded-full" />
            )}
            {item.status === "warning" && (
              <AlertTriangle className="h-5 w-5 text-warning bg-background rounded-full" />
            )}
            {item.status === "info" && (
              <Info className="h-5 w-5 text-info bg-background rounded-full" />
            )}
            {item.status === "default" && (
              <Clock className="h-5 w-5 text-muted-foreground bg-background rounded-full" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold tracking-tight">{item.title}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{item.timestamp}</span>
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
