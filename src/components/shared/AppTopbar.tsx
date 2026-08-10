"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Bell, ChevronRight, X, CheckCircle2, AlertTriangle,
  Info, User, LogOut, Settings, ChevronsUpDown
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandShortcut, CommandSeparator
} from "@/components/ui/command"

// --- Breadcrumb generation ---
function useBreadcrumbs() {
  const pathname = usePathname()
  const parts = pathname.split("/").filter(Boolean)
  const crumbs = parts.map((part, i) => {
    const href = "/" + parts.slice(0, i + 1).join("/")
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ")
    return { label, href }
  })
  return crumbs
}

function Breadcrumbs() {
  const crumbs = useBreadcrumbs()
  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1 text-sm">
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.href}>
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />}
          {i === crumbs.length - 1 ? (
            <span className="font-semibold text-foreground truncate max-w-[160px]">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px]"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

// --- AI System Status ---
type SystemStatus = "online" | "processing" | "degraded"

function AIStatusIndicator() {
  const [status] = React.useState<SystemStatus>("online")

  const config: Record<SystemStatus, { label: string; color: string; pulse: string }> = {
    online:     { label: "AI Online",     color: "bg-success",     pulse: "bg-success" },
    processing: { label: "Processing…",   color: "bg-warning",     pulse: "bg-warning" },
    degraded:   { label: "Degraded",      color: "bg-destructive", pulse: "bg-destructive" },
  }
  const { label, color, pulse } = config[status]

  return (
    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
      <span className="relative flex h-2 w-2">
        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", pulse)} />
        <span className={cn("relative inline-flex rounded-full h-2 w-2", color)} />
      </span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}

// --- Notifications ---
interface Notification {
  id: string
  title: string
  body: string
  time: string
  type: "success" | "warning" | "info"
  read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1", type: "success", read: false,
    title: "Inference Complete",
    body: "Session S-002B finished with 94.2% average confidence.",
    time: "2m ago",
  },
  {
    id: "2", type: "warning", read: false,
    title: "Low Confidence Detected",
    body: "Segment 03:14–03:28 fell below the 70% epistemic threshold.",
    time: "18m ago",
  },
  {
    id: "3", type: "info", read: true,
    title: "Model Updated",
    body: "Multimodal Fusion v2.4.1 has been deployed to your workspace.",
    time: "2h ago",
  },
]

const notifIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
}
const notifColor: Record<string, string> = {
  success: "text-success",
  warning: "text-warning",
  info: "text-info",
}

function NotificationsDropdown() {
  const [notifications, setNotifications] = React.useState(MOCK_NOTIFICATIONS)
  const unread = notifications.filter((n) => !n.read).length

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4.5 w-4.5" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Notifications</span>
            {unread > 0 && (
              <span className="text-xs font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                {unread}
              </span>
            )}
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-[320px] overflow-y-auto divide-y divide-border">
          {notifications.map((n) => {
            const Icon = notifIcon[n.type]
            return (
              <div
                key={n.id}
                className={cn(
                  "flex gap-3 px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer",
                  !n.read && "bg-primary/[0.03]"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", notifColor[n.type])} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-medium leading-tight", !n.read && "font-semibold")}>
                      {n.title}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {n.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                </div>
                {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0" />}
              </div>
            )
          })}
        </div>
        <div className="px-4 py-2 border-t">
          <Button variant="ghost" size="sm" className="w-full text-muted-foreground text-xs h-8">
            View all activity
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// --- Command Palette ---
const COMMAND_ITEMS = [
  { group: "Navigation", items: [
    { label: "Dashboard", href: "/dashboard", shortcut: "G D" },
    { label: "Session Analysis", href: "/dashboard/workspace/session", shortcut: "" },
    { label: "Digital Twin", href: "/dashboard/workspace/twin", shortcut: "" },
    { label: "Analytics", href: "/dashboard/analytics/trends", shortcut: "G A" },
    { label: "Settings", href: "/dashboard/settings", shortcut: "G S" },
  ]},
  { group: "Actions", items: [
    { label: "New Analysis Session", href: "#", shortcut: "⌘ N" },
    { label: "Upload Dataset", href: "/dashboard/workspace/upload", shortcut: "" },
    { label: "Export Report", href: "#", shortcut: "" },
  ]},
]

export function useCommandPalette() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  return { open, setOpen }
}

interface AppTopbarProps {
  onMobileMenuOpen: () => void
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (v: boolean) => void
}

export function AppTopbar({ onMobileMenuOpen, commandPaletteOpen, setCommandPaletteOpen }: AppTopbarProps) {
  return (
    <>
      <header className="flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 shrink-0 z-30">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuOpen}
          className="md:hidden flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Open navigation"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Breadcrumbs />

        <div className="flex-1" />

        <ThemeToggle />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-2 sm:py-1 min-h-[44px] sm:min-h-0 hover:bg-accent transition-colors" aria-label="User menu">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col text-left min-w-0">
                <span className="text-xs font-semibold leading-tight truncate max-w-[100px]">Student</span>
              </div>
              <ChevronsUpDown className="hidden lg:block h-3 w-3 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Student</p>
                <p className="text-xs text-muted-foreground truncate">student@university.edu</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Command Palette */}
      <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
        <CommandInput placeholder="Search pages, sessions, actions…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {COMMAND_ITEMS.map((group, gi) => (
            <React.Fragment key={group.group}>
              {gi > 0 && <CommandSeparator />}
              <CommandGroup heading={group.group}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.label}
                    onSelect={() => setCommandPaletteOpen(false)}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
