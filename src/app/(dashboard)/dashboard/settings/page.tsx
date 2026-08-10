"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import {
  User, Bell, Palette, ShieldCheck, Smartphone, Key, AlertTriangle,
  Upload, Eye, EyeOff, Copy, Check, Trash2, Plus, RefreshCw, Sun,
  Moon, Monitor, LogOut, CheckCircle2, X, ChevronDown
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { ToastContextProvider, useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// SECTION DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "profile",  label: "Profile",            icon: User },
  { id: "preferences", label: "Preferences",     icon: Bell },
  { id: "theme",    label: "Theme",              icon: Palette },
  { id: "security", label: "Security",           icon: ShieldCheck },
  { id: "devices",  label: "Connected Devices",  icon: Smartphone },
  { id: "apikeys",  label: "API Keys",           icon: Key },
  { id: "account",  label: "Account",            icon: AlertTriangle },
] as const

type SectionId = typeof SECTIONS[number]["id"]

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
    </div>
  )
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-3 items-start py-5 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div>{children}</div>
    </div>
  )
}

function Toggle({
  checked, onChange, id
}: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked ? "bg-primary" : "bg-input"
      )}
    >
      <span className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
        checked ? "translate-x-5" : "translate-x-0"
      )} />
    </button>
  )
}

function ConfirmDialog({
  open, onOpenChange, title, description, confirmLabel = "Confirm", variant = "destructive",
  onConfirm, requireText, children
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  variant?: "destructive" | "default"
  onConfirm: () => void
  requireText?: string
  children?: React.ReactNode
}) {
  const [typed, setTyped] = React.useState("")
  const [prevOpen, setPrevOpen] = React.useState(false)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (!open) setTyped("")
  }

  const canConfirm = !requireText || typed === requireText

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className={variant === "destructive" ? "text-destructive" : ""}>{title}</DialogTitle>
          <DialogDescription className="leading-relaxed">{description}</DialogDescription>
        </DialogHeader>
        {children}
        {requireText && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Type <span className="font-mono font-semibold text-foreground">{requireText}</span> to confirm
            </p>
            <Input
              value={typed}
              onChange={e => setTyped(e.target.value)}
              placeholder={requireText}
              className="font-mono"
            />
          </div>
        )}
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            size="sm"
            disabled={!canConfirm}
            onClick={() => { onConfirm(); onOpenChange(false) }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PROFILE
// ─────────────────────────────────────────────────────────────────────────────
function ProfileSection() {
  const { toast } = useToast()
  const [saving, setSaving] = React.useState(false)
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const [form, setForm] = React.useState({
    firstName: "Jane", lastName: "Doe",
    email: "jane.doe@stanford.edu",
    institution: "Stanford Research Institute",
    role: "Lead Researcher",
    bio: "Affective computing researcher specialising in multimodal uncertainty quantification and clinical-grade emotion AI systems.",
    timezone: "America/Los_Angeles",
  })

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setAvatarUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 900))
    setSaving(false)
    toast({ title: "Profile saved", description: "Your changes are now live.", variant: "default" })
  }

  function field(key: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  return (
    <div>
      <SectionHeader
        title="Profile"
        description="Manage your public identity and account information."
      />

      {/* Avatar */}
      <FieldRow label="Photo" hint="JPEG or PNG · Max 4 MB">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-border">
            {avatarUrl
              ? <AvatarImage src={avatarUrl} />
              : <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">JD</AvatarFallback>
            }
          </Avatar>
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" className="gap-2 w-fit"
              onClick={() => fileRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" /> Upload photo
            </Button>
            {avatarUrl && (
              <Button variant="ghost" size="sm" className="text-destructive gap-2 w-fit"
                onClick={() => setAvatarUrl(null)}>
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </Button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
        </div>
      </FieldRow>

      {/* Name */}
      <FieldRow label="Full name">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="prof-first" className="text-xs text-muted-foreground">First</Label>
            <Input id="prof-first" value={form.firstName} onChange={e => field("firstName", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prof-last" className="text-xs text-muted-foreground">Last</Label>
            <Input id="prof-last" value={form.lastName} onChange={e => field("lastName", e.target.value)} />
          </div>
        </div>
      </FieldRow>

      <FieldRow label="Work email" hint="Used for login and notifications.">
        <Input id="prof-email" type="email" value={form.email} onChange={e => field("email", e.target.value)} />
      </FieldRow>

      <FieldRow label="Institution">
        <Input id="prof-inst" value={form.institution} onChange={e => field("institution", e.target.value)} />
      </FieldRow>

      <FieldRow label="Role / Title">
        <Input id="prof-role" value={form.role} onChange={e => field("role", e.target.value)} />
      </FieldRow>

      <FieldRow label="Bio" hint="Short public description. Shown on team pages.">
        <Textarea
          id="prof-bio"
          value={form.bio}
          onChange={e => field("bio", e.target.value)}
          className="min-h-[96px] resize-none"
          maxLength={280}
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">{form.bio.length}/280</p>
      </FieldRow>

      <FieldRow label="Timezone">
        <Select value={form.timezone} onValueChange={v => field("timezone", v)}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["America/Los_Angeles", "America/New_York", "Europe/London", "Europe/Berlin", "Asia/Tokyo", "Asia/Kolkata"].map(tz => (
              <SelectItem key={tz} value={tz}>{tz.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>

      <div className="pt-6">
        <Button onClick={handleSave} isLoading={saving} className="gap-2">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PREFERENCES
// ─────────────────────────────────────────────────────────────────────────────
function PreferencesSection() {
  const { toast } = useToast()
  const [saving, setSaving] = React.useState(false)
  const [prefs, setPrefs] = React.useState({
    notifyInference: true,
    notifyLowConfidence: true,
    notifyModelUpdates: false,
    notifyWeeklyDigest: true,
    notifyTeamInvites: true,
    defaultView: "dashboard",
    language: "en-US",
    dateFormat: "MMM D, YYYY",
    compactMode: false,
    animationsReduced: false,
  })

  function toggle(key: keyof typeof prefs) {
    setPrefs(p => ({ ...p, [key]: !p[key] }))
  }

  async function save() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    toast({ title: "Preferences saved", variant: "default" })
  }

  const notifToggles = [
    { key: "notifyInference", label: "Inference complete", desc: "When a session finishes processing" },
    { key: "notifyLowConfidence", label: "Low confidence alert", desc: "When uncertainty exceeds configured threshold" },
    { key: "notifyModelUpdates", label: "Model updates", desc: "New model versions deployed to your workspace" },
    { key: "notifyWeeklyDigest", label: "Weekly digest", desc: "Summary of activity sent every Monday" },
    { key: "notifyTeamInvites", label: "Team invitations", desc: "When someone invites you to a workspace" },
  ] as const

  return (
    <div>
      <SectionHeader
        title="Preferences"
        description="Control notifications, layout defaults, and locale settings."
      />

      {/* Notifications */}
      <div className="mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Notifications</p>
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {notifToggles.map(item => (
              <div key={item.key} className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Toggle
                  id={`notif-${item.key}`}
                  checked={prefs[item.key] as boolean}
                  onChange={() => toggle(item.key)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Display */}
      <div className="mt-8 mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Display</p>
        <Card>
          <CardContent className="divide-y divide-border p-0">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-sm font-medium">Compact mode</p>
                <p className="text-xs text-muted-foreground">Reduce spacing and font size in tables</p>
              </div>
              <Toggle id="compact-mode" checked={prefs.compactMode} onChange={() => toggle("compactMode")} />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-sm font-medium">Reduce motion</p>
                <p className="text-xs text-muted-foreground">Disable transitions and animations</p>
              </div>
              <Toggle id="reduce-motion" checked={prefs.animationsReduced} onChange={() => toggle("animationsReduced")} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Locale */}
      <div className="mt-8 mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Locale</p>
        <Card>
          <CardContent className="divide-y divide-border p-0">
            <FieldRow label="Language">
              <Select value={prefs.language} onValueChange={v => setPrefs(p => ({ ...p, language: v }))}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="de-DE">Deutsch</SelectItem>
                  <SelectItem value="fr-FR">Français</SelectItem>
                  <SelectItem value="ja-JP">日本語</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="Date format">
              <Select value={prefs.dateFormat} onValueChange={v => setPrefs(p => ({ ...p, dateFormat: v }))}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MMM D, YYYY">Jul 19, 2026</SelectItem>
                  <SelectItem value="DD/MM/YYYY">19/07/2026</SelectItem>
                  <SelectItem value="MM/DD/YYYY">07/19/2026</SelectItem>
                  <SelectItem value="YYYY-MM-DD">2026-07-19</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
          </CardContent>
        </Card>
      </div>

      <div className="pt-6">
        <Button onClick={save} isLoading={saving}>{saving ? "Saving…" : "Save preferences"}</Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. THEME
// ─────────────────────────────────────────────────────────────────────────────
const ACCENT_PALETTES = [
  { name: "Teal (Default)", value: "teal",   primary: "#0d9488", secondary: "#ccfbf1" },
  { name: "Violet",         value: "violet", primary: "#7c3aed", secondary: "#ede9fe" },
  { name: "Rose",           value: "rose",   primary: "#e11d48", secondary: "#ffe4e6" },
  { name: "Amber",          value: "amber",  primary: "#d97706", secondary: "#fef3c7" },
  { name: "Sky",            value: "sky",    primary: "#0284c7", secondary: "#e0f2fe" },
  { name: "Emerald",        value: "emerald",primary: "#059669", secondary: "#d1fae5" },
]

function ThemeSection() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [selectedAccent, setSelectedAccent] = React.useState("teal")
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(id)
  }, [])

  const MODES = [
    { value: "light", label: "Light", icon: Sun,     desc: "Always use light mode" },
    { value: "dark",  label: "Dark",  icon: Moon,    desc: "Always use dark mode" },
    { value: "system",label: "System",icon: Monitor, desc: "Follow OS preference" },
  ]

  function save() {
    toast({ title: "Theme saved", description: `Mode: ${theme}, Accent: ${selectedAccent}`, variant: "default" })
  }

  if (!mounted) return null

  return (
    <div>
      <SectionHeader title="Theme" description="Personalise the platform's visual appearance." />

      {/* Mode selector */}
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Appearance mode</p>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {MODES.map(mode => {
          const Icon = mode.icon
          const isActive = theme === mode.value
          return (
            <button
              key={mode.value}
              onClick={() => setTheme(mode.value)}
              className={cn(
                "group relative rounded-xl border-2 p-4 text-left transition-all duration-200 hover:border-primary/50",
                isActive ? "border-primary bg-primary/5" : "border-border bg-card"
              )}
            >
              {/* Live preview swatch */}
              <div className={cn(
                "mb-3 rounded-lg overflow-hidden border shadow-sm h-24 relative",
                mode.value === "dark" ? "bg-slate-950" :
                mode.value === "light" ? "bg-slate-50" :
                "bg-gradient-to-br from-slate-50 to-slate-900"
              )}>
                {/* Miniature UI chrome */}
                <div className={cn("h-5 flex items-center px-2 gap-1.5 border-b",
                  mode.value === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
                  {[0,1,2].map(i => (
                    <div key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: ["#ef4444","#f59e0b","#22c55e"][i] }} />
                  ))}
                </div>
                <div className="flex gap-1 p-2 h-full">
                  <div className={cn("w-10 rounded", mode.value === "dark" ? "bg-slate-800" : "bg-slate-100")} />
                  <div className="flex-1 space-y-1.5 pt-1">
                    <div className={cn("h-2 rounded-sm w-3/4", mode.value === "dark" ? "bg-slate-700" : "bg-slate-200")} />
                    <div className={cn("h-2 rounded-sm w-1/2", mode.value === "dark" ? "bg-slate-700" : "bg-slate-200")} />
                  </div>
                </div>
                {isActive && (
                  <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                <div>
                  <p className={cn("text-sm font-semibold", isActive && "text-primary")}>{mode.label}</p>
                  <p className="text-xs text-muted-foreground">{mode.desc}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Accent color */}
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Accent color</p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
        {ACCENT_PALETTES.map(palette => (
          <button
            key={palette.value}
            onClick={() => setSelectedAccent(palette.value)}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
              selectedAccent === palette.value ? "border-foreground" : "border-border hover:border-muted-foreground"
            )}
          >
            <div
              className="h-8 w-8 rounded-full border-[3px] border-background shadow-sm"
              style={{ background: palette.primary }}
            />
            <span className="text-xs text-muted-foreground leading-tight text-center">{palette.name}</span>
            {selectedAccent === palette.value && (
              <Check className="h-3 w-3 text-foreground absolute" />
            )}
          </button>
        ))}
      </div>

      <Button onClick={save}>Save theme</Button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SECURITY
// ─────────────────────────────────────────────────────────────────────────────
function SecuritySection() {
  const { toast } = useToast()
  const [showCurrent, setShowCurrent] = React.useState(false)
  const [showNew, setShowNew] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [twoFAEnabled, setTwoFAEnabled] = React.useState(true)
  const [savingPw, setSavingPw] = React.useState(false)
  const [showBackupCodes, setShowBackupCodes] = React.useState(false)
  const [regenConfirm, setRegenConfirm] = React.useState(false)
  const [backupCodes] = React.useState([
    "A1B2-C3D4", "E5F6-G7H8", "I9J0-K1L2", "M3N4-O5P6",
    "Q7R8-S9T0", "U1V2-W3X4", "Y5Z6-A7B8", "C9D0-E1F2"
  ])
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null)
  const [pwForm, setPwForm] = React.useState({ current: "", newPw: "", confirm: "" })

  function getStrength(pw: string) {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }
  const strength = getStrength(pwForm.newPw)
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength]
  const strengthColor = ["", "bg-destructive", "bg-warning", "bg-success/70", "bg-success"][strength]

  async function savePassword() {
    if (!pwForm.current || !pwForm.newPw || pwForm.newPw !== pwForm.confirm) return
    setSavingPw(true)
    await new Promise(r => setTimeout(r, 1000))
    setSavingPw(false)
    setPwForm({ current: "", newPw: "", confirm: "" })
    toast({ title: "Password updated", description: "You'll need to use your new password next time.", variant: "default" })
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div>
      <SectionHeader title="Security" description="Manage your password, two-factor authentication, and active sessions." />

      {/* Password */}
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Password</p>
      <Card className="mb-8">
        <CardContent className="pt-5 space-y-4">
          {/* Current */}
          <div className="space-y-1.5">
            <Label htmlFor="sec-current">Current password</Label>
            <div className="relative">
              <Input id="sec-current" type={showCurrent ? "text" : "password"}
                placeholder="Your current password" className="pr-10"
                value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} />
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {/* New */}
          <div className="space-y-1.5">
            <Label htmlFor="sec-new">New password</Label>
            <div className="relative">
              <Input id="sec-new" type={showNew ? "text" : "password"}
                placeholder="Min. 8 chars" className="pr-10"
                value={pwForm.newPw} onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {pwForm.newPw && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[0,1,2,3].map(i => (
                    <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i < strength ? strengthColor : "bg-muted")} />
                  ))}
                </div>
                <p className={cn("text-xs font-medium",
                  strength <= 1 ? "text-destructive" : strength === 2 ? "text-warning" : "text-success")}>
                  {strengthLabel}
                </p>
              </div>
            )}
          </div>
          {/* Confirm */}
          <div className="space-y-1.5">
            <Label htmlFor="sec-confirm">Confirm new password</Label>
            <div className="relative">
              <Input id="sec-confirm" type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password" className="pr-10"
                value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {pwForm.newPw && pwForm.confirm && pwForm.newPw === pwForm.confirm
                  ? <CheckCircle2 className="h-4 w-4 text-success" />
                  : showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
              <p className="text-xs text-destructive">Passwords do not match.</p>
            )}
          </div>
          <Button size="sm" onClick={savePassword} isLoading={savingPw}
            disabled={!pwForm.current || !pwForm.newPw || pwForm.newPw !== pwForm.confirm}>
            {savingPw ? "Updating…" : "Update password"}
          </Button>
        </CardContent>
      </Card>

      {/* 2FA */}
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Two-factor authentication</p>
      <Card className="mb-8">
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">Authenticator app</p>
                <Badge variant={twoFAEnabled ? "success" : "secondary"} className="text-xs">
                  {twoFAEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Time-based one-time passwords via Google Authenticator, Authy, or 1Password.</p>
            </div>
            <Toggle id="2fa-toggle" checked={twoFAEnabled} onChange={setTwoFAEnabled} />
          </div>

          {twoFAEnabled && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="border-t border-border pt-4 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" className="gap-2"
                    onClick={() => setShowBackupCodes(true)}>
                    <Key className="h-3.5 w-3.5" /> View backup codes
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 text-warning border-warning/30 hover:bg-warning/10"
                    onClick={() => setRegenConfirm(true)}>
                    <RefreshCw className="h-3.5 w-3.5" /> Regenerate codes
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">8 backup codes remaining · Each code can only be used once.</p>
              </motion.div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>

      {/* Backup codes modal */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Backup codes</DialogTitle>
            <DialogDescription>Store these in a safe place. Each can only be used once.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map(code => (
              <div key={code} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                <code className="text-sm font-mono font-semibold">{code}</code>
                <button onClick={() => copyCode(code)} className="text-muted-foreground hover:text-foreground transition-colors ml-2">
                  {copiedCode === code ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" size="sm">Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={regenConfirm} onOpenChange={setRegenConfirm}
        title="Regenerate backup codes"
        description="This will permanently invalidate all current backup codes and generate 8 new ones. Any stored codes will no longer work."
        confirmLabel="Regenerate" variant="destructive"
        onConfirm={() => toast({ title: "Backup codes regenerated", description: "8 new codes are now active.", variant: "default" })}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. CONNECTED DEVICES
// ─────────────────────────────────────────────────────────────────────────────
interface DeviceSession {
  id: string
  name: string
  os: string
  browser: string
  location: string
  ip: string
  lastActive: string
  isCurrent: boolean
}

const MOCK_DEVICES: DeviceSession[] = [
  { id: "d1", name: 'MacBook Pro 16"', os: "macOS 15.2", browser: "Chrome 126", location: "San Francisco, CA", ip: "76.120.43.11", lastActive: "Now", isCurrent: true },
  { id: "d2", name: 'iPad Pro 12.9"',  os: "iPadOS 17.5", browser: "Safari 17",  location: "San Francisco, CA", ip: "76.120.43.11", lastActive: "3 hours ago", isCurrent: false },
  { id: "d3", name: "Windows Desktop", os: "Windows 11", browser: "Edge 126",   location: "New York, NY",       ip: "64.43.22.98",  lastActive: "2 days ago", isCurrent: false },
  { id: "d4", name: "iPhone 15 Pro",   os: "iOS 17.5",   browser: "Safari 17",  location: "Boston, MA",         ip: "98.204.11.45", lastActive: "5 days ago", isCurrent: false },
]

function DeviceIcon({ os }: { os: string }) {
  const icon = os.includes("macOS") || os.includes("iOS") || os.includes("iPadOS")
    ? "🍎" : os.includes("Windows") ? "🪟" : "🐧"
  return <span className="text-2xl">{icon}</span>
}

function DevicesSection() {
  const { toast } = useToast()
  const [devices, setDevices] = React.useState(MOCK_DEVICES)
  const [revokeId, setRevokeId] = React.useState<string | null>(null)
  const [revokeAllOpen, setRevokeAllOpen] = React.useState(false)

  function revoke(id: string) {
    setDevices(d => d.filter(x => x.id !== id))
    toast({ title: "Session revoked", description: "That device has been signed out.", variant: "default" })
  }

  function revokeAll() {
    setDevices(d => d.filter(x => x.isCurrent))
    toast({ title: "All other sessions revoked", variant: "default" })
  }

  const targetDevice = devices.find(d => d.id === revokeId)

  return (
    <div>
      <SectionHeader title="Connected Devices" description="Devices and browsers currently signed into your account." />

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{devices.length} active session{devices.length !== 1 ? "s" : ""}</p>
        {devices.length > 1 && (
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-2"
            onClick={() => setRevokeAllOpen(true)}>
            <LogOut className="h-3.5 w-3.5" /> Revoke all others
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {devices.map(device => (
          <motion.div key={device.id} layout exit={{ opacity: 0, x: 40, height: 0 }}
            transition={{ duration: 0.25 }}>
            <Card className={device.isCurrent ? "border-primary/30 bg-primary/[0.02]" : ""}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <DeviceIcon os={device.os} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{device.name}</p>
                      {device.isCurrent && <Badge variant="success" className="text-xs">Current session</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{device.os} · {device.browser}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-xs text-muted-foreground">
                      <span>📍 {device.location}</span>
                      <span>🌐 {device.ip}</span>
                      <span>🕐 {device.lastActive}</span>
                    </div>
                  </div>
                  {!device.isCurrent && (
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 shrink-0 gap-1.5"
                      onClick={() => setRevokeId(device.id)}>
                      <LogOut className="h-3.5 w-3.5" /> Revoke
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <ConfirmDialog
        open={!!revokeId} onOpenChange={v => !v && setRevokeId(null)}
        title="Revoke this session"
        description={`"${targetDevice?.name}" in ${targetDevice?.location} will be immediately signed out.`}
        confirmLabel="Revoke session" variant="destructive"
        onConfirm={() => { if (revokeId) revoke(revokeId); setRevokeId(null) }}
      />
      <ConfirmDialog
        open={revokeAllOpen} onOpenChange={setRevokeAllOpen}
        title="Revoke all other sessions"
        description="All devices except your current one will be immediately signed out."
        confirmLabel="Revoke all others" variant="destructive"
        onConfirm={revokeAll}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. API KEYS
// ─────────────────────────────────────────────────────────────────────────────
interface ApiKey {
  id: string
  name: string
  prefix: string
  scopes: string[]
  created: string
  lastUsed: string | null
}

const INITIAL_KEYS: ApiKey[] = [
  { id: "k1", name: "Production Inference", prefix: "ua_prod_", scopes: ["inference:read", "inference:write"], created: "2026-04-12", lastUsed: "2026-07-19" },
  { id: "k2", name: "Analytics Pipeline", prefix: "ua_anly_", scopes: ["analytics:read"], created: "2026-05-03", lastUsed: "2026-07-15" },
  { id: "k3", name: "CI/CD Integration", prefix: "ua_ci___", scopes: ["inference:read"], created: "2026-06-22", lastUsed: null },
]

const ALL_SCOPES = ["inference:read", "inference:write", "analytics:read", "analytics:write", "admin:read"]

function ApiKeysSection() {
  const { toast } = useToast()
  const [keys, setKeys] = React.useState(INITIAL_KEYS)
  const [revokeId, setRevokeId] = React.useState<string | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [newKeyName, setNewKeyName] = React.useState("")
  const [newKeyScopes, setNewKeyScopes] = React.useState<string[]>(["inference:read"])
  const [revealedKey, setRevealedKey] = React.useState<string | null>(null)
  const [copiedKey, setCopiedKey] = React.useState(false)
  const [creating, setCreating] = React.useState(false)

  function toggleScope(scope: string) {
    setNewKeyScopes(prev => prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope])
  }

  async function createKey() {
    if (!newKeyName.trim() || newKeyScopes.length === 0) return
    setCreating(true)
    await new Promise(r => setTimeout(r, 900))
    setCreating(false)
    const secret = `ua_${newKeyScopes[0].split(":")[0].slice(0,4)}_${"x".repeat(4)}.${"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("").sort(() => Math.random() - 0.5).join("").slice(0, 32)}`
    const newKey: ApiKey = {
      id: `k${Date.now()}`, name: newKeyName, prefix: secret.slice(0, 12),
      scopes: newKeyScopes, created: new Date().toISOString().split("T")[0], lastUsed: null
    }
    setKeys(prev => [...prev, newKey])
    setCreateOpen(false)
    setRevealedKey(secret)
    setNewKeyName("")
    setNewKeyScopes(["inference:read"])
  }

  function copyKey() {
    if (!revealedKey) return
    navigator.clipboard.writeText(revealedKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2500)
  }

  function revokeKey(id: string) {
    const k = keys.find(x => x.id === id)
    setKeys(prev => prev.filter(x => x.id !== id))
    toast({ title: "API key revoked", description: `"${k?.name}" has been permanently deleted.`, variant: "default" })
  }

  const targetKey = keys.find(k => k.id === revokeId)

  return (
    <div>
      <SectionHeader title="API Keys" description="Manage programmatic access to the UA-EDT inference and analytics APIs." />

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{keys.length} key{keys.length !== 1 ? "s" : ""}</p>
        <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> New API key
        </Button>
      </div>

      {/* Keys table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Name", "Key prefix", "Scopes", "Created", "Last used", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {keys.map(key => (
                <tr key={key.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{key.name}</td>
                  <td className="px-4 py-3">
                    <code className="font-mono text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                      {key.prefix}•••••••••
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {key.scopes.map(s => (
                        <Badge key={s} variant="secondary" className="text-xs font-mono">{s}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs tabular-nums">{key.created}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                    {key.lastUsed ?? <span className="italic">Never</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 gap-1.5"
                      onClick={() => setRevokeId(key.id)}>
                      <Trash2 className="h-3.5 w-3.5" /> Revoke
                    </Button>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                    No API keys. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={v => { if (!creating) setCreateOpen(v) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create new API key</DialogTitle>
            <DialogDescription>Give it a name and choose the minimum required scopes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="key-name">Key name</Label>
              <Input id="key-name" placeholder="e.g. Production Inference" value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Scopes</Label>
              <div className="space-y-2">
                {ALL_SCOPES.map(scope => (
                  <label key={scope} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={newKeyScopes.includes(scope)}
                      onChange={() => toggleScope(scope)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-ring cursor-pointer" />
                    <span className="font-mono text-xs text-muted-foreground">{scope}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" size="sm" disabled={creating}>Cancel</Button></DialogClose>
            <Button size="sm" onClick={createKey} isLoading={creating}
              disabled={!newKeyName.trim() || newKeyScopes.length === 0}>
              {creating ? "Generating…" : "Generate key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* One-time reveal dialog */}
      <Dialog open={!!revealedKey} onOpenChange={v => { if (!v) setRevealedKey(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" /> API key created
            </DialogTitle>
            <DialogDescription>
              <strong className="text-destructive">Copy this key now.</strong> You won't be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted border border-border p-4 font-mono text-sm break-all relative">
            {revealedKey}
            <button onClick={copyKey}
              className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
              {copiedKey ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          {copiedKey && <p className="text-xs text-success text-center">Copied to clipboard!</p>}
          <DialogFooter>
            <Button onClick={() => setRevealedKey(null)}>Done, I've saved it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke confirm */}
      <ConfirmDialog
        open={!!revokeId} onOpenChange={v => !v && setRevokeId(null)}
        title="Revoke API key"
        description={`"${targetKey?.name}" will be permanently deleted. Any integrations using this key will stop working immediately.`}
        confirmLabel="Revoke key" variant="destructive"
        onConfirm={() => { if (revokeId) revokeKey(revokeId); setRevokeId(null) }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. ACCOUNT MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
function AccountSection() {
  const { toast } = useToast()
  const [exportLoading, setExportLoading] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  async function handleExport() {
    setExportLoading(true)
    await new Promise(r => setTimeout(r, 1400))
    setExportLoading(false)
    toast({ title: "Export initiated", description: "You'll receive a download link by email within 24 hours.", variant: "default" })
  }

  function handleDelete() {
    toast({ title: "Account scheduled for deletion", description: "Your account will be permanently deleted in 14 days.", variant: "destructive" })
  }

  return (
    <div>
      <SectionHeader title="Account" description="Manage your subscription, export your data, or delete your account." />

      {/* Plan */}
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Current plan</p>
      <Card className="mb-8">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">Clinical Trial</span>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">$899 / month · Renews August 19, 2026</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Inference usage</span>
                  <span className="font-semibold text-foreground">32,140 / 50,000 min</span>
                </div>
                <Progress value={64.3} className="h-1.5" />
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Button variant="outline" size="sm">Manage billing</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">View invoices</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data export */}
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Data & privacy</p>
      <Card className="mb-8">
        <CardContent className="pt-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="font-medium text-sm">Export your data</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
                Download a complete archive of all your sessions, reports, configurations, and account data in JSON format.
                GDPR-compliant within 24 hours.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} isLoading={exportLoading} className="gap-2 shrink-0">
              {exportLoading ? "Preparing…" : "Request export"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <p className="text-xs font-semibold uppercase tracking-widest text-destructive mb-3">Danger zone</p>
      <Card className="border-destructive/30 bg-destructive/[0.02]">
        <CardContent className="pt-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <p className="font-semibold text-sm text-destructive">Delete account</p>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Permanently deletes your account, all sessions, reports, API keys, and team memberships.
                This action is irreversible and will be processed after a 14-day grace period.
              </p>
            </div>
            <Button variant="destructive" size="sm" className="shrink-0"
              onClick={() => setDeleteOpen(true)}>
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen} onOpenChange={setDeleteOpen}
        title="Delete account permanently"
        description="All your data will be permanently erased. This cannot be undone. There is a 14-day grace period during which you can cancel."
        confirmLabel="Delete my account" variant="destructive"
        requireText="delete my account"
        onConfirm={handleDelete}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS SHELL — Left nav + content
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_CONTENT: Record<SectionId, React.ReactNode> = {
  profile: <ProfileSection />,
  preferences: <PreferencesSection />,
  theme: <ThemeSection />,
  security: <SecuritySection />,
  devices: <DevicesSection />,
  apikeys: <ApiKeysSection />,
  account: <AccountSection />,
}

function SettingsShell() {
  const [active, setActive] = React.useState<SectionId>("profile")

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* ── Left nav (desktop) / Select (mobile) ── */}
      {/* Mobile: select dropdown */}
      <div className="lg:hidden mb-4">
        <div className="relative">
          <select
            value={active}
            onChange={e => setActive(e.target.value as SectionId)}
            className="w-full appearance-none rounded-lg border border-border bg-card px-4 py-2.5 pr-10 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {SECTIONS.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Desktop sidebar nav */}
      <nav className="hidden lg:flex lg:flex-col lg:w-52 xl:w-60 shrink-0 space-y-0.5">
        {SECTIONS.map(section => {
          const Icon = section.icon
          const isActive = active === section.id
          return (
            <button
              key={section.id}
              onClick={() => setActive(section.id)}
              className={cn(
                "relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 text-left",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="settings-indicator"
                  className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-primary rounded-full"
                  transition={{ duration: 0.2 }}
                />
              )}
              <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
              {section.label}
              {section.id === "account" && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-destructive/60" />
              )}
            </button>
          )
        })}
      </nav>

      {/* ── Content panel ── */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
          >
            {SECTION_CONTENT[active]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  return (
    <ToastContextProvider>
      <SettingsShell />
    </ToastContextProvider>
  )
}
