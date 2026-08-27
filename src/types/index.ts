/**
 * Canonical domain vocabulary for Intelligent Flow.
 * Terminology is contractual: "Audit Vulnerability" (never "exposure" in UI copy),
 * "Mandate", "Evidence Pack", "RBAC Persona".
 */

export type TrackId = 'track1' | 'track1.5' | 'track2';

export type PhaseId = 'DISCOVER' | 'DECIDE' | 'BUILD' | 'OPERATE' | 'IMPROVE';

export type PersonaId = 'lead-fde' | 'ai-agent' | 'ciso';

export type ScreenId =
  | 'dashboard'
  | 'context'
  | 'execution'
  | 'evolution';

export type GateVerdict = 'PENDING' | 'PASSED' | 'FAILED' | 'VOID';

export type MandateStatus = 'UNSIGNED' | 'ACTIVE' | 'VOIDED' | 'DISCHARGED';

export interface TrackMetrics {
  /** Delivery lead time, days */
  leadTimeDays: number;
  /** Change failure rate, percent */
  changeFailureRate: number;
  /** Defect escape ratio, percent */
  defectEscapeRatio: number;
  /** A-UPI maturity multiplier applied to raw DORA metrics */
  maturityMultiplier: number;
  /** Total Cost of Ownership per COSMIC Function Point, EUR */
  tcoPerCfp: number;
}

export interface TrackProfile {
  id: TrackId;
  label: string;
  shortLabel: string;
  /** Way of Working narrative for the presenter */
  wow: string;
  /** Governance posture badge rendered in the guardrail pane */
  controlPlaneBadge: string;
  controlPlaneTone: 'violation' | 'hitl' | 'passed';
  metrics: TrackMetrics;
  /** Model routing shown in the top-right console */
  modelRouting: string;
  /** Default persona bound to this track */
  defaultPersona: PersonaId;
  /** A-UPI composite index per sprint — the governed delivery curve */
  aupiSeries: number[];
  /** Change failure rate per sprint — the ungoverned volatility curve */
  cfrSeries: number[];
  /** TCO per CFP per sprint */
  tcoSeries: number[];
}

export interface Persona {
  id: PersonaId;
  name: string;
  accessLevel: string;
  /** Governing track context for the presenter script */
  trackContext: string;
  canSignEvidencePack: boolean;
  tone: 'active' | 'hitl' | 'passed';
}

export interface ContextPill {
  id: string;
  kind: 'ADR' | 'Compliance' | 'Interface' | 'Origin' | 'Domain';
  label: string;
  /** Context freshness, percent — drives the Golden Bridge hygiene warning */
  freshness: number;
  classified: boolean;
}

export interface HygieneFinding {
  id: string;
  artefact: string;
  detail: string;
  severity: 'warning' | 'critical';
  /** What the control plane did automatically in response */
  automaticClamp: string;
}

export interface ScopeNode {
  path: string;
  kind: 'file' | 'dir';
  allowed: boolean;
  note?: string;
}

export interface Mandate {
  token: string;
  status: MandateStatus;
  allowedScope: string;
  maxIterations: number;
  budgetTokens: number;
  tokensConsumed: number;
  /** Minutes until the temporal boundary expires */
  expiryMinutes: number;
  signedBy: string | null;
  voidReason: string | null;
}

export interface EvidencePack {
  id: string;
  timestamp: string;
  selectedModel: string;
  mandateId: string;
  verificationStatus:
    | 'DISCOVERING_BASELINE'
    | 'ACTIVE_RUN'
    | 'PENDING_HUMAN_SIGNATURE'
    | 'SIGNED_AND_SEALED'
    | 'VOIDED';
  contextIntegrityHash: string;
  statementCoverage: string;
  opaGates: Record<string, GateVerdict>;
  signature: string | null;
  signedBy: string | null;
}

export interface RegulatoryFinding {
  id: string;
  regulation: string;
  article: string;
  /** Verdict against an ungoverned pipeline */
  verdict: 'FAILED' | 'HIGH RISK';
  /** Verdict once the Control Plane is enforced */
  remediatedVerdict: 'ENFORCED';
  auditVulnerability: 'Extreme' | 'High' | 'Elevated';
  finding: string;
  remediation: string;
}

export interface FceeStep {
  id: string;
  name: string;
  detail: string;
}

export interface BlastRadiusItem {
  id: string;
  label: string;
  tone: 'passed' | 'hitl' | 'violation';
}

export interface CompetitorExploit {
  id: 'epam' | 'coforge' | 'cognizant' | 'persistent' | 'wonderful';
  vendor: string;
  product: string;
  trap: string;
  /** The structural vulnerability the exploit proves */
  weakness: string;
  /** What the presenter says out loud */
  script: string;
  /** What Intelligent Flow does on screen */
  proof: string;
  tone: 'violation' | 'hitl' | 'active' | 'passed';
}

export interface ToastMessage {
  id: string;
  title: string;
  detail: string;
  tone: 'active' | 'passed' | 'hitl' | 'violation';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  phase: PhaseId;
  actor: string;
  message: string;
  tone: 'active' | 'passed' | 'hitl' | 'violation';
}
