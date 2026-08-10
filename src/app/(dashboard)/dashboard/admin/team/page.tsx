"use client"

import * as React from "react"
import { Users, UserPlus, Search, Filter, Shield, MoreHorizontal, CheckCircle2, XCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const MOCK_TEAM = [
  { id: "u1", name: "Dr. Sarah Chen", role: "Super Admin", email: "sarah.chen@ua-edt.org", lastActive: "2 mins ago", status: "active" },
  { id: "u2", name: "Marcus Johnson", role: "Lead Researcher", email: "mjohnson@ua-edt.org", lastActive: "1 hour ago", status: "active" },
  { id: "u3", name: "Elena Rodriguez", role: "Annotator", email: "erodriguez@ua-edt.org", lastActive: "2 days ago", status: "offline" },
  { id: "u4", name: "David Kim", role: "Clinical Reviewer", email: "dkim@ua-edt.org", lastActive: "1 week ago", status: "active" },
  { id: "u5", name: "System API Bot", role: "API Key", email: "api-service-prod", lastActive: "Just now", status: "active" },
]

export default function TeamManagementPage() {
  const [search, setSearch] = React.useState("")
  const filtered = MOCK_TEAM.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage user roles, access permissions, and API accounts.</p>
          </div>
        </div>
        <Button className="gap-2 bg-warning text-warning-foreground hover:bg-warning/90">
          <UserPlus className="h-4 w-4" /> Invite User
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filter by Role
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Directory</span>
            <span className="text-xs text-muted-foreground font-normal bg-background px-2 py-0.5 rounded-full border border-border">
              {MOCK_TEAM.length} Total Users
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border bg-muted/10 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4 font-semibold">User / Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Last Active</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          user.role === 'Super Admin' ? 'bg-warning/20 text-warning' : 'bg-primary/10 text-primary'
                        }`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground leading-none mb-1">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`text-[10px] uppercase ${user.role === 'Super Admin' ? 'border-warning text-warning' : ''}`}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {user.status === "active" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-success font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <XCircle className="h-3.5 w-3.5" /> Offline
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {user.lastActive}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                No users found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
