import { TrainingManager } from "@/components/admin/TrainingManager"

export default function TrainingPage() {
  return (
    <div className="flex flex-col gap-6 p-8 w-full max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Training Pipeline</h1>
        <p className="text-muted-foreground mt-2">
          Configure architectures, tune hyperparameters, and monitor ML training jobs in real-time.
        </p>
      </div>
      <TrainingManager />
    </div>
  )
}
