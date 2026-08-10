"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Play, Pause, Square, Save, Download, Activity, Cpu, Network, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Deterministic pseudo-random number generator for purity
function getDeterministicRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export function TrainingManager() {
  const [isTraining, setIsTraining] = React.useState(false)
  const [epoch, setEpoch] = React.useState(0)
  const [loss, setLoss] = React.useState(1.42)
  const [accuracy, setAccuracy] = React.useState(45.2)

  const handleStartTraining = () => {
    setIsTraining(true)
    let currentEpoch = 0
    let currentLoss = 1.42
    let currentAcc = 45.2
    
    const interval = setInterval(() => {
      currentEpoch += 1
      currentLoss = Math.max(0.1, currentLoss - (Math.random() * 0.1))
      currentAcc = Math.min(99.5, currentAcc + (Math.random() * 2))
      
      setEpoch(currentEpoch)
      setLoss(currentLoss)
      setAccuracy(currentAcc)

      if (currentEpoch >= 50) {
        clearInterval(interval)
        setIsTraining(false)
      }
    }, 1000)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Configuration Panel */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Job Configuration</CardTitle>
            <CardDescription>Setup your model architecture and hyperparams.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Dataset</label>
              <Select defaultValue="1">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">AffectNet-HQ (Image)</SelectItem>
                  <SelectItem value="2">IEMOCAP-Audio (Audio)</SelectItem>
                  <SelectItem value="3">GoEmotions (Text)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Model Architecture</label>
              <Select defaultValue="resnet50">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="resnet50">ResNet50 (Vision)</SelectItem>
                  <SelectItem value="efficientnet">EfficientNet (Vision)</SelectItem>
                  <SelectItem value="wav2vec2">Wav2Vec2 (Speech)</SelectItem>
                  <SelectItem value="bert">BERT (Text)</SelectItem>
                  <SelectItem value="fusion">Multimodal Attention Fusion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hyperparameters</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Learning Rate</label>
                  <Select defaultValue="1e-4">
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1e-3">1e-3</SelectItem>
                      <SelectItem value="1e-4">1e-4</SelectItem>
                      <SelectItem value="1e-5">1e-5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Batch Size</label>
                  <Select defaultValue="32">
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16">16</SelectItem>
                      <SelectItem value="32">32</SelectItem>
                      <SelectItem value="64">64</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Epochs</label>
                  <Select defaultValue="50">
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Optimizer</label>
                  <Select defaultValue="adamw">
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adamw">AdamW</SelectItem>
                      <SelectItem value="sgd">SGD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleStartTraining} disabled={isTraining} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              <Play className="mr-2 h-4 w-4" /> Start Training Job
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Metrics & Control Panel */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-primary/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Cpu className="w-32 h-32" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl">Training Monitor</CardTitle>
              <CardDescription>Real-time metrics from the GPU cluster</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" disabled={!isTraining}><Pause className="h-4 w-4" /></Button>
              <Button size="icon" variant="destructive" disabled={!isTraining}><Square className="h-4 w-4" /></Button>
              <Button size="icon" variant="secondary" disabled={isTraining && epoch === 0}><Save className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 mt-4">
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1 p-4 bg-muted/40 rounded-xl border">
                <span className="text-xs text-muted-foreground font-medium uppercase">Epoch</span>
                <span className="text-3xl font-bold tracking-tighter">{epoch}<span className="text-base font-normal text-muted-foreground">/50</span></span>
              </div>
              <div className="flex flex-col gap-1 p-4 bg-muted/40 rounded-xl border">
                <span className="text-xs text-muted-foreground font-medium uppercase">Validation Loss</span>
                <span className="text-3xl font-bold tracking-tighter text-amber-500">{loss.toFixed(4)}</span>
              </div>
              <div className="flex flex-col gap-1 p-4 bg-muted/40 rounded-xl border">
                <span className="text-xs text-muted-foreground font-medium uppercase">Accuracy</span>
                <span className="text-3xl font-bold tracking-tighter text-green-500">{accuracy.toFixed(2)}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{(epoch / 50 * 100).toFixed(0)}%</span>
              </div>
              <Progress value={(epoch / 50) * 100} className="h-2 bg-muted/50" />
            </div>

          </CardContent>
        </Card>

        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="logs">Live Logs</TabsTrigger>
            <TabsTrigger value="checkpoints">Checkpoints & Export</TabsTrigger>
          </TabsList>
          <TabsContent value="logs">
            <Card>
              <CardContent className="p-0">
                <div className="bg-zinc-950 text-zinc-300 font-mono text-xs p-4 h-64 overflow-y-auto rounded-b-xl leading-relaxed">
                  {epoch === 0 ? (
                    <div className="text-zinc-600">Waiting for job to start...</div>
                  ) : (
                    Array.from({ length: epoch }).map((_, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                        <span className="text-zinc-500">[{new Date().toISOString().split('T')[1].slice(0,8)}]</span> INFO: Epoch {i+1}/50 - loss: {(loss + getDeterministicRandom(i)*0.1).toFixed(4)} - val_loss: {loss.toFixed(4)} - val_acc: {(accuracy - getDeterministicRandom(i + 1)).toFixed(2)}
                      </motion.div>
                    ))
                  )}
                  {isTraining && (
                    <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      <span className="text-indigo-400">Processing next batch...</span>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="checkpoints">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Database className="text-muted-foreground h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">checkpoint_epoch_25.pt</p>
                      <p className="text-xs text-muted-foreground">Val Acc: 89.4% • 124 MB</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-2" /> Export</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Database className="text-muted-foreground h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">checkpoint_best.pt</p>
                      <p className="text-xs text-muted-foreground">Val Acc: 94.2% • 124 MB</p>
                    </div>
                  </div>
                  <Button size="sm" variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-white"><Download className="h-4 w-4 mr-2" /> Export Best</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
