"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  UserPlus, MoreHorizontal, Edit2, PauseCircle,
  Trash2, Users, UserCheck, UserX, Clock, Mail,
  ShieldCheck, CheckCircle2
} from "lucide-react"
import type { Metadata } from "next"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"

import { AdminPageShell } from "@/components/admin/AdminPageShell"
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable"
import { ConfirmDialog, type ConfirmVariant } from "@/components/admin/ConfirmDialog"
import {
  ADMIN_USERS, type AdminUser, type UserRole, type UserStatus
} from "@/lib/admin-data"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin:       "Admin",
  researcher:  "Researcher",
  clinician:   "Clinician",
  viewer:      "Viewer",
}

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: "bg-destructive/10 text-destructive border-destructive/20",
  admin:       "bg-warning/10 text-warning border-warning/20",
  researcher:  "bg-primary/10 text-primary border-primary/20",
  clinician:   "bg-success/10 text-success border-success/20",
  viewer:      "bg-info/10 text-info border-info/20",
}

const STATUS_COLORS: Record<UserStatus, string> = {
  active:    "bg-success/10 text-success border-success/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
  pending:   "bg-warning/10 text-warning border-warning/20",
  inactive:  "bg-muted text-muted-foreground border-border",
}

const STATUS_DOT: Record<UserStatus, string> = {
  active:    "bg-success",
  suspended: "bg-destructive",
  pending:   "bg-warning",
  inactive:  "bg-muted-foreground",
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: number; color: string
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Invite Dialog ─────────────────────────────────────────────────────────────

function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<UserRole>("viewer")
  const [loading, setLoading] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  function handleSend() {
    if (!email) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setSent(true) }, 1200)
  }

  function handleClose() {
    onOpenChange(false)
    setTimeout(() => { setName(""); setEmail(""); setRole("viewer"); setSent(false) }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Send an email invitation. The recipient will set their own password on first login.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 py-6"
          >
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <p className="text-sm font-semibold">Invitation sent!</p>
            <p className="text-xs text-muted-foreground text-center">
              An invitation email has been sent to <strong>{email}</strong>
            </p>
            <Button onClick={handleClose} className="mt-2">Done</Button>
          </motion.div>
        ) : (
          <>
            <div className="grid gap-4 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="invite-name">Full Name</Label>
                <Input
                  id="invite-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Dr. Jane Smith"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="invite-email">Email Address <span className="text-destructive">*</span></Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@institution.edu"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="invite-role">Assign Role</Label>
                <Select value={role} onValueChange={v => setRole(v as UserRole)}>
                  <SelectTrigger id="invite-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSend} disabled={!email || loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending…
                  </span>
                ) : (
                  <><Mail className="h-3.5 w-3.5 mr-1.5" />Send Invite</>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Role Dialog ──────────────────────────────────────────────────────────

function EditRoleDialog({
  user, open, onOpenChange, onSave
}: {
  user: AdminUser | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (userId: string, role: UserRole) => void
}) {
  const [prevUserId, setPrevUserId] = React.useState<string | null>(null)
  const [selectedRole, setSelectedRole] = React.useState<UserRole>("viewer")

  if ((user?.id ?? null) !== prevUserId) {
    setPrevUserId(user?.id ?? null)
    setSelectedRole(user?.role ?? "viewer")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>
            Change the role for <strong>{user?.name}</strong>. This takes effect immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label>New Role</Label>
          <Select value={selectedRole} onValueChange={v => setSelectedRole(v as UserRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Current role: <span className="font-medium">{user ? ROLE_LABELS[user.role] : "—"}</span>
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { user && onSave(user.id, selectedRole); onOpenChange(false) }}>
            Save Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>(ADMIN_USERS)
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [editUser, setEditUser] = React.useState<AdminUser | null>(null)
  const [editRoleOpen, setEditRoleOpen] = React.useState(false)
  const [confirmTarget, setConfirmTarget] = React.useState<AdminUser | null>(null)
  const [confirmVariant, setConfirmVariant] = React.useState<ConfirmVariant>("delete")
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [statusFilter, setStatusFilter] = React.useState<UserStatus | "all">("all")

  const filtered = statusFilter === "all" ? users : users.filter(u => u.status === statusFilter)

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    suspended: users.filter(u => u.status === "suspended").length,
    pending: users.filter(u => u.status === "pending").length,
  }

  function openConfirm(user: AdminUser, variant: ConfirmVariant) {
    setConfirmTarget(user)
    setConfirmVariant(variant)
    setConfirmOpen(true)
  }

  function handleConfirm() {
    if (!confirmTarget) return
    if (confirmVariant === "delete") {
      setUsers(prev => prev.filter(u => u.id !== confirmTarget.id))
    } else if (confirmVariant === "suspend") {
      setUsers(prev => prev.map(u =>
        u.id === confirmTarget.id
          ? { ...u, status: u.status === "suspended" ? "active" : "suspended" as UserStatus }
          : u
      ))
    }
    setConfirmTarget(null)
  }

  function handleRoleSave(userId: string, role: UserRole) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
  }

  const columns: AdminColumn<Record<string, unknown>>[] = [
    {
      key: "name",
      header: "User",
      sortable: true,
      render: (row) => {
        const u = row as unknown as AdminUser
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className={`text-xs font-semibold ${ROLE_COLORS[u.role]}`}>
                {u.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight truncate max-w-[160px]">{u.name}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[160px]">{u.org}</p>
            </div>
            {u.mfaEnabled && (
              <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" />
            )}
          </div>
        )
      }
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      render: (row) => (
        <span className="text-sm text-muted-foreground font-mono text-xs">
          {(row as unknown as AdminUser).email}
        </span>
      )
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (row) => {
        const u = row as unknown as AdminUser
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${ROLE_COLORS[u.role]}`}>
            {ROLE_LABELS[u.role]}
          </span>
        )
      }
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const u = row as unknown as AdminUser
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[u.status]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[u.status]}`} />
            {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
          </span>
        )
      }
    },
    {
      key: "lastLogin",
      header: "Last Login",
      sortable: false,
      nowrap: true,
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {(row as unknown as AdminUser).lastLogin}
        </span>
      )
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "48px",
      render: (row) => {
        const u = row as unknown as AdminUser
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-xs"
                onClick={e => { e.stopPropagation(); setEditUser(u); setEditRoleOpen(true) }}
              >
                <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                Edit Role
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 text-xs"
                onClick={e => { e.stopPropagation(); openConfirm(u, "suspend") }}
              >
                <PauseCircle className="h-3.5 w-3.5 text-warning" />
                {u.status === "suspended" ? "Unsuspend" : "Suspend"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-xs text-destructive focus:text-destructive"
                onClick={e => { e.stopPropagation(); openConfirm(u, "delete") }}
                disabled={u.role === "super_admin"}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    },
  ]

  return (
    <AdminPageShell
      title="User Management"
      description="Manage platform users, roles, and access. Invite new members or modify existing accounts."
      actions={
        <Button onClick={() => setInviteOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Users,     label: "Total Users",   value: stats.total,     color: "bg-primary/10 text-primary" },
          { icon: UserCheck, label: "Active",         value: stats.active,    color: "bg-success/10 text-success" },
          { icon: UserX,     label: "Suspended",      value: stats.suspended, color: "bg-destructive/10 text-destructive" },
          { icon: Clock,     label: "Pending Invite", value: stats.pending,   color: "bg-warning/10 text-warning" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        rows={filtered as unknown as Record<string, unknown>[]}
        searchPlaceholder="Search users…"
        searchKeys={["name", "email", "org"]}
        defaultPageSize={10}
        filterSlot={
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as UserStatus | "all")}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All statuses</SelectItem>
              <SelectItem value="active" className="text-xs">Active</SelectItem>
              <SelectItem value="suspended" className="text-xs">Suspended</SelectItem>
              <SelectItem value="pending" className="text-xs">Pending</SelectItem>
              <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
            </SelectContent>
          </Select>
        }
        emptyTitle="No users found"
        emptyDescription="Try adjusting your search or filter."
      />

      {/* Dialogs */}
      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      <EditRoleDialog
        user={editUser}
        open={editRoleOpen}
        onOpenChange={setEditRoleOpen}
        onSave={handleRoleSave}
      />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirm}
        variant={confirmVariant}
        itemName={confirmTarget?.name}
        title={
          confirmVariant === "suspend"
            ? confirmTarget?.status === "suspended"
              ? `Unsuspend ${confirmTarget?.name}?`
              : `Suspend ${confirmTarget?.name}?`
            : undefined
        }
      />
    </AdminPageShell>
  )
}
