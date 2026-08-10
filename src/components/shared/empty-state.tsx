import * as React from "react"
import { cn } from "@/lib/utils"

export type EmptyStateVariant = "no-data" | "no-insights" | "error"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: EmptyStateVariant
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  variant,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-secondary/50">
        {variant === "no-data" && <NoDataIllustration />}
        {variant === "no-insights" && <NoInsightsIllustration />}
        {variant === "error" && <ErrorIllustration />}
      </div>
      <h3 className="mb-2 text-xl font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}

function NoDataIllustration() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <rect x="20" y="20" width="40" height="40" rx="8" className="fill-primary/20" />
      <path
        d="M30 40H50M30 50H45"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="40" cy="30" r="4" fill="currentColor" />
    </svg>
  )
}

function NoInsightsIllustration() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-confidence-high"
    >
      <circle cx="40" cy="40" r="24" className="fill-confidence-high/20" />
      <path
        d="M40 26V32M40 48V54M26 40H32M48 40H54M30.1 30.1L34.3 34.3M45.7 45.7L49.9 49.9M30.1 49.9L34.3 45.7M45.7 30.1L49.9 34.3"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="40" cy="40" r="4" fill="currentColor" />
    </svg>
  )
}

function ErrorIllustration() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-destructive"
    >
      <polygon
        points="40,16 68,64 12,64"
        className="fill-destructive/20"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M40 34V46"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="40" cy="54" r="2.5" fill="currentColor" />
    </svg>
  )
}
