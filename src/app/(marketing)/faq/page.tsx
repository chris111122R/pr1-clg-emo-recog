import * as React from "react"
import { Metadata } from "next"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "FAQ | UA-EDT",
  description: "Frequently asked questions about the UA-EDT platform and architecture.",
}

const faqs = [
  {
    category: "Architecture & Explainability",
    items: [
      {
        q: "What does 'Uncertainty-Aware' actually mean?",
        a: "Most AI models output a point estimate (e.g., 98% Happy). Our model uses Evidential Deep Learning to output the parameters of a distribution. This means the model can explicitly tell you 'I am confident' vs 'I am guessing because this data is noisy' (Aleatoric uncertainty) vs 'I have never seen a face like this before' (Epistemic uncertainty)."
      },
      {
        q: "How does the Digital Twin provide explainability?",
        a: "Before estimating a dimensional emotion space (Valence/Arousal), our model is forced to predict intermediate structural features: specifically, the intensity of 44 Action Units (FACS) and vocal prosody metrics. We map these intermediate features onto a parametric 3D digital twin, so you can visually verify which facial muscles the AI thinks are moving."
      }
    ]
  },
  {
    category: "Data & Privacy",
    items: [
      {
        q: "Do you store the raw video and audio feeds?",
        a: "No. For enterprise and clinical trial tiers, we offer edge-compute ONNX runtimes. The multimodal fusion and feature extraction happen entirely on your local hardware or secure VPC. Only the anonymized parameter payloads (the 'Twin') are sent to the central server for longitudinal analytics, ensuring full HIPAA compliance."
      },
      {
        q: "What datasets was the core model trained on?",
        a: "Our foundation model was trained on a proprietary, ethnically diverse dataset of over 2 million annotated multimodal segments, cross-validated against public sets like AffectNet and VGG-Face2. We specifically curated the data to minimize demographic bias, which is actively measured via our Epistemic Uncertainty layer."
      }
    ]
  },
  {
    category: "Integration",
    items: [
      {
        q: "Can we use this for real-time live streams?",
        a: "Yes. Our inference pipeline is optimized to run at sub-50ms latency on standard GPU hardware, allowing for real-time overlay of attribution maps and confidence intervals on live 60fps video feeds."
      },
      {
        q: "Do you provide an API?",
        a: "Absolutely. The UA-EDT platform provides a robust REST API and WebSocket connections for real-time streaming data ingestion and digital twin parameter extraction. Documentation is provided for all enterprise and clinical tier customers."
      }
    ]
  }
]

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="pt-32 pb-16 bg-muted/20 border-b">
        <div className="container mx-auto px-6 md:px-12 text-center">
          
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about the product and architecture.
            </p>
          
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl space-y-16">
          {faqs.map((group, i) => (
            
              <div key={i} className="space-y-6">
                <h2 className="text-2xl font-bold">{group.category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {group.items.map((faq, j) => (
                    <AccordionItem key={j} value={`item-${i}-${j}`}>
                      <AccordionTrigger className="text-left font-medium text-lg">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            
          ))}
        </div>
      </section>
    </div>
  )
}
