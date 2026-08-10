"use client"

import * as React from "react"
import {
  Toast, ToastClose, ToastDescription, ToastProvider,
  ToastTitle, ToastViewport, type ToastProps
} from "@/components/ui/toast"

// ── Toast State ────────────────────────────────────────────────────────────
interface ToastItem {
  id: string
  title: string
  description?: string
  variant?: ToastProps["variant"]
}

const ToastContext = React.createContext<{
  toast: (opts: Omit<ToastItem, "id">) => void
} | null>(null)

let counter = 0

export function ToastContextProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  function toast(opts: Omit<ToastItem, "id">) {
    const id = String(++counter)
    setToasts(prev => [...prev, { ...opts, id }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastProvider>
        {children}
        {toasts.map(t => (
          <Toast key={t.id} variant={t.variant} open>
            <div className="grid gap-1">
              <ToastTitle>{t.title}</ToastTitle>
              {t.description && <ToastDescription>{t.description}</ToastDescription>}
            </div>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastContextProvider")
  return ctx
}
