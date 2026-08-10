"use client"

import * as React from "react"
import { Sliders, Save, Database, ShieldAlert, Key } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function GlobalConfigPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-md mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
          <Sliders className="h-5 w-5 text-warning" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage global model routing, limits, and system parameters.</p>
        </div>
      </div>

      <Card className="border-warning/30 bg-warning/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-warning">
            <ShieldAlert className="h-4 w-4" /> Warning
          </CardTitle>
          <CardDescription className="text-warning/80 text-xs">
            Changes made here apply to all active sessions globally and may disrupt live clinical trials.
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={e => e.preventDefault()} className="space-y-6">
        <Card>
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-base">Inference Settings</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="font-semibold text-foreground">Default Fallback Model</Label>
              <Select defaultValue="fusion_base">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fusion_l">FusionAffect-X Large</SelectItem>
                  <SelectItem value="fusion_base">FusionAffect-X Base</SelectItem>
                  <SelectItem value="prosody">VocalProsody-Net</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="font-semibold text-foreground">Max Batch Size</Label>
              <Input type="number" defaultValue={128} className="font-mono w-32" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4"/> Storage & Retention</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="font-semibold text-foreground">PHI Data Retention</Label>
              <Select defaultValue="90d">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="indefinite">Indefinite (Not Recommended)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="font-semibold text-foreground">Workspace Quota (GB)</Label>
              <Input type="number" defaultValue={500} className="font-mono w-32" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button className="gap-2 bg-warning text-warning-foreground hover:bg-warning/90">
            <Save className="h-4 w-4" /> Save Global Configuration
          </Button>
        </div>
      </form>
    </div>
  )
}
