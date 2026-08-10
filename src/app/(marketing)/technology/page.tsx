"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Brain, Waves, ScanFace, GitMerge, Gauge, FlaskConical,
  ShieldCheck, Layers, ChevronRight, Database, Cpu, Sparkles, Activity
} from "lucide-react"

// ── Animation helpers ───────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ── Animated pipeline flow ──────────────────────────────────────────────────
const PIPELINE_STEPS = [
  {
    id: "input",
    icon: Layers,
    title: "Raw Input",
    sub: "Text · Audio · Image",
    color: "from-slate-500/20 to-slate-400/10",
    border: "border-slate-400/40",
    dot: "bg-slate-400",
  },
  {
    id: "encoders",
    icon: Brain,
    title: "Transformer Encoders",
    sub: "DeBERTa · Wav2Vec2 · ViT",
    color: "from-blue-500/20 to-blue-400/10",
    border: "border-blue-400/40",
    dot: "bg-blue-400",
  },
  {
    id: "fusion",
    icon: GitMerge,
    title: "Cross-Attention Fusion",
    sub: "Quality-Aware · Missing Modality",
    color: "from-violet-500/20 to-violet-400/10",
    border: "border-violet-400/40",
    dot: "bg-violet-400",
  },
  {
    id: "uncertainty",
    icon: Gauge,
    title: "MC Dropout UQ",
    sub: "T=30 Passes · Entropy · BALD",
    color: "from-amber-500/20 to-amber-400/10",
    border: "border-amber-400/40",
    dot: "bg-amber-400",
  },
  {
    id: "xai",
    icon: FlaskConical,
    title: "Explainability",
    sub: "SHAP · Grad-CAM · Attention",
    color: "from-emerald-500/20 to-emerald-400/10",
    border: "border-emerald-400/40",
    dot: "bg-emerald-400",
  },
  {
    id: "output",
    icon: ShieldCheck,
    title: "Digital Twin Output",
    sub: "Prediction + Bounds + Intervention",
    color: "from-primary/20 to-primary/5",
    border: "border-primary/40",
    dot: "bg-primary",
  },
]

function PipelineDiagram() {
  return (
    <div className="relative overflow-x-auto">
      <div className="min-w-[760px] flex items-center gap-0 py-8 px-4">
        {PIPELINE_STEPS.map((step, i) => {
          const Icon = step.icon
          return (
            <React.Fragment key={step.id}>
              {/* Node */}
              <motion.div
                className={`relative flex flex-col items-center gap-2 flex-1`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} border ${step.border} flex items-center justify-center shadow-lg`}>
                  <Icon className="h-7 w-7 text-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-bold text-foreground leading-tight">{step.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{step.sub}</p>
                </div>
                {/* step number */}
                <span className="absolute -top-3 -right-1 h-5 w-5 rounded-full bg-card border border-border text-[10px] font-bold flex items-center justify-center text-muted-foreground">
                  {i + 1}
                </span>
              </motion.div>

              {/* Arrow connector */}
              {i < PIPELINE_STEPS.length - 1 && (
                <div className="flex items-center justify-center w-10 shrink-0">
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.3, duration: 0.4 }}
                    className="origin-left"
                  >
                    <div className="flex items-center gap-0">
                      <div className={`h-0.5 w-6 ${step.dot}`} />
                      <ChevronRight className="h-3 w-3 text-muted-foreground -ml-1" />
                    </div>
                  </motion.div>
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

// ── Architecture details cards ──────────────────────────────────────────────
const ARCH_CARDS = [
  {
    icon: Brain,
    title: "Modality-Specific Encoders",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    content: [
      { label: "Text", detail: "DeBERTa-v3 (microsoft/deberta-v3-small) → 768-dim CLS embedding" },
      { label: "Audio", detail: "Wav2Vec2 (facebook/wav2vec2-base-960h) → 768-dim prosody features" },
      { label: "Vision", detail: "ViT-B/16 (microsoft/vit-base-patch16-224) → 768-dim spatial map" },
    ],
    math: "E_m ∈ ℝ^{1×768}, m ∈ {text, audio, vision}",
  },
  {
    icon: GitMerge,
    title: "Cross-Attention Fusion",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    content: [
      { label: "Projection", detail: "Each 768-dim embedding → 256-dim via Linear + ReLU + LayerNorm + Dropout" },
      { label: "Attention", detail: "Scaled dot-product: Score = (Q · Kᵀ) / √d" },
      { label: "Missing Modality", detail: "Unavailable channels masked with −10⁹ prior to Softmax" },
    ],
    math: "H = Softmax(QKᵀ/√256) · V → 256-dim fused vector",
  },
  {
    icon: Gauge,
    title: "Monte Carlo Uncertainty (BALD)",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    content: [
      { label: "MC Passes", detail: "T=30 stochastic forward passes with Dropout enabled during inference" },
      { label: "Predictive Entropy", detail: "H(Y|X) = −∑ P̄_c log P̄_c — total uncertainty" },
      { label: "BALD MI", detail: "I(Y;ω|X) = H − E_ω[H] — epistemic component (model ignorance)" },
    ],
    math: "Uncertainty = min(H / ln(C), 1.0) × 100%",
  },
  {
    icon: FlaskConical,
    title: "Explainability Engine (XAI)",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    content: [
      { label: "SHAP", detail: "Token-level Shapley attributions for text inputs — identifies emotional trigger words" },
      { label: "Grad-CAM", detail: "Gradient activation maps highlight FACS regions (AU6/Cheek, AU12/Lip Corner)" },
      { label: "Modality Weights", detail: "Attention allocation: Text%, Audio%, Vision% — per-prediction explainability" },
    ],
    math: "φ_i(f,x) = ∑_{S⊆F\\{i}} |S|!(|F|−|S|−1)!/|F|! [f(S∪{i})−f(S)]",
  },
]

// ── Dataset section ─────────────────────────────────────────────────────────
const DATASETS = [
  { name: "GoEmotions", modality: "Text", size: "58 000", org: "Google", detail: "58k Reddit comments, 28 fine-grained emotion classes → simplified to 7 core" },
  { name: "CREMA-D", modality: "Audio", size: "7 442", org: "Multi-university", detail: "7,442 audio clips · 91 actors · 6 emotions · diverse ethnic backgrounds" },
  { name: "AffectNet / FER-2013", modality: "Vision", size: "~35 000", org: "Microsoft / Kaggle", detail: "30k+ aligned facial images · 7 basic expression categories · FACS-annotated" },
  { name: "CMU-MOSEI", modality: "Multimodal", size: "23 453", org: "Carnegie Mellon U.", detail: "Aligned monologue video + audio + text with emotional ratings. Benchmark for fusion models." },
]

const MODALITY_COLOR: Record<string, string> = {
  Text: "bg-blue-500/20 text-blue-400 border-blue-400/30",
  Audio: "bg-emerald-500/20 text-emerald-400 border-emerald-400/30",
  Vision: "bg-violet-500/20 text-violet-400 border-violet-400/30",
  Multimodal: "bg-amber-500/20 text-amber-400 border-amber-400/30",
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function TechnologyPage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-violet-500/5 -z-10" />
        <div className="absolute right-0 top-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl -z-10" />
        <div className="container mx-auto px-6 md:px-12">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
              <Cpu className="h-3 w-3" /> Publication-Grade Architecture
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
              The UA-EDT<br />
              <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                Technical Architecture
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
              How we transform raw, noisy multimodal data into a clinically valid, uncertainty-aware emotional digital twin — using a cross-modal attention fusion network, Monte Carlo dropout quantification, and a SHAP/Grad-CAM explainability stack.
            </p>
          </Reveal>

          {/* Metrics */}
          <div className="flex flex-wrap gap-8 mt-12">
            {[
              { label: "Transformer Parameters", value: "~340M" },
              { label: "MC Dropout Passes", value: "T = 30" },
              { label: "Emotion Classes", value: "7" },
              { label: "Calibration ECE", value: "<3.2%" },
            ].map((m, i) => (
              <Reveal key={m.label} delay={0.15 + i * 0.07}>
                <div className="text-center">
                  <p className="text-3xl font-black text-foreground">{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline Overview */}
      <section className="py-24 bg-muted/10 border-b">
        <div className="container mx-auto px-6 md:px-12">
          <Reveal>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold mb-3">End-to-End Pipeline</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                From raw multimodal input to a fully-bounded, explainable emotional state in under 250 ms.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl border bg-card p-4 md:p-8 shadow-sm">
              <PipelineDiagram />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Architecture Deep Dive */}
      <section className="py-24 bg-background border-b">
        <div className="container mx-auto px-6 md:px-12">
          <Reveal>
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold mb-3">Component Architecture</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Four mathematically rigorous modules compose the UA-EDT research stack.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {ARCH_CARDS.map((card, i) => {
              const Icon = card.icon
              return (
                <Reveal key={card.title} delay={i * 0.1}>
                  <div className="rounded-2xl border bg-card p-6 h-full flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                      <h3 className="text-lg font-bold">{card.title}</h3>
                    </div>

                    <div className="space-y-3 flex-1">
                      {card.content.map(c => (
                        <div key={c.label} className="flex gap-2">
                          <span className={`text-xs font-bold ${card.color} shrink-0 mt-0.5`}>{c.label}</span>
                          <span className="text-sm text-muted-foreground leading-snug">{c.detail}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg bg-muted/50 border border-border/50 px-3 py-2">
                      <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">{card.math}</p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Training Pipeline */}
      <section className="py-24 bg-muted/10 border-b">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <Reveal>
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <Activity className="h-3 w-3" /> Discriminative Fine-Tuning
                </div>
                <h2 className="text-3xl font-bold">Progressive Layer Unfreezing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Training proceeds in three stages to preserve pre-trained transformer features while adapting to emotion targets, preventing catastrophic forgetting.
                </p>
                <div className="space-y-4">
                  {[
                    { stage: "Stage 0 (0–30%)", detail: "Freeze backbone encoders. Train projection heads & classification layer only. AdamW lr=1×10⁻³" },
                    { stage: "Stage 1 (30–60%)", detail: "Unfreeze Q/K/V attention layers in all three encoders. lr decayed 10×." },
                    { stage: "Stage 2 (60–100%)", detail: "Full end-to-end fine-tuning. Cosine annealing schedule + mixed precision (torch.cuda.amp)." },
                  ].map((s, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{s.stage}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="rounded-2xl border bg-card p-6 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Database className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-bold">Optimization Configuration</h3>
                </div>
                {[
                  { label: "Loss Function", value: "Weighted Cross-Entropy" },
                  { label: "Optimizer", value: "AdamW (β₁=0.9, β₂=0.999)" },
                  { label: "LR Range", value: "1×10⁻⁵ → 1×10⁻³ (Optuna)" },
                  { label: "Weight Decay", value: "1×10⁻⁶ → 1×10⁻²" },
                  { label: "Temperature (cal.)", value: "T = 1.15" },
                  { label: "Hyperparameter search", value: "Optuna TPE, N=50 trials" },
                  { label: "Mixed Precision", value: "torch.cuda.amp.GradScaler" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center text-sm border-b border-border/30 pb-2 last:border-0 last:pb-0">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-mono text-xs font-semibold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Datasets Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <Reveal>
            <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground text-xs font-semibold mb-4">
                <Sparkles className="h-3 w-3" /> Benchmark Datasets
              </div>
              <h2 className="text-3xl font-bold mb-3">Training Data</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                UA-EDT is trained and evaluated on premier public benchmarks across all three modalities.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {DATASETS.map((ds, i) => (
              <Reveal key={ds.name} delay={i * 0.08}>
                <div className="rounded-2xl border bg-card p-5 h-full flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm leading-tight">{ds.name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${MODALITY_COLOR[ds.modality]}`}>
                      {ds.modality}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-foreground">{ds.size}</span>
                    <span className="text-xs text-muted-foreground">samples</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{ds.detail}</p>
                  <p className="text-[10px] text-muted-foreground/60 font-mono">{ds.org}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
