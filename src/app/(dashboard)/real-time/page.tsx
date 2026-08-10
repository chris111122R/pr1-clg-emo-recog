import { RealTimeFeed } from "@/components/dashboard/RealTimeFeed"

export default function RealTimePage() {
  return (
    <div className="flex flex-col gap-6 p-8 w-full max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Real-Time Feed</h1>
        <p className="text-muted-foreground mt-2">
          Instantly analyze facial expressions using in-browser machine learning via your webcam.
        </p>
      </div>
      <RealTimeFeed />
    </div>
  )
}
