"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Upload, FileText, ImageIcon, Video, Music, HardDrive, Settings, PlayCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const MOCK_DATASETS = [
  { id: 1, name: "AffectNet-HQ", modality: "IMAGE", size: "15 GB", status: "READY", version: "v1.2", date: "2024-03-10" },
  { id: 2, name: "IEMOCAP-Audio", modality: "AUDIO", size: "3.2 GB", status: "PREPROCESSING", progress: 65, version: "v1.0", date: "2024-03-11" },
  { id: 3, name: "GoEmotions-Text", modality: "TEXT", size: "450 MB", status: "READY", version: "v2.0", date: "2024-03-12" },
]

export function DatasetManager() {
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)

  const handleUpload = () => {
    setIsUploading(true)
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
        }, 500)
      }
    }, 200)
  }

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case "IMAGE": return <ImageIcon className="h-4 w-4 text-blue-500" />
      case "AUDIO": return <Music className="h-4 w-4 text-green-500" />
      case "VIDEO": return <Video className="h-4 w-4 text-purple-500" />
      case "TEXT": return <FileText className="h-4 w-4 text-amber-500" />
      default: return <HardDrive className="h-4 w-4" />
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-6">
        <Card className="border-primary/10 shadow-sm backdrop-blur-xl bg-background/50">
          <CardHeader>
            <CardTitle className="text-xl">Upload New Dataset</CardTitle>
            <CardDescription>Upload a raw dataset to trigger automatic preprocessing pipelines.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Dataset Name</Label>
                <Input id="name" placeholder="e.g. RAF-DB Subset" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modality">Modality</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select modality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMAGE">Image (Face)</SelectItem>
                    <SelectItem value="AUDIO">Audio (Speech)</SelectItem>
                    <SelectItem value="TEXT">Text (NLP)</SelectItem>
                    <SelectItem value="VIDEO">Video (Multimodal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>File / Archive</Label>
              <div className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors border-muted-foreground/25 flex flex-col items-center justify-center gap-2 cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to browse or drag and drop</p>
                <p className="text-xs text-muted-foreground">Supports .zip, .tar.gz, .csv, and media files</p>
              </div>
            </div>
            
            {isUploading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Uploading & Validating...</span>
                  <span className="font-bold">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </motion.div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleUpload} disabled={isUploading} className="w-full">
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {isUploading ? "Processing..." : "Upload & Preprocess"}
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Available Datasets</h2>
          <div className="grid gap-4">
            {MOCK_DATASETS.map((dataset, i) => (
              <motion.div 
                key={dataset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-md">
                        {getModalityIcon(dataset.modality)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{dataset.name}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-2 mt-1">
                          <span>{dataset.size}</span>
                          <span>•</span>
                          <span>{dataset.version}</span>
                          <span>•</span>
                          <span>{dataset.date}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={dataset.status === "READY" ? "default" : "secondary"}>
                      {dataset.status}
                    </Badge>
                  </CardHeader>
                  {dataset.progress && (
                    <div className="px-4 pb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Preprocessing Pipeline</span>
                        <span>{dataset.progress}%</span>
                      </div>
                      <Progress value={dataset.progress} className="h-1" />
                    </div>
                  )}
                  <CardFooter className="p-4 pt-0 flex gap-2 justify-end">
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-3 w-3" /> Config
                    </Button>
                    <Button size="sm" disabled={dataset.status !== "READY"}>
                      <PlayCircle className="mr-2 h-3 w-3" /> Train
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pipeline Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Active Jobs</span>
              <Badge variant="outline">2 Running</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Storage Used</span>
              <span className="font-medium">18.7 GB / 50 GB</span>
            </div>
            <Progress value={37} className="h-2" />
          </CardContent>
        </Card>
        
        <Card className="bg-primary text-primary-foreground border-none">
          <CardHeader>
            <CardTitle className="text-lg">Need larger datasets?</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Connect external cloud buckets (AWS S3, GCP) to stream datasets directly into the training pipeline.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="secondary" className="w-full">Configure Integrations</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
