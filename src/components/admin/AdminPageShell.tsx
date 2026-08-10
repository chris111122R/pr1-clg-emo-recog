import * as React from "react"
import { cn } from "@/lib/utils"

interface AdminPageShellProps {
  title: string
  description?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function AdminPageShell({
  title,
  description,
  badge,
  actions,
  children,
  className,
}: AdminPageShellProps) {
  return (
    <div className={cn("flex flex-col gap-6 p-6", className)}>
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
      {/* Page content */}
      {children}
    </div>
  )
}
