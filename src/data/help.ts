import type { ScreenId } from '@/types';

/**
 * Copy for the contextual help overlay.
 *
 * Two rules held throughout: it explains what is on screen *right now* rather
 * than the product in general, and every claim here is one the console can be
 * made to demonstrate. Help that describes a feature the demo cannot show is
 * worse than no help, because a client will ask to see it.
 */

export interface ScreenHelp {
  title: string;
  what: string;
  /** The controls on this screen, and what each one actually does. */
  controls: { label: string; effect: string }[];
  /** The line worth saying out loud on this screen. */
  point: string;
}

export const SCREEN_HELP: Record<ScreenId, ScreenHelp> = {
  dashboard: {
    title: 'Executive Trust Dashboard',
    what: 'The commercial case in five numbers and two charts. Everything here is driven by the engagement track selected in the left rail — switching track repaints every figure, both charts and the control-plane badge.',
    controls: [
      {
        label: 'Track 1 / 1.5 / 2',
        effect:
          'Swaps the whole dataset: lead time, change failure rate, defect escape, Maturity Multiplier, cost per function point, both curves, the control-plane badge and the active identity.',
      },
      {
        label: 'A-UPI composite index',
        effect:
          'Both lines are the same measure on one axis — ungoverned delivery decaying, governed delivery compounding. Deliberately not a dual axis, which would let the shape be chosen rather than measured.',
      },
      {
        label: 'TCO per function point',
        effect:
          'Cost of one COSMIC Function Point across six sprints. €1,200 at Track 1, €180 at Track 2.',
      },
    ],
    point:
      'The Maturity Multiplier is the honest number here: an ungoverned team scores 1.00× however fast it looks, because its speed is borrowed against future rework.',
  },
  context: {
    title: 'Context Assembly & the Mandate',
    what: 'What the agent is allowed to know, and what it is allowed to do. The left panel is the information it will rely on; the right panel is the permission slip that bounds it.',
    controls: [
      {
        label: 'Run probe',
        effect:
          'Scans the context library before a single token is spent. In this scenario it finds a stale tax schema and an unclassified billing extract, and holds agent initialisation. The Sign button greys out — the block is real, not narrated.',
      },
      {
        label: 'Fix with Avenga Intelligence',
        effect:
          'Runs the Data Product Factory: re-indexes the schema, classifies the billing extract, restores context freshness to 97% and releases the hold.',
      },
      {
        label: 'The three sliders',
        effect:
          'Maximum attempts, token budget and expiry window. These are written into the Mandate at signing and shown again on the execution screen as a live budget bar.',
      },
      {
        label: 'Repository scope allowlist',
        effect:
          'The file-system firewall. Struck-through paths — payments, production estate, pipeline definitions — are outside the Mandate and cannot be reached.',
      },
    ],
    point:
      'The beat that lands is the refusal. Most tools would have carried on and produced a confident answer from stale data.',
  },
  execution: {
    title: 'Grounded Execution',
    what: 'The agent working inside the Mandate. The Evidence Pack builds itself on the left as the code change appears on the right, and the budget bar at the top burns down in real time.',
    controls: [
      {
        label: 'Execute next tool-call',
        effect:
          'Advances one interception. Every tool-call the agent makes is caught at the MCP Gateway and schema-validated before it runs; each one appends to the Evidence Pack.',
      },
      {
        label: 'Request production merge',
        effect:
          'Opens the human-in-the-loop gate. This is the non-reversible action, so the agent is not permitted to take it alone.',
      },
      {
        label: 'The cost figure in the budget bar',
        effect:
          'Changes basis with the routed model: metered tokens for a hosted API, GPU-hours for weights the client hosts themselves.',
      },
    ],
    point:
      'Nobody writes the Evidence Pack afterwards, so nobody can forget to write it — or quietly tidy it up later.',
  },
  evolution: {
    title: 'Continuous Evolution',
    what: 'What happens after go-live, which is where most of the cost of software actually lives. The seven-step loop runs continuously; the right panel is a live finding from it.',
    controls: [
      {
        label: 'Advance loop',
        effect:
          'Steps the Monitor → Analyse → Propose → Review → Execute → Validate → Learn cycle. Review is a human step, under a fresh, time-bounded Mandate.',
      },
      {
        label: 'Create remediation PR & test',
        effect:
          'The loop has found an out-of-date supplier dependency carrying a security risk, and drafts the fix itself — queued for the same approval gate.',
      },
    ],
    point:
      'Nobody filed a ticket for this. That is the difference between software that decays and software that maintains itself.',
  },
};

/** Exactly what a route change rewrites — the six things, no more. */
export interface ModelDimension {
  label: string;
  detail: string;
}

export const MODEL_DIMENSIONS: ModelDimension[] = [
  {
    label: 'Evidence Pack · selected_model',
    detail:
      'The wire identifier of the route is written into the record, so an auditor can see which model produced which change.',
  },
  {
    label: 'Evidence Pack · assurance_tier',
    detail:
      'Which of the four assurance tiers the run sits in, from a public API up to air-gapped weights on client hardware.',
  },
  {
    label: 'Evidence Pack · data_residency',
    detail: 'Where the payload physically goes. Changes region, and changes whether it leaves the estate at all.',
  },
  {
    label: 'OPA gate · pii_egress_control',
    detail:
      'Re-evaluated on the spot. A route that egresses to the public internet FAILS it, and the failure survives remediating the context library — cleaning the data does not licence sending it somewhere.',
  },
  {
    label: 'The cost basis',
    detail:
      'Frontier routes meter tokens per million. Sovereign routes bill GPU-hours on infrastructure the client already owns, which is the actual economic argument for hosting your own weights.',
  },
  {
    label: 'The audit trail',
    detail:
      'The switch itself is logged, with both route identifiers and the new residency. Changing the model is a governed act, not a settings tweak.',
  },
];

/** The things a presenter should know are there, but a client should not see. */
export interface PresenterSecret {
  label: string;
  how: string;
  detail: string;
}

export const PRESENTER_SECRETS: PresenterSecret[] = [
  {
    label: 'Presenter God Mode',
    how: 'Click the crown at the bottom-right, or press the key immediately left of “1”',
    detail:
      'Jump to any phase, force a track or an identity, fire an instant proof, or run a competitor demolition point. Hidden by default so a client never sees the strings. On a US or UK keyboard that key is the backtick; on a Spanish or French layout it is the same physical key, whatever it prints — the shortcut matches the position, not the character.',
  },
  {
    label: 'Run cycle',
    how: 'First button in the tray',
    detail:
      'Runs the narrative from the ungoverned baseline through context, the Mandate and execution, then stops at the human decision and hands back. Twelve correct clicks under pressure become one. It resets to the baseline first, so it is always safe to press.',
  },
  {
    label: 'Inject drift',
    how: 'Third button in the tray',
    detail:
      'Simulates a file changed outside the agreed boundary. The Mandate voids instantly and the path to production freezes. Use it when someone asks what stops a developer going around the system.',
  },
  {
    label: 'Regulatory shock',
    how: 'Fourth button in the tray',
    detail:
      'Scans against EU AI Act Articles 14 and 15, DORA and GDPR — and opens red, on purpose. Let it sit for a beat before enforcing the control plane. A tool that always reports green convinces nobody.',
  },
  {
    label: 'Competitor demolition matrix',
    how: 'Inside God Mode',
    detail:
      'One button per competitor, each opening on the structural weakness of that platform rather than a feature comparison. EPAM DIAL and Cognizant Flowsource also fire a live proof against the running demo.',
  },
  {
    label: 'The run-book',
    how: 'God Mode → Run-book & script',
    detail:
      'The whole demo written out word for word for a non-technical audience, plus what to say when someone interrupts. Hosted alongside the console, so it is one link you can send to whoever presents next. It is excluded from search engines, but anyone with the link can read it — do not paste it into a client thread.',
  },
  {
    label: 'The offline copy',
    how: 'God Mode → Download single file',
    detail:
      'Saves the entire console as one file that runs from your desktop with no network at all. Take it to a client site whose Wi-Fi you do not trust.',
  },
  {
    label: 'Glossary tooltips',
    how: 'Hover or tab to any (i) or dotted term',
    detail:
      'Every piece of vocabulary a client will not know on sight carries its own definition — A-UPI, the Maturity Multiplier, function points, the Mandate, the Evidence Pack, blast radius and the rest. They work on keyboard focus too, so a keyboard-driven walkthrough reaches the same copy.',
  },
];
