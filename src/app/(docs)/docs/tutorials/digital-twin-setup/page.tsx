import * as React from "react"
import { TableOfContents } from "@/components/docs/TableOfContents"
import { CodeBlock } from "@/components/docs/CodeBlock"

export default function DigitalTwinSetup() {
  const tocItems = [
    { id: "prerequisites", text: "Prerequisites", level: 2 },
    { id: "step-1-create-workspace", text: "Step 1: Create a Workspace", level: 2 },
    { id: "step-2-upload-baseline", text: "Step 2: Upload Baseline Video", level: 2 },
    { id: "step-3-run-calibration", text: "Step 3: Run Calibration", level: 2 },
    { id: "next-steps", text: "Next Steps", level: 2 },
  ]

  return (
    <>
      <div className="max-w-3xl space-y-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="text-primary font-medium">Tutorials</span>
            <span>/</span>
            <span>Digital Twin Setup</span>
          </div>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight mb-4">
            Setting up a Digital Twin
          </h1>
          <p className="text-xl text-muted-foreground">
            A step-by-step guide to capturing and configuring a patient's digital twin model for emotion tracking.
          </p>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <h2 id="prerequisites" className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10 mb-4">
            Prerequisites
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-6 text-muted-foreground">
            <li>An active UA-EDT account with Researcher or Clinician role.</li>
            <li>A high-quality baseline video (1080p, 60fps recommended) of the subject showing neutral expressions.</li>
            <li>API credentials if using the CLI workflow.</li>
          </ul>

          <h2 id="step-1-create-workspace" className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10 mb-4">
            Step 1: Create a Workspace
          </h2>
          <p className="leading-7 mb-4">
            Workspaces isolate digital twins and their associated sessions. Start by creating a new workspace via the dashboard or using the API.
          </p>
          
          <CodeBlock
            language="bash"
            code={`curl -X POST https://api.ua-edt.ai/v1/workspaces \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"name": "Patient 402 - Trial A", "description": "Baseline setup"}'`}
          />

          <div className="my-8 rounded-lg overflow-hidden border bg-muted/30 p-1 flex items-center justify-center min-h-[300px]">
            <span className="text-muted-foreground text-sm flex items-center gap-2">
              <span className="h-4 w-4 block rounded-full border-2 border-muted-foreground" />
              Placeholder: Screenshot of the Workspace Creation Modal
            </span>
          </div>

          <h2 id="step-2-upload-baseline" className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10 mb-4">
            Step 2: Upload Baseline Video
          </h2>
          <p className="leading-7 mb-4">
            The digital twin relies on a baseline video to calibrate individual muscle and expression nuances (FACS). Upload your prepared video.
          </p>

          <CodeBlock
            language="typescript"
            code={`import { UAEDTClient } from '@ua-edt/sdk';

const client = new UAEDTClient(process.env.UA_API_KEY);

const upload = await client.media.uploadBaseline({
  workspaceId: "ws_982390a",
  filePath: "./data/patient402_neutral.mp4",
  format: "mp4"
});

console.log(\`Upload successful: \${upload.id}\`);`}
          />

          <h2 id="step-3-run-calibration" className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10 mb-4">
            Step 3: Run Calibration
          </h2>
          <p className="leading-7 mb-4">
            Once uploaded, trigger the calibration job. The multimodal pipeline will analyze the video and build the underlying tensor representation.
          </p>
          <div className="bg-warning/10 border border-warning/20 text-warning px-4 py-3 rounded-md mb-6 flex gap-3 text-sm">
            <span className="font-bold text-lg leading-none">!</span>
            <p>Calibration can take up to 5 minutes depending on the video length. Do not close the session if running via WebSockets.</p>
          </div>

          <h2 id="next-steps" className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10 mb-4">
            Next Steps
          </h2>
          <p className="leading-7 mb-4">
            Your digital twin is now ready. You can now start live video inference or run batch analysis against this twin.
          </p>
        </div>
      </div>
      
      {/* Table of Contents Overlay */}
      <div className="hidden xl:block absolute right-0 top-8 w-64 pt-8">
        <div className="sticky top-24">
          <TableOfContents items={tocItems} />
        </div>
      </div>
    </>
  )
}
