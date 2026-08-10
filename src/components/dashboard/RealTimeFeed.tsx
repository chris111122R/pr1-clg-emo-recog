"use client"

import React, { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Camera, Loader2, VideoOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import * as faceapi from "@vladmandic/face-api"

export function RealTimeFeed() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingMsg, setLoadingMsg] = useState("Loading AI models...")

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Load tiny models from unpkg CDN to avoid needing local static files
        const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/"
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ])
        setIsModelLoaded(true)
        setLoadingMsg("Models ready!")
      } catch (e: any) {
        setError(`Failed to load models: ${e.message}`)
      }
    }
    loadModels()
  }, [])

  const startVideo = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (e: any) {
      setError(`Unable to access webcam: ${e.message}`)
    }
  }

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
      // Clear canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }

  const handleVideoPlay = () => {
    if (!videoRef.current || !canvasRef.current || !isModelLoaded) return

    const video = videoRef.current
    const canvas = canvasRef.current
    
    // Set canvas dimensions to match video
    const displaySize = { width: video.videoWidth || 640, height: video.videoHeight || 480 }
    faceapi.matchDimensions(canvas, displaySize)

    const intervalId = setInterval(async () => {
      if (video.paused || video.ended) {
        clearInterval(intervalId)
        return
      }
      
      try {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions()

        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          faceapi.draw.drawDetections(canvas, resizedDetections)
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
        }
      } catch (err) {
        console.error("Detection error:", err)
      }
    }, 100) // ~10fps to save CPU, could go lower for 30fps

    // Cleanup on unmount or stop
    return () => clearInterval(intervalId)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Browser Emotion Tracking</CardTitle>
        <CardDescription>
          Uses WebGL and your local hardware. No video is ever sent to the cloud.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center">
          <div className="relative rounded-lg overflow-hidden border bg-black w-full max-w-3xl aspect-video flex items-center justify-center">
            {!isStreaming && (
              <div className="absolute flex flex-col items-center justify-center text-muted-foreground z-10">
                <VideoOff className="h-12 w-12 mb-4 opacity-50" />
                <p>Webcam is currently off</p>
                {!isModelLoaded && (
                  <p className="text-sm mt-2 animate-pulse">{loadingMsg}</p>
                )}
              </div>
            )}
            
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onPlay={handleVideoPlay}
              className={`w-full h-full object-cover ${!isStreaming ? "opacity-0" : "opacity-100"}`}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {!isStreaming ? (
            <Button onClick={startVideo} disabled={!isModelLoaded} className="gap-2">
              {!isModelLoaded ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              Start Camera
            </Button>
          ) : (
            <Button onClick={stopVideo} variant="destructive" className="gap-2">
              <VideoOff className="h-4 w-4" />
              Stop Camera
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
