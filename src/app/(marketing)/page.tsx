"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Cpu, SlidersHorizontal, FlaskConical, Target, Microscope, Gauge, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Reveal } from "@/components/marketing/Reveal"

import dynamic from "next/dynamic"

const EmotionUniverse = dynamic(() => import("@/components/marketing/EmotionUniverse"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center text-muted-foreground">
      Initializing AI Emotion Engine...
    </div>
  ),
})

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content Column */}
            <div className="text-left max-w-2xl">
              <Reveal delay={0.1}>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                  Understand Emotion with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Mathematical Certainty</span>
                </h1>
              </Reveal>
              
              <Reveal delay={0.2}>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  UA-EDT is the world’s first Uncertainty-Aware Explainable Emotional Digital Twin. We bridge the gap between multimodal AI predictions and clinical-grade reliability.
                </p>
              </Reveal>
              
              <Reveal delay={0.3}>
                <div className="flex flex-col sm:flex-row justify-start gap-4">
                  <Link href="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                      Start Analysis <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Right 3D Column */}
            <Reveal delay={0.4}>
              <div className="relative w-full h-[450px] sm:h-[550px] lg:h-[600px] flex items-center justify-center">
                {/* Soft background radial glows behind the 3D core */}
                <div className="absolute w-[350px] h-[350px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute w-[200px] h-[200px] bg-primary/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
                <EmotionUniverse />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-background">
        <Reveal delay={0.5}>
          <div className="container mx-auto px-6 md:px-12 max-w-4xl text-center pb-8">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              It started with a simple question: Can we truly understand human emotion through data without losing the nuance of the human experience? Our team of researchers and engineers set out to build a platform that doesn't just guess how you feel, but provides a mathematically certain, uncertainty-aware emotional digital twin. We believe that by bridging the gap between multimodal AI predictions and clinical-grade reliability, we can unlock new frontiers in mental health, personalized care, and human-computer interaction.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/20 border-b border-border/50">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Reveal delay={0.1}>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Advanced Capabilities</h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-lg text-muted-foreground leading-relaxed">
                UA-EDT goes beyond basic sentiment analysis. We build explainable, trust-verified emotional twins using state-of-the-art multimodal systems.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal delay={0.1}>
              <Card className="h-full bg-background/50 backdrop-blur-md border-border/60 hover:border-primary/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="p-3 w-fit rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                    <Target className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Calibrated class distributions mapping textual, facial expression, and speech tone signals to accurate emotions.
                  </p>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delay={0.2}>
              <Card className="h-full bg-background/50 backdrop-blur-md border-border/60 hover:border-primary/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="p-3 w-fit rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                    <Microscope className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Explainability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    View interpretative attribution maps (SHAP token weights and Grad-CAM facial action activation arrays).
                  </p>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delay={0.3}>
              <Card className="h-full bg-background/50 backdrop-blur-md border-border/60 hover:border-primary/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="p-3 w-fit rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                    <Gauge className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Uncertainty</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Calibrated confidence metrics and Monte Carlo Dropout predictive entropy bounds for medical-grade safety.
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>


    </div>
  )
}
