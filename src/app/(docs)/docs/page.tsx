import * as React from "react"
import Link from "next/link"
import { BookOpen, Code2, Cpu, Zap, ArrowRight, Server, Blocks, LineChart } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const CATEGORIES = [
  {
    title: "Quickstart",
    description: "Get up and running with the UA-EDT platform in under 5 minutes.",
    icon: Zap,
    href: "/docs/quickstart",
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  {
    title: "API Reference",
    description: "Detailed endpoints for integrating the Multimodal Fusion model.",
    icon: Code2,
    href: "/docs/rest-api",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Model Architecture",
    description: "Deep dive into FusionAffect-X and VocalProsody-Net.",
    icon: Cpu,
    href: "/docs/fusion",
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    title: "Explainability",
    description: "Learn how to interpret spatial attention and feature attribution.",
    icon: LineChart,
    href: "/docs/explainability",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  }
]

export default function DocsLandingPage() {
  return (
    <div className="max-w-3xl space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Documentation
        </h1>
        <p className="text-lg text-muted-foreground">
          Everything you need to build, integrate, and analyze with the UA-EDT Multimodal Emotion Platform.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {CATEGORIES.map((category) => (
          <Link key={category.title} href={category.href}>
            <Card className="h-full hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className={`h-10 w-10 rounded-lg ${category.bg} flex items-center justify-center mb-4`}>
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {category.title}
                </CardTitle>
                <CardDescription className="text-sm mt-2">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm font-medium text-primary group-hover:underline">
                  Read more <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="space-y-4 pt-8 border-t border-border">
        <h2 className="text-2xl font-bold tracking-tight">Popular Resources</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/docs/auth" className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <Server className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm font-medium">Authentication via OAuth2</div>
          </Link>
          <Link href="/docs/websockets" className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <Blocks className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm font-medium">Streaming Live Inference</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
