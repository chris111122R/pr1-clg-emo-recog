import * as React from "react"
import { CodeBlock } from "@/components/docs/CodeBlock"
import { Badge } from "@/components/ui/badge"

export default function InferenceAPI() {
  return (
    <div className="flex flex-col xl:flex-row gap-12 relative items-start">
      {/* Main Content (Left) */}
      <div className="flex-1 min-w-0 max-w-3xl space-y-10">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="text-primary font-medium">API Reference</span>
            <span>/</span>
            <span>Inference</span>
          </div>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight mb-4">
            Create Inference Job
          </h1>
          <p className="text-lg text-muted-foreground">
            Submit a video file or stream for asynchronous emotion and FACS analysis.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 border-b pb-4">
            <Badge variant="default" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-sm font-mono px-2 rounded">
              POST
            </Badge>
            <span className="font-mono text-sm">/v1/inference/jobs</span>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold tracking-tight border-b pb-2">Request Parameters</h2>
          
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Parameter</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-4 font-mono text-foreground font-medium align-top">
                    workspaceId <span className="text-destructive text-xs ml-1">required</span>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground align-top">string</td>
                  <td className="px-4 py-4 align-top leading-relaxed">
                    The ID of the workspace. Determines which digital twin models are available.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-4 font-mono text-foreground font-medium align-top">
                    mediaUrl
                  </td>
                  <td className="px-4 py-4 text-muted-foreground align-top">string</td>
                  <td className="px-4 py-4 align-top leading-relaxed">
                    A publicly accessible URL to the video file. If not provided, you must provide <code className="text-xs bg-muted p-0.5 rounded">fileId</code>.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-4 font-mono text-foreground font-medium align-top">
                    models
                  </td>
                  <td className="px-4 py-4 text-muted-foreground align-top">array</td>
                  <td className="px-4 py-4 align-top leading-relaxed">
                    List of models to run. Options: <code className="text-xs bg-muted p-0.5 rounded">facs_v2</code>, <code className="text-xs bg-muted p-0.5 rounded">emotion_base</code>, <code className="text-xs bg-muted p-0.5 rounded">valence_arousal</code>. Default runs all.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold tracking-tight border-b pb-2">Response Attributes</h2>
          
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Attribute</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-4 font-mono text-foreground font-medium align-top">id</td>
                  <td className="px-4 py-4 text-muted-foreground align-top">string</td>
                  <td className="px-4 py-4 align-top">Unique identifier for the inference job.</td>
                </tr>
                <tr>
                  <td className="px-4 py-4 font-mono text-foreground font-medium align-top">status</td>
                  <td className="px-4 py-4 text-muted-foreground align-top">string</td>
                  <td className="px-4 py-4 align-top">
                    Current status of the job. One of: <code className="text-xs bg-muted p-0.5 rounded">queued</code>, <code className="text-xs bg-muted p-0.5 rounded">processing</code>, <code className="text-xs bg-muted p-0.5 rounded">completed</code>, <code className="text-xs bg-muted p-0.5 rounded">failed</code>.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Code Examples (Right Panel - Sticky) */}
      <div className="w-full xl:w-[400px] 2xl:w-[500px] shrink-0 space-y-6 xl:sticky xl:top-24">
        <div>
          <h3 className="text-sm font-semibold tracking-tight mb-3">Example Request</h3>
          <CodeBlock
            language="bash"
            code={`curl -X POST https://api.ua-edt.ai/v1/inference/jobs \\
  -H "Authorization: Bearer sk_test_123..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "workspaceId": "ws_982390a",
    "mediaUrl": "https://example.com/session-01.mp4",
    "models": ["facs_v2", "emotion_base"]
  }'`}
          />
        </div>
        
        <div>
          <h3 className="text-sm font-semibold tracking-tight mb-3">Example Response</h3>
          <CodeBlock
            language="json"
            code={`{
  "id": "job_01h8x9",
  "object": "inference_job",
  "status": "queued",
  "workspaceId": "ws_982390a",
  "createdAt": "2024-03-12T10:24:00Z",
  "estimatedCompletionTime": 120
}`}
          />
        </div>
      </div>
    </div>
  )
}
