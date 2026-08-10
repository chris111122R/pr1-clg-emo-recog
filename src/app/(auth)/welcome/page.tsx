"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"

import { AuthShell } from "@/components/auth/AuthShell"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const steps = [
  {
    step: 1,
    emoji: "🧠",
    title: "Understand Emotion, Not Just Labels",
    body:
      "UA-EDT builds a continuous Valence-Arousal model from your multimodal streams — so you see nuanced emotional dynamics, not just 'Happy' or 'Sad'.",
  },
  {
    step: 2,
    emoji: "🔎",
    title: "Every Prediction is Explainable",
    body:
      "Your Digital Twin maps predictions back to the exact Facial Action Units and vocal prosody markers that drove them. Full clinical transparency, zero black boxes.",
  },
  {
    step: 3,
    emoji: "📊",
    title: "Know When the Model is Confident",
    body:
      "Powered by Evidential Deep Learning, each output carries aleatoric and epistemic uncertainty bounds. The platform flags when you should trust the data — and when you shouldn't.",
  },
]

export default function WelcomePage() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [direction, setDirection] = React.useState(1) // 1 = forward, -1 = backward

  function goNext() {
    setDirection(1)
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1))
  }

  function goPrev() {
    setDirection(-1)
    setCurrentStep((s) => Math.max(s - 1, 0))
  }

  const isLast = currentStep === steps.length - 1
  const step = steps[currentStep]

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  }

  return (
    <AuthShell
      title=""
      description=""
      showLogo={false}
      maxWidth="max-w-lg"
    >
      <div className="space-y-8">
        {/* Welcome header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="text-5xl mb-4"
          >
            👋
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to UA-EDT</h1>
          <p className="text-muted-foreground text-sm">
            Before you dive in, here's a quick look at what's waiting for you.
          </p>
        </div>

        {/* Progress bar */}
        <Progress value={((currentStep + 1) / steps.length) * 100} className="h-1" />

        {/* Carousel */}
        <div className="relative overflow-hidden rounded-xl bg-muted/30 border border-border min-h-[200px] flex items-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step.step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-8 text-center space-y-4 w-full"
            >
              <div className="text-5xl">{step.emoji}</div>
              <h2 className="text-xl font-bold leading-tight">{step.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                {step.body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > currentStep ? 1 : -1); setCurrentStep(i) }}
              aria-label={`Go to step ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentStep ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={goPrev}
            disabled={currentStep === 0}
            aria-label="Previous step"
            className="h-10 w-10 shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            {isLast ? (
              <Link href="/dashboard">
                <Button className="w-full h-11 text-base gap-2">
                  Enter the Platform
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button
                type="button"
                onClick={goNext}
                className="w-full h-11 text-base gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Skip */}
        {!isLast && (
          <div className="text-center">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Skip intro
            </Link>
          </div>
        )}
      </div>
    </AuthShell>
  )
}
