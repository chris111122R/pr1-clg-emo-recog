"use client"

import * as React from "react"
import { AlertTriangle, Trash2, PauseCircle, RotateCcw, ShieldOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ConfirmVariant = "delete" | "suspend" | "rollback" | "revoke"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  variant?: ConfirmVariant
  itemName?: string
  loading?: boolean
}

const VARIANT_CONFIG: Record<ConfirmVariant, {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
  bg: string
  confirmLabel: string
}> = {
  delete:   { icon: Trash2,      label: "Permanently Delete", color: "text-destructive", bg: "bg-destructive/10",   confirmLabel: "Yes, Delete"   },
  suspend:  { icon: PauseCircle, label: "Suspend Account",    color: "text-warning",     bg: "bg-warning/10",       confirmLabel: "Yes, Suspend"  },
  rollback: { icon: RotateCcw,   label: "Rollback Version",   color: "text-warning",     bg: "bg-warning/10",       confirmLabel: "Yes, Rollback" },
  revoke:   { icon: ShieldOff,   label: "Revoke Access",      color: "text-destructive", bg: "bg-destructive/10",   confirmLabel: "Yes, Revoke"   },
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  variant = "delete",
  itemName,
  loading = false,
}: ConfirmDialogProps) {
  const cfg = VARIANT_CONFIG[variant]
  const Icon = cfg.icon

  const defaultTitle = title ?? `${cfg.label}?`
  const defaultDesc = description ?? (itemName
    ? `Are you sure you want to ${cfg.label.toLowerCase()} "${itemName}"? This action cannot be undone.`
    : `Are you sure you want to proceed? This action cannot be undone.`)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    cfg.bg
                  )}
                >
                  <Icon className={cn("h-5 w-5", cfg.color)} />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base leading-tight">{defaultTitle}</DialogTitle>
              <DialogDescription className="mt-1.5 text-sm leading-relaxed">
                {defaultDesc}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className={cn("rounded-lg border px-3 py-2.5 mt-2", cfg.bg, "border-current/10")}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn("h-3.5 w-3.5 shrink-0", cfg.color)} />
            <p className={cn("text-xs font-medium", cfg.color)}>
              {variant === "delete" || variant === "revoke"
                ? "This action is irreversible."
                : "This action can be reversed by an admin."}
            </p>
          </div>
        </div>

        <DialogFooter className="mt-2 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={variant === "delete" || variant === "revoke" ? "destructive" : "default"}
            onClick={() => { onConfirm(); onOpenChange(false) }}
            disabled={loading}
            className={cn(
              variant === "suspend" || variant === "rollback"
                ? "bg-warning text-warning-foreground hover:bg-warning/90"
                : ""
            )}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                </svg>
                Processing…
              </span>
            ) : cfg.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
