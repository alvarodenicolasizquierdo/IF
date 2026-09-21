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
 * A note on `status`, because it is the part that can embarrass us.
 *
 * The talk track's claim discipline is absolute: available now, in build with
 * a date, or planned — and the badge is on screen while the thing is, never in
 * an apology afterwards. In a room with analysts in it that discipline is
 * worth more than any feature it sits beside.
 *
 * The statuses below are inferred from the December MVP plan and from what is
 * running at clients today, not handed down. They need confirming before this
 * screen is shown to anyone outside the team.
 * ---------------------------------------------------------------------------
 */

export type AcceleratorStatus = 'now' | 'building' | 'planned';

export interface Accelerator {
  id: string;
  name: string;
  /** One line. What it does for the client, not how it works. */
  line: string;
  status: AcceleratorStatus;
  /** Only for 'building'. A date, or the badge is not a claim. */
  when?: string;
  /** Where in this console you can show it working. */
  provenIn: string;
}

export const ACCELERATORS: Accelerator[] = [
  {
    id: 'spec-driven',
    name: 'Spec-driven delivery',
    line: 'Requirements, specs and tasks live as files beside the code, so a change to the requirement does not cost you the work.',
    status: 'now',
    provenIn: 'Running at clients today',
  },
  {
    id: 'context-probe',
    name: 'Context probe',
    line: 'Checks what the AI is about to rely on, and stops it before a token is spent if the data is stale or unclassified.',
    status: 'building',
    when: 'Dec 2026',
    provenIn: 'Context & Mandate — Run probe',
  },
  {
    id: 'mandate',
    name: 'Mandate',
    line: 'Sets what an agent may touch, for how long, and how much it may spend. Signed by a named person.',
    status: 'building',
    when: 'Dec 2026',
    provenIn: 'Context & Mandate — Sign Mandate',
  },
  {
    id: 'gates',
    name: 'Policy gates',
    line: 'A named approver on the changes you are most afraid of. A gate that never says no is decoration.',
    status: 'building',
    when: 'Dec 2026',
    provenIn: 'Grounded Execution — the gate',
  },
  {
    id: 'evidence',
    name: 'Evidence Pack',
    line: 'The signed record of one change: what was asked for, what was checked, who said yes. Readable without us.',
    status: 'building',
    when: 'Dec 2026',
    provenIn: 'Grounded Execution — Evidence Pack',
  },
  {
    id: 'evolution',
    name: 'Evolution loop',
    line: 'Watches after go-live and drafts the fix itself, under the same gates. Nobody has to file a ticket.',
    status: 'planned',
    provenIn: 'Continuous Evolution',
  },
];

/**
 * Deliberately not a colour. Green against red is the pair that collapses for
 * roughly one man in twelve, and these three states have to be told apart on a
 * client's laptop, on a projector, and in a screenshot somebody greyscales
 * into a deck.
 */
export const STATUS_LABEL: Record<AcceleratorStatus, string> = {
  now: 'Available now',
  building: 'In build',
  planned: 'Planned',
};
