/**
 * Definitions for the vocabulary a client will not know on first sight.
 *
 * These are demo copy, not decoration: each one is what the presenter would
 * otherwise have to say out loud, so they are written to be read silently by
 * an evaluator while the presenter keeps talking. Plain language, one idea
 * each, no acronym left unexpanded.
 */
export const GLOSSARY = {
  aupi:
    'Avenga Unified Productivity Index. A composite of speed, quality and sustainability, normalised so two teams on different stacks can be compared. Raw DORA metrics go in; the Maturity Multiplier scales them by how much governance is actually enforced.',

  maturityMultiplier:
    'How much of the raw productivity gain is real and durable. Computed from OPA gate adherence and context freshness — an ungoverned team scores 1.00× no matter how fast it looks, because its speed is borrowed against future rework.',

  cfp:
    'COSMIC Function Point. An ISO-standard measure of delivered functionality, counted from data movements rather than lines of code — so it does not reward an AI that writes more code to do the same job. Cost per CFP is the only comparison that survives an AI-native shift.',

  tco:
    'What one unit of delivered functionality actually costs, all-in: engineering time, rework, defect escape and compliance effort. The demo tracks it per COSMIC Function Point so the number is comparable across tracks.',

  leadTime:
    'Delivery lead time — the clock from a change being committed to it running in production. One of the four DORA metrics.',

  changeFailureRate:
    'The share of production changes that cause a degradation needing remediation — a hotfix, rollback or patch.',

  defectEscape:
    'The share of defects that reach production rather than being caught by a gate upstream. The metric AI code generation degrades fastest when nothing governs it.',

  mandate:
    'A cryptographic contract issued to an agent before it may touch a repository: which exact file paths it can write, how many tokens it may spend, how many loops it may run, and when it expires. Out-of-bounds work voids it instantly.',

  evidencePack:
    'The signed audit record of one change — prompt inputs, model version, policy verdicts, test coverage and the named human who approved it, bound in a hash chain. This is what satisfies EU AI Act Article 15 traceability.',

  opa:
    'Open Policy Agent — the open-source engine that evaluates policy written as code. Here it runs the gate pack: a commit that fails any gate cannot be merged, so compliance is enforced rather than audited afterwards.',

  mcpGateway:
    'Model Context Protocol gateway. Every tool-call an agent makes — reading a file, fetching a ticket, writing code — is intercepted here and its payload validated against a schema before it executes. Nothing reaches your systems unchecked.',

  hitl:
    'Human-in-the-loop. A non-bypassable checkpoint modelled on aviation: before an irreversible action, a named human with the right role must sign. The pipeline physically cannot proceed without it.',

  blastRadius:
    'What this change can break if it is wrong — which files, which downstream systems, and whether it can be rolled back. Pre-analysed by a security sub-agent so the human approving it is not reading a diff cold.',

  fcee:
    'The Continuous Evolution loop that runs after deployment: monitor, analyse, propose, review, execute, validate, learn. It is what stops the estate decaying between releases.',

  contextFreshness:
    'How current the material an agent retrieves actually is. Stale context is the main cause of confidently wrong AI output — an agent given a 2023 tax schema will apply 2023 rates with total confidence.',

  rbacPersona:
    'The identity the platform is acting as right now, and what that identity is allowed to do. Agents run under task-scoped non-human identities; only a named human with signing privileges can approve a production merge.',

  oidc:
    'OpenID Connect — the standard behind the verified identity badge. Every action is attributable to a specific human or a specific task-scoped agent, never a shared team credential.',

  codeDrift:
    'A change made to the repository outside the control plane — a manual push, a local script. The platform detects it because the repository state no longer matches the signed Mandate, and freezes the merge path.',

  goldenBridge:
    'Agents are only as reliable as the data they can reach. This probe scores the context library before a single token is spent, and the control plane refuses to issue a Mandate against unclassified or stale sources.',

  tokenBudget:
    'A hard ceiling on what one agent run may spend, enforced by the gateway rather than trusted to the agent. It is the difference between a bounded task and a runaway inference bill.',

  assuranceTier:
    'Which class of infrastructure a model runs on, from a public API up to air-gapped weights on your own hardware. The tier determines where your data can travel — the Control Plane enforces it rather than trusting a configuration note.',

  sovereignty:
    'Whether you could keep running this if the vendor relationship ended tomorrow. Open weights on your own GPUs mean the answer is yes.',

  auditVulnerability:
    'A gap that would fail an audit if the regulation were enforced today — not a theoretical risk, a finding with a named article behind it.',

  track:
    'How Avenga engages. Track 1 is traditional staff augmentation. Track 1.5 embeds forward-deployed engineers to measure a baseline. Track 2 is the governed platform running as a managed service.',

  spine:
    'The traceability spine — the index linking requirement to decision to code to test to release to control. It is what makes "show me why this line exists" a query rather than an archaeology project.',
} as const;

export type GlossaryKey = keyof typeof GLOSSARY;
