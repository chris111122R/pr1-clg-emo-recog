import { DatasetManager } from "@/components/admin/DatasetManager"

export default function DatasetsPage() {
  return (
    <div className="flex flex-col gap-6 p-8 w-full max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dataset Management</h1>
        <p className="text-muted-foreground mt-2">
          Upload, manage, and track datasets for multi-modal emotion recognition models.
        </p>
      </div>
      <DatasetManager />
    </div>
  )
}
