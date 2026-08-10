import * as React from "react"
import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, Minus } from "lucide-react"

export const metadata: Metadata = {
  title: "Pricing | UA-EDT",
  description: "Transparent pricing for academic, clinical, and enterprise teams.",
}

const tiers = [
  {
    name: "Academic",
    price: "$0",
    description: "For university researchers and students.",
    buttonText: "Apply for Academic License",
    buttonVariant: "outline" as const,
    features: [
      "1,000 inference minutes/mo",
      "Standard Aleatoric Uncertainty",
      "FACS visualizer",
      "Community support"
    ]
  },
  {
    name: "Clinical Trial",
    price: "$899",
    period: "/mo",
    description: "For validated clinical pipelines.",
    buttonText: "Start Clinical Trial",
    buttonVariant: "default" as const,
    isPopular: true,
    features: [
      "50,000 inference minutes/mo",
      "Full Evidential Deep Learning",
      "HIPAA-compliant data processing",
      "Priority email support",
      "Batch processing API"
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large-scale, real-time commercial deployments.",
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    features: [
      "Unlimited inference",
      "On-premise / VPC deployment",
      "Custom model fine-tuning",
      "24/7 Dedicated SLA",
      "Edge-compute ONNX runtimes"
    ]
  }
]

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="pt-32 pb-16 bg-muted/20 border-b">
        <div className="container mx-auto px-6 md:px-12 text-center">
          
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Whether you are publishing a paper or running a Phase III trial, we have a plan for you.
            </p>
          
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {tiers.map((tier, i) => (
              
                <Card key={i} className={`relative h-full flex flex-col ${tier.isPopular ? 'border-primary shadow-lg scale-105 z-10' : 'border-muted'}`}>
                  {tier.isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="text-center pb-8 pt-8">
                    <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mb-6 h-10">{tier.description}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold">{tier.price}</span>
                      {tier.period && <span className="text-muted-foreground font-medium">{tier.period}</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-4">
                      {tier.features.map(feature => (
                        <li key={feature} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-8 pb-8">
                    <Button variant={tier.buttonVariant} className="w-full h-12 text-base">
                      {tier.buttonText}
                    </Button>
                  </CardFooter>
                </Card>
              
            ))}
          </div>

          
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Compare Features</h2>
              <p className="text-muted-foreground">A detailed breakdown of platform capabilities.</p>
            </div>
            
            <div className="rounded-xl border bg-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Feature</TableHead>
                    <TableHead className="text-center">Academic</TableHead>
                    <TableHead className="text-center">Clinical Trial</TableHead>
                    <TableHead className="text-center">Enterprise</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Monthly Inference (mins)</TableCell>
                    <TableCell className="text-center">1,000</TableCell>
                    <TableCell className="text-center">50,000</TableCell>
                    <TableCell className="text-center">Unlimited</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">FACS Alignment</TableCell>
                    <TableCell className="text-center"><CheckCircle2 className="mx-auto h-4 w-4 text-success" /></TableCell>
                    <TableCell className="text-center"><CheckCircle2 className="mx-auto h-4 w-4 text-success" /></TableCell>
                    <TableCell className="text-center"><CheckCircle2 className="mx-auto h-4 w-4 text-success" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Aleatoric Uncertainty</TableCell>
                    <TableCell className="text-center"><CheckCircle2 className="mx-auto h-4 w-4 text-success" /></TableCell>
                    <TableCell className="text-center"><CheckCircle2 className="mx-auto h-4 w-4 text-success" /></TableCell>
                    <TableCell className="text-center"><CheckCircle2 className="mx-auto h-4 w-4 text-success" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Epistemic Uncertainty (EDL)</TableCell>
                    <TableCell className="text-center"><Minus className="mx-auto h-4 w-4 text-muted-foreground" /></TableCell>
                    <TableCell className="text-center"><CheckCircle2 className="mx-auto h-4 w-4 text-success" /></TableCell>
                    <TableCell className="text-center"><CheckCircle2 className="mx-auto h-4 w-4 text-success" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">HIPAA / SOC2 Compliance</TableCell>
                    <TableCell className="text-center"><Minus className="mx-auto h-4 w-4 text-muted-foreground" /></TableCell>
                    <TableCell className="text-center"><CheckCircle2 className="mx-auto h-4 w-4 text-success" /></TableCell>
                    <TableCell className="text-center"><CheckCircle2 className="mx-auto h-4 w-4 text-success" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">On-Premise Deployment</TableCell>
                    <TableCell className="text-center"><Minus className="mx-auto h-4 w-4 text-muted-foreground" /></TableCell>
                    <TableCell className="text-center"><Minus className="mx-auto h-4 w-4 text-muted-foreground" /></TableCell>
                    <TableCell className="text-center"><CheckCircle2 className="mx-auto h-4 w-4 text-success" /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          
        </div>
      </section>
    </div>
  )
}
