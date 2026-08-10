"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { SlidersHorizontal, Settings2, Info, HelpCircle, Save, Play } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Replace this with standard HTML checkbox inputs since Checkbox component is not built
// Or I can build a simple custom toggle for this page.

function ConfigSection({ title, desc, children }: { title: string, desc: string, children: React.ReactNode }) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
        <CardTitle className="text-lg flex items-center gap-2">
          {title}
        </CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {children}
      </CardContent>
    </Card>
  )
}

function FieldRow({ label, tooltip, children }: { label: string, tooltip?: string, children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-6 items-start">
      <div className="flex items-center gap-1.5 pt-2">
        <Label className="font-semibold text-foreground">{label}</Label>
        {tooltip && (
          <div className="group relative cursor-help">
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border z-10">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}

export default function AIConfigPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-md mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure hyperparameters, modalities, and inference methods.</p>
        </div>
      </div>

      <form onSubmit={e => e.preventDefault()}>
        <ConfigSection title="Model Modalities" desc="Select which input streams to fuse during inference.">
          <FieldRow label="Active Streams" tooltip="Vision provides FACS, Audio provides Prosody, Text provides Semantic context.">
            <div className="space-y-3">
              {[
                { id: "v", label: "Vision (Facial Analysis)", desc: "Requires webcam or video file" },
                { id: "a", label: "Audio (Vocal Prosody)", desc: "Requires microphone or audio file" },
                { id: "t", label: "Text (Semantic Analysis)", desc: "Requires transcript or chat log" }
              ].map(mod => (
                <label key={mod.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
                  <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded border-primary text-primary focus:ring-primary" />
                  <div>
                    <p className="text-sm font-medium">{mod.label}</p>
                    <p className="text-xs text-muted-foreground">{mod.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </FieldRow>
        </ConfigSection>

        <ConfigSection title="Hyperparameters" desc="Tune the underlying network parameters.">
          <FieldRow label="Batch Size" tooltip="Number of samples processed before the model is updated.">
            <Select defaultValue="32">
              <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="16">16</SelectItem>
                <SelectItem value="32">32</SelectItem>
                <SelectItem value="64">64</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          
          <FieldRow label="Learning Rate" tooltip="Step size at each iteration while moving toward a minimum of a loss function.">
            <div className="flex items-center gap-3">
              <Input type="number" defaultValue={0.001} step={0.0001} className="w-full sm:w-48 font-mono" />
              <span className="text-xs text-muted-foreground">Default: 0.001</span>
            </div>
          </FieldRow>
          
          <FieldRow label="Dropout Rate" tooltip="Probability of an element to be zeroed. Used for regularization.">
            <div className="flex items-center gap-3">
              <input type="range" min="0" max="0.5" step="0.1" defaultValue="0.2" className="w-full sm:w-48 accent-primary" />
              <span className="font-mono text-sm">0.2</span>
            </div>
          </FieldRow>
        </ConfigSection>

        <ConfigSection title="Uncertainty & Explainability" desc="Configure how the model evaluates its own confidence.">
          <FieldRow label="Uncertainty Method" tooltip="Method used to calculate epistemic and aleatoric uncertainty.">
            <Select defaultValue="mc">
              <SelectTrigger className="w-full sm:w-[280px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mc">Monte Carlo Dropout</SelectItem>
                <SelectItem value="ev">Evidential Deep Learning</SelectItem>
                <SelectItem value="ens">Deep Ensembles (Slower)</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow label="Explainability Engine" tooltip="Algorithm used to generate attention maps and feature importance.">
            <Select defaultValue="ig">
              <SelectTrigger className="w-full sm:w-[280px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ig">Integrated Gradients</SelectItem>
                <SelectItem value="gradcam">Grad-CAM (Vision only)</SelectItem>
                <SelectItem value="shap">SHAP Values</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
        </ConfigSection>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="outline" className="gap-2"><Save className="h-4 w-4"/> Save as Preset</Button>
          <Button className="gap-2"><Play className="h-4 w-4"/> Start Training Run</Button>
        </div>
      </form>
    </div>
  )
}
