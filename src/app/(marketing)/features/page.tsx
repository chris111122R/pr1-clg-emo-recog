import * as React from "react"
import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Target, Waves, Zap, Activity, BrainCircuit, Mic, ScanFace, Database, Lock } from "lucide-react"

export const metadata: Metadata = {
  title: "Features | UA-EDT",
  description: "Explore the features of the Uncertainty-Aware Explainable Emotional Digital Twin platform.",
}

const categories = [
  {
    title: "Explainability",
    description: "Move beyond black-box predictions with structural transparency.",
    features: [
      { name: "Digital Twin Mapping", desc: "Maps continuous dimensional emotions back to a parametric 3D representation to visualize 'why' a conclusion was reached.", icon: ScanFace },
      { name: "FACS Alignment", desc: "Directly correlates latent space activations with standard Facial Action Coding System (FACS) units.", icon: Target },
      { name: "Attribution Heatmaps", desc: "Interactive heatmaps overlaying the source video to highlight which pixels drove the model's decision.", icon: Activity },
    ]
  },
  {
    title: "Uncertainty Analysis",
    description: "Quantify what the model doesn't know to ensure clinical safety.",
    features: [
      { name: "Aleatoric Uncertainty", desc: "Measures uncertainty inherent in the data itself (e.g., poor lighting, background noise, low resolution).", icon: Waves },
      { name: "Epistemic Uncertainty", desc: "Measures uncertainty in the model's knowledge (e.g., encountering out-of-distribution demographic data).", icon: BrainCircuit },
      { name: "Evidential Deep Learning", desc: "Replaces standard Softmax layers with Dirichlet distributions to output direct confidence intervals.", icon: Shield },
    ]
  },
  {
    title: "Multimodal Input",
    description: "Fuse asynchronous streams for holistic context.",
    features: [
      { name: "Cross-Modal Attention", desc: "Dynamically weighs the importance of audio vs. visual signals in real-time based on stream clarity.", icon: Database },
      { name: "Vocal Prosody Extraction", desc: "Analyzes pitch, jitter, shimmer, and speaking rate to extract emotional valance independent of spoken language.", icon: Mic },
      { name: "Privacy-Preserving Edge Processing", desc: "Run inference directly on-device to ensure raw biometric data never leaves the local network.", icon: Lock },
    ]
  },
  {
    title: "Real-Time Predictions",
    description: "High-throughput inference for live streaming applications.",
    features: [
      { name: "Sub-50ms Latency", desc: "Optimized ONNX runtimes ensure that multimodal fusion operates well within standard video frame rates.", icon: Zap },
    ]
  }
]

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="pt-32 pb-16 bg-muted/20 border-b">
        <div className="container mx-auto px-6 md:px-12 text-center">
          
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Platform Features
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A comprehensive suite of tools designed for researchers requiring absolute transparency and mathematical certainty.
            </p>
          
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl space-y-32">
          {categories.map((category, index) => (
            <div key={category.title} className="space-y-10">
              
                <div className="border-b pb-6">
                  <h2 className="text-3xl font-bold mb-4">{category.title}</h2>
                  <p className="text-lg text-muted-foreground">{category.description}</p>
                </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.features.map((feature, i) => (
                  
                    <Card key={i} className="h-full border-muted bg-card hover:bg-muted/10 transition-colors">
                      <CardHeader>
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <feature.icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl">{feature.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {feature.desc}
                        </p>
                      </CardContent>
                    </Card>
                  
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
