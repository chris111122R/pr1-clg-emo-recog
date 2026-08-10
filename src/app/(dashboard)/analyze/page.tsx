import { AnalyzeEmotion } from "@/components/dashboard/AnalyzeEmotion"

export default function AnalyzePage() {
  return (
    <div className="flex flex-col gap-6 p-8 w-full max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analyze Emotion</h1>
        <p className="text-muted-foreground mt-2">
          Use the trained multimodal models to analyze emotions and sync the results to your Digital Twin.
        </p>
      </div>
      <AnalyzeEmotion />
    </div>
  )
}
