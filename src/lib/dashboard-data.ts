// Mock data for the UA-EDT Dashboard — all realistic, domain-specific

export const MOCK_USER = {
  name: "Dr. Jane Doe",
  firstName: "Jane",
  email: "jane.doe@stanford.edu",
  tier: "Clinical Trial",
  avatar: "JD",
}

// Sparkline generators
function makeSpark(base: number, len = 12, variance = 0.15) {
  return Array.from({ length: len }, (_, i) => ({
    i,
    v: Math.round(base * (1 + (Math.random() - 0.5) * variance)),
  }))
}

export const STAT_CARDS = [
  {
    id: "models",
    title: "Active Models",
    value: 7,
    display: "7",
    unit: "",
    delta: "+2 vs yesterday",
    deltaPositive: true,
    spark: makeSpark(6),
    icon: "BrainCircuit",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    id: "datasets",
    title: "Sessions Processed",
    value: 1204,
    display: "1,204",
    unit: " today",
    delta: "+18% vs avg",
    deltaPositive: true,
    spark: makeSpark(1100, 12, 0.2),
    icon: "Activity",
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    id: "confidence",
    title: "Avg. Confidence",
    value: 96.2,
    display: "96.2",
    unit: "%",
    delta: "+1.4pts this week",
    deltaPositive: true,
    spark: makeSpark(94, 12, 0.05),
    icon: "ShieldCheck",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    id: "alerts",
    title: "Active Alerts",
    value: 3,
    display: "3",
    unit: "",
    delta: "2 critical",
    deltaPositive: false,
    spark: makeSpark(2, 12, 0.8),
    icon: "AlertTriangle",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
]

export const PREDICTION_VOLUME = [
  { time: "00:00", sessions: 34, confidence: 94.1 },
  { time: "02:00", sessions: 18, confidence: 95.5 },
  { time: "04:00", sessions: 12, confidence: 96.2 },
  { time: "06:00", sessions: 47, confidence: 93.8 },
  { time: "08:00", sessions: 98, confidence: 94.9 },
  { time: "10:00", sessions: 156, confidence: 96.7 },
  { time: "12:00", sessions: 201, confidence: 97.1 },
  { time: "14:00", sessions: 188, confidence: 96.3 },
  { time: "16:00", sessions: 220, confidence: 95.8 },
  { time: "18:00", sessions: 174, confidence: 96.9 },
  { time: "20:00", sessions: 89, confidence: 97.4 },
  { time: "22:00", sessions: 67, confidence: 96.8 },
]

export const CONFIDENCE_GAUGES = [
  {
    label: "Multimodal Fusion",
    aleatoric: 4.2,
    epistemic: 1.8,
    mean: 96.2,
    color: "hsl(var(--primary))",
  },
  {
    label: "Audio Prosody",
    aleatoric: 6.1,
    epistemic: 2.9,
    mean: 91.5,
    color: "hsl(var(--info))",
  },
  {
    label: "Facial FACS",
    aleatoric: 3.4,
    epistemic: 1.2,
    mean: 97.8,
    color: "hsl(var(--success))",
  },
  {
    label: "Text Sentiment",
    aleatoric: 8.7,
    epistemic: 4.3,
    mean: 87.1,
    color: "hsl(var(--warning))",
  },
]

export const SYSTEM_HEALTH = {
  uptime: 99.97,
  queueLength: 8,
  queueMax: 50,
  gpuLoad: 67,
  inferenceLatency: 42,
  latencyTarget: 50,
  status: "online" as "online" | "processing" | "degraded",
  activeNodes: 4,
  totalNodes: 4,
}

export const RECENT_REPORTS = [
  {
    id: "RPT-0091",
    title: "Weekly Emotion Trend Analysis",
    subject: "Cohort A (n=42)",
    status: "ready",
    generatedAt: "2 hours ago",
    size: "4.2 MB",
  },
  {
    id: "RPT-0090",
    title: "Session S-007 Deep Analysis",
    subject: "Participant 012",
    status: "ready",
    generatedAt: "5 hours ago",
    size: "1.8 MB",
  },
  {
    id: "RPT-0089",
    title: "Model Uncertainty Audit",
    subject: "Multimodal Fusion v2.4.1",
    status: "processing",
    generatedAt: "In progress",
    size: "—",
  },
  {
    id: "RPT-0088",
    title: "Cross-Session Valence Drift",
    subject: "Study Group B",
    status: "ready",
    generatedAt: "Yesterday",
    size: "6.1 MB",
  },
]

export const ACTIVITY_FEED = [
  {
    id: "a1",
    title: "Batch inference completed",
    description: "224 sessions analysed in 18m 42s. Avg. confidence: 96.2%.",
    timestamp: "2 min ago",
    status: "success" as const,
  },
  {
    id: "a2",
    title: "New dataset uploaded",
    description: "AffectNet-Subset-C (2,048 annotated clips) ready for training.",
    timestamp: "34 min ago",
    status: "info" as const,
  },
  {
    id: "a3",
    title: "Low-confidence segment flagged",
    description: "Session S-006 segment 03:14–03:28 fell below 70% epistemic threshold.",
    timestamp: "1 hr ago",
    status: "warning" as const,
  },
  {
    id: "a4",
    title: "Digital Twin generated",
    description: "Participant 012 twin exported with full FACS attribution map.",
    timestamp: "2 hr ago",
    status: "success" as const,
  },
  {
    id: "a5",
    title: "Model checkpoint saved",
    description: "Multimodal Fusion v2.4.1 weights backed up to secure storage.",
    timestamp: "3 hr ago",
    status: "default" as const,
  },
]

export const NOTIFICATIONS = [
  {
    id: "n1",
    title: "Critical: GPU Node 3 Memory High",
    body: "Node 3 is operating at 94% VRAM. Recommend load balancing.",
    type: "warning",
    read: false,
  },
  {
    id: "n2",
    title: "Report RPT-0091 Ready",
    body: "Your weekly trend analysis is available for download.",
    type: "success",
    read: false,
  },
  {
    id: "n3",
    title: "New Team Member Joined",
    body: "Dr. Marcus Webb has accepted your workspace invitation.",
    type: "info",
    read: true,
  },
]

export function getTimeGreeting(): string {
  const h = new Date().getHours()
  if (h < 5) return "Good night"
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}
