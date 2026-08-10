"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Save, RotateCcw, Users, Shield, Info } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { AdminPageShell } from "@/components/admin/AdminPageShell"
import {
  ADMIN_ROLES, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS
} from "@/lib/admin-data"
import { cn } from "@/lib/utils"

// Group permissions by category
const PERMISSION_GROUPS = Array.from(
  new Set(PERMISSIONS.map(p => p.group))
)

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-destructive/10 text-destructive border-destructive/20",
  admin:       "bg-warning/10 text-warning border-warning/20",
  researcher:  "bg-primary/10 text-primary border-primary/20",
  clinician:   "bg-success/10 text-success border-success/20",
  viewer:      "bg-info/10 text-info border-info/20",
}

export default function RolesPage() {
  const [matrix, setMatrix] = React.useState<Record<string, Set<string>>>(() => {
    const m: Record<string, Set<string>> = {}
    for (const role of ADMIN_ROLES) {
      m[role.id] = new Set(DEFAULT_ROLE_PERMISSIONS[role.id] ?? [])
    }
    return m
  })
  const [saved, setSaved] = React.useState(false)
  const [selectedRole, setSelectedRole] = React.useState(ADMIN_ROLES[0].id)

  const original = React.useMemo(() => {
    const m: Record<string, Set<string>> = {}
    for (const role of ADMIN_ROLES) {
      m[role.id] = new Set(DEFAULT_ROLE_PERMISSIONS[role.id] ?? [])
    }
    return m
  }, [])

  function toggle(roleId: string, permId: string) {
    if (ADMIN_ROLES.find(r => r.id === roleId)?.isSystem && roleId === "super_admin") return
    setMatrix(prev => {
      const next = { ...prev }
      const set = new Set(prev[roleId])
      if (set.has(permId)) set.delete(permId)
      else set.add(permId)
      next[roleId] = set
      return next
    })
    setSaved(false)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleRevert() {
    setMatrix(() => {
      const m: Record<string, Set<string>> = {}
      for (const role of ADMIN_ROLES) {
        m[role.id] = new Set(DEFAULT_ROLE_PERMISSIONS[role.id] ?? [])
      }
      return m
    })
    setSaved(false)
  }

  return (
    <AdminPageShell
      title="Role Management"
      description="Define which permissions each role grants. Super Admin permissions are immutable. Changes affect all users with that role."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRevert} className="gap-2">
            <RotateCcw className="h-3.5 w-3.5" />
            Revert
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-3.5 w-3.5" />
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Role list */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-1">
            Roles
          </p>
          {ADMIN_ROLES.map((role, i) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setSelectedRole(role.id)}
              className={cn(
                "flex flex-col gap-1.5 rounded-xl p-3.5 text-left border transition-all duration-200",
                selectedRole === role.id
                  ? "bg-card border-primary/30 shadow-sm"
                  : "bg-card border-border hover:border-muted-foreground/30"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full border",
                  ROLE_COLORS[role.id]
                )}>
                  {role.name}
                </span>
                {role.isSystem && (
                  <Shield className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {role.description}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{role.userCount} users</span>
                <span className="ml-auto text-xs font-medium text-primary">
                  {matrix[role.id]?.size ?? 0} permissions
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Permission matrix */}
        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">
                  {ADMIN_ROLES.find(r => r.id === selectedRole)?.name} Permissions
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ADMIN_ROLES.find(r => r.id === selectedRole)?.description}
                </p>
              </div>
              {selectedRole === "super_admin" && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
                  <Info className="h-3.5 w-3.5 text-destructive shrink-0" />
                  <span className="text-xs text-destructive font-medium">Immutable — all permissions granted</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {PERMISSION_GROUPS.map(group => {
                const groupPerms = PERMISSIONS.filter(p => p.group === group)
                return (
                  <div key={group}>
                    <div className="px-4 py-2 bg-muted/30">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {group}
                      </p>
                    </div>
                    <div className="divide-y divide-border/50">
                      {groupPerms.map(perm => {
                        const checked = matrix[selectedRole]?.has(perm.id) ?? false
                        const disabled = selectedRole === "super_admin"
                        return (
                          <div
                            key={perm.id}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 transition-colors",
                              !disabled && "hover:bg-muted/30 cursor-pointer"
                            )}
                            onClick={() => !disabled && toggle(selectedRole, perm.id)}
                          >
                            <Checkbox
                              id={`${selectedRole}-${perm.id}`}
                              checked={checked}
                              disabled={disabled}
                              onCheckedChange={() => !disabled && toggle(selectedRole, perm.id)}
                              onClick={e => e.stopPropagation()}
                            />
                            <div className="flex-1 min-w-0">
                              <label
                                htmlFor={`${selectedRole}-${perm.id}`}
                                className={cn("text-sm font-medium cursor-pointer", disabled && "cursor-default")}
                              >
                                {perm.label}
                              </label>
                              <p className="text-xs text-muted-foreground">{perm.description}</p>
                            </div>
                            {checked && !disabled && (
                              <Badge variant="success" className="text-xs px-1.5 py-0 shrink-0">Granted</Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageShell>
  )
}
