import * as React from "react"
import { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "Research | UA-EDT",
  description: "Read our latest publications on affective computing and evidential deep learning.",
}

const publications = [
  {
    title: "Evidential Deep Learning for Clinical-Grade Multimodal Emotion Recognition",
    authors: "Rostova, E., Holden, J., Chen, S.",
    journal: "Nature Machine Intelligence",
    date: "October 2025",
    tags: ["Core Architecture", "Evidential ML"],
    abstract: "We introduce a novel architecture that bounds dimensional emotion predictions with strict confidence intervals, successfully separating aleatoric noise from epistemic uncertainty in real-time video streams."
  },
  {
    title: "FACS-Aligned Digital Twins: A Framework for Explainable Affective Computing",
    authors: "Webb, M., Kim, D., Rostova, E.",
    journal: "IEEE Transactions on Affective Computing",
    date: "June 2025",
    tags: ["Explainability", "FACS"],
    abstract: "This paper details the intermediate structural layer of the UA-EDT model, forcing the network to predict localized Action Units prior to estimating global Valence and Arousal states."
  },
  {
    title: "Cross-Modal Attention Mechanisms in High-Noise Environments",
    authors: "Patel, A., Holden, J.",
    journal: "Proceedings of NeurIPS",
    date: "December 2024",
    tags: ["Multimodal", "Audio Processing"],
    abstract: "An analysis of dynamic attention weighting between vocal prosody and facial landmarks when subjects are partially occluded or in environments with low signal-to-noise ratios."
  }
]

export default function ResearchPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="pt-32 pb-16 bg-muted/20 border-b">
        <div className="container mx-auto px-6 md:px-12 text-center">
          
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Research & Publications
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Our platform is built on years of peer-reviewed research in affective computing and uncertainty quantification.
            </p>
          
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-2">Selected Papers</h2>
              <p className="text-muted-foreground">Foundation literature behind the UA-EDT architecture.</p>
            </div>
          
          
          <div className="space-y-12">
            {publications.map((pub, i) => (
              
                <div key={i} className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl border bg-card hover:border-primary/50 transition-colors">
                  <div className="hidden md:flex mt-1 shrink-0 h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {pub.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold leading-tight">{pub.title}</h3>
                    <p className="text-sm font-medium text-foreground">{pub.authors}</p>
                    <p className="text-sm text-muted-foreground">
                      Published in <span className="italic">{pub.journal}</span> • {pub.date}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed border-l-2 border-muted pl-4">
                      {pub.abstract}
                    </p>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        Read Paper <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
