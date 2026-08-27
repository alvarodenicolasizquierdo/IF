/**
 * The model catalogue behind the LLM Gateway.
 *
 * This is the demo's proof of model sovereignty (PRD v5 §3.1.4, the Persistent
 * SASVA counter-position): the same governed pipeline runs on a frontier cloud
 * model or on open weights the client hosts themselves, and the Control Plane
 * reacts to which one is routed.
 *
 * ── Provenance of these numbers ────────────────────────────────────────────
 * Claude model IDs, context windows and per-MTok prices are Anthropic
 * first-party API rates. Amazon Bedrock and Google Vertex are partner-operated
 * and priced separately — a Bedrock-routed engagement should re-check against
 * the AWS pricing page before a client meeting.
 *
 * Open-weight entries carry no per-token price because the client runs them:
 * the cost is GPU-hours on infrastructure they already own, which is exactly
 * the economic point of the sovereign tiers. Their versions move fast — treat
 * them as the one block to refresh before a workshop.
 */

export type AssuranceTier = 1 | 2 | 3 | 4;

export type Egress =
  | 'public-internet'
  | 'region-isolated'
  | 'vpc-only'
  | 'air-gapped';

export interface ModelOption {
  id: string;
  /** Wire identifier, shown in the Evidence Pack. */
  routeId: string;
  name: string;
  vendor: string;
  /** The PRD's Four-Tiered Assurance Model (§4.5). */
  tier: AssuranceTier;
  tierLabel: string;
  hosting: 'frontier' | 'sovereign';
  weights: 'proprietary' | 'open';
  contextWindow: string;
  /** USD per million tokens. null when the client hosts the weights. */
  inputPerMTok: number | null;
  outputPerMTok: number | null;
  /** USD per GPU-hour for self-hosted serving. null for hosted APIs. */
  gpuHourUsd: number | null;
  dataResidency: string;
  egress: Egress;
  /** Whether classified payloads may be routed here without masking. */
  piiSafe: boolean;
  /** One line the presenter can read out. */
  note: string;
}

export const MODELS: ModelOption[] = [
  /* ── Tier 1 · Public API ────────────────────────────────────────────── */
  {
    id: 'haiku-4-5-public',
    routeId: 'anthropic.claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    vendor: 'Anthropic',
    tier: 1,
    tierLabel: 'Public API',
    hosting: 'frontier',
    weights: 'proprietary',
    contextWindow: '200K',
    inputPerMTok: 1.0,
    outputPerMTok: 5.0,
    gpuHourUsd: null,
    dataResidency: 'Unpinned — provider default',
    egress: 'public-internet',
    piiSafe: false,
    note: 'Cheapest route. Fine for public documentation; never for customer data.',
  },

  /* ── Tier 2 · Managed enclave ──────────────────────────────────────── */
  {
    id: 'sonnet-5-bedrock',
    routeId: 'bedrock.anthropic.claude-sonnet-5',
    name: 'Claude Sonnet 5',
    vendor: 'Anthropic via AWS Bedrock',
    tier: 2,
    tierLabel: 'Managed enclave',
    hosting: 'frontier',
    weights: 'proprietary',
    contextWindow: '1M',
    inputPerMTok: 2.0,
    outputPerMTok: 10.0,
    gpuHourUsd: null,
    dataResidency: 'eu-central-1 — region isolated',
    egress: 'region-isolated',
    piiSafe: true,
    note: 'The volume workhorse. Region-pinned, no weights leave the enclave.',
  },
  {
    id: 'opus-5-bedrock',
    routeId: 'bedrock.anthropic.claude-opus-5',
    name: 'Claude Opus 5',
    vendor: 'Anthropic via AWS Bedrock',
    tier: 2,
    tierLabel: 'Managed enclave',
    hosting: 'frontier',
    weights: 'proprietary',
    contextWindow: '1M',
    inputPerMTok: 5.0,
    outputPerMTok: 25.0,
    gpuHourUsd: null,
    dataResidency: 'eu-central-1 — region isolated',
    egress: 'region-isolated',
    piiSafe: true,
    note: 'Default for governed modernisation work. Strongest agentic reasoning.',
  },
  {
    id: 'fable-5-bedrock',
    routeId: 'bedrock.anthropic.claude-fable-5',
    name: 'Claude Fable 5',
    vendor: 'Anthropic via AWS Bedrock',
    tier: 2,
    tierLabel: 'Managed enclave',
    hosting: 'frontier',
    weights: 'proprietary',
    contextWindow: '1M',
    inputPerMTok: 10.0,
    outputPerMTok: 50.0,
    gpuHourUsd: null,
    dataResidency: 'eu-central-1 — region isolated',
    egress: 'region-isolated',
    piiSafe: true,
    note: 'Reserved for the hardest long-horizon migrations. Premium rate.',
  },

  /* ── Tier 3 · Self-hosted GPU ──────────────────────────────────────── */
  {
    id: 'llama-33-70b-vllm',
    routeId: 'selfhosted.vllm.llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B Instruct',
    vendor: 'Meta — open weights',
    tier: 3,
    tierLabel: 'Self-hosted GPU',
    hosting: 'sovereign',
    weights: 'open',
    contextWindow: '128K',
    inputPerMTok: null,
    outputPerMTok: null,
    gpuHourUsd: 10.6,
    dataResidency: 'Client VPC — EKS, 4×H100',
    egress: 'vpc-only',
    piiSafe: true,
    note: 'No per-token bill. Cost is GPU-hours on infrastructure they already own.',
  },
  {
    id: 'qwen-25-72b-vllm',
    routeId: 'selfhosted.vllm.qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B Instruct',
    vendor: 'Alibaba — open weights',
    tier: 3,
    tierLabel: 'Self-hosted GPU',
    hosting: 'sovereign',
    weights: 'open',
    contextWindow: '128K',
    inputPerMTok: null,
    outputPerMTok: null,
    gpuHourUsd: 10.6,
    dataResidency: 'Client VPC — EKS, 4×H100',
    egress: 'vpc-only',
    piiSafe: true,
    note: 'Strong multilingual coding. Same serving cost as the Llama tier.',
  },

  /* ── Tier 4 · Sovereign air-gapped ─────────────────────────────────── */
  {
    id: 'mistral-large-airgap',
    routeId: 'airgapped.vllm.mistral-large-2',
    name: 'Mistral Large 2',
    vendor: 'Mistral AI — open weights',
    tier: 4,
    tierLabel: 'Sovereign air-gapped',
    hosting: 'sovereign',
    weights: 'open',
    contextWindow: '128K',
    inputPerMTok: null,
    outputPerMTok: null,
    gpuHourUsd: 12.4,
    dataResidency: 'On-premise — zero callback, EU-built weights',
    egress: 'air-gapped',
    piiSafe: true,
    note: 'The answer to "what if the regulator says nothing may leave the building".',
  },
  {
    id: 'deepseek-v3-airgap',
    routeId: 'airgapped.vllm.deepseek-v3',
    name: 'DeepSeek-V3',
    vendor: 'DeepSeek — open weights',
    tier: 4,
    tierLabel: 'Sovereign air-gapped',
    hosting: 'sovereign',
    weights: 'open',
    contextWindow: '128K',
    inputPerMTok: null,
    outputPerMTok: null,
    gpuHourUsd: 12.4,
    dataResidency: 'On-premise — zero callback',
    egress: 'air-gapped',
    piiSafe: true,
    note: 'Mixture-of-experts. Cheapest per useful token once the GPUs are bought.',
  },
];

export const DEFAULT_MODEL_ID = 'opus-5-bedrock';

export function getModel(id: string): ModelOption {
  // Fall back through the named default rather than a positional index — the
  // catalogue is meant to be edited before a workshop, and MODELS[2] only
  // happened to be the default.
  return (
    MODELS.find((m) => m.id === id) ??
    MODELS.find((m) => m.id === DEFAULT_MODEL_ID) ??
    MODELS[0]
  );
}

/**
 * Cost of one Mandate's token budget on a given route.
 * Agentic coding runs read far more than they write, so the split is weighted
 * 75/25 rather than assumed even — an even split roughly doubles the estimate
 * on models whose output rate is 5× their input rate.
 */
export const INPUT_SHARE = 0.75;

export function mandateCostUsd(model: ModelOption, tokens: number): number | null {
  if (model.inputPerMTok === null || model.outputPerMTok === null) return null;
  const input = (tokens * INPUT_SHARE) / 1_000_000;
  const output = (tokens * (1 - INPUT_SHARE)) / 1_000_000;
  return input * model.inputPerMTok + output * model.outputPerMTok;
}

/** Serving cost for the same work when the client hosts the weights. */
export function mandateGpuCostUsd(model: ModelOption, tokens: number): number | null {
  if (model.gpuHourUsd === null) return null;
  // ~2,400 tok/s sustained on a 4×H100 vLLM deployment at batch.
  const seconds = tokens / 2_400;
  return (seconds / 3_600) * model.gpuHourUsd;
}

export function formatUsd(value: number): string {
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(3)}`;
  return `$${value.toFixed(4)}`;
}

export const EGRESS_LABEL: Record<Egress, string> = {
  'public-internet': 'Public internet',
  'region-isolated': 'Region isolated',
  'vpc-only': 'Client VPC only',
  'air-gapped': 'Air-gapped',
};
