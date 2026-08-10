"use client"

import * as React from "react"
import { Cpu, Star, ShieldCheck, Scale, Zap, Info, Check, Search, Filter } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

const MODELS = [
  { 
    id: "m1", name: "FusionAffect-X Large", version: "v4.2.0", type: "Multimodal", 
    params: "1.2B", latency: "120ms", benchmark: 94.2, 
    desc: "State-of-the-art multimodal fusion model supporting video, audio, and text with full FACS attribution.",
    recommended: true
  },
  { 
    id: "m2", name: "FusionAffect-X Base", version: "v4.2.0", type: "Multimodal", 
    params: "350M", latency: "45ms", benchmark: 91.8, 
    desc: "Optimized for real-time inference streams. Lower resource footprint with minimal accuracy trade-off.",
    recommended: false
  },
  { 
    id: "m3", name: "VocalProsody-Net", version: "v2.1", type: "Audio Only", 
    params: "120M", latency: "25ms", benchmark: 88.5, 
    desc: "Specialized model for tone and prosody analysis on audio-only inputs.",
    recommended: false
  },
  { 
    id: "m4", name: "FaceMesh-Affect", version: "v3.0", type: "Vision Only", 
    params: "280M", latency: "35ms", benchmark: 92.1, 
    desc: "High-precision spatial facial tracking with micro-expression detection.",
    recommended: false
  }
]

export default function ModelSelectionPage() {
  const [selected, setSelected] = React.useState("m1")
  const [search, setSearch] = React.useState("")

  const filtered = MODELS.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Model Selection</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose the base model architecture for your inference tasks.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search models..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Modality
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(model => {
          const isSelected = selected === model.id
          return (
            <Card 
              key={model.id} 
              className={`relative overflow-hidden cursor-pointer transition-all duration-200 border-2 ${
                isSelected ? "border-primary shadow-md" : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelected(model.id)}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-bl-lg">
                  <Check className="h-4 w-4" />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Cpu className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      {model.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] uppercase font-mono">{model.version}</Badge>
                      <span className="text-xs text-muted-foreground">{model.type}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed h-14">
                  {model.desc}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                  <div className="text-center p-2 rounded bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1"><Scale className="h-3 w-3 inline mr-1"/>Params</p>
                    <p className="font-semibold text-sm">{model.params}</p>
                  </div>
                  <div className="text-center p-2 rounded bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1"><Zap className="h-3 w-3 inline mr-1"/>Latency</p>
                    <p className="font-semibold text-sm">{model.latency}</p>
                  </div>
                  <div className="text-center p-2 rounded bg-primary/5 text-primary">
                    <p className="text-xs mb-1 opacity-80"><ShieldCheck className="h-3 w-3 inline mr-1"/>Eval</p>
                    <p className="font-bold text-sm">{model.benchmark}%</p>
                  </div>
                </div>
              </CardContent>
              {model.recommended && (
                <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold text-warning">
                  <Star className="h-3.5 w-3.5 fill-warning" /> 
                  <span className={isSelected ? "mr-6" : ""}>RECOMMENDED</span>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button size="lg" className="px-8">Continue to Configuration</Button>
      </div>
    </div>
  )
}
