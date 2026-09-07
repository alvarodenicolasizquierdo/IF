/**
 * Stage Mode fixtures — TalkTrack draft 4.5, parts two and eight.
 *
 * Every string a camera will see lives here, spelled exactly as the copy deck
 * spells it. Nothing on the stage surface improvises text at render time: a
 * frame that reads differently from the copy deck is a frame that has to be
 * shot again, and the recording window is one afternoon.
 */

/** Placeholder brand. Open item: check against the trade mark register by 10 Sept. */
export const APP_NAME = 'Northbound';
export const APP_LEGAL_NAME = 'Northbound Travel';

export interface Property {
  id: string;
  name: string;
  location: string;
  /** Price per night, euros. */
  nightly: number;
  /** Four-night total, euros. Held as a figure rather than derived, because
   *  the copy deck is the contract and arithmetic drift would not be caught. */
  total: number;
  /** Feature B: three of the six qualify. */
  freeCancellation: boolean;
  /** Hue for the generated placeholder image. No real building, no real person. */
  hue: number;
}

export const PROPERTIES: Property[] = [
  { id: 'faro',      name: 'Casa del Faro',  location: 'Cadaqués, Spain',     nightly: 185, total: 740, freeCancellation: true,  hue: 24 },
  { id: 'ropewalk',  name: 'The Ropewalk',   location: 'Whitby, England',     nightly: 120, total: 480, freeCancellation: false, hue: 205 },
  { id: 'serrana',   name: 'Villa Serrana',  location: 'Setúbal, Portugal',   nightly: 210, total: 840, freeCancellation: true,  hue: 168 },
  { id: 'lindenhof', name: 'Haus Lindenhof', location: 'Bregenz, Austria',    nightly: 165, total: 660, freeCancellation: false, hue: 96 },
  { id: 'marinablu', name: 'Marina Blu',     location: 'Trapani, Italy',      nightly: 140, total: 560, freeCancellation: true,  hue: 192 },
  { id: 'fjordly',   name: 'Fjordly',        location: 'Ålesund, Norway',     nightly: 230, total: 920, freeCancellation: false, hue: 220 },
];

export interface Person {
  name: string;
  role: string;
  /** Monogram, never a photograph: nobody's likeness, and no approval step. */
  initials: string;
}

export const PEOPLE = {
  elena:  { name: 'Elena Marchetti',  role: 'Commercial director',        initials: 'EM' },
  tomas:  { name: 'Tomas Berg',       role: 'Head of customer experience', initials: 'TB' },
  sofia:  { name: 'Sofia Almeida',    role: 'Product owner',               initials: 'SA' },
  marta:  { name: 'Marta Kowalczyk',  role: 'Tech lead',                   initials: 'MK' },
  daniel: { name: 'Daniel Osei',      role: 'Release manager',             initials: 'DO' },
} satisfies Record<string, Person>;

export type FeatureId = 'A' | 'B';

export interface Feature {
  id: FeatureId;
  requirement: string;
  requester: Person;
  timestamp: string;
  /** The request in the requester's own words. One sentence. */
  request: string;
  specTitle: string;
  specBody: string;
  doneWhen: string[];
  mustNotBreak: string;
}

export const FEATURES: Record<FeatureId, Feature> = {
  A: {
    id: 'A',
    requirement: 'REQ-118',
    requester: PEOPLE.elena,
    timestamp: '09:12',
    request: 'Show the price per night as well as the total, and let people switch between the two.',
    specTitle: 'Show price per night alongside total',
    specBody:
      'Every property shows both its total price for the selected dates and its price per night. The customer can switch between the two without leaving the page.',
    doneWhen: [
      'Both prices are visible on every result.',
      'Switching between them does not reload the page.',
      'The total still matches what is charged at checkout.',
      'Nothing changes for a customer who does not touch the control.',
    ],
    mustNotBreak: 'The checkout total.',
  },
  B: {
    id: 'B',
    requirement: 'REQ-119',
    requester: PEOPLE.tomas,
    timestamp: '09:12',
    request: 'Put a badge on any property that can be cancelled for free, and let people show only those.',
    specTitle: 'Show which properties can be cancelled for free',
    specBody:
      'Any property whose booking can be cancelled at no cost carries a badge on its card. The customer can choose to see only those properties.',
    doneWhen: [
      'The badge appears on every property that qualifies, and no others.',
      'The filter can be turned on and off without losing the search.',
      'The badge matches the cancellation terms shown at checkout.',
      'Nothing changes for a customer who does not use the filter.',
    ],
    mustNotBreak: 'The cancellation terms at checkout.',
  },
};

/**
 * The gate copy. Refused and passed are the same panel; only the word, the
 * glyph, the bar and the sentence differ, so both states are written here
 * side by side to keep that property visible to whoever edits them next.
 */
export const GATE_COPY = {
  refused: {
    word: 'REFUSED',
    sentence: 'This change does not say which requirement it serves.',
    lines: [
      'Refused by release policy, 09:47',
      'Sent back with a written reason, 09:47',
    ],
  },
  passed: {
    word: 'PASSED',
    approver: PEOPLE.marta,
    approvedAt: '09:51',
  },
} as const;

export const EVIDENCE_PACK = {
  coverLine: 'Signed record of one change',
  footer: 'Readable without Intelligent Flow',
  sections: [
    { n: 1, title: 'The requirement',            owner: PEOPLE.elena },
    { n: 2, title: 'The decisions, and who took them', owner: PEOPLE.sofia },
    { n: 3, title: 'The checks that ran',        owner: PEOPLE.marta },
    { n: 4, title: 'The tests, and what they found', owner: PEOPLE.marta },
    { n: 5, title: 'The approvals',              owner: PEOPLE.daniel },
  ],
} as const;

export type Phase = 'discover' | 'decide' | 'build' | 'operate' | 'improve';
export const PHASES: Phase[] = ['discover', 'decide', 'build', 'operate', 'improve'];
export const PHASE_LABEL: Record<Phase, string> = {
  discover: 'Discover',
  decide: 'Decide',
  build: 'Build',
  operate: 'Operate',
  improve: 'Improve',
};

/** Claim discipline: every frame carries one of these, with no exceptions. */
export type ClaimState = 'now' | 'building' | 'planned';
export const CLAIM_LABEL: Record<ClaimState, string> = {
  now: 'Available now',
  building: 'In build Nov 2026',
  planned: 'Planned',
};

/** Elapsed times the timeline drives. Milliseconds, never wall time. */
export const ELAPSED = {
  specReview: 4 * 60_000 + 12_000,
  final: 11 * 60_000 + 47_000,
} as const;

export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
