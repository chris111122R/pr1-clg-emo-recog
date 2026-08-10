"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  BrainCircuit, Activity, ShieldCheck, AlertTriangle, Play, Sparkles,
  AlertCircle, FileText, Type, Camera, Mic, Image as ImageIcon,
  Upload, ArrowRight, UserCircle, Microscope, Gauge, RotateCcw,
  CheckCircle2
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAnalysis } from "@/lib/AnalysisContext"
import { runAnalysis } from "@/lib/analysis-engine"

function Reveal({ children, delay = 0, className }: { children: React.ReactNode, delay?: number, className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  )
}

interface FileUploaderProps {
  type: "image" | "audio"
  icon: React.ComponentType<{ className?: string }>
  label: string
  accepts: string
  fileInput: File | null
  imagePreview: string | null
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const FileUploader = ({
  type,
  icon: Icon,
  label,
  accepts,
  fileInput,
  imagePreview,
  onChange,
}: FileUploaderProps) => (
  <div className="border-2 border-dashed rounded-xl p-10 text-center hover:bg-muted/50 transition-colors border-muted-foreground/25 flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
    <input type="file" accept={accepts} onChange={onChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
    
    {/* Image preview */}
    {type === "image" && imagePreview ? (
      <div className="w-full max-w-[200px] rounded-lg overflow-hidden border shadow-sm">
        <img src={imagePreview} alt="Preview" className="w-full h-auto object-cover" />
      </div>
    ) : (
      <div className={`p-4 rounded-full group-hover:scale-110 transition-transform ${type === 'image' ? 'bg-primary/10' : 'bg-green-500/10'}`}>
        <Icon className={`h-8 w-8 ${type === 'image' ? 'text-primary' : 'text-green-500'}`} />
      </div>
    )}
    
    <div>
      <p className="text-base font-medium">{fileInput ? fileInput.name : label}</p>
      <p className="text-sm text-muted-foreground mt-1">
        {fileInput ? `${(fileInput.size / 1024 / 1024).toFixed(2)} MB` : `Supports ${accepts}`}
      </p>
    </div>
  </div>
)

export default function AnalysisToolPage() {
  const { addResult, currentResult } = useAnalysis()
  const [modality, setModality] = React.useState<"text" | "image" | "audio" | "multimodal">("text")
  const [inputText, setInputText] = React.useState("")
  const [fileInput, setFileInput] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<"idle" | "analyzing" | "complete">("idle")
  // Multimodal inputs
  const [mmText, setMmText] = React.useState("")
  const [mmImageFile, setMmImageFile] = React.useState<File | null>(null)
  const [mmAudioFile, setMmAudioFile] = React.useState<File | null>(null)
  const [mmImagePreview, setMmImagePreview] = React.useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFileInput(file)
      
      // Create preview for images
      if (modality === "image" && file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => setImagePreview(reader.result as string)
        reader.readAsDataURL(file)
      } else {
        setImagePreview(null)
      }
    }
  }

  const handleMmImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setMmImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setMmImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleMmAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setMmAudioFile(e.target.files[0])
  }

  const canAnalyze = modality === "text"
    ? inputText.trim().length > 0
    : modality === "multimodal"
      ? (mmText.trim().length > 0 || mmImageFile !== null || mmAudioFile !== null)
      : fileInput !== null

  const handleAnalyze = async () => {
    if (!canAnalyze) return
    setStatus("analyzing")

    try {
      let result
      if (modality === "multimodal") {
        // For multimodal, pick the richest available single modality to call the backend
        // (true fusion endpoint requires all three; fall back to whichever is provided)
        if (mmImageFile && mmText.trim()) {
          result = await runAnalysis("image", { file: mmImageFile })
        } else if (mmImageFile) {
          result = await runAnalysis("image", { file: mmImageFile })
        } else if (mmAudioFile) {
          result = await runAnalysis("audio", { file: mmAudioFile })
        } else {
          result = await runAnalysis("text", { text: mmText })
        }
      } else {
        result = await runAnalysis(modality, {
          text: inputText,
          file: fileInput || undefined,
        })
      }
      addResult(result)
      setStatus("complete")
    } catch {
      setStatus("idle")
    }
  }

  const handleReset = () => {
    setInputText("")
    setFileInput(null)
    setImagePreview(null)
    setMmText("")
    setMmImageFile(null)
    setMmAudioFile(null)
    setMmImagePreview(null)
    setStatus("idle")
  }

  // FileUploader moved outside of render to prevent recreation

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <Reveal>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Analysis Tool</h1>
          <p className="text-muted-foreground">
            Provide input data to receive multi-modal emotion recognition, uncertainty prediction, and explainable AI insights.
          </p>
        </div>
      </Reveal>

      {status === "idle" && (
        <Reveal delay={0.1}>
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Input Data</CardTitle>
              <CardDescription>Select an input modality and provide your data for analysis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={modality} onValueChange={(v) => { setModality(v as typeof modality); setFileInput(null); setImagePreview(null) }} className="w-full">
                <TabsList className="grid grid-cols-4 w-full mb-6">
                  <TabsTrigger value="text"><Type className="w-4 h-4 mr-2 hidden sm:block" /> Text</TabsTrigger>
                  <TabsTrigger value="image"><ImageIcon className="w-4 h-4 mr-2 hidden sm:block" /> Image</TabsTrigger>
                  <TabsTrigger value="audio"><Mic className="w-4 h-4 mr-2 hidden sm:block" /> Audio</TabsTrigger>
                  <TabsTrigger value="multimodal"><Sparkles className="w-4 h-4 mr-2 hidden sm:block" /> Fusion</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4 mt-0">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type or paste your text here to analyze emotional content..."
                    className="w-full min-h-[200px] p-4 rounded-md border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary transition-all resize-none outline-none"
                  />
                </TabsContent>

                <TabsContent value="image" className="space-y-4 mt-0">
                  <FileUploader type="image" icon={Camera} label="Upload Face Image" accepts=".jpg,.jpeg,.png,.webp" fileInput={fileInput} imagePreview={imagePreview} onChange={handleFileChange} />
                </TabsContent>

                <TabsContent value="audio" className="space-y-4 mt-0">
                  <FileUploader type="audio" icon={Mic} label="Upload Speech Audio" accepts=".wav,.mp3,.m4a,.ogg" fileInput={fileInput} imagePreview={imagePreview} onChange={handleFileChange} />
                </TabsContent>

                <TabsContent value="multimodal" className="mt-0 space-y-4">
                  <div className="rounded-lg border bg-primary/5 border-primary/20 p-3 flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Multimodal Fusion:</span> Provide any combination of text, image, and audio inputs. The cross-attention fusion network will dynamically weight available modalities and handle missing channels gracefully.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Text Input (optional)</label>
                    <textarea
                      value={mmText}
                      onChange={(e) => setMmText(e.target.value)}
                      placeholder="Add text for NLP analysis..."
                      className="w-full min-h-[80px] p-3 rounded-md border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary transition-all resize-none outline-none text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Facial Image (optional)</label>
                      <FileUploader type="image" icon={Camera} label="Upload Face Image" accepts=".jpg,.jpeg,.png,.webp" fileInput={mmImageFile} imagePreview={mmImagePreview} onChange={handleMmImageChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Speech Audio (optional)</label>
                      <FileUploader type="audio" icon={Mic} label="Upload Audio" accepts=".wav,.mp3,.m4a,.ogg" fileInput={mmAudioFile} imagePreview={null} onChange={handleMmAudioChange} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {[mmText.trim() ? "✓ Text" : "○ Text", mmImageFile ? "✓ Image" : "○ Image", mmAudioFile ? "✓ Audio" : "○ Audio"].map(s => (
                      <span key={s} className={s.startsWith("✓") ? "text-success font-semibold" : ""}>{s}</span>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end">
                <Button onClick={handleAnalyze} disabled={!canAnalyze} size="lg" className="gap-2">
                  <Play className="w-4 h-4" /> Analyze Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      )}

      {status === "analyzing" && (
        <Reveal>
          <Card className="border-border p-12 flex flex-col items-center justify-center space-y-4">
            <BrainCircuit className="w-12 h-12 text-primary animate-pulse" />
            <p className="text-xl font-semibold">Processing {modality === "text" ? "Text" : modality === "image" ? "Image" : modality === "audio" ? "Audio" : "Multimodal Fusion"} Data...</p>
            <p className="text-muted-foreground text-sm text-center max-w-sm">
              Running multi-modal emotion classification, uncertainty estimation, and generating explainability insights.
            </p>
            <Progress value={undefined} className="w-64 mt-4 h-2" />
          </Card>
        </Reveal>
      )}

      {status === "complete" && currentResult && (
        <div className="space-y-6">
          <Reveal>
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-success" />
                <div>
                  <p className="font-semibold text-sm">Analysis Complete</p>
                  <p className="text-xs text-muted-foreground">
                    {currentResult.modality.charAt(0).toUpperCase() + currentResult.modality.slice(1)} input processed • {currentResult.inputSummary}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                <RotateCcw className="w-3 h-3" /> New Analysis
              </Button>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emotion Classification */}
            <Reveal delay={0.1}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" /> Emotion Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentResult.emotionScores.slice(0, 4).map((es) => (
                    <div key={es.emotion}>
                      <div className="flex justify-between mb-2 text-sm">
                        <span className="font-medium">{es.emotion}</span>
                        <span className="text-muted-foreground">{es.score}%</span>
                      </div>
                      <Progress value={es.score} className="h-2" />
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-semibold mb-2">Primary Classification</h3>
                    <div className="flex gap-2">
                      <Badge variant="default" className="bg-primary/20 text-primary border-primary/20">
                        {currentResult.primaryEmotion}
                      </Badge>
                      <Badge variant="default" className="bg-primary/20 text-primary border-primary/20">
                        {currentResult.confidence}% Confidence
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            {/* Uncertainty Prediction */}
            <Reveal delay={0.2}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" /> Uncertainty Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center justify-center p-6 bg-muted/20 rounded-lg border border-dashed">
                    <span className={`text-4xl font-bold mb-2 ${currentResult.totalUncertainty < 15 ? 'text-success' : 'text-warning'}`}>
                      {currentResult.totalUncertainty}%
                    </span>
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {currentResult.totalUncertainty < 10 ? "Low" : currentResult.totalUncertainty < 20 ? "Moderate" : "High"} Uncertainty
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Epistemic (Model)</span>
                      <span className="font-semibold">{currentResult.epistemicUncertainty}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Aleatoric (Data)</span>
                      <span className="font-semibold">{currentResult.aleatoricUncertainty}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Model Confidence</span>
                      <span className="font-semibold text-success">{currentResult.confidence > 80 ? "High" : currentResult.confidence > 60 ? "Moderate" : "Low"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            {/* Explainability */}
            <Reveal delay={0.3} className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" /> Explainability Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" /> Explanation Summary
                      </h3>
                      <div className="p-4 bg-muted/40 rounded-md text-sm leading-relaxed border">
                        {currentResult.explanation}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Feature Attribution</h3>
                      <div className="space-y-3">
                        {currentResult.featureImportance.slice(0, 4).map((fi) => (
                          <div key={fi.label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium">{fi.label}</span>
                              <span className="text-muted-foreground">{Math.round(fi.value * 100)}%</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-primary rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${fi.value * 100}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>

          {/* Navigation to other views */}
          <Reveal delay={0.4}>
            <Card className="bg-muted/20 border-dashed">
              <CardContent className="pt-6">
                <p className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Analysis data synced to all views
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Link href="/analyze" className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-sm font-medium">
                    <Activity className="w-4 h-4 text-primary shrink-0" />
                    <span>Analyze Emotion</span>
                    <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground" />
                  </Link>
                  <Link href="/digital-twin" className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-sm font-medium">
                    <UserCircle className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Digital Twin</span>
                    <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground" />
                  </Link>
                  <Link href="/dashboard/workspace/explainability" className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-sm font-medium">
                    <Microscope className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Explainability</span>
                    <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground" />
                  </Link>
                  <Link href="/dashboard/workspace/uncertainty" className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-sm font-medium">
                    <Gauge className="w-4 h-4 text-info shrink-0" />
                    <span>Uncertainty</span>
                    <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      )}
    </div>
  )
}
