"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  UploadCloud, File as FileIcon, X, CheckCircle2, AlertCircle, FileType, Columns, Database
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface UploadFile {
  id: string
  name: string
  size: string
  progress: number
  status: "uploading" | "validating" | "success" | "error"
  errorMsg?: string
}

export default function DataUploadPage() {
  const [isDragging, setIsDragging] = React.useState(false)
  const [files, setFiles] = React.useState<UploadFile[]>([])

  // Simulate an upload process
  const simulateUpload = () => {
    const newFiles: UploadFile[] = [
      { id: "f1", name: "clinical_audio_batch_01.wav", size: "245 MB", progress: 0, status: "uploading" },
      { id: "f2", name: "metadata_labels_v2.csv", size: "1.2 MB", progress: 0, status: "uploading" },
      { id: "f3", name: "corrupted_video.mp4", size: "850 MB", progress: 0, status: "uploading" },
    ]
    setFiles(newFiles)

    // Simulate progress
    newFiles.forEach((file, idx) => {
      let prog = 0
      const interval = setInterval(() => {
        prog += Math.random() * 15
        if (prog >= 100) {
          prog = 100
          clearInterval(interval)
          setFiles(current => current.map(f => {
            if (f.id === file.id) {
              if (f.id === "f3") return { ...f, progress: 100, status: "error", errorMsg: "Format validation failed: unexpected EOF" }
              return { ...f, progress: 100, status: "validating" }
            }
            return f
          }))
          
          // Move from validating to success after a delay
          if (file.id !== "f3") {
            setTimeout(() => {
              setFiles(current => current.map(f => f.id === file.id ? { ...f, status: "success" } : f))
            }, 1500 + idx * 500)
          }
        } else {
          setFiles(current => current.map(f => f.id === file.id ? { ...f, progress: prog } : f))
        }
      }, 300 + idx * 100)
    })
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Upload</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload raw assets or structured labels for model processing.</p>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 bg-card"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (files.length === 0) simulateUpload() }}
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <UploadCloud className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Drag and drop files here</h3>
        <p className="text-sm text-muted-foreground mb-6">Supports CSV, JSON, MP4, WAV, and JPEG formats up to 50GB.</p>
        <Button onClick={() => { if (files.length === 0) simulateUpload() }}>
          Browse Files
        </Button>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Upload Queue</h3>
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {files.map(file => (
                  <div key={file.id} className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground shrink-0">{file.size}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Progress 
                            value={file.progress} 
                            className={`h-1.5 ${file.status === "error" ? "[&>div]:bg-destructive" : ""}`} 
                          />
                        </div>
                        <span className="text-[10px] font-medium w-16 text-right uppercase tracking-wider text-muted-foreground">
                          {file.status}
                        </span>
                      </div>

                      {file.status === "error" && (
                        <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {file.errorMsg}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center justify-center w-8">
                      {file.status === "success" && <CheckCircle2 className="h-5 w-5 text-success" />}
                      {file.status === "error" && <X className="h-5 w-5 text-destructive cursor-pointer hover:bg-destructive/10 rounded-full p-0.5" />}
                      {file.status === "uploading" && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground">
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {files.some(f => f.status === "success") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Schema Preview: metadata_labels_v2.csv
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium border-b border-r"><Columns className="h-3 w-3 inline mr-1"/>ID</th>
                        <th className="px-3 py-2 text-left font-medium border-b border-r"><FileType className="h-3 w-3 inline mr-1"/>Valence</th>
                        <th className="px-3 py-2 text-left font-medium border-b border-r"><FileType className="h-3 w-3 inline mr-1"/>Arousal</th>
                        <th className="px-3 py-2 text-left font-medium border-b"><FileType className="h-3 w-3 inline mr-1"/>Label</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-mono text-xs">
                      {[
                        { id: "S001", v: "0.45", a: "0.82", l: "Joy" },
                        { id: "S002", v: "-0.71", a: "0.65", l: "Anger" },
                        { id: "S003", v: "0.12", a: "0.33", l: "Neutral" },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-muted/30">
                          <td className="px-3 py-2 border-r">{row.id}</td>
                          <td className="px-3 py-2 border-r">{row.v}</td>
                          <td className="px-3 py-2 border-r">{row.a}</td>
                          <td className="px-3 py-2">{row.l}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button className="gap-2">Complete Import</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
