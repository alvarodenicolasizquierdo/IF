import type { Persona, PersonaId, TrackId, TrackProfile } from '@/types';

/**
 * The three Avenga delivery tracks (PRD v5 §8).
 * TCO per COSMIC Function Point is the commercial spine of the demo:
 * €1,200 (ungoverned body-shop) → €750 (FDE pilot) → €180 (governed platform).
 */
export const TRACKS: Record<TrackId, TrackProfile> = {
  track1: {
    id: 'track1',
    label: 'Track 1 — Core Resourcing (T&M)',
    shortLabel: 'Track 1',
    wow: 'Traditional Kanban and ticket-by-ticket sprint resourcing. Engineers are placed into client teams as individuals, adapting to whatever tooling the client already runs. No standardised SLAs, no non-bypassable quality gates, code review is manual and inconsistent.',
    controlPlaneBadge: 'NO ACTIVE CONTROL PLANE',
    controlPlaneTone: 'violation',
    metrics: {
      leadTimeDays: 14.2,
      changeFailureRate: 28.0,
      defectEscapeRatio: 12.0,
      maturityMultiplier: 1.0,
      tcoPerCfp: 1200,
    },
    modelRouting: 'Not unified — default IDE tooling, ungoverned egress',
    defaultPersona: 'lead-fde',
    aupiSeries: [42, 41, 39, 38, 36, 34],
    cfrSeries: [28, 29, 32, 35, 39, 44],
    tcoSeries: [1200, 1215, 1240, 1260, 1285, 1310],
  },
  'track1.5': {
    id: 'track1.5',
    label: 'Track 1.5 — Forward-Deployed Engineers',
    shortLabel: 'Track 1.5',
    wow: 'Consultative FDE Mod Squads embedded for a 60-to-90 day window. Eight-dimensional AI Readiness Assessment, tool-landscape mapping, and the non-disruptive Intelligent Flow Pulse telemetry collector establishing a measured baseline before any platform change.',
    controlPlaneBadge: 'TELEMETRY PULSE LOGGING',
    controlPlaneTone: 'hitl',
    metrics: {
      leadTimeDays: 9.2,
      changeFailureRate: 18.5,
      defectEscapeRatio: 7.4,
      maturityMultiplier: 1.15,
      tcoPerCfp: 750,
    },
    modelRouting: 'Claude 3.5 Sonnet — Bedrock transit enclave (eu-central-1)',
    defaultPersona: 'lead-fde',
    aupiSeries: [42, 48, 54, 58, 61, 64],
    cfrSeries: [28, 25, 21, 20, 19, 18.5],
    tcoSeries: [1200, 1040, 930, 855, 790, 750],
  },
  track2: {
    id: 'track2',
    label: 'Track 2 — Intelligent Flow Platform',
    shortLabel: 'Track 2',
    wow: 'Small, senior-weighted Mod Squads under complete control plane enforcement. Operations-as-Code: requirements become in-repo ADRs, the agentic pipeline executes under cryptographic Mandates, and non-bypassable OPA gates compile signed Evidence Packs.',
    controlPlaneBadge: 'MANDATE ACTIVE',
    controlPlaneTone: 'passed',
    metrics: {
      leadTimeDays: 2.1,
      changeFailureRate: 4.2,
      defectEscapeRatio: 1.1,
      maturityMultiplier: 1.44,
      tcoPerCfp: 180,
    },
    modelRouting: 'AWS Bedrock — Claude 3.5 Sonnet (isolated region: eu-central-1)',
    defaultPersona: 'ai-agent',
    aupiSeries: [42, 51, 62, 73, 81, 91],
    cfrSeries: [28, 17, 11, 7.5, 5.4, 4.2],
    tcoSeries: [1200, 720, 470, 320, 235, 180],
  },
};

export const TRACK_ORDER: TrackId[] = ['track1', 'track1.5', 'track2'];

/** A-UPI curve after a human signs the Evidence Pack at the HITL gate. */
export const SIGNED_UPLIFT = {
  aupiSeries: [42, 55, 68, 79, 88, 97],
  metrics: {
    leadTimeDays: 1.3,
    changeFailureRate: 1.2,
    defectEscapeRatio: 0.4,
    maturityMultiplier: 1.58,
    tcoPerCfp: 165,
  },
};

/**
 * RBAC Personas (PRD v5 §6.9). Separation of duties is the DORA / EU AI Act
 * Article 14 proof point — only the CISO identity can sign an Evidence Pack.
 */
export const PERSONAS: Record<PersonaId, Persona> = {
  'lead-fde': {
    id: 'lead-fde',
    name: 'Lead FDE',
    accessLevel: 'HIGH READ / BASELINE DEV',
    trackContext: 'Track 1.5 — Forward-Deployed',
    canSignEvidencePack: false,
    tone: 'active',
  },
  'ai-agent': {
    id: 'ai-agent',
    name: 'AI Agent (Bounded)',
    accessLevel: 'RESTRICTED FILE-WRITE',
    trackContext: 'Track 2 — Task-scoped non-human identity',
    canSignEvidencePack: false,
    tone: 'hitl',
  },
  ciso: {
    id: 'ciso',
    name: 'CISO / Human Operator',
    accessLevel: 'FULL SIGN-OFF PRIVILEGES',
    trackContext: 'Track 2 — Human-on-the-loop',
    canSignEvidencePack: true,
    tone: 'passed',
  },
};

export const PERSONA_ORDER: PersonaId[] = ['lead-fde', 'ai-agent', 'ciso'];
