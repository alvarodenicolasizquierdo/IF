import { create } from 'zustand';
import type {
  AuditLogEntry,
  CompetitorExploit,
  EvidencePack,
  GateVerdict,
  Mandate,
  PersonaId,
  PhaseId,
  ScreenId,
  ToastMessage,
  TrackId,
  TrackMetrics,
} from '@/types';
import { PERSONAS, SIGNED_UPLIFT, TRACKS } from '@/data/tracks';
import {
  CLIENT_CONTEXT,
  COMPETITOR_EXPLOITS,
  GOVERNED_CODE,
  MCP_INTERCEPTS,
  PHASES,
} from '@/data/scenario';
import { DEFAULT_MODEL_ID, getModel, MODELS } from '@/data/models';
import { mintToken, sha256Hex } from '@/lib/sha256';

const PHASE_SCREEN: Record<PhaseId, ScreenId> = {
  DISCOVER: 'context',
  DECIDE: 'context',
  BUILD: 'execution',
  OPERATE: 'execution',
  IMPROVE: 'evolution',
};

/**
 * Track 2 binds a distinct RBAC persona to each phase — the visible proof of
 * separation of duties. Only the CISO identity may sign an Evidence Pack.
 */
function personaForPhase(track: TrackId, phase: PhaseId, current: PersonaId): PersonaId {
  if (track !== 'track2') return TRACKS[track].defaultPersona;
  if (phase === 'BUILD') return 'ai-agent';
  if (phase === 'OPERATE') return 'ciso';
  if (phase === 'DISCOVER' || phase === 'DECIDE' || phase === 'IMPROVE') return 'lead-fde';
  return current;
}

const INITIAL_MANDATE: Mandate = {
  token: 'MND-F839A2B91C',
  status: 'UNSIGNED',
  allowedScope: CLIENT_CONTEXT.targetFile,
  maxIterations: 5,
  budgetTokens: 50_000,
  tokensConsumed: 1_450,
  expiryMinutes: 15,
  signedBy: null,
  voidReason: null,
};

const INITIAL_GATES: Record<string, GateVerdict> = {
  requirements_traceability: 'PENDING',
  finance_policy_pack_v1: 'PENDING',
  dependency_scan: 'PENDING',
  gitops_origin_provenance: 'PENDING',
  pii_egress_control: 'PENDING',
};

function buildEvidencePack(): EvidencePack {
  return {
    id: 'EP-7A9B4C2D',
    timestamp: new Date().toISOString(),
    selectedModel: 'amazon.bedrock.anthropic.claude-3-5-sonnet',
    mandateId: INITIAL_MANDATE.token,
    verificationStatus: 'DISCOVERING_BASELINE',
    contextIntegrityHash: `0x${sha256Hex(CLIENT_CONTEXT.targetFile).slice(0, 16)}`,
    statementCoverage: '—',
    opaGates: { ...INITIAL_GATES },
    signature: null,
    signedBy: null,
  };
}

let sequence = 0;
const nextId = (prefix: string) => `${prefix}-${(sequence += 1)}`;

/** Deferred HITL gate opening, cancelled whenever the phase moves on. */
let pendingGateTimer: ReturnType<typeof setTimeout> | null = null;

interface DemoState {
  /* ---- Narrative state ---- */
  activeTrack: TrackId;
  activePhase: PhaseId;
  activePersona: PersonaId;
  activeScreen: ScreenId;
  presenterMode: boolean;

  /* ---- Governance state ---- */
  mandate: Mandate;
  evidencePack: EvidencePack;
  controlPlaneEnforced: boolean;
  driftDetected: boolean;
  dataRemediated: boolean;
  /** Which route in the LLM Gateway catalogue is live. */
  activeModelId: string;
  metricsOverride: TrackMetrics | null;
  aupiOverride: number[] | null;

  /* ---- Execution state ---- */
  agentRunning: boolean;
  interceptIndex: number;
  codeRevealed: boolean;
  fceeStepIndex: number;
  remediationPrRaised: boolean;

  /* ---- Overlays ---- */
  hitlGateOpen: boolean;
  regulatoryOverlayOpen: boolean;
  regulatoryScanComplete: boolean;
  /**
   * The assessment always scans the client's *current, ungoverned* pipeline,
   * so it must not read the demo's ambient track. Only pressing "Enforce
   * control plane" flips the verdicts — that is the whole shock.
   */
  regulatoryRemediated: boolean;
  avengaIntelligenceOpen: boolean;
  activeExploit: CompetitorExploit | null;

  /* ---- Feedback ---- */
  toasts: ToastMessage[];
  auditLog: AuditLogEntry[];

  /* ---- Actions ---- */
  setTrack: (track: TrackId) => void;
  setPhase: (phase: PhaseId) => void;
  advancePhase: () => void;
  setPersona: (persona: PersonaId) => void;
  setScreen: (screen: ScreenId) => void;
  togglePresenterMode: () => void;
  setPresenterMode: (open: boolean) => void;

  signMandate: () => void;
  updateMandate: (patch: Partial<Pick<Mandate, 'maxIterations' | 'budgetTokens' | 'expiryMinutes'>>) => void;
  runOpaCheck: () => void;
  advanceIntercept: () => void;
  injectDrift: () => void;

  openHitlGate: () => void;
  approveGate: () => void;
  rejectGate: () => void;

  openRegulatoryOverlay: () => void;
  completeRegulatoryScan: () => void;
  closeRegulatoryOverlay: () => void;
  enforceControlPlane: () => void;

  openAvengaIntelligence: () => void;
  closeAvengaIntelligence: () => void;
  remediateContextLibrary: () => void;

  triggerExploit: (id: CompetitorExploit['id']) => void;
  dismissExploit: () => void;
  closeExploit: () => void;
  swapToSovereignModel: () => void;
  setModel: (id: string) => void;

  advanceFcee: () => void;
  raiseRemediationPr: () => void;

  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  log: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;

  resetDemo: () => void;
}

const initialState = () => ({
  activeTrack: 'track2' as TrackId,
  activePhase: 'DISCOVER' as PhaseId,
  activePersona: 'lead-fde' as PersonaId,
  activeScreen: 'dashboard' as ScreenId,
  presenterMode: false,

  mandate: { ...INITIAL_MANDATE },
  evidencePack: buildEvidencePack(),
  controlPlaneEnforced: true,
  driftDetected: false,
  dataRemediated: false,
  activeModelId: DEFAULT_MODEL_ID,
  metricsOverride: null,
  aupiOverride: null,

  agentRunning: false,
  interceptIndex: 0,
  codeRevealed: false,
  fceeStepIndex: 2,
  remediationPrRaised: false,

  hitlGateOpen: false,
  regulatoryOverlayOpen: false,
  regulatoryScanComplete: false,
  regulatoryRemediated: false,
  avengaIntelligenceOpen: false,
  activeExploit: null,

  toasts: [] as ToastMessage[],
  auditLog: [] as AuditLogEntry[],
});

export const useDemoStore = create<DemoState>((set, get) => ({
  ...initialState(),

  /* ------------------------------------------------------------------ */
  /* Narrative                                                           */
  /* ------------------------------------------------------------------ */

  setTrack: (track) => {
    const profile = TRACKS[track];
    set({
      activeTrack: track,
      // Persona follows the phase, not the track default — otherwise switching
      // track mid-demo would show an agent identity on a human-owned phase.
      activePersona: personaForPhase(track, get().activePhase, get().activePersona),
      metricsOverride: null,
      aupiOverride: null,
      controlPlaneEnforced: track === 'track2',
    });
    get().log({
      phase: get().activePhase,
      actor: 'Presenter',
      message: `Engagement track switched to ${profile.shortLabel} — TCO €${profile.metrics.tcoPerCfp} per CFP.`,
      tone: track === 'track2' ? 'passed' : track === 'track1' ? 'violation' : 'hitl',
    });
  },

  setPhase: (phase) => {
    const { activeTrack } = get();
    const persona = personaForPhase(activeTrack, phase, get().activePersona);

    set({
      activePhase: phase,
      activeScreen: PHASE_SCREEN[phase],
      activePersona: persona,
      hitlGateOpen: false,
    });

    if (phase === 'BUILD') set({ agentRunning: true });
    if (phase === 'OPERATE' && activeTrack === 'track2' && !get().driftDetected) {
      // The gate is the point of the OPERATE phase, so open it a beat later —
      // but only if the presenter is still on OPERATE. Without this guard a
      // quick jump onward leaves a stale timer that pops the gate on the
      // wrong phase and re-assumes the CISO identity.
      if (pendingGateTimer !== null) clearTimeout(pendingGateTimer);
      pendingGateTimer = setTimeout(() => {
        pendingGateTimer = null;
        if (get().activePhase === 'OPERATE') get().openHitlGate();
      }, 650);
    }

    get().log({
      phase,
      actor: 'Lifecycle Enforcement Engine',
      message: `Phase transition committed → ${phase}.`,
      tone: 'active',
    });
  },

  advancePhase: () => {
    const index = PHASES.indexOf(get().activePhase);
    get().setPhase(PHASES[(index + 1) % PHASES.length]);
  },

  setPersona: (persona) => {
    set({ activePersona: persona });
    get().log({
      phase: get().activePhase,
      actor: 'OIDC Identity Broker',
      message: `Active RBAC persona assumed: ${PERSONAS[persona].name} — ${PERSONAS[persona].accessLevel}.`,
      tone: PERSONAS[persona].tone,
    });
  },

  setScreen: (screen) => set({ activeScreen: screen }),

  togglePresenterMode: () => set((s) => ({ presenterMode: !s.presenterMode })),
  setPresenterMode: (open) => set({ presenterMode: open }),

  /* ------------------------------------------------------------------ */
  /* Mandate & execution                                                 */
  /* ------------------------------------------------------------------ */

  signMandate: () => {
    const { mandate, activePersona } = get();
    const token = mintToken('MND', 6, `${CLIENT_CONTEXT.workItem}:${mandate.budgetTokens}`);
    set({
      mandate: {
        ...mandate,
        token,
        status: 'ACTIVE',
        signedBy: PERSONAS[activePersona].name,
        voidReason: null,
      },
      evidencePack: {
        ...get().evidencePack,
        mandateId: token,
        verificationStatus: 'ACTIVE_RUN',
        opaGates: { ...get().evidencePack.opaGates, requirements_traceability: 'PASSED' },
      },
    });
    get().pushToast({
      title: 'Mandate signed',
      detail: `${token} bound to ${mandate.allowedScope}. Temporal boundary ${mandate.expiryMinutes} minutes.`,
      tone: 'passed',
    });
    get().log({
      phase: 'DECIDE',
      actor: PERSONAS[activePersona].name,
      message: `Cryptographic Mandate ${token} signed and bound to repository file scope.`,
      tone: 'passed',
    });
    get().setPhase('BUILD');
  },

  updateMandate: (patch) => set((s) => ({ mandate: { ...s.mandate, ...patch } })),

  runOpaCheck: () => {
    const { mandate, evidencePack } = get();
    const withinBudget = mandate.tokensConsumed <= mandate.budgetTokens;
    const scopeIntact = !get().driftDetected;

    set({
      evidencePack: {
        ...evidencePack,
        opaGates: {
          ...evidencePack.opaGates,
          finance_policy_pack_v1: 'PASSED',
          dependency_scan: 'PASSED',
          // Same rule as the route switch: egress is a property of the
          // destination, not of how tidy the context library is.
          pii_egress_control: getModel(get().activeModelId).piiSafe ? 'PASSED' : 'FAILED',
          gitops_origin_provenance: scopeIntact ? 'PASSED' : 'FAILED',
        },
      },
    });

    get().pushToast({
      title: scopeIntact && withinBudget ? 'OPA policy conformity verified' : 'OPA policy violation',
      detail: scopeIntact
        ? `Model sovereignty, token bounds (${mandate.tokensConsumed.toLocaleString()} / ${mandate.budgetTokens.toLocaleString()}) and path allowlist all satisfied.`
        : 'GitOps origin provenance failed — repository state no longer matches the signed Mandate.',
      tone: scopeIntact && withinBudget ? 'passed' : 'violation',
    });
    get().log({
      phase: get().activePhase,
      actor: 'Open Policy Agent',
      message: scopeIntact
        ? 'Policy evaluation complete — 100% conformity across the Finance-EU-v1 gate pack.'
        : 'Policy evaluation failed — out-of-band mutation detected against signed Mandate.',
      tone: scopeIntact ? 'passed' : 'violation',
    });
  },

  advanceIntercept: () => {
    const { interceptIndex, mandate } = get();
    if (interceptIndex >= MCP_INTERCEPTS.length) return;

    const intercept = MCP_INTERCEPTS[interceptIndex];
    const spend = 2_450 + interceptIndex * 1_780;
    const consumed = Math.min(mandate.tokensConsumed + spend, mandate.budgetTokens);

    set({
      interceptIndex: interceptIndex + 1,
      mandate: { ...mandate, tokensConsumed: consumed },
      codeRevealed: interceptIndex >= 2 ? true : get().codeRevealed,
      evidencePack: {
        ...get().evidencePack,
        contextIntegrityHash: `0x${sha256Hex(`${GOVERNED_CODE}:${interceptIndex}`).slice(0, 16)}`,
        statementCoverage: interceptIndex >= 3 ? '100%' : get().evidencePack.statementCoverage,
        verificationStatus: 'ACTIVE_RUN',
      },
    });

    get().pushToast({
      title: 'MCP Gateway',
      detail: intercept.detail,
      tone: 'passed',
    });
    get().log({
      phase: 'BUILD',
      actor: 'MCP Gateway Proxy',
      message: intercept.detail,
      tone: 'passed',
    });
  },

  injectDrift: () => {
    const { mandate } = get();
    set({
      driftDetected: true,
      mandate: {
        ...mandate,
        status: 'VOIDED',
        voidReason: 'Out-of-band file system mutation detected outside the signed Mandate scope.',
      },
      evidencePack: {
        ...get().evidencePack,
        verificationStatus: 'VOIDED',
        opaGates: { ...get().evidencePack.opaGates, gitops_origin_provenance: 'FAILED' },
      },
      hitlGateOpen: false,
    });
    get().pushToast({
      title: 'CONTROL PLANE LOCKOUT',
      detail: 'Out-of-band file system mutation detected. Mandate voided immediately.',
      tone: 'violation',
    });
    get().log({
      phase: get().activePhase,
      actor: 'Repository Boundary Watchdog',
      message:
        'Manual git push bypassed the control plane. Merge path frozen until the diff matches the signed Mandate.',
      tone: 'violation',
    });
  },

  /* ------------------------------------------------------------------ */
  /* HITL gate                                                           */
  /* ------------------------------------------------------------------ */

  openHitlGate: () => {
    if (get().mandate.status === 'VOIDED') {
      get().pushToast({
        title: 'Gate unavailable',
        detail: 'The Mandate is voided. Re-sign a Mandate before requesting human authorisation.',
        tone: 'violation',
      });
      return;
    }
    set({
      hitlGateOpen: true,
      activePersona: 'ciso',
      evidencePack: { ...get().evidencePack, verificationStatus: 'PENDING_HUMAN_SIGNATURE' },
    });
    get().log({
      phase: 'OPERATE',
      actor: 'Lifecycle Enforcement Engine',
      message:
        'Non-reversible action intercepted. Aviation-style checkpoint raised — awaiting named human signature.',
      tone: 'hitl',
    });
  },

  approveGate: () => {
    const { evidencePack, activePersona } = get();
    const persona = PERSONAS[activePersona];
    const payload = JSON.stringify({
      id: evidencePack.id,
      mandate: evidencePack.mandateId,
      model: evidencePack.selectedModel,
      gates: evidencePack.opaGates,
      signatory: persona.name,
    });
    const signature = sha256Hex(payload);

    set({
      hitlGateOpen: false,
      mandate: { ...get().mandate, status: 'DISCHARGED' },
      metricsOverride: SIGNED_UPLIFT.metrics,
      aupiOverride: SIGNED_UPLIFT.aupiSeries,
      evidencePack: {
        ...evidencePack,
        verificationStatus: 'SIGNED_AND_SEALED',
        signature,
        signedBy: persona.name,
        statementCoverage: '100%',
        opaGates: Object.fromEntries(
          Object.keys(evidencePack.opaGates).map((key) => [key, 'PASSED' as GateVerdict]),
        ),
      },
    });

    get().pushToast({
      title: 'Evidence Pack signed and sealed',
      detail: `${evidencePack.id} committed to the immutable audit ledger. Deployment pipeline released.`,
      tone: 'passed',
    });
    get().log({
      phase: 'OPERATE',
      actor: persona.name,
      message: `Evidence Pack ${evidencePack.id} cryptographically signed — sha256:${signature.slice(0, 16)}…`,
      tone: 'passed',
    });
    get().setPhase('IMPROVE');
  },

  rejectGate: () => {
    set({
      hitlGateOpen: false,
      mandate: {
        ...get().mandate,
        status: 'VOIDED',
        voidReason: 'Human operator rejected the change at the governance gate.',
      },
      evidencePack: { ...get().evidencePack, verificationStatus: 'VOIDED' },
    });
    get().pushToast({
      title: 'Mandate revoked',
      detail: 'Changes reverted to Legacy Billing Code v1.0. Baseline safety metrics maintained.',
      tone: 'violation',
    });
    get().log({
      phase: 'OPERATE',
      actor: PERSONAS[get().activePersona].name,
      message: 'Gate rejected. Mandate voided and the feature branch rolled back.',
      tone: 'violation',
    });
  },

  /* ------------------------------------------------------------------ */
  /* Regulatory shock                                                    */
  /* ------------------------------------------------------------------ */

  openRegulatoryOverlay: () =>
    set({
      regulatoryOverlayOpen: true,
      regulatoryScanComplete: false,
      regulatoryRemediated: false,
      presenterMode: false,
    }),

  completeRegulatoryScan: () => set({ regulatoryScanComplete: true }),

  closeRegulatoryOverlay: () => set({ regulatoryOverlayOpen: false }),

  enforceControlPlane: () => {
    set({ regulatoryRemediated: true, controlPlaneEnforced: true, driftDetected: false });
    get().setTrack('track2');
    get().pushToast({
      title: 'Control Plane enforced',
      detail:
        'OPA gates locked in-line, sovereign routing pinned, Evidence Pack compilation reactivated. Audit vulnerability reduced to zero.',
      tone: 'passed',
    });
    get().log({
      phase: get().activePhase,
      actor: 'Control Plane',
      message:
        'Regulatory audit vulnerabilities remediated — EU AI Act Art. 14/15, DORA 8–9 and GDPR controls now enforced as non-bypassable gates.',
      tone: 'passed',
    });
  },

  /* ------------------------------------------------------------------ */
  /* Golden Bridge — Avenga Intelligence                                 */
  /* ------------------------------------------------------------------ */

  openAvengaIntelligence: () => set({ avengaIntelligenceOpen: true }),
  closeAvengaIntelligence: () => set({ avengaIntelligenceOpen: false }),

  remediateContextLibrary: () => {
    set({ dataRemediated: true, avengaIntelligenceOpen: false });
    get().pushToast({
      title: 'Context Library remediated',
      detail:
        'Data Product Factory re-indexed the tax schema and classified the billing extract. Context freshness restored to 97%.',
      tone: 'passed',
    });
    get().log({
      phase: get().activePhase,
      actor: 'Avenga Intelligence',
      message:
        'Stale schema re-indexed, unclassified source quarantined and labelled. Sovereign routing override released.',
      tone: 'passed',
    });
  },

  /* ------------------------------------------------------------------ */
  /* Demolition Matrix                                                   */
  /* ------------------------------------------------------------------ */

  triggerExploit: (id) => {
    const exploit = COMPETITOR_EXPLOITS[id];
    set({ activeExploit: exploit, presenterMode: false });
    get().log({
      phase: get().activePhase,
      actor: 'Presenter — God Mode',
      message: `Demolition point armed: ${exploit.vendor} (${exploit.product}) — ${exploit.trap}.`,
      tone: exploit.tone,
    });
  },

  closeExploit: () => set({ activeExploit: null }),

  dismissExploit: () => {
    const exploit = get().activeExploit;
    set({ activeExploit: null });
    if (!exploit) return;

    // Each demolition point ends in a live proof, not a slide.
    if (exploit.id === 'epam') {
      get().setPhase('BUILD');
      get().injectDrift();
    } else if (exploit.id === 'coforge') {
      get().setPhase('DECIDE');
      get().pushToast({
        title: 'Tool sovereignty asserted',
        detail: `Standard ${CLIENT_CONTEXT.scmConnector}, standard JS/TS, standard IDEs — wrapped, never replaced.`,
        tone: 'passed',
      });
    } else if (exploit.id === 'cognizant') {
      get().setPhase('OPERATE');
    } else if (exploit.id === 'persistent') {
      get().swapToSovereignModel();
    } else if (exploit.id === 'wonderful') {
      get().setPhase('DECIDE');
      get().pushToast({
        title: 'Mandate guardrails',
        detail: 'Scope allowlist, hard token cap and temporal expiry — the agent has a hall-pass, not a master key.',
        tone: 'active',
      });
    }
  },

  setModel: (id) => {
    const model = getModel(id);
    const previous = getModel(get().activeModelId);
    set({
      activeModelId: id,
      evidencePack: {
        ...get().evidencePack,
        selectedModel: model.routeId,
        opaGates: {
          ...get().evidencePack.opaGates,
          // Routing classified context to a model that egresses to the public
          // internet is the GDPR finding, evaluated live rather than narrated.
          //
          // Deliberately independent of dataRemediated: classifying the context
          // library is a different control from where classified payloads may
          // travel. Cleaning the data does not license sending it to a public
          // endpoint — if anything, knowing it holds PII sharpens the finding.
          pii_egress_control: model.piiSafe ? 'PASSED' : 'FAILED',
        },
      },
    });

    get().pushToast({
      title: 'LLM Gateway re-routed',
      detail: `${model.name} — Tier ${model.tier}, ${model.tierLabel}. ${model.note}`,
      tone: model.piiSafe ? 'passed' : 'violation',
    });
    get().log({
      phase: get().activePhase,
      actor: 'LiteLLM Multi-Tier Gateway',
      message: `Route switched ${previous.name} → ${model.name} (${model.routeId}). Residency: ${model.dataResidency}.`,
      tone: model.piiSafe ? 'passed' : 'violation',
    });
  },

  swapToSovereignModel: () => {
    // The demolition point against proprietary-editor lock-in: jump straight to
    // the deepest sovereign tier, then back, without touching anything else.
    const onSovereign = getModel(get().activeModelId).hosting === 'sovereign';
    const target = onSovereign
      ? DEFAULT_MODEL_ID
      : (MODELS.find((m) => m.tier === 4) ?? MODELS[MODELS.length - 1]).id;
    get().setModel(target);
  },

  /* ------------------------------------------------------------------ */
  /* Continuous Evolution                                                */
  /* ------------------------------------------------------------------ */

  advanceFcee: () => set((s) => ({ fceeStepIndex: Math.min(s.fceeStepIndex + 1, 6) })),

  raiseRemediationPr: () => {
    set({ remediationPrRaised: true, fceeStepIndex: Math.max(get().fceeStepIndex, 3) });
    get().pushToast({
      title: 'Remediation PR raised',
      detail:
        'Dependency refactor drafted under a fresh, temporally bounded Mandate. Awaiting human review at the same gate.',
      tone: 'active',
    });
    get().log({
      phase: 'IMPROVE',
      actor: 'Continuous Evolution Engine',
      message:
        'Automated remediation pull-request opened against billing-gateway-v2 for the deprecated tax API dependency.',
      tone: 'active',
    });
  },

  /* ------------------------------------------------------------------ */
  /* Feedback plumbing                                                   */
  /* ------------------------------------------------------------------ */

  pushToast: (toast) => {
    const id = nextId('toast');
    set((s) => ({ toasts: [...s.toasts.slice(-2), { ...toast, id }] }));
    setTimeout(() => get().dismissToast(id), 6_000);
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  log: (entry) =>
    set((s) => ({
      auditLog: [
        {
          ...entry,
          id: nextId('log'),
          timestamp: new Date().toISOString(),
        },
        ...s.auditLog,
      ].slice(0, 60),
    })),

  resetDemo: () => {
    if (pendingGateTimer !== null) {
      clearTimeout(pendingGateTimer);
      pendingGateTimer = null;
    }
    set({ ...initialState() });
    get().pushToast({
      title: 'Simulation reset',
      detail: `${CLIENT_CONTEXT.client} baseline restored. Phase returned to DISCOVER.`,
      tone: 'active',
    });
  },
}));

/* -------------------------------------------------------------------- */
/* Selectors                                                             */
/* -------------------------------------------------------------------- */

/** Metrics currently on screen: track baseline, unless a signed gate lifted them. */
export const selectMetrics = (s: DemoState): TrackMetrics =>
  s.metricsOverride ?? TRACKS[s.activeTrack].metrics;

/** The governed A-UPI curve, lifted after a human signs the Evidence Pack. */
export const selectAupiSeries = (s: DemoState): number[] =>
  s.aupiOverride ?? TRACKS[s.activeTrack].aupiSeries;

export const selectModel = (s: DemoState) => getModel(s.activeModelId);

export const selectModelRouting = (s: DemoState): string => {
  const m = getModel(s.activeModelId);
  return `${m.name} · ${m.dataResidency}`;
};

export const selectPersona = (s: DemoState) => PERSONAS[s.activePersona];

export const selectTrack = (s: DemoState) => TRACKS[s.activeTrack];
