"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  ShieldAlert, Fingerprint, GitPullRequest, BrainCircuit, AudioLines, 
  Type, Image as ImageIcon, GitMerge, FileWarning, Sliders, ChevronRight, 
  Scale, AlertTriangle
} from "lucide-react"

// ── Animation helpers ───────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ── Axioms Data ─────────────────────────────────────────────────────────────
const AXIOMS = [
  {
    icon: FileWarning,
    title: "Aleatoric Monotonicity",
    desc: "Blur, occlusion, and missing tokens strictly increase predicted aleatoric variance (σ²).",
    color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20"
  },
  {
    icon: Fingerprint,
    title: "Epistemic Knowledge Gap",
    desc: "Novel shifts and ambiguous boundaries monotonically increase epistemic variance.",
    color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20"
  },
  {
    icon: GitPullRequest,
    title: "Modality Conflict",
    desc: "Cross-modal disagreement elevates total uncertainty, bypassing unimodal confidence.",
    color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20"
  },
  {
    icon: ShieldAlert,
    title: "OOD Rejection",
    desc: "Samples with high OOD scores or large prediction sets are strictly rejected.",
    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20"
  },
  {
    icon: Scale,
    title: "Confidence Inversion",
    desc: "Confidence C(x) is mathematically bounded to be strictly non-increasing with respect to U_total(x).",
    color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20"
  }
]

// ── Metric Suite Data ───────────────────────────────────────────────────────
const METRICS = [
  {
    modality: "Vision",
    icon: ImageIcon,
    color: "text-violet-400", bg: "bg-violet-500/10",
    items: ["Variance of Laplacian (Blur)", "BRISQUE & NIQE", "3D Pose Angles (Pitch/Yaw/Roll)", "Occlusion Mask Ratio", "Spatial Noise Power"]
  },
  {
    modality: "Audio",
    icon: AudioLines,
    color: "text-emerald-400", bg: "bg-emerald-500/10",
    items: ["Signal-to-Noise Ratio (SNR dB)", "Spectral Flatness", "Clipping Percentage", "VAD Confidence", "Background Noise Floor"]
  },
  {
    modality: "Text",
    icon: Type,
    color: "text-blue-400", bg: "bg-blue-500/10",
    items: ["Grammar Errors Index", "Language ID Confidence", "Perplexity", "Missing Token Ratio", "Sentence Completeness"]
  }
]

export default function UncertaintyQuantificationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-background to-background -z-10" />
        <div className="absolute left-0 top-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] -z-10 mix-blend-overlay pointer-events-none" />
        
        <div className="container mx-auto px-6 md:px-12">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold mb-6 shadow-sm shadow-amber-500/10">
              <ShieldAlert className="h-4 w-4" /> Research-Grade System
            </div>
          </Reveal>
          
          <Reveal delay={0.1}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 max-w-5xl leading-[1.1]">
              Trustworthy <br />
              <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-violet-400 bg-clip-text text-transparent">
                Uncertainty Quantification
              </span>
            </h1>
          </Reveal>
          
          <Reveal delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
              A statistically grounded, fully calibrated, and interpretable multimodal framework.
              Designed to strictly match human intuition, causal degradation models, and the statistical properties of the input.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-10 inline-block p-4 rounded-xl bg-muted/30 border border-border/50 backdrop-blur-sm">
              <p className="font-mono text-sm text-foreground/80 flex items-center gap-2">
                <span className="text-amber-500">Constraint:</span>
                High confidence for degraded, ambiguous, or OOD samples is explicitly prevented by hard constraints.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Axiomatic Behavior ───────────────────────────────────────────── */}
      <section className="py-24 bg-muted/20 border-b border-border/50">
        <div className="container mx-auto px-6 md:px-12">
          <Reveal>
            <div className="max-w-3xl mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">System Objectives & Axiomatic Behavior</h2>
              <p className="text-muted-foreground text-lg">
                The uncertainty estimation system is governed by mathematical guarantees that ensure reliable behavior across edge cases.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AXIOMS.map((axiom, i) => {
              const Icon = axiom.icon
              return (
                <Reveal key={axiom.title} delay={0.1 + i * 0.1}>
                  <div className={`p-6 rounded-2xl border ${axiom.border} bg-card hover:bg-muted/50 transition-colors h-full flex flex-col`}>
                    <div className={`w-12 h-12 rounded-xl ${axiom.bg} flex items-center justify-center mb-5`}>
                      <Icon className={`h-6 w-6 ${axiom.color}`} />
                    </div>
                    <h3 className="text-lg font-bold mb-3">{axiom.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {axiom.desc}
                    </p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Mathematical Fusion Pipeline ─────────────────────────────────── */}
      <section className="py-24 bg-background border-b border-border/50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <Reveal>
            <div className="text-center max-w-4xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Multi-Stage Uncertainty Fusion</h2>
              <p className="text-muted-foreground text-lg">
                Total uncertainty avoids naive linear averaging, instead computing a non-linear, monotonically constrained fusion function to combine distinct statistical signals.
              </p>
            </div>
          </Reveal>

          {/* Math Equation Block */}
          <Reveal delay={0.1}>
            <div className="max-w-4xl mx-auto bg-card border border-border/60 rounded-3xl p-8 shadow-2xl shadow-black/5 mb-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
              
              <div className="font-mono text-center mb-8 relative z-10">
                <span className="text-xl md:text-2xl text-foreground font-semibold">
                  U<sub className="text-sm">total</sub> = <span className="text-violet-400">f</span>(
                  <span className="text-blue-400">U<sub className="text-xs">aleatoric</sub></span>, 
                  <span className="text-amber-400">U<sub className="text-xs">epistemic</sub></span>, 
                  <span className="text-emerald-400">U<sub className="text-xs">quality</sub></span>, 
                  <span className="text-rose-400">U<sub className="text-xs">OOD</sub></span>, 
                  <span className="text-indigo-400">U<sub className="text-xs">cross-modal</sub></span>
                  )
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-sm relative z-10">
                <div className="flex items-start gap-3">
                  <span className="font-mono font-bold text-blue-400 mt-0.5">U_aleatoric</span>
                  <p className="text-muted-foreground leading-snug">Aggregates parameter and data noise (EDL + Gaussian).</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-mono font-bold text-amber-400 mt-0.5">U_epistemic</span>
                  <p className="text-muted-foreground leading-snug">Aggregates model variance via Deep Ensembles & MC Dropout.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-mono font-bold text-emerald-400 mt-0.5">U_quality</span>
                  <p className="text-muted-foreground leading-snug">Measures input physical degradation (‖1 - Q‖₂).</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-mono font-bold text-rose-400 mt-0.5">U_OOD</span>
                  <p className="text-muted-foreground leading-snug">Measures distribution shift via Mahalanobis + Energy.</p>
                </div>
                <div className="flex items-start gap-3 md:col-span-2">
                  <span className="font-mono font-bold text-indigo-400 mt-0.5">U_cross-modal</span>
                  <p className="text-muted-foreground leading-snug">Measures inter-modality conflict across temporal sliding windows.</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Quality Metrics */}
          <div className="mt-24">
            <Reveal>
              <h3 className="text-2xl font-bold mb-8 text-center">Input Quality Conditioning (Q)</h3>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {METRICS.map((metric, i) => {
                const Icon = metric.icon
                return (
                  <Reveal key={metric.modality} delay={0.2 + i * 0.1}>
                    <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm h-full">
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`p-2 rounded-lg ${metric.bg}`}>
                          <Icon className={`w-5 h-5 ${metric.color}`} />
                        </div>
                        <h4 className="font-bold text-lg">{metric.modality} Quality</h4>
                      </div>
                      <ul className="space-y-3">
                        {metric.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 ${metric.color}`} />
                            <span className="leading-tight">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Architecture Details ─────────────────────────────────────────── */}
      <section className="py-24 bg-muted/10 border-b border-border/50">
        <div className="container mx-auto px-6 md:px-12">
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <Reveal>
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Bounded Residual Injection</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    To prevent representation collapse, the Quality vector <span className="font-mono text-sm text-foreground">Q</span> quantitatively modulates Evidential Deep Learning (EDL) parameters via a bounded residual bottleneck with a stop-gradient constraint.
                  </p>
                </div>
                
                <div className="p-5 rounded-xl border border-border/60 bg-card font-mono text-sm overflow-x-auto shadow-sm">
                  <div className="text-muted-foreground mb-2">{/* Stop-gradient on feature extraction */}</div>
                  <div className="text-emerald-400 mb-4">Q_emb = MLP(stop_gradient(Q))</div>
                  <div className="text-muted-foreground mb-2">{/* Additive evidence upper bound */}</div>
                  <div className="text-blue-400">α_k = f_k(X_feat) + Softplus(W_q · Q_emb + b_q)</div>
                </div>

                <p className="text-sm text-muted-foreground">
                  For high physical degradation (Q → 0), the additive evidence upper bound drops, mathematically forcing higher Dirichlet uncertainty <span className="font-mono">U_aleatoric = K / S</span>.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Temporally Aligned Disagreement</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Cross-modal disagreement is evaluated using temporally aligned, overlapping sliding windows <span className="font-mono text-sm text-foreground">W_t</span> of length <span className="font-mono text-sm text-foreground">τ</span>, preventing naive global misalignment errors.
                  </p>
                </div>
                
                <div className="p-5 rounded-xl border border-border/60 bg-card font-mono text-xs overflow-x-auto shadow-sm">
                  <div className="text-muted-foreground mb-2">{/* Jensen-Shannon Divergence across pairs */}</div>
                  <div className="text-rose-400">
                    U_cross-modal(t) = (1 / C(M,2)) * Σ Σ JS( P_m(W_t) || P_n(W_t) )
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-400/90 leading-tight">
                    Conflict Resolution: A Non-Negative Gated MLP guarantees that a critical failure in ANY single sub-estimator overrides low uncertainty in others.
                  </p>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ── Explainability Output & Fallback ─────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Self-Explaining Traceability Engine</h2>
              <p className="text-muted-foreground text-lg">
                Every prediction returns a structured, deterministic attribution breakdown explaining the exact factors driving total uncertainty.
              </p>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            <Reveal className="lg:col-span-7" delay={0.1}>
              <div className="rounded-2xl border border-border/60 bg-[#0d1117] overflow-hidden shadow-2xl">
                <div className="flex items-center px-4 py-3 border-b border-white/10 bg-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="ml-4 text-xs font-mono text-white/50">prediction_trace.json</span>
                </div>
                <div className="p-6 overflow-x-auto">
                  <pre className="text-sm font-mono leading-relaxed">
                    <span className="text-white/70">{`{`}</span>{`\n`}
                    <span className="text-blue-300">  "prediction"</span><span className="text-white/70">: </span><span className="text-emerald-300">"Sadness"</span><span className="text-white/70">,</span>{`\n`}
                    <span className="text-blue-300">  "confidence"</span><span className="text-white/70">: </span><span className="text-amber-300">0.61</span><span className="text-white/70">,</span>{`\n`}
                    <span className="text-blue-300">  "uncertainty"</span><span className="text-white/70">: {`{`}</span>{`\n`}
                    <span className="text-violet-300">    "total"</span><span className="text-white/70">: </span><span className="text-rose-400">0.76</span><span className="text-white/70">,</span>{`\n`}
                    <span className="text-violet-300">    "aleatoric"</span><span className="text-white/70">: {`{`}</span>{`\n`}
                    <span className="text-blue-200">      "score"</span><span className="text-white/70">: </span><span className="text-amber-300">0.72</span><span className="text-white/70">,</span>{`\n`}
                    <span className="text-blue-200">      "attribution"</span><span className="text-white/70">: {`{`}</span>{`\n`}
                    <span className="text-slate-300">        "face_blur"</span><span className="text-white/70">: </span><span className="text-emerald-300">"42%"</span><span className="text-white/70">,</span>{`\n`}
                    <span className="text-slate-300">        "low_illumination"</span><span className="text-white/70">: </span><span className="text-emerald-300">"18%"</span><span className="text-white/70">,</span>{`\n`}
                    <span className="text-slate-300">        "speech_snr_db"</span><span className="text-white/70">: </span><span className="text-emerald-300">"9 dB"</span>{`\n`}
                    <span className="text-white/70">      {`}`}</span>{`\n`}
                    <span className="text-white/70">    {`},`}</span>{`\n`}
                    <span className="text-violet-300">    "epistemic"</span><span className="text-white/70">: {`{`}</span>{`\n`}
                    <span className="text-blue-200">      "score"</span><span className="text-white/70">: </span><span className="text-amber-300">0.14</span><span className="text-white/70">,</span>{`\n`}
                    <span className="text-blue-200">      "attribution"</span><span className="text-white/70">: {`{`}</span>{`\n`}
                    <span className="text-slate-300">        "ensemble_variance"</span><span className="text-white/70">: </span><span className="text-emerald-300">"Low"</span><span className="text-white/70">,</span>{`\n`}
                    <span className="text-slate-300">        "mc_dropout_disagreement"</span><span className="text-white/70">: </span><span className="text-emerald-300">"Low"</span>{`\n`}
                    <span className="text-white/70">      {`}`}</span>{`\n`}
                    <span className="text-white/70">    {`}`}</span>{`\n`}
                    <span className="text-white/70">  {`}`}</span>{`\n`}
                    <span className="text-white/70">{`}`}</span>
                  </pre>
                </div>
              </div>
            </Reveal>

            <div className="lg:col-span-5 space-y-6">
              <Reveal delay={0.2}>
                <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    Fail-Safe Rejection Logic
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    When uncertainty exceeds <span className="font-mono">τ_u</span> or OOD probability exceeds <span className="font-mono">τ_ood</span>, the system forcibly executes a fallback and generates actionable user feedback.
                  </p>
                  <div className="space-y-2">
                    <div className="text-xs bg-background p-2 rounded border font-medium text-foreground/80 border-border/50">
                      Vision Quality Low → <span className="text-emerald-500">"Capture image under brighter lighting"</span>
                    </div>
                    <div className="text-xs bg-background p-2 rounded border font-medium text-foreground/80 border-border/50">
                      Audio SNR Low → <span className="text-emerald-500">"Move closer to the microphone"</span>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.3}>
                <div className="p-6 rounded-2xl border border-border/60 bg-card">
                  <h3 className="font-bold mb-4">Benchmark Targets</h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex justify-between items-center border-b border-border/40 pb-2">
                      <span>ECE & ACE</span>
                      <span className="font-mono font-bold text-foreground">&lt; 0.02</span>
                    </li>
                    <li className="flex justify-between items-center border-b border-border/40 pb-2">
                      <span>Uncertainty Calibration Error</span>
                      <span className="font-mono font-bold text-foreground">&lt; 0.03</span>
                    </li>
                    <li className="flex justify-between items-center border-b border-border/40 pb-2">
                      <span>OOD Detection (AUROC)</span>
                      <span className="font-mono font-bold text-foreground">≥ 0.95</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Degradation Rank Corr. (ρ)</span>
                      <span className="font-mono font-bold text-foreground">≥ 0.85</span>
                    </li>
                  </ul>
                </div>
              </Reveal>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
