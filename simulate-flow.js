/**
 * Intelligent Flow — headless state engine simulator (PRD v5 §9.2).
 *
 * Drives the same five-phase lifecycle the UI console shows, but on the real
 * filesystem: it initialises the client context, mutates a mock repository file
 * under a cryptographic Mandate, and compiles a signed Evidence Pack to disk.
 *
 * Sales engineers run this alongside the console when a technical evaluator
 * asks to see the artefacts rather than the interface:
 *
 *   npm run simulate
 *   cat evidence-packs/EP-*.json
 *
 * Edit context-store/current-context.json before a workshop to re-skin the run
 * for the client in the room.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DIRS = ['context-store', 'mock-repos/core-service', 'evidence-packs'];
const CONTEXT_PATH = path.join(ROOT, 'context-store/current-context.json');
const TARGET_FILE = 'mock-repos/core-service/billing.js';

const COLOR = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  indigo: '\x1b[38;5;63m',
  emerald: '\x1b[38;5;42m',
  amber: '\x1b[38;5;214m',
  crimson: '\x1b[38;5;196m',
};

const DEFAULT_CONTEXT = {
  client: 'Azercell Telecom LLC',
  project: 'Billing Engine Modernisation',
  work_item: 'AZ-7001',
  requirement: 'Flexible Tax Calendar & Rate Utility',
  target_cloud: 'AWS (Amazon Bedrock, region-isolated eu-central-1)',
  scm_connector: 'Bitbucket Data Center',
  adr: 'ADR-042: Dynamic Tax Boundary Validation Schema',
  baseline_metrics: {
    cycle_time_days: 14.2,
    deployment_frequency_per_week: 0.5,
    change_failure_rate_percent: 28.0,
    defect_escape_ratio_percent: 12.0,
    tco_per_cfp_eur: 1200,
    composite_index: 42.0,
  },
};

const LEGACY_CODE = `// Legacy Billing Code v1.0
function calculateTax(amount) {
  return amount * 0.18;
}

module.exports = { calculateTax };
`;

/* ------------------------------------------------------------------ */
/* Bootstrap                                                           */
/* ------------------------------------------------------------------ */

for (const dir of DIRS) {
  fs.mkdirSync(path.join(ROOT, dir), { recursive: true });
}

// Preserve a pre-meeting customised context rather than clobbering it.
if (!fs.existsSync(CONTEXT_PATH)) {
  fs.writeFileSync(CONTEXT_PATH, `${JSON.stringify(DEFAULT_CONTEXT, null, 2)}\n`);
}
const context = JSON.parse(fs.readFileSync(CONTEXT_PATH, 'utf8'));

fs.writeFileSync(path.join(ROOT, TARGET_FILE), LEGACY_CODE);

/* ------------------------------------------------------------------ */
/* Evidence Pack                                                       */
/* ------------------------------------------------------------------ */

const evidencePack = {
  id: `EP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
  timestamp: new Date().toISOString(),
  client: context.client,
  work_item: context.work_item,
  selected_model: 'amazon.bedrock.anthropic.claude-3-5-sonnet',
  verification_status: 'DISCOVERING_BASELINE',
  opa_gates: {},
  steps: [],
};

let activeMandate = null;

function logStep(phase, message, meta = {}) {
  const tint =
    phase === 'BUILD' ? COLOR.indigo : phase === 'OPERATE' ? COLOR.amber : COLOR.emerald;
  console.log(`\n${tint}[${phase}]${COLOR.reset} ${COLOR.dim}${'─'.repeat(52)}${COLOR.reset}`);
  console.log(`  ${message}`);
  for (const [key, value] of Object.entries(meta)) {
    console.log(`  ${COLOR.dim}${key}:${COLOR.reset} ${format(value)}`);
  }
  evidencePack.steps.push({ phase, timestamp: new Date().toISOString(), description: message, meta });
}

const format = (value) =>
  typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);

function fail(message) {
  console.error(`\n${COLOR.crimson}[GOVERNANCE EXCEPTION]${COLOR.reset} ${message}\n`);
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* The five continuous phases                                          */
/* ------------------------------------------------------------------ */

function discover() {
  logStep('DISCOVER', `Ingested unstructured tax brief for ${context.client}.`, {
    requirement: context.requirement,
    system_of_record: `Jira ${context.work_item}`,
    baseline_cycle_time: `${context.baseline_metrics.cycle_time_days} days`,
    identified_bottleneck: 'Manual tax verification in the legacy billing script.',
  });
  evidencePack.opa_gates.requirements_traceability = 'PASSED';
}

function decide() {
  logStep('DECIDE', 'Architectural Decision Record raised and pinned to the work item.', {
    adr: context.adr,
    model_tier: 'Tier 2 — managed enclave',
    target_cloud: context.target_cloud,
  });

  activeMandate = {
    token: `MND-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
    allowed_scope: TARGET_FILE,
    max_iterations: 5,
    budget_tokens: 50_000,
    tokens_consumed: 1_450,
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
  };

  evidencePack.mandate_id = activeMandate.token;
  logStep('DECIDE', 'Cryptographic Mandate signed and bound to a single repository pathway.', {
    mandate: activeMandate.token,
    scope: activeMandate.allowed_scope,
    budget: `${activeMandate.budget_tokens.toLocaleString()} tokens`,
    expiry: activeMandate.expires_at,
  });
}

function build() {
  if (!activeMandate || activeMandate.status !== 'ACTIVE') {
    fail('Agent execution blocked — no active Mandate.');
  }

  logStep('BUILD', `Executing inside the file-system firewall: ${activeMandate.allowed_scope}`);

  const governedCode = `// Modernized Billing Service v1.1
// Compiled under Mandate ${activeMandate.token}
// Governed by ${context.adr}
function calculateTax(amount, period = currentPeriod()) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    throw new TypeError('calculateTax: amount must be a finite number');
  }
  if (amount <= 0) return 0;

  const rate = resolveRate(period);
  return round2(amount * rate);
}

module.exports = { calculateTax };
`;

  const targetPath = path.join(ROOT, activeMandate.allowed_scope);

  // The scope allowlist is the firewall — resolve and re-check before writing.
  if (!targetPath.startsWith(path.join(ROOT, 'mock-repos'))) {
    fail('Write rejected — resolved path escapes the Mandate scope.');
  }

  fs.writeFileSync(targetPath, governedCode);
  activeMandate.tokens_consumed += 4_120;

  if (activeMandate.tokens_consumed > activeMandate.budget_tokens) {
    activeMandate.status = 'VOIDED';
    fail('Token budget exceeded — Mandate voided mid-loop.');
  }

  evidencePack.opa_gates.finance_policy_pack_v1 = 'PASSED';
  evidencePack.opa_gates.dependency_scan = 'PASSED';
  evidencePack.opa_gates.pii_egress_control = 'PASSED';
  evidencePack.opa_gates.gitops_origin_provenance = 'PASSED';
  evidencePack.context_integrity_hash = crypto
    .createHash('sha256')
    .update(governedCode)
    .digest('hex');
  evidencePack.statement_coverage = '100%';
  evidencePack.verification_status = 'PENDING_HUMAN_SIGNATURE';

  logStep('BUILD', 'Target file mutated. Property-based regression suite executed under the assured filter.', {
    tests_passed: true,
    statement_coverage: '100%',
    tokens_remaining: activeMandate.budget_tokens - activeMandate.tokens_consumed,
  });
}

function operate() {
  logStep('OPERATE', 'Non-reversible action intercepted at the aviation-style checkpoint.', {
    blast_radius: '3 core tax allocation files · zero OPA violations',
    signatory: 'CISO / Human Operator (OIDC verified)',
  });

  const payload = JSON.stringify({
    id: evidencePack.id,
    mandate: evidencePack.mandate_id,
    model: evidencePack.selected_model,
    gates: evidencePack.opa_gates,
    integrity: evidencePack.context_integrity_hash,
  });

  evidencePack.signature = crypto
    .createHmac('sha256', process.env.IF_SIGNING_KEY ?? 'avenga-canonical-demo-key')
    .update(payload)
    .digest('hex');
  evidencePack.signed_by = 'CISO / Human Operator';
  evidencePack.verification_status = 'SIGNED_AND_SEALED';
  activeMandate.status = 'DISCHARGED';

  logStep('OPERATE', 'Evidence Pack compiled and cryptographically signed.', {
    evidence_pack_id: evidencePack.id,
    signature: `${evidencePack.signature.slice(0, 24)}…`,
  });
}

function improve() {
  logStep('IMPROVE', 'Continuous Evolution loop armed against the deployed change.', {
    monitor: '0.01% error spike in tax rate resolution',
    analyze: 'Missing validation rules in an adjacent billing module',
    propose: 'Automated remediation PR drafted under a fresh, bounded Mandate',
  });
}

/* ------------------------------------------------------------------ */
/* Run                                                                 */
/* ------------------------------------------------------------------ */

console.log(
  `\n${COLOR.indigo}Intelligent Flow${COLOR.reset} — governed lifecycle simulation`,
);
console.log(`${COLOR.dim}${context.client} · ${context.project}${COLOR.reset}`);

discover();
decide();
build();
operate();
improve();

const outputPath = path.join(ROOT, 'evidence-packs', `${evidencePack.id}.json`);
fs.writeFileSync(outputPath, `${JSON.stringify(evidencePack, null, 2)}\n`);

console.log(
  `\n${COLOR.emerald}[SEALED]${COLOR.reset} Evidence Pack written to ${path.relative(ROOT, outputPath)}\n`,
);
