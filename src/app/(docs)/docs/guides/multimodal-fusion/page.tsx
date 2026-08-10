import * as React from "react"
import { TableOfContents } from "@/components/docs/TableOfContents"

export default function MultimodalFusionGuide() {
  const tocItems = [
    { id: "what-is-fusion", text: "What is Multimodal Fusion?", level: 2 },
    { id: "early-vs-late", text: "Early vs. Late Fusion", level: 2 },
    { id: "attention-mechanism", text: "Cross-Modal Attention", level: 2 },
    { id: "architecture", text: "Architecture Diagram", level: 2 },
  ]

  return (
    <>
      <div className="max-w-3xl space-y-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="text-primary font-medium">Guides</span>
            <span>/</span>
            <span>Multimodal Fusion</span>
          </div>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight mb-4">
            Multimodal Fusion Pipeline
          </h1>
          <p className="text-xl text-muted-foreground">
            How UA-EDT combines facial expressions, vocal prosody, and semantic text into a unified emotion vector.
          </p>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <h2 id="what-is-fusion" className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10 mb-4">
            What is Multimodal Fusion?
          </h2>
          <p className="leading-7 mb-4">
            Emotions are rarely expressed through a single channel. A smile (facial) paired with a sarcastic tone (vocal) and negative words (textual) carries a vastly different meaning than a smile alone. The UA-EDT engine fuses these three streams in real-time.
          </p>

          <h2 id="early-vs-late" className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10 mb-4">
            Early vs. Late Fusion
          </h2>
          <p className="leading-7 mb-4">
            We employ a <strong>hybrid fusion</strong> strategy:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Early Fusion (Feature Level):</strong> We concatenate lower-level embeddings of Audio and Video prior to the transformer blocks to capture tight temporal synchronicity (e.g., lip movement and phoneme alignment).</li>
            <li><strong>Late Fusion (Decision Level):</strong> The semantic textual embedding (from ASR transcripts) is fused later using a cross-attention mechanism, as text operates on a longer temporal horizon than micro-expressions.</li>
          </ul>

          <h2 id="attention-mechanism" className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10 mb-4">
            Cross-Modal Attention
          </h2>
          <p className="leading-7 mb-4">
            The core of the fusion engine is our <code className="bg-muted px-1.5 py-0.5 rounded text-sm">CrossModalTransformer</code>. It allows the model to dynamically weigh the importance of each modality based on context. For example, if the face is occluded, the attention mechanism automatically shifts higher weight to the vocal and textual channels.
          </p>

          <h2 id="architecture" className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10 mb-4">
            Architecture Diagram
          </h2>
          <div className="my-8 rounded-lg overflow-hidden border bg-muted/30 p-1 flex items-center justify-center min-h-[300px]">
            <span className="text-muted-foreground text-sm flex items-center gap-2">
              <span className="h-4 w-4 block rounded-full border-2 border-muted-foreground" />
              Placeholder: Multimodal Fusion Architecture Diagram
            </span>
          </div>
        </div>
      </div>
      
      {/* Table of Contents Overlay */}
      <div className="hidden xl:block absolute right-0 top-8 w-64 pt-8">
        <div className="sticky top-24">
          <TableOfContents items={tocItems} />
        </div>
      </div>
    </>
  )
}
