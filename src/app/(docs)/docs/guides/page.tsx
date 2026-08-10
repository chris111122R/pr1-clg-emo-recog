import * as React from "react"
import Link from "next/link"
import { BookOpen, Activity, Lock, FlaskConical } from "lucide-react"

const GUIDES = [
  {
    title: "Multimodal Fusion",
    description: "Understand how facial, vocal, and textual modalities are synchronized and fused.",
    href: "/docs/guides/multimodal-fusion",
    icon: FlaskConical,
  },
  {
    title: "FACS Integration",
    description: "Deep dive into the Facial Action Coding System standard in UA-EDT.",
    href: "/docs/guides/facs",
    icon: Activity,
  },
  {
    title: "Security & Compliance",
    description: "HIPAA compliance, data encryption, and access control models.",
    href: "/docs/guides/security",
    icon: Lock,
  },
]

export default function GuidesPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Conceptual Guides
        </h1>
        <p className="text-xl text-muted-foreground">
          Deep dives into the architecture, theory, and models powering the UA-EDT platform.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        {GUIDES.map((guide) => {
          const Icon = guide.icon
          return (
            <Link
              key={guide.title}
              href={guide.href}
              className="group block rounded-lg border p-6 transition-colors hover:border-primary/50"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{guide.title}</h3>
              <p className="text-sm text-muted-foreground">{guide.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
