import * as React from "react"
import { notFound } from "next/navigation"
import { ChevronRight, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const MOCK_DOCS: Record<string, { title: string; content: React.ReactNode }> = {
  "quickstart": {
    title: "Quickstart Guide",
    content: (
      <>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
          Welcome to the UA-EDT platform. This guide will help you get your first multimodal emotion analysis running in under 5 minutes.
        </p>
        
        <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          1. Install the SDK
        </h2>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
          Our official Python SDK is the easiest way to interact with the Inference API.
        </p>
        <div className="my-6 w-full rounded-md bg-muted/50 p-4 border border-border">
          <code className="text-sm font-mono">pip install ua-edt-sdk</code>
        </div>
        
        <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          2. Authenticate
        </h2>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
          Retrieve your API key from the Settings Dashboard and initialize the client.
        </p>
        <div className="my-6 w-full rounded-md bg-muted/50 p-4 border border-border overflow-x-auto">
          <pre className="text-sm font-mono text-foreground">
{`from ua_edt import Client

client = Client(api_key="your_api_key_here")`}
          </pre>
        </div>

        <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          3. Run Inference
        </h2>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
          Pass a video file to the client to receive synchronous analysis results.
        </p>
        <div className="my-6 w-full rounded-md bg-muted/50 p-4 border border-border overflow-x-auto">
          <pre className="text-sm font-mono text-foreground">
{`result = client.analyze(
    video_path="session_recording.mp4", 
    models=["fusion_base", "vocal_prosody"]
)

print(result.primary_emotion)`}
          </pre>
        </div>
      </>
    )
  },
  "rest-api": {
    title: "REST API Reference",
    content: (
      <>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
          Our REST API allows for language-agnostic integration into your clinical workflows. Base URL: <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">https://api.ua-edt.org/v1</code>
        </p>

        <h3 className="mt-8 scroll-m-20 text-xl font-semibold tracking-tight">POST /analyze</h3>
        <p className="leading-7 mt-2 text-muted-foreground">
          Submit a media payload for asynchronous or synchronous processing.
        </p>
        
        <div className="my-6 w-full rounded-md bg-muted/50 p-4 border border-border overflow-x-auto">
          <pre className="text-sm font-mono text-foreground">
{`curl -X POST https://api.ua-edt.org/v1/analyze \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "file=@patient_video.mp4" \\
  -F "mode=async"`}
          </pre>
        </div>

        <h4 className="mt-8 scroll-m-20 text-lg font-semibold tracking-tight">Response</h4>
        <div className="my-4 w-full rounded-md bg-muted/50 p-4 border border-border overflow-x-auto">
          <pre className="text-sm font-mono text-foreground">
{`{
  "job_id": "job_9482abc",
  "status": "processing",
  "estimated_eta_seconds": 45
}`}
          </pre>
        </div>
      </>
    )
  },
  "explainability": {
    title: "Explainability Engine",
    content: (
      <>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
          The Explainability Engine provides visual and statistical evidence for model predictions, ensuring clinical trust and compliance with AI regulations.
        </p>
        
        <blockquote className="mt-6 border-l-2 border-primary pl-6 italic text-muted-foreground">
          "Explainability is not just a feature; it's a prerequisite for AI in healthcare."
        </blockquote>

        <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          Spatial Attention
        </h2>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
          For video analysis, the engine outputs frame-by-frame attention heatmaps. These indicate which facial action units (AUs) most heavily influenced the model's confidence scores.
        </p>

        <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          Feature Attribution
        </h2>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
          Calculates the Shapley values for each modality (Video, Audio, Text). For instance, if a subject's voice is cracking but their face remains neutral, the attribution scores will heavily weight the audio stream for detecting anxiety.
        </p>
      </>
    )
  }
}

export default function DocArticlePage({ params }: { params: { slug: string } }) {
  const doc = MOCK_DOCS[params.slug]

  if (!doc) {
    // Basic fallback for unknown slugs
    return (
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Documentation Article
        </h1>
        <p className="text-muted-foreground">
          Content for <code>{params.slug}</code> is coming soon.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl pb-16">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center space-x-1 text-sm text-muted-foreground">
        <Link href="/docs" className="hover:text-foreground">Docs</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{doc.title}</span>
      </div>

      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {doc.title}
        </h1>
      </div>

      <div className="mt-8 prose prose-slate dark:prose-invert max-w-none">
        {doc.content}
      </div>

      <div className="mt-16 flex justify-between border-t border-border pt-8">
        <Button variant="outline" className="gap-2">
           Previous
        </Button>
        <Button className="gap-2">
           Next Article <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
