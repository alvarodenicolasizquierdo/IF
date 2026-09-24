import raw from './readiness.json';

/**
 * What this console is allowed to claim, and from when.
 *
 * Generated, never typed. `src/data/readiness.json` comes out of
 * scripts/sync-readiness.mjs, which reads two documents that live outside this
 * repository: the seller's readiness register, and the MVP build schedule.
 *
 * The distinction the two documents force, and the reason this file exists:
 *
 *   the register answers  "can I show it on the 14th of October?"
 *   the schedule answers  "when can a client actually have it?"
 *
 * They are not the same question and right now they do not have the same
 * answer — the register was written before the plan was rebased onto a
 * mid-September start, and most of its in-build dates are ahead of the epics
 * that deliver them. A pre-sales console is looked at by clients, so it answers
 * the second question: `showFrom` is whichever of the two is later. The first
 * question belongs in the presenter's planner, which is not published.
 *
 * Dates are rendered as a month. The schedule says why, in its own assumptions
 * sheet: every date in it is arithmetic downstream of two factors nobody has
 * measured yet, so a day is a false precision and a month is the honest shape.
 */

export type CapabilityState = 'live' | 'build' | 'planned';

export interface Capability {
  id: string;
  name: string;
  state: CapabilityState;
  /** When the register says we can show it. Presenter-facing. */
  registerFrom: string;
  /** When the epics that deliver it finish. Null if no epic delivers it. */
  planFrom: string | null;
  /** What a client may be told. The later of the two, unless met by hand. */
  showFrom: string;
  /** `showFrom` as a month and a year, which is the only precision on offer. */
  showFromLabel: string | null;
  epics: string[];
  /** Set when the claim is deliberately met by hand before the software lands. */
  manual: string | null;
}

export const READINESS = {
  /** How current the register is, read off the register itself. */
  asOf: raw.asOf as string,
  syncedAt: raw.syncedAt as string,
  schedule: raw.sources.schedule,
  capabilities: raw.capabilities as Capability[],
} as const;

const BY_ID = new Map(READINESS.capabilities.map((c) => [c.id, c]));

export function capability(id: string): Capability {
  const c = BY_ID.get(id);
  // A missing id means the register was re-synced and something was renamed or
  // dropped. Failing loudly here is the point: the alternative is a dashboard
  // that quietly stops saying anything about a capability it still shows.
  if (!c) throw new Error(`readiness: no capability ${id} — re-run npm run sync:readiness`);
  return c;
}

/** Which register entry stands behind each accelerator on the dashboard. */
export const ACCELERATOR_SOURCE = raw.acceleratorSource as Record<string, string>;

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/** "14 September 2026" — for the provenance line, where the day is a fact. */
export function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
