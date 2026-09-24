import { ACCELERATOR_SOURCE, capability, type CapabilityState } from './readiness';

/**
 * The accelerators — the modules Avenga drops into a client's own platform.
 *
 * This is the commercial shape of the product and it was the one thing the
 * dashboard never said out loud. Intelligent Flow is not sold as a monolith
 * somebody has to adopt whole; it arrives a module at a time, alongside
 * delivery, into the estate the client already has. "La idea es ir creando
 * aceleradores según vamos haciendo entregas a los proyectos que tenemos de
 * cliente."
 *
 * Every one of these maps to something this console already demonstrates, so
 * nothing here is a claim the demo cannot back up on the spot.
 *
 * ---------------------------------------------------------------------------
 * On `status` and the date beside it — the part that can embarrass us.
 *
 * These used to be inferred from the December plan. They are not inferred any
 * more. Each accelerator names an entry in the readiness register, and the
 * state and the date are read from src/data/readiness.json, which is generated
 * from the register and the build schedule together. Nobody types a month into
 * this file, and when the register moves the dashboard moves with it.
 *
 * The date shown is when a client can have the thing, not when we can
 * demonstrate it. Where those differ — and today they differ on almost every
 * line, because the register predates the plan's rebase onto a mid-September
 * start — the later of the two wins. Showing the earlier one to a client is
 * the exact failure the claim discipline exists to prevent.
 *
 * What stays hand-written here is the sentence: the register is not written in
 * a client's language and should not be pasted into one.
 * ---------------------------------------------------------------------------
 */

export type AcceleratorStatus = CapabilityState;

export interface Accelerator {
  id: string;
  name: string;
  /** One line. What it does for the client, not how it works. */
  line: string;
  status: AcceleratorStatus;
  /** A month and a year, from the register. Absent only if the register has none. */
  when: string | null;
  /** Where in this console you can show it working. */
  provenIn: string;
  /** The register entry this is answerable to. */
  source: string;
}

interface Copy {
  id: keyof typeof ACCELERATOR_SOURCE & string;
  name: string;
  line: string;
  provenIn: string;
}

const COPY: Copy[] = [
  {
    id: 'spec-driven',
    name: 'Spec-driven delivery',
    line: 'Requirements, specs and tasks live as files beside the code, so a change to the requirement does not cost you the work.',
    provenIn: 'Running at clients today',
  },
  {
    id: 'context-probe',
    name: 'Context probe',
    line: 'Checks what the AI is about to rely on, and stops it before a token is spent if the data is stale or unclassified.',
    provenIn: 'Context & Mandate — Run probe',
  },
  {
    id: 'mandate',
    name: 'Mandate',
    line: 'Sets what an agent may touch, for how long, and how much it may spend. Signed by a named person.',
    provenIn: 'Context & Mandate — Sign Mandate',
  },
  {
    id: 'gates',
    name: 'Policy gates',
    line: 'A named approver on the changes you are most afraid of. A gate that never says no is decoration.',
    provenIn: 'Grounded Execution — the gate',
  },
  {
    id: 'evidence',
    name: 'Evidence Pack',
    line: 'The signed record of one change: what was asked for, what was checked, who said yes. Readable without us.',
    provenIn: 'Grounded Execution — Evidence Pack',
  },
  {
    id: 'evolution',
    name: 'Evolution loop',
    line: 'Watches after go-live and drafts the fix itself, under the same gates. Nobody has to file a ticket.',
    provenIn: 'Continuous Evolution',
  },
];

export const ACCELERATORS: Accelerator[] = COPY.map((c) => {
  const source = ACCELERATOR_SOURCE[c.id];
  const cap = capability(source);
  return {
    ...c,
    source,
    status: cap.state,
    // A live capability needs no date beside it; "available now" is the date.
    when: cap.state === 'live' ? null : cap.showFromLabel,
  };
});

/**
 * Deliberately not a colour. Green against red is the pair that collapses for
 * roughly one man in twelve, and these three states have to be told apart on a
 * client's laptop, on a projector, and in a screenshot somebody greyscales
 * into a deck.
 */
export const STATUS_LABEL: Record<AcceleratorStatus, string> = {
  live: 'Available now',
  build: 'In build',
  planned: 'Planned',
};
