import * as React from "react"
import Link from "next/link"
import { ChevronRight, PlayCircle } from "lucide-react"

const TUTORIALS = [
  {
    title: "Digital Twin Setup",
    description: "Learn how to capture and configure a patient's digital twin model.",
    href: "/docs/tutorials/digital-twin-setup",
    time: "15 min",
  },
  {
    title: "Live Video Inference",
    description: "Stream live video and run real-time emotion inference.",
    href: "/docs/tutorials/live-video",
    time: "25 min",
  },
  {
    title: "Working with AffectNet",
    description: "Import, prepare, and train on the AffectNet dataset.",
    href: "/docs/tutorials/affectnet",
    time: "40 min",
  },
]

export default function TutorialsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Tutorials
        </h1>
        <p className="text-xl text-muted-foreground">
          Step-by-step guides to help you get the most out of the UA-EDT platform.
        </p>
      </div>
      <div className="grid gap-4 mt-8">
        {TUTORIALS.map((tutorial) => (
          <Link
            key={tutorial.title}
            href={tutorial.href}
            className="group block rounded-lg border p-6 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 text-primary" />
                  {tutorial.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tutorial.description}
                </p>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="text-xs font-medium bg-muted px-2 py-1 rounded-md">
                  {tutorial.time}
                </span>
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
