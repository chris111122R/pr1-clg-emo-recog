"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldAlert, HeartHandshake, Lightbulb, AlertTriangle,
  ShieldCheck, Activity, BookOpen, ChevronDown, ChevronUp, Clock,
  CheckCircle2, Circle, PhoneCall
} from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAnalysis } from "@/lib/AnalysisContext"

// ── Evidence-based protocol data ────────────────────────────────────────────
type InterventionType = "clinical" | "preventative" | "supportive"

interface Protocol {
  type: InterventionType
  title: string
  desc: string
  steps: string[]
  evidence: string
  duration: string
}

const INTERVENTIONS_DATA: Record<string, Protocol[]> = {
  Joy: [
    {
      type: "supportive",
      title: "Positive Affect Capitalization",
      desc: "Help the individual acknowledge and savour the positive emotional state. Encourage reflective journaling of what contributed to this feeling.",
      steps: [
        "Ask: 'What contributed most to how you're feeling right now?'",
        "Encourage sharing the positive experience with a trusted person.",
        "Journal 3 specific positive events and their emotional impact.",
      ],
      evidence: "Fredrickson's Broaden-and-Build Theory (2001) — Positive Psychology",
      duration: "10–15 min"
    },
    {
      type: "preventative",
      title: "Resilience Scaffolding",
      desc: "Use this high-resource emotional state to proactively build coping strategies and stress-tolerance buffers for future stressors.",
      steps: [
        "Identify one personal strength that contributed to this positive state.",
        "List two coping strategies to apply when feeling the opposite.",
        "Set a small, achievable goal that builds on this momentum.",
      ],
      evidence: "Seligman's PERMA Model (2011) — Positive Psychology",
      duration: "15–20 min"
    }
  ],
  Sadness: [
    {
      type: "supportive",
      title: "Active Listening & Validation",
      desc: "Provide a non-judgmental, empathic space for emotional expression without rushing to problem-solve. Validate the individual's experience.",
      steps: [
        "Reflect back: 'It sounds like you're feeling…' to confirm understanding.",
        "Avoid minimizing ('at least…') or advising prematurely.",
        "Sit in silence if necessary — presence is often therapeutic.",
      ],
      evidence: "Carl Rogers' Person-Centred Therapy (1951)",
      duration: "15–30 min"
    },
    {
      type: "preventative",
      title: "Behavioural Activation (CBT)",
      desc: "Encourage small, manageable positive activities to gently disrupt the withdrawal–inactivity cycle common in low mood states.",
      steps: [
        "Identify one enjoyable activity from the past (even low-energy, e.g. a 5-min walk).",
        "Schedule it for within the next 24 hours.",
        "After completion, note any mood shift — even subtle.",
      ],
      evidence: "Beck's Cognitive Behavioural Therapy (1979)",
      duration: "5 min planning + activity"
    },
    {
      type: "clinical",
      title: "PHQ-9 Depression Screening",
      desc: "If sadness is prolonged (>2 weeks) or functionally impairing, recommend standardised PHQ-9 screening to assess severity and guide clinical referral.",
      steps: [
        "Administer PHQ-9 questionnaire (takes ~3 min).",
        "Score 0–4: Monitor. Score 5–9: Watchful waiting. Score 10+: Clinical referral.",
        "Escalate to licensed clinician if score ≥10 or suicidal ideation is present.",
      ],
      evidence: "Spitzer et al., JAMA Internal Medicine (1999)",
      duration: "~3 min screening"
    }
  ],
  Anger: [
    {
      type: "preventative",
      title: "De-escalation Protocol",
      desc: "Immediately reduce physiological arousal and create psychological distance from the trigger using regulated breathing and calm, steady communication.",
      steps: [
        "Speak in a calm, slow, steady voice. Avoid confrontational posture.",
        "Practice 4-7-8 breathing: inhale 4s → hold 7s → exhale 8s × 3 cycles.",
        "Offer the option to pause the conversation for 10 minutes.",
      ],
      evidence: "Progressive Muscle Relaxation — Jacobson (1938)",
      duration: "5–10 min"
    },
    {
      type: "supportive",
      title: "Trigger Identification (CBT)",
      desc: "Once physiologically calm, help identify the underlying unmet need, violated boundary, or cognitive appraisal that triggered the anger response.",
      steps: [
        "Ask: 'What specifically triggered the intensity of this feeling?'",
        "Identify the unmet need: respect, fairness, safety, control?",
        "Reframe: 'What outcome would feel most fair in this situation?'",
      ],
      evidence: "Beck's Cognitive Reappraisal — Cognitive Therapy (1979)",
      duration: "15–20 min"
    },
    {
      type: "clinical",
      title: "Emotion Regulation Skills Training",
      desc: "For recurrent or intense anger, introduce evidence-based emotion regulation skills from Dialectical Behaviour Therapy (DBT) to build long-term tolerance.",
      steps: [
        "Introduce TIPP: Temperature, Intense exercise, Paced breathing, Paired Muscle Relaxation.",
        "Practice TIPP cold-water immersion for acute spikes (≥2min).",
        "Refer to DBT group therapy if dysregulation is chronic.",
      ],
      evidence: "Linehan's Dialectical Behaviour Therapy (1993)",
      duration: "Ongoing training"
    }
  ],
  Fear: [
    {
      type: "supportive",
      title: "5-4-3-2-1 Somatic Grounding",
      desc: "Interrupt the sympathetic nervous system response by directing attention sequentially through five sensory modalities, anchoring to the present moment.",
      steps: [
        "5 things you can SEE — name them aloud.",
        "4 things you can TOUCH — notice their texture.",
        "3 things you can HEAR · 2 you can SMELL · 1 you can TASTE.",
      ],
      evidence: "Mindfulness-Based Stress Reduction (MBSR) — Kabat-Zinn (1990)",
      duration: "5–8 min"
    },
    {
      type: "preventative",
      title: "Reality-Testing & Safety Assessment",
      desc: "Assess the realistic probability and imminence of the feared outcome. If no immediate threat, gently challenge the cognitive distortions driving anticipatory fear.",
      steps: [
        "Ask: 'What specifically are you afraid will happen?'",
        "Ask: 'On a scale of 0–100, how likely is that outcome?'",
        "Challenge: 'What evidence supports / contradicts this prediction?'",
      ],
      evidence: "Cognitive Restructuring — Beck (1964), Ellis (1962)",
      duration: "15 min"
    },
    {
      type: "clinical",
      title: "GAD-7 Anxiety Screening",
      desc: "If fear is chronic, generalised, or interferes with function, administer GAD-7 to assess clinical anxiety severity and guide treatment pathway.",
      steps: [
        "Administer GAD-7 (~2 min). Score ≥10 indicates moderate-severe GAD.",
        "For scores ≥8: Consider referral for CBT-focused therapy.",
        "For scores ≥15 or panic symptoms: Urgent psychiatric consultation.",
      ],
      evidence: "Spitzer et al., Archives of Internal Medicine (2006)",
      duration: "~2 min screening"
    }
  ],
  Surprise: [
    {
      type: "supportive",
      title: "Schema Integration & Contextualization",
      desc: "Provide clear, calm context to help process unexpected information and integrate it into existing cognitive schemas with minimal disruption.",
      steps: [
        "Allow time to process — avoid immediately demanding a response.",
        "Provide clear, factual context about what occurred.",
        "Ask: 'What part of this feels most unexpected or confusing?'",
      ],
      evidence: "Piaget's Schema Theory — Cognitive Development",
      duration: "10 min"
    },
    {
      type: "preventative",
      title: "Predictability Scaffolding",
      desc: "If the individual is in a chronically unpredictable environment, collaboratively establish routine and anchor points to build a sense of control.",
      steps: [
        "Identify one daily anchor routine (e.g. consistent wake time).",
        "Create a '3 things I can control today' list each morning.",
        "Reduce unnecessary novel stimuli in the environment where possible.",
      ],
      evidence: "Cognitive Schema Theory — Bandura (1977)",
      duration: "Ongoing"
    }
  ],
  Disgust: [
    {
      type: "supportive",
      title: "Boundary Validation",
      desc: "Disgust frequently signals a physical or moral boundary violation. Validate the individual's right to those boundaries and the legitimacy of their response.",
      steps: [
        "Name the feeling: 'It sounds like that strongly violated a personal boundary.'",
        "Affirm: 'Your reaction to that makes complete sense.'",
        "Identify what boundary was crossed: physical, moral, or aesthetic?",
      ],
      evidence: "Affective Science Boundary Protocols — Rozin (1999)",
      duration: "10 min"
    },
    {
      type: "preventative",
      title: "Distance from Trigger",
      desc: "Where possible, physically or cognitively remove the individual from the triggering stimulus to reduce sustained activation of the disgust response.",
      steps: [
        "Remove or exit the triggering environment if safe to do so.",
        "Engage in a brief pleasant sensory experience (pleasant scent, clean taste).",
        "Delay re-exposure until emotional regulation is restored.",
      ],
      evidence: "Disgust Sensitivity Scale — Haidt et al. (1994)",
      duration: "5–10 min"
    }
  ],
  Neutral: [
    {
      type: "supportive",
      title: "Wellbeing Check-In",
      desc: "Ensure that a neutral state does not mask underlying apathy, dissociation, or masked affect. A brief, genuine check-in is sufficient protocol.",
      steps: [
        "Ask an open question: 'How has your week been overall?'",
        "Look for subtle indicators of avoidance or emotional blunting.",
        "If consistent neutrality is reported, explore recent stressors gently.",
      ],
      evidence: "Standard Care Protocols — WHO Mental Health Gap Action Programme",
      duration: "5 min"
    },
    {
      type: "preventative",
      title: "Routine Maintenance",
      desc: "Continue standard care protocols. No acute intervention is required. Reinforce positive coping habits and schedule next regular check-in.",
      steps: [
        "Confirm sleep, nutrition, and social engagement are adequate.",
        "Reinforce any existing positive coping strategies in use.",
        "Schedule next wellbeing check-in as per standard protocol.",
      ],
      evidence: "Preventative Mental Health Framework — APA (2020)",
      duration: "Ongoing"
    }
  ]
}

// ── Risk triage from uncertainty ──────────────────────────────────────────
function getRiskLevel(uncertainty: number, primaryEmotion: string): {
  level: "LOW" | "MEDIUM" | "HIGH"
  label: string
  color: string
  bg: string
  icon: React.ComponentType<{ className?: string }>
  note: string
} {
  const isHighRisk = ["Sadness", "Fear", "Anger"].includes(primaryEmotion)
  const combined = uncertainty + (isHighRisk ? 15 : 0)

  if (combined < 20) return {
    level: "LOW", label: "Low Risk", color: "text-success", bg: "bg-success/10",
    icon: ShieldCheck,
    note: "High model confidence + low-risk affect. Standard care protocol applies."
  }
  if (combined < 45) return {
    level: "MEDIUM", label: "Moderate Alert", color: "text-warning", bg: "bg-warning/10",
    icon: AlertTriangle,
    note: "Moderate uncertainty or elevated affect detected. Increase monitoring frequency."
  }
  return {
    level: "HIGH", label: "Critical Alert", color: "text-destructive", bg: "bg-destructive/10",
    icon: ShieldAlert,
    note: "High uncertainty with high-risk emotion. Escalate to licensed clinician immediately."
  }
}

// ── Protocol step card ─────────────────────────────────────────────────────
function ProtocolCard({ protocol, index }: { protocol: Protocol; index: number }) {
  const [expanded, setExpanded] = React.useState(index === 0)
  const [stepsCompleted, setStepsCompleted] = React.useState<boolean[]>(
    () => protocol.steps.map(() => false)
  )

  const TYPE_CONFIG = {
    clinical: { label: "Clinical", color: "border-destructive/60 text-destructive", bg: "bg-destructive/5", icon: ShieldAlert, dot: "bg-destructive" },
    preventative: { label: "Preventative", color: "border-warning/60 text-warning", bg: "bg-warning/5", icon: AlertTriangle, dot: "bg-warning" },
    supportive: { label: "Supportive", color: "border-blue-500/60 text-blue-500", bg: "bg-blue-500/5", icon: HeartHandshake, dot: "bg-blue-500" },
  }
  const cfg = TYPE_CONFIG[protocol.type]
  const TypeIcon = cfg.icon
  const allDone = stepsCompleted.every(Boolean)

  const toggleStep = (i: number) => {
    setStepsCompleted(prev => prev.map((v, idx) => idx === i ? !v : v))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`overflow-hidden border-l-4 ${protocol.type === "clinical" ? "border-l-destructive" : protocol.type === "preventative" ? "border-l-amber-500" : "border-l-blue-500"}`}>
        {/* Header */}
        <button
          className="w-full text-left"
          onClick={() => setExpanded(v => !v)}
        >
          <div className="flex items-start justify-between gap-3 p-5">
            <div className="flex items-start gap-3">
              <div className={`h-9 w-9 rounded-lg ${cfg.bg} border ${cfg.color} flex items-center justify-center shrink-0 mt-0.5`}>
                <TypeIcon className={`h-4 w-4 ${cfg.color.split(" ")[1]}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-semibold text-sm">{protocol.title}</h4>
                  {allDone && (
                    <span className="flex items-center gap-1 text-success text-[10px] font-semibold">
                      <CheckCircle2 className="h-3 w-3" /> Completed
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-[10px] ${cfg.color} border`}>
                    {cfg.label}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {protocol.duration}
                  </span>
                </div>
              </div>
            </div>
            <div className="shrink-0 mt-1">
              {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
        </button>

        {/* Expandable body */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-4 border-t border-border/50 pt-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{protocol.desc}</p>

                {/* Step-by-step checklist */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step-by-Step Protocol</p>
                  {protocol.steps.map((step, i) => (
                    <button
                      key={i}
                      onClick={() => toggleStep(i)}
                      className="w-full flex items-start gap-3 text-left group"
                    >
                      <div className="mt-0.5 shrink-0">
                        {stepsCompleted[i]
                          ? <CheckCircle2 className="h-4 w-4 text-success" />
                          : <Circle className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                        }
                      </div>
                      <p className={`text-sm leading-snug transition-colors ${stepsCompleted[i] ? "line-through text-muted-foreground/50" : "text-foreground"}`}>
                        {step}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Evidence */}
                <div className="flex items-start gap-2 rounded-lg bg-muted/40 border border-border/50 p-3">
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground/80">Evidence Base: </span>
                    {protocol.evidence}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function InterventionsPage() {
  const { currentResult } = useAnalysis()

  if (!currentResult) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <HeartHandshake className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h1 className="text-2xl font-bold tracking-tight mb-2">Clinical Interventions</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          No analysis data found. Run an analysis in the Analysis Tool to generate evidence-based intervention strategies.
        </p>
        <Button asChild>
          <Link href="/dashboard">Go to Analysis Tool</Link>
        </Button>
      </div>
    )
  }

  const { primaryEmotion, confidence, totalUncertainty, emotionScores, modality } = currentResult
  const protocols = INTERVENTIONS_DATA[primaryEmotion] || INTERVENTIONS_DATA["Neutral"]
  const secondaryEmotion = emotionScores.length > 1 ? emotionScores[1] : null
  const risk = getRiskLevel(totalUncertainty, primaryEmotion)
  const RiskIcon = risk.icon

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HeartHandshake className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Clinical Interventions</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Evidence-based therapeutic protocols dynamically tailored to the detected emotional state, confidence level, and uncertainty risk triage.
          </p>
        </div>
        <Badge variant="outline" className="h-fit px-3 py-1 text-sm bg-primary/5 shrink-0">
          Emotion: <span className="font-bold ml-1">{primaryEmotion}</span>
        </Badge>
      </div>

      {/* Triage Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-start gap-3 rounded-xl border p-4 ${risk.bg}`}
      >
        <RiskIcon className={`h-5 w-5 ${risk.color} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-sm font-bold ${risk.color}`}>{risk.label}</span>
            {risk.level === "HIGH" && (
              <Badge variant="destructive" className="text-[10px]">URGENT</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{risk.note}</p>
        </div>
        {risk.level === "HIGH" && (
          <Button variant="destructive" size="sm" className="shrink-0 gap-1.5">
            <PhoneCall className="h-3.5 w-3.5" /> Contact Clinician
          </Button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left: Context panel */}
        <div className="md:col-span-1 space-y-4">
          <Card className="bg-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Detection Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Primary Emotion</span>
                  <span className="font-bold">{primaryEmotion}</span>
                </div>
                <Progress value={confidence} className="h-2" />
                <p className="text-[10px] text-muted-foreground mt-1">{confidence}% confidence</p>
              </div>

              {/* Secondary */}
              {secondaryEmotion && secondaryEmotion.score > 15 && (
                <div className="pt-3 border-t">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Secondary</span>
                    <span className="font-medium">{secondaryEmotion.emotion}</span>
                  </div>
                  <Progress value={secondaryEmotion.score} className="h-2 [&>div]:bg-muted-foreground/50" />
                  <p className="text-[10px] text-muted-foreground mt-1">{secondaryEmotion.score}% score</p>
                </div>
              )}

              {/* Uncertainty */}
              <div className="pt-3 border-t">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Model Uncertainty</span>
                  <span className={`font-bold ${totalUncertainty > 20 ? "text-warning" : "text-success"}`}>
                    ±{totalUncertainty}%
                  </span>
                </div>
                <Progress value={totalUncertainty} className={`h-2 [&>div]:${totalUncertainty > 20 ? "bg-warning" : "bg-success"}`} />
              </div>

              {/* Modality */}
              <div className="pt-3 border-t flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Input Modality</span>
                <Badge variant="secondary" className="text-[10px] capitalize">{modality}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Safety note */}
          <div className="rounded-xl border bg-amber-500/5 border-amber-500/20 p-4 flex gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-600 mb-1">Important Notice</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                These AI-generated recommendations support, but do not replace, clinical judgment. Always defer to a licensed mental health professional for diagnosis or treatment decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Protocol cards */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold">
              {protocols.length} Recommended Protocol{protocols.length !== 1 ? "s" : ""}
            </h3>
          </div>

          {protocols.map((protocol, idx) => (
            <ProtocolCard key={protocol.title} protocol={protocol} index={idx} />
          ))}
        </div>

      </div>
    </div>
  )
}
