import type {
  BlastRadiusItem,
  CompetitorExploit,
  ContextPill,
  FceeStep,
  HygieneFinding,
  PhaseId,
  RegulatoryFinding,
  ScopeNode,
} from '@/types';

/** The client in the room. Edit this block before a workshop to re-skin the demo. */
export const CLIENT_CONTEXT = {
  client: 'Palantino LLC',
  project: 'Billing Engine Modernisation',
  workItem: 'AZ-7001',
  requirement: 'Flexible Tax Calendar & Rate Utility',
  targetCloud: 'AWS — Amazon Bedrock, region-isolated (eu-central-1)',
  scmConnector: 'Bitbucket Data Center',
  repository: 'mock-repos/core-service',
  targetFile: 'mock-repos/core-service/billing.js',
  adr: 'ADR-042',
} as const;

export const PHASES: PhaseId[] = ['DISCOVER', 'DECIDE', 'BUILD', 'OPERATE', 'IMPROVE'];

export const PHASE_BLURB: Record<PhaseId, string> = {
  DISCOVER:
    'Unstructured tax brief ingested and mapped back to the Jira system of record. Requirements compliance gate enforced.',
  DECIDE:
    'Architectural Decision Record raised and the cryptographic Mandate bound to a single repository pathway.',
  BUILD:
    'Agent executes inside the file-system firewall. Every tool-call is intercepted and schema-validated at the MCP Gateway.',
  OPERATE:
    'Pre-merge policy evaluation. Non-bypassable aviation-style checkpoint before any irreversible change reaches production.',
  IMPROVE:
    'Post-deployment Continuous Evolution loop. Telemetry, drift detection, and automated remediation without human decay.',
};

/** Screen 2 — Hot-Path Memory Context (synchronous top-k retrieval). */
export const CONTEXT_PILLS: ContextPill[] = [
  {
    id: 'adr-042',
    kind: 'ADR',
    label: 'ADR-042: BSCS Billing Design Pattern',
    freshness: 98,
    classified: true,
  },
  {
    id: 'compliance-tax',
    kind: 'Compliance',
    label: 'Compliance: TaxCalculations_v1_EU',
    freshness: 94,
    classified: true,
  },
  {
    id: 'interface-tax',
    kind: 'Interface',
    label: 'Interface: TaxRateUtility_v1.0.js',
    freshness: 91,
    classified: true,
  },
  {
    id: 'domain-bscs',
    kind: 'Domain',
    label: 'Domain: Palantino_BSCS_Entities',
    freshness: 88,
    classified: true,
  },
  {
    id: 'origin-jira',
    kind: 'Origin',
    label: `Origin Source: Jira_Ticket_${CLIENT_CONTEXT.workItem}`,
    freshness: 100,
    classified: true,
  },
  {
    id: 'stale-tax-schema',
    kind: 'Domain',
    label: 'Schema: TaxRates_2023_v1.xls',
    freshness: 62,
    classified: false,
  },
];

/**
 * The Golden Bridge (PRD v5 §8.4) — ungoverned data is what makes AI hallucinate.
 * These findings halt the agent and open the Avenga Intelligence conversation.
 */
export const HYGIENE_FINDINGS: HygieneFinding[] = [
  {
    id: 'stale-schema',
    artefact: 'TaxRates_2023_v1.xls',
    detail:
      'Stale tax schema detected in the Context Library. Context freshness has decayed to 62% — risking confidently wrong AI output.',
    severity: 'warning',
    automaticClamp: 'Hot-path retrieval weighting reduced. Agent initialisation held pending re-index.',
  },
  {
    id: 'unclassified-pii',
    artefact: 'customer_billing_dump.csv',
    detail:
      'Unclassified data source detected in the retrieval path. Raw subscriber numbers and tax IDs are unmasked.',
    severity: 'critical',
    automaticClamp:
      'Sovereign routing override engaged — request pinned to the self-hosted fallback model to prevent structural PII leak.',
  },
];

/** Screen 2 — Mandate scope allowlist. Everything outside the allowlist is padlocked. */
export const SCOPE_TREE: ScopeNode[] = [
  { path: 'mock-repos/', kind: 'dir', allowed: true },
  { path: 'mock-repos/core-service/', kind: 'dir', allowed: true },
  { path: 'mock-repos/core-service/billing.js', kind: 'file', allowed: true, note: 'Mandate target' },
  {
    path: 'mock-repos/core-service/tax_calc.js',
    kind: 'file',
    allowed: true,
    note: 'Interface contract',
  },
  { path: 'mock-repos/database/schema_root/', kind: 'dir', allowed: false, note: 'Lateral movement blocked' },
  { path: 'mock-repos/payments-gateway/', kind: 'dir', allowed: false, note: 'Out of Mandate scope' },
  { path: 'infra/terraform/', kind: 'dir', allowed: false, note: 'Production estate — denied' },
  { path: '.github/workflows/', kind: 'dir', allowed: false, note: 'Pipeline definition — denied' },
];

/** Screen 3 — the legacy billing function, un-governed. */
export const LEGACY_CODE = `// Legacy Billing Code v1.0
function calculateTax(amount) {
  return amount * 0.18;
}

module.exports = { calculateTax };`;

/** Screen 3 — the governed replacement, produced under Mandate. */
export const GOVERNED_CODE = `// Modernized Billing Service v1.1
// Compiled under Mandate MND-F839A2B91C
// Governed by ADR-042: Dynamic Tax Boundary Validation Schema
function calculateTax(amount, period = currentPeriod()) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    throw new TypeError('calculateTax: amount must be a finite number');
  }
  if (amount <= 0) return 0;

  const rate = resolveRate(period);
  return round2(amount * rate);
}

module.exports = { calculateTax };`;

/** Screen 3 — MCP Gateway tool-call interceptions, replayed as the agent works. */
export const MCP_INTERCEPTS = [
  {
    tool: 'read_file',
    detail: "Intercepted tool-call 'read_file'. Path checked against Mandate allowlist.",
  },
  {
    tool: 'jira_fetch_issue',
    detail: `Intercepted tool-call 'jira_fetch_issue'. ${CLIENT_CONTEXT.workItem} resolved from the system of record.`,
  },
  {
    tool: 'write_file',
    detail: "Intercepted tool-call 'write_file'. Pre-invocation payload schema validated successfully.",
  },
  {
    tool: 'run_tests',
    detail: "Intercepted tool-call 'run_tests'. Property-based suite executed under the assured filter.",
  },
] as const;

/** Screen 4 — blast radius, pre-analysed by the security sub-agent. */
export const BLAST_RADIUS: BlastRadiusItem[] = [
  {
    id: 'files',
    label: 'Modifies 3 core tax allocation files inside the Mandate scope.',
    tone: 'passed',
  },
  {
    id: 'opa',
    label: '100% compliant with the OPA Policy Gate Pack (Finance-EU-v1). Zero violations.',
    tone: 'passed',
  },
  {
    id: 'coverage',
    label: '100% interface contract adherence to the ADR-042 schema. Statement coverage 100%.',
    tone: 'passed',
  },
  {
    id: 'routing',
    label: 'Touches BSCS regional payment routing tables — named human sign-off required.',
    tone: 'hitl',
  },
  {
    id: 'irreversible',
    label: 'Action is non-reversible: production merge of branch feature/dynamic-tax-rates.',
    tone: 'violation',
  },
];

/** Screen 5 — the seven-step Continuous Evolution (FCEE) post-deployment loop. */
export const FCEE_STEPS: FceeStep[] = [
  {
    id: 'monitor',
    name: 'Monitor',
    detail: 'Real-time OpenTelemetry parsing shows a 0.01% error spike in tax rate resolution.',
  },
  {
    id: 'analyze',
    name: 'Analyze',
    detail: 'Correlated context indicates missing validation rules in an adjacent billing module.',
  },
  {
    id: 'propose',
    name: 'Propose',
    detail: 'Automated correction pull-request drafted and pushed to the secondary repository.',
  },
  {
    id: 'review',
    name: 'Review',
    detail: 'Pending human operator sign-off under a fresh, temporally bounded Mandate.',
  },
  {
    id: 'execute',
    name: 'Execute',
    detail: 'Remediation merged through the same non-bypassable OPA gate pack.',
  },
  {
    id: 'validate',
    name: 'Validate',
    detail: 'Post-merge telemetry compared against the pre-change A-UPI baseline.',
  },
  {
    id: 'learn',
    name: 'Learn',
    detail: 'Session transcript consolidated: ADR extracted, tribal knowledge de-duplicated, vector index refreshed.',
  },
];

/** Screen 6 — the Regulatory Exposure Assessment scan matrix. */
export const REGULATORY_FINDINGS: RegulatoryFinding[] = [
  {
    id: 'aiact-14',
    regulation: 'EU AI Act',
    article: 'Article 14 — Human Oversight',
    verdict: 'FAILED',
    remediatedVerdict: 'ENFORCED',
    auditVulnerability: 'Extreme',
    finding:
      'Autonomous agents executing raw, un-monitored file-writes directly to the main branch. No non-bypassable manual verification checkpoint exists in the pipeline.',
    remediation:
      'Aviation-style HITL gate installed. Irreversible actions hard-stop pending a named, OIDC-verified human signature.',
  },
  {
    id: 'aiact-15',
    regulation: 'EU AI Act',
    article: 'Article 15 — Traceability & Logging',
    verdict: 'FAILED',
    remediatedVerdict: 'ENFORCED',
    auditVulnerability: 'High',
    finding:
      'AI-generated merges are checked in under shared developer Git credentials. No cryptographically signed, immutable Evidence Packs are compiled.',
    remediation:
      'Evidence Pack compiler active. Every merge carries a signed hash chain binding prompt, model version, policy verdicts, and human signatory.',
  },
  {
    id: 'dora-8-9',
    regulation: 'DORA',
    article: 'Articles 8–9 — ICT Risk & Supply Chain',
    verdict: 'HIGH RISK',
    remediatedVerdict: 'ENFORCED',
    auditVulnerability: 'Elevated',
    finding:
      'Third-party libraries pulled by the coding assistant bypass automated policy-as-code licence and vulnerability scanning before merge.',
    remediation:
      'Dependency scan promoted to a blocking OPA gate. Un-scanned transitive dependencies cannot enter the build environment.',
  },
  {
    id: 'gdpr-pii',
    regulation: 'GDPR',
    article: 'Data Minimisation & PII Leakage',
    verdict: 'FAILED',
    remediatedVerdict: 'ENFORCED',
    auditVulnerability: 'Extreme',
    finding:
      'Unmasked customer billing records — local telephone numbers and tax IDs — transmitted in plaintext to public, US-hosted frontier model endpoints.',
    remediation:
      'Sovereign routing enforced at the LLM Gateway. Classified payloads pinned to the region-isolated or self-hosted tier.',
  },
];

/** God Mode — the Demolition Matrix (PRD v5 §3.1). */
export const COMPETITOR_EXPLOITS: Record<CompetitorExploit['id'], CompetitorExploit> = {
  epam: {
    id: 'epam',
    vendor: 'EPAM Systems',
    product: 'DIAL & AI/Run',
    trap: 'The Token Gateway Trap',
    weakness:
      'DIAL is a gateway-level API key manager and billing dashboard. It limits token budgets and authenticates calls, but has zero context of what code is checked in or how it maps to the specification.',
    script:
      "EPAM's gateway will happily let an agent check out tokens as long as it holds the API key. It has no idea whether that agent is injecting untested, non-compliant code into production. Intelligent Flow binds tokens, OPA policies, and file pathways into one cryptographic loop. If code shifts without authorisation, the system shuts it down instantly.",
    proof: 'Injecting out-of-band code drift — watch the Mandate void itself.',
    tone: 'violation',
  },
  coforge: {
    id: 'coforge',
    vendor: 'Coforge',
    product: 'CodeInsightAI & Pega',
    trap: 'The Low-Code Lock-In Trap',
    weakness:
      'Requirements are converted into proprietary low-code blocks on Pega/Appian runtimes, costing millions in recurring licences and preventing standard software integration.',
    script:
      'Coforge wants to turn your professional engineering department into citizen developers tied to proprietary platforms. Intelligent Flow implements paved roads on top of your existing Git, CI/CD, and IDEs. We wrap and govern professional tooling — we never replace it. You retain full ownership of your code, your models, and your architecture.',
    proof: 'Tool Sovereignty asserted — standard Bitbucket DC, standard JS/TS, standard IDEs.',
    tone: 'hitl',
  },
  cognizant: {
    id: 'cognizant',
    vendor: 'Cognizant',
    product: 'Flowsource & Neuro AI',
    trap: 'The Passive Dashboard Trap',
    weakness:
      'Flowsource aggregates metrics after code is already merged. It reports how slow or broken things are; it cannot prevent a defect from entering production.',
    script:
      'Flowsource is a car dashboard that tells you that you crashed ten miles ago. Intelligent Flow is the active collision-avoidance system. If your code fails OPA policy or lacks a cryptographically signed Evidence Pack, it cannot be committed, merged, or deployed. We enforce quality before it becomes a metric.',
    proof: 'Advancing to the OPERATE gate — the pipeline is physically blocked until a human signs.',
    tone: 'active',
  },
  persistent: {
    id: 'persistent',
    vendor: 'Persistent Systems',
    product: 'SASVA & iAURA',
    trap: 'Proprietary Model Captivity',
    weakness:
      'SASVA displaces the assistants developers already use, forcing a rip-and-replace of developer habits and an editor lock-in with principle-only governance.',
    script:
      'Persistent forces your developers to abandon the assistants they already love for a proprietary tool. We believe in model and tool sovereignty. Intelligent Flow is a control plane wrapper: keep Cursor, keep Copilot, keep your IDE — we secure, validate, and sign everything they produce at the repository boundary.',
    proof: 'Swapping the routed model from AWS Bedrock to a self-hosted open-weight Llama tier.',
    tone: 'passed',
  },
  wonderful: {
    id: 'wonderful',
    vendor: 'Wonderful AI',
    product: 'Point-Agent Library',
    trap: 'The Shadow Agent Risk',
    weakness:
      'Ready-made agent estates with broad read/write access to corporate systems, with no transformation methodology, no SDLC governance, and no measurement framework.',
    script:
      'Regional rivals pitch raw agent teams with broad access — the equivalent of handing a junior contractor a master key to your building. Intelligent Flow issues a cryptographic Mandate: a digital hall-pass. Agents are firewalled to specific files, given a hard token budget, and restricted to five loops. Out of bounds, and the platform terminates the process.',
    proof: 'Mandate guardrails highlighted — scope allowlist, token cap, temporal expiry.',
    tone: 'active',
  },
};

export const EXPLOIT_ORDER: CompetitorExploit['id'][] = [
  'epam',
  'coforge',
  'cognizant',
  'persistent',
  'wonderful',
];
