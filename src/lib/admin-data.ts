// ─── Admin Mock Data — UA-EDT Platform ───────────────────────────────────────

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "super_admin" | "admin" | "researcher" | "clinician" | "viewer"
export type UserStatus = "active" | "suspended" | "pending" | "inactive"

export interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastLogin: string
  joinedAt: string
  initials: string
  org: string
  mfaEnabled: boolean
}

export type LogSeverity = "critical" | "error" | "warning" | "info" | "debug"

export interface LogEntry {
  id: string
  timestamp: string
  severity: LogSeverity
  service: string
  message: string
  details: string
  traceId: string
  userId?: string
  ip?: string
}

export type ModelStatus = "deployed" | "staging" | "deprecated" | "failed"

export interface AdminModel {
  id: string
  name: string
  version: string
  status: ModelStatus
  deployedAt: string
  inferenceLatency: number
  accuracy: number
  size: string
  framework: string
  description: string
  trainedOn: string
}

export type AccessLevel = "public" | "restricted" | "private"
export type DatasetStatus = "ready" | "processing" | "archived"

export interface AdminDataset {
  id: string
  name: string
  type: string
  org: string
  sizeLabel: string
  sizeBytes: number
  maxBytes: number
  records: number
  access: AccessLevel
  status: DatasetStatus
  createdAt: string
  owner: string
  modalities: string[]
}

export type ThreatSeverity = "critical" | "high" | "medium" | "low"
export type ThreatStatus = "active" | "resolved" | "investigating"

export interface SecurityThreat {
  id: string
  type: string
  severity: ThreatSeverity
  source: string
  timestamp: string
  status: ThreatStatus
  description: string
}

export interface IPEntry {
  id: string
  ip: string
  type: "allow" | "block"
  reason: string
  addedAt: string
  addedBy: string
}

export type AuditResult = "success" | "failure" | "pending"

export interface AuditEntry {
  id: string
  timestamp: string
  actor: string
  actorRole: UserRole
  action: string
  resource: string
  ip: string
  result: AuditResult
  details: string
}

export interface Permission {
  id: string
  group: string
  label: string
  description: string
}

export interface AdminRole {
  id: string
  name: string
  description: string
  userCount: number
  color: string
  isSystem: boolean
}

export interface FeatureFlag {
  id: string
  label: string
  description: string
  enabled: boolean
  env: "all" | "prod" | "staging"
}

export interface RateLimit {
  id: string
  label: string
  description: string
  value: number
  unit: string
  min: number
  max: number
}

// ─── Roles & Permissions ──────────────────────────────────────────────────────

export const ADMIN_ROLES: AdminRole[] = [
  { id: "super_admin", name: "Super Admin",  description: "Full system access, cannot be restricted", userCount: 2,  color: "text-destructive", isSystem: true  },
  { id: "admin",       name: "Admin",        description: "Manage users, models, and system settings", userCount: 5,  color: "text-warning",     isSystem: true  },
  { id: "researcher",  name: "Researcher",   description: "Run sessions, view analytics, export data", userCount: 18, color: "text-primary",     isSystem: false },
  { id: "clinician",   name: "Clinician",    description: "View sessions and reports, no data export", userCount: 24, color: "text-success",     isSystem: false },
  { id: "viewer",      name: "Viewer",       description: "Read-only access to approved resources",   userCount: 11, color: "text-info",        isSystem: false },
]

export const PERMISSIONS: Permission[] = [
  { id: "view_dashboard",  group: "Core",      label: "View Dashboard",       description: "Access the main dashboard" },
  { id: "view_help",       group: "Core",      label: "Access Documentation", description: "View docs and help" },
  { id: "invite_users",    group: "Users",     label: "Invite Users",         description: "Send email invitations" },
  { id: "manage_users",    group: "Users",     label: "Manage Users",         description: "Edit roles, suspend, delete users" },
  { id: "view_sessions",   group: "Sessions",  label: "View Sessions",        description: "List and open analysis sessions" },
  { id: "run_inference",   group: "Sessions",  label: "Run Inference",        description: "Start AI inference sessions" },
  { id: "delete_sessions", group: "Sessions",  label: "Delete Sessions",      description: "Remove analysis sessions" },
  { id: "view_datasets",   group: "Data",      label: "View Datasets",        description: "Browse the dataset library" },
  { id: "upload_datasets", group: "Data",      label: "Upload Datasets",      description: "Add new datasets" },
  { id: "manage_datasets", group: "Data",      label: "Manage Datasets",      description: "Edit access, archive datasets" },
  { id: "export_data",     group: "Data",      label: "Export Data",          description: "Download data and reports" },
  { id: "view_analytics",  group: "Analytics", label: "View Analytics",       description: "Access analytics dashboards" },
  { id: "view_reports",    group: "Analytics", label: "Generate Reports",     description: "Create and export reports" },
  { id: "view_models",     group: "Models",    label: "View Models",          description: "See model registry" },
  { id: "manage_models",   group: "Models",    label: "Manage Models",        description: "Edit model configuration" },
  { id: "deploy_models",   group: "Models",    label: "Deploy / Rollback",    description: "Deploy or rollback model versions" },
  { id: "view_logs",       group: "System",    label: "View System Logs",     description: "Access operational logs" },
  { id: "view_audit",      group: "System",    label: "View Audit Logs",      description: "Read immutable audit trail" },
  { id: "manage_api_keys", group: "System",    label: "Manage API Keys",      description: "Create and revoke API keys" },
  { id: "manage_settings", group: "System",    label: "System Configuration", description: "Modify global settings" },
  { id: "system_admin",    group: "Admin",     label: "System Administration",description: "Full admin capability" },
]

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: PERMISSIONS.map(p => p.id),
  admin: ["view_dashboard","view_help","invite_users","manage_users","view_sessions","run_inference","delete_sessions","view_datasets","upload_datasets","manage_datasets","export_data","view_analytics","view_reports","view_models","manage_models","deploy_models","view_logs","view_audit","manage_api_keys","manage_settings"],
  researcher: ["view_dashboard","view_help","view_sessions","run_inference","view_datasets","upload_datasets","export_data","view_analytics","view_reports","view_models"],
  clinician:  ["view_dashboard","view_help","view_sessions","view_datasets","view_analytics","view_reports"],
  viewer:     ["view_dashboard","view_help","view_sessions","view_analytics"],
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const ADMIN_USERS: AdminUser[] = [
  { id: "u1",  name: "Dr. Sarah Chen",       email: "s.chen@stanford.edu",      role: "super_admin", status: "active",    lastLogin: "2 min ago",    joinedAt: "2024-01-15", initials: "SC", org: "Stanford AI Lab",      mfaEnabled: true  },
  { id: "u2",  name: "Prof. Marcus Webb",    email: "m.webb@stanford.edu",      role: "super_admin", status: "active",    lastLogin: "1 hr ago",     joinedAt: "2024-01-15", initials: "MW", org: "Stanford AI Lab",      mfaEnabled: true  },
  { id: "u3",  name: "Dr. Jane Doe",         email: "jane.doe@stanford.edu",    role: "admin",       status: "active",    lastLogin: "Just now",     joinedAt: "2024-02-10", initials: "JD", org: "Clinical Research",    mfaEnabled: true  },
  { id: "u4",  name: "Dr. Aiko Tanaka",      email: "a.tanaka@partners.org",    role: "admin",       status: "active",    lastLogin: "3 hr ago",     joinedAt: "2024-03-05", initials: "AT", org: "Partners HealthCare",  mfaEnabled: true  },
  { id: "u5",  name: "Ravi Patel",           email: "r.patel@neurology.edu",    role: "researcher",  status: "active",    lastLogin: "Yesterday",    joinedAt: "2024-04-12", initials: "RP", org: "Neurology Dept",       mfaEnabled: false },
  { id: "u6",  name: "Emma Wilson",          email: "e.wilson@psych.org",       role: "researcher",  status: "active",    lastLogin: "2 days ago",   joinedAt: "2024-04-18", initials: "EW", org: "Psych Institute",      mfaEnabled: true  },
  { id: "u7",  name: "Dr. Luis Morales",     email: "l.morales@clinic.net",     role: "clinician",   status: "active",    lastLogin: "4 hr ago",     joinedAt: "2024-05-01", initials: "LM", org: "Metro Clinic",         mfaEnabled: true  },
  { id: "u8",  name: "Priya Sharma",         email: "p.sharma@research.io",     role: "researcher",  status: "suspended", lastLogin: "3 weeks ago",  joinedAt: "2024-05-14", initials: "PS", org: "Research Collective",  mfaEnabled: false },
  { id: "u9",  name: "Dr. Oliver Grant",     email: "o.grant@stanford.edu",     role: "clinician",   status: "active",    lastLogin: "1 day ago",    joinedAt: "2024-06-03", initials: "OG", org: "Stanford Medical",     mfaEnabled: true  },
  { id: "u10", name: "Sophie Laurent",       email: "s.laurent@eu-research.eu", role: "viewer",      status: "pending",   lastLogin: "Never",        joinedAt: "2024-07-01", initials: "SL", org: "EU Research Hub",      mfaEnabled: false },
  { id: "u11", name: "James Okafor",         email: "j.okafor@africa-ai.org",   role: "researcher",  status: "active",    lastLogin: "6 hr ago",     joinedAt: "2024-06-20", initials: "JO", org: "Africa AI Initiative", mfaEnabled: false },
  { id: "u12", name: "Dr. Fatima Al-Rashid", email: "f.rashid@mena.med",        role: "clinician",   status: "inactive",  lastLogin: "2 months ago", joinedAt: "2024-03-30", initials: "FA", org: "MENA Medical",         mfaEnabled: true  },
]

// ─── System Logs ──────────────────────────────────────────────────────────────

export const SYSTEM_LOGS: LogEntry[] = [
  { id: "L001", timestamp: "2026-07-19 20:31:02", severity: "critical", service: "InferenceEngine", message: "GPU Node 3 VRAM exhausted — inference queue stalled",           details: "Node 3 reached 99.4% VRAM utilization. Automatic failover to Node 1 initiated. 12 queued sessions delayed by ~90s. Node 3 restarted after cache flush.", traceId: "tr-9af2c1", userId: "system", ip: "10.0.3.3" },
  { id: "L002", timestamp: "2026-07-19 20:18:44", severity: "error",    service: "DataPipeline",    message: "Dataset AffectNet-C validation checksum mismatch",               details: "Expected SHA-256: 8a7f2c… Got: 3d91fa… Upload rejected. Source file may be corrupted. User notified.", traceId: "tr-3b12e8", userId: "u5", ip: "192.168.1.44" },
  { id: "L003", timestamp: "2026-07-19 20:05:12", severity: "warning",  service: "AuthService",     message: "5 consecutive failed login attempts for j.okafor@africa-ai.org", details: "Account temporarily locked for 15 minutes. User IP: 197.219.4.17. MFA not enabled — upgrade recommended.", traceId: "tr-7e04d9", ip: "197.219.4.17" },
  { id: "L004", timestamp: "2026-07-19 19:58:31", severity: "info",     service: "ModelRegistry",   message: "Multimodal Fusion v2.5.0 promoted to staging",                   details: "Model passed automated evaluation suite. Accuracy: 97.3%. Latency: 38ms. Awaiting admin approval.", traceId: "tr-1ca5f3", userId: "u2", ip: "10.0.1.1" },
  { id: "L005", timestamp: "2026-07-19 19:47:08", severity: "info",     service: "InferenceEngine", message: "Batch inference job BJ-2241 completed successfully",             details: "224 sessions processed in 18m 42s. Average confidence: 96.2%. 3 sessions flagged for low epistemic certainty.", traceId: "tr-5d87a2", userId: "u3", ip: "10.0.1.5" },
  { id: "L006", timestamp: "2026-07-19 19:30:00", severity: "debug",    service: "CacheService",    message: "Redis cache eviction triggered — LRU policy",                    details: "Cache hit ratio dropped to 71.4%. Evicted 1,240 keys. Cache memory at 87%. Consider increasing cache size.", traceId: "tr-2f99c7" },
  { id: "L007", timestamp: "2026-07-19 19:15:22", severity: "warning",  service: "APIGateway",      message: "Rate limit threshold at 85% for org 'Research Collective'",      details: "Org consumed 850/1000 API requests in the last hour. Alert sent to admin.", traceId: "tr-8b30e1", ip: "203.0.113.45" },
  { id: "L008", timestamp: "2026-07-19 18:52:47", severity: "info",     service: "AuthService",     message: "User p.sharma@research.io suspended by admin",                   details: "Admin u3 suspended account u8. Reason: Policy violation — unauthorized data export attempt.", traceId: "tr-6c41d2", userId: "u3", ip: "10.0.1.5" },
  { id: "L009", timestamp: "2026-07-19 18:40:11", severity: "error",    service: "DigitalTwin",     message: "Twin export failed for Participant 014 — missing FACS data",     details: "FACS attribution map incomplete for segments 4–7. Export aborted. Reanalysis required.", traceId: "tr-4a72f9", userId: "u7" },
  { id: "L010", timestamp: "2026-07-19 18:22:33", severity: "info",     service: "Billing",         message: "Monthly usage report generated for all orgs",                    details: "Reports emailed to 6 org billing contacts. Total API calls: 284,441. Storage: 1.84 TB.", traceId: "tr-9d13e6" },
  { id: "L011", timestamp: "2026-07-19 17:58:09", severity: "debug",    service: "InferenceEngine", message: "Model warm-up completed for Audio Prosody v3.1.2",               details: "Cold start: 4.2s. Inference latency normalized to 28ms. GPU memory allocated: 2.1 GB.", traceId: "tr-7e82a1" },
  { id: "L012", timestamp: "2026-07-19 17:41:55", severity: "critical", service: "DatabaseCluster", message: "Primary DB node disk I/O saturation — read latency spike",       details: "Read latency peaked at 842ms (target <50ms). Automatic read replica promotion initiated.", traceId: "tr-3f24b8" },
  { id: "L013", timestamp: "2026-07-19 17:30:18", severity: "info",     service: "ModelRegistry",   message: "Facial FACS v4.0.1 rolled back to v3.9.2 by admin",             details: "Admin u2 rolled back model after accuracy regression. Rollback completed in 12s.", traceId: "tr-5e91c4", userId: "u2", ip: "10.0.1.1" },
  { id: "L014", timestamp: "2026-07-19 17:15:44", severity: "warning",  service: "SecurityScanner", message: "Anomalous API access pattern from IP 185.220.101.47",            details: "IP flagged by threat intelligence. 140 requests in 3 minutes targeting /api/v1/sessions. IP auto-blocked.", traceId: "tr-2a60d7", ip: "185.220.101.47" },
  { id: "L015", timestamp: "2026-07-19 16:58:02", severity: "info",     service: "DataPipeline",    message: "AffectNet-Subset-C ingestion completed",                         details: "Checksum verified. 2,048 clips validated. Dataset available in library. Metadata indexed.", traceId: "tr-8b13f2", userId: "u5" },
]

// ─── Models ───────────────────────────────────────────────────────────────────

export const ADMIN_MODELS: AdminModel[] = [
  { id: "m1", name: "Multimodal Fusion", version: "v2.4.1", status: "deployed",   deployedAt: "2026-06-15", inferenceLatency: 42, accuracy: 96.2, size: "3.8 GB", framework: "PyTorch",     description: "Primary fusion model combining audio, video, text streams", trainedOn: "AffectNet-Merged-2026" },
  { id: "m2", name: "Audio Prosody",     version: "v3.1.2", status: "deployed",   deployedAt: "2026-06-22", inferenceLatency: 28, accuracy: 91.5, size: "1.2 GB", framework: "TensorFlow",  description: "Prosodic feature extraction from speech waveforms",          trainedOn: "RAVDESS + IEMOCAP"     },
  { id: "m3", name: "Facial FACS",       version: "v3.9.2", status: "deployed",   deployedAt: "2026-07-01", inferenceLatency: 18, accuracy: 97.8, size: "0.9 GB", framework: "ONNX",        description: "Facial Action Coding System unit detection",                  trainedOn: "BP4D + DISFA+"         },
  { id: "m4", name: "Text Sentiment",    version: "v2.1.0", status: "deployed",   deployedAt: "2026-05-30", inferenceLatency: 11, accuracy: 87.1, size: "0.4 GB", framework: "HuggingFace", description: "Transformer-based sentiment and emotion classification",       trainedOn: "SemEval-2026"          },
  { id: "m5", name: "Multimodal Fusion", version: "v2.5.0", status: "staging",    deployedAt: "2026-07-18", inferenceLatency: 38, accuracy: 97.3, size: "4.1 GB", framework: "PyTorch",     description: "Candidate release with enhanced cross-modal attention",      trainedOn: "AffectNet-Merged-2026" },
  { id: "m6", name: "Facial FACS",       version: "v4.0.1", status: "deprecated", deployedAt: "2026-06-01", inferenceLatency: 22, accuracy: 95.1, size: "1.1 GB", framework: "ONNX",        description: "Rolled back due to accuracy regression on low-light video",  trainedOn: "BP4D + AffectNet-B"    },
  { id: "m7", name: "EEG Correlator",    version: "v0.3.0", status: "failed",     deployedAt: "2026-07-10", inferenceLatency: 0,  accuracy: 0,    size: "2.1 GB", framework: "PyTorch",     description: "Experimental EEG signal correlation module",                  trainedOn: "DEAP + DREAMER"        },
]

// ─── Datasets ─────────────────────────────────────────────────────────────────

const GB = 1024 ** 3

export const ADMIN_DATASETS: AdminDataset[] = [
  { id: "d1", name: "AffectNet-Merged-2026", type: "Multimodal",   org: "Stanford AI Lab",     sizeLabel: "248 GB",  sizeBytes: 248  * GB, maxBytes: 500 * GB, records: 1_240_000, access: "restricted", status: "ready",      createdAt: "2026-01-10", owner: "Dr. Sarah Chen",      modalities: ["Video","Audio","Text"] },
  { id: "d2", name: "IEMOCAP-Extended",      type: "Audio/Video",  org: "Global",              sizeLabel: "74 GB",   sizeBytes: 74   * GB, maxBytes: 200 * GB, records: 10_039,    access: "public",     status: "ready",      createdAt: "2025-08-20", owner: "System",              modalities: ["Video","Audio"] },
  { id: "d3", name: "AffectNet-Subset-C",    type: "Video",        org: "Research Collective", sizeLabel: "12 GB",   sizeBytes: 12   * GB, maxBytes: 50  * GB, records: 2_048,     access: "restricted", status: "ready",      createdAt: "2026-07-19", owner: "Ravi Patel",          modalities: ["Video"] },
  { id: "d4", name: "DEAP Signals",          type: "EEG/Physio",   org: "Neurology Dept",      sizeLabel: "5.2 GB",  sizeBytes: 5.2  * GB, maxBytes: 20  * GB, records: 32_000,    access: "private",    status: "ready",      createdAt: "2025-11-01", owner: "Ravi Patel",          modalities: ["EEG","GSR","HR"] },
  { id: "d5", name: "RAVDESS Audio",         type: "Audio",        org: "Global",              sizeLabel: "1.8 GB",  sizeBytes: 1.8  * GB, maxBytes: 10  * GB, records: 7_356,     access: "public",     status: "ready",      createdAt: "2024-05-15", owner: "System",              modalities: ["Audio"] },
  { id: "d6", name: "SemEval-2026 Text",     type: "Text/NLP",     org: "EU Research Hub",     sizeLabel: "890 MB",  sizeBytes: 0.87 * GB, maxBytes: 5   * GB, records: 450_000,   access: "public",     status: "processing", createdAt: "2026-06-30", owner: "Sophie Laurent",      modalities: ["Text"] },
  { id: "d7", name: "Cohort-A Clinical",     type: "Clinical",     org: "Stanford Medical",    sizeLabel: "3.1 GB",  sizeBytes: 3.1  * GB, maxBytes: 10  * GB, records: 42,        access: "private",    status: "ready",      createdAt: "2026-04-02", owner: "Dr. Oliver Grant",    modalities: ["Video","Audio","Clinical Notes"] },
  { id: "d8", name: "MENA Mental Health",    type: "Multimodal",   org: "MENA Medical",        sizeLabel: "18 GB",   sizeBytes: 18   * GB, maxBytes: 50  * GB, records: 8_400,     access: "restricted", status: "archived",   createdAt: "2025-12-01", owner: "Dr. Fatima Al-Rashid",modalities: ["Video","Audio"] },
]

// ─── Security ─────────────────────────────────────────────────────────────────

export const SECURITY_THREATS: SecurityThreat[] = [
  { id: "t1", type: "Brute Force",       severity: "critical", source: "185.220.101.47", timestamp: "2026-07-19 17:15", status: "active",        description: "Systematic credential stuffing targeting research accounts. 2,400+ attempts in 10 min." },
  { id: "t2", type: "Anomalous Access",  severity: "high",     source: "203.0.113.88",   timestamp: "2026-07-19 14:42", status: "investigating", description: "API key used from 3 different countries within 2 hours. Possible key compromise." },
  { id: "t3", type: "Data Exfiltration", severity: "medium",   source: "u8 (suspended)", timestamp: "2026-07-18 22:10", status: "resolved",      description: "Suspended user attempted bulk dataset download via saved API token. Token revoked." },
  { id: "t4", type: "SQL Injection",     severity: "high",     source: "198.51.100.24",  timestamp: "2026-07-18 08:31", status: "resolved",      description: "Attempted SQL injection via dataset search endpoint. WAF blocked; no data exposed." },
  { id: "t5", type: "Privilege Esc.",    severity: "medium",   source: "u11 (internal)", timestamp: "2026-07-17 16:05", status: "resolved",      description: "User attempted to access admin endpoints without elevation. RBAC enforcement worked correctly." },
]

export const FAILED_LOGINS_CHART = [
  { time: "00:00", count: 4   },
  { time: "02:00", count: 2   },
  { time: "04:00", count: 1   },
  { time: "06:00", count: 8   },
  { time: "08:00", count: 22  },
  { time: "10:00", count: 35  },
  { time: "12:00", count: 19  },
  { time: "14:00", count: 48  },
  { time: "16:00", count: 290 },
  { time: "18:00", count: 14  },
  { time: "20:00", count: 7   },
  { time: "22:00", count: 3   },
]

export const IP_LIST: IPEntry[] = [
  { id: "ip1", ip: "10.0.0.0/8",       type: "allow", reason: "Internal network",         addedAt: "2024-01-15", addedBy: "Dr. Sarah Chen"   },
  { id: "ip2", ip: "192.168.0.0/16",   type: "allow", reason: "VPN subnet",               addedAt: "2024-01-15", addedBy: "Dr. Sarah Chen"   },
  { id: "ip3", ip: "140.82.112.0/24",  type: "allow", reason: "GitHub Actions CI/CD",     addedAt: "2024-06-01", addedBy: "Prof. Marcus Webb" },
  { id: "ip4", ip: "185.220.101.0/24", type: "block", reason: "Brute-force source range", addedAt: "2026-07-19", addedBy: "Auto-blocked"      },
  { id: "ip5", ip: "203.0.113.88",     type: "block", reason: "Suspicious API key usage", addedAt: "2026-07-19", addedBy: "Dr. Jane Doe"      },
  { id: "ip6", ip: "198.51.100.24",    type: "block", reason: "SQL injection attempt",     addedAt: "2026-07-18", addedBy: "WAF Auto-block"    },
]

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const AUDIT_LOGS: AuditEntry[] = [
  { id: "a001", timestamp: "2026-07-19 20:31:02", actor: "System",            actorRole: "super_admin", action: "AUTO_BLOCK_IP",         resource: "IP 185.220.101.47",            ip: "system",        result: "success", details: "IP auto-blocked after brute-force threshold exceeded" },
  { id: "a002", timestamp: "2026-07-19 20:05:12", actor: "Dr. Jane Doe",      actorRole: "admin",       action: "SUSPEND_USER",          resource: "User u8 (Priya Sharma)",       ip: "10.0.1.5",      result: "success", details: "Account suspended. Reason: unauthorized data export attempt" },
  { id: "a003", timestamp: "2026-07-19 19:58:31", actor: "Prof. Marcus Webb", actorRole: "super_admin", action: "PROMOTE_MODEL",         resource: "Multimodal Fusion v2.5.0",     ip: "10.0.1.1",      result: "success", details: "Model promoted from dev to staging environment" },
  { id: "a004", timestamp: "2026-07-19 19:30:00", actor: "Dr. Jane Doe",      actorRole: "admin",       action: "UPDATE_RATE_LIMIT",     resource: "Org: Research Collective",     ip: "10.0.1.5",      result: "success", details: "API rate limit increased from 1000 to 1500 req/hr" },
  { id: "a005", timestamp: "2026-07-19 18:52:47", actor: "Dr. Jane Doe",      actorRole: "admin",       action: "REVOKE_API_KEY",        resource: "Key ak-xxx8f2 (Priya Sharma)", ip: "10.0.1.5",      result: "success", details: "API key revoked as part of account suspension" },
  { id: "a006", timestamp: "2026-07-19 17:30:18", actor: "Prof. Marcus Webb", actorRole: "super_admin", action: "ROLLBACK_MODEL",        resource: "Facial FACS v4.0.1 → v3.9.2", ip: "10.0.1.1",      result: "success", details: "Emergency rollback due to production accuracy regression" },
  { id: "a007", timestamp: "2026-07-19 16:00:00", actor: "Dr. Sarah Chen",    actorRole: "super_admin", action: "UPDATE_PERMISSION",     resource: "Role: Researcher",             ip: "10.0.1.2",      result: "success", details: "Removed 'delete_sessions' permission from Researcher role" },
  { id: "a008", timestamp: "2026-07-19 14:00:00", actor: "Dr. Aiko Tanaka",   actorRole: "admin",       action: "INVITE_USER",           resource: "Sophie Laurent",               ip: "172.16.0.5",    result: "success", details: "Invitation sent. Role: Viewer. Org: EU Research Hub" },
  { id: "a009", timestamp: "2026-07-19 12:30:00", actor: "Ravi Patel",        actorRole: "researcher",  action: "UPLOAD_DATASET",        resource: "AffectNet-Subset-C",           ip: "192.168.1.44",  result: "success", details: "Dataset uploaded and validated. 2,048 records." },
  { id: "a010", timestamp: "2026-07-19 11:15:00", actor: "Prof. Marcus Webb", actorRole: "super_admin", action: "TOGGLE_FEATURE_FLAG",   resource: "Flag: live_stream_enabled",    ip: "10.0.1.1",      result: "success", details: "Feature flag enabled for all production users" },
  { id: "a011", timestamp: "2026-07-18 23:10:00", actor: "Priya Sharma",      actorRole: "researcher",  action: "EXPORT_DATA",           resource: "Dataset: AffectNet-Merged",    ip: "192.168.1.55",  result: "failure", details: "Bulk export denied — exceeds 10GB single-export limit. Account flagged." },
  { id: "a012", timestamp: "2026-07-18 20:00:00", actor: "Dr. Sarah Chen",    actorRole: "super_admin", action: "DELETE_USER",           resource: "User (deactivated account)",   ip: "10.0.1.2",      result: "success", details: "Permanently deleted deactivated account per data retention policy" },
  { id: "a013", timestamp: "2026-07-18 15:45:00", actor: "System",            actorRole: "super_admin", action: "AUTO_REVOKE_TOKEN",     resource: "Session tokens (expired)",     ip: "system",        result: "success", details: "Routine session token cleanup — 847 expired tokens purged" },
  { id: "a014", timestamp: "2026-07-18 08:31:00", actor: "WAF",               actorRole: "super_admin", action: "BLOCK_REQUEST",         resource: "Endpoint /api/v1/datasets",    ip: "198.51.100.24", result: "success", details: "SQL injection payload detected and blocked by WAF rule WAF-SQL-004" },
  { id: "a015", timestamp: "2026-07-17 16:05:00", actor: "James Okafor",      actorRole: "researcher",  action: "ACCESS_ADMIN_ENDPOINT", resource: "GET /api/admin/users",         ip: "197.219.4.17",  result: "failure", details: "RBAC denied — insufficient privilege. Incident logged for review." },
]

// ─── Monitoring ───────────────────────────────────────────────────────────────

export const MONITORING_TIMESERIES = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  requests: Math.round(80 + Math.sin(i * 0.4) * 60 + Math.random() * 30),
  errors: Math.round(1 + Math.abs(Math.sin(i * 0.7)) * 4 + (i === 16 ? 28 : 0)),
  latency: Math.round(35 + Math.cos(i * 0.3) * 12 + Math.random() * 8),
}))

export const SERVICE_HEALTH = [
  { name: "Inference Engine", status: "healthy",  uptime: 99.97, latency: 42  },
  { name: "Auth Service",     status: "healthy",  uptime: 100,   latency: 8   },
  { name: "Data Pipeline",    status: "degraded", uptime: 98.2,  latency: 210 },
  { name: "Model Registry",   status: "healthy",  uptime: 100,   latency: 12  },
  { name: "Database Cluster", status: "degraded", uptime: 99.1,  latency: 180 },
  { name: "Cache Service",    status: "healthy",  uptime: 100,   latency: 2   },
  { name: "API Gateway",      status: "healthy",  uptime: 99.99, latency: 5   },
  { name: "Security Scanner", status: "healthy",  uptime: 100,   latency: 18  },
]

// ─── System Config ────────────────────────────────────────────────────────────

export const FEATURE_FLAGS: FeatureFlag[] = [
  { id: "live_stream",     label: "Live Stream Analysis", description: "Real-time emotion analysis via live video feed",  enabled: true,  env: "all"     },
  { id: "digital_twin",   label: "Digital Twin Export",  description: "Allow users to export Digital Twin models",        enabled: true,  env: "all"     },
  { id: "eeg_module",     label: "EEG Correlator",       description: "Experimental EEG signal correlation module",       enabled: false, env: "staging" },
  { id: "beta_ui",        label: "Beta UI Components",   description: "New design system components under development",   enabled: false, env: "staging" },
  { id: "bulk_export",    label: "Bulk Data Export",     description: "Allow >1 GB single export operations",            enabled: false, env: "prod"    },
  { id: "mfa_required",   label: "Enforce MFA for Admins", description: "Require MFA for all admin-level accounts",     enabled: true,  env: "all"     },
  { id: "audit_webhooks", label: "Audit Webhooks",       description: "Send audit events to external SIEM via webhook",  enabled: false, env: "all"     },
]

export const RATE_LIMITS: RateLimit[] = [
  { id: "api_req_hr",     label: "API Requests / Hour",  description: "Per-org API call ceiling",               value: 1000, unit: "req/hr",   min: 100, max: 10000 },
  { id: "max_sessions",   label: "Concurrent Sessions",  description: "Max simultaneous inference sessions",    value: 50,   unit: "sessions", min: 1,   max: 500   },
  { id: "export_size",    label: "Max Export Size",      description: "Single export operation limit",          value: 10,   unit: "GB",       min: 1,   max: 100   },
  { id: "upload_size",    label: "Max Upload Size",      description: "Single dataset upload limit",            value: 50,   unit: "GB",       min: 1,   max: 500   },
  { id: "session_ttl",    label: "Session Token TTL",    description: "User session expiry",                    value: 24,   unit: "hr",       min: 1,   max: 168   },
  { id: "login_attempts", label: "Max Login Attempts",   description: "Before temporary lockout",               value: 5,    unit: "attempts", min: 3,   max: 10    },
]
