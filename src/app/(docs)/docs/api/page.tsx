import * as React from "react"
import Link from "next/link"
import { Code2, Key, Database, Activity } from "lucide-react"

const APIS = [
  {
    title: "Authentication",
    description: "Manage API keys, OAuth tokens, and session lifecycles.",
    href: "/docs/api/authentication",
    icon: Key,
  },
  {
    title: "Inference API",
    description: "Submit video streams and images for real-time expression analysis.",
    href: "/docs/api/inference",
    icon: Activity,
  },
  {
    title: "Datasets API",
    description: "Upload, manage, and annotate custom datasets programmatically.",
    href: "/docs/api/datasets",
    icon: Database,
  },
]

export default function APIPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          API Reference
        </h1>
        <p className="text-xl text-muted-foreground">
          Integrate the UA-EDT emotion engine directly into your applications using our REST and WebSocket APIs.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        {APIS.map((api) => {
          const Icon = api.icon
          return (
            <Link
              key={api.title}
              href={api.href}
              className="group block rounded-lg border p-6 transition-colors hover:border-primary/50"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{api.title}</h3>
              <p className="text-sm text-muted-foreground">{api.description}</p>
            </Link>
          )
        })}
      </div>
      
      <div className="mt-12 p-6 rounded-lg bg-muted/50 border">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-background border flex items-center justify-center shrink-0">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Official SDKs</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started faster with our official client libraries for TypeScript, Python, and Go.
            </p>
            <div className="flex gap-2">
              <span className="text-xs font-mono bg-background border px-2 py-1 rounded">npm i @ua-edt/sdk</span>
              <span className="text-xs font-mono bg-background border px-2 py-1 rounded">pip install ua-edt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
