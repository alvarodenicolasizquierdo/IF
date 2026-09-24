/**
 * Sync what the console is allowed to claim, from the documents that decide it.
 *
 *   npm run sync:readiness
 *
 * Two source documents, neither of them ours to edit:
 *
 *   sources/readiness-tracker.html   the seller's register of what can be shown
 *                                    and from when — "Can I show it?"
 *   sources/mvp-schedule.xlsx        the build plan the same claims depend on
 *
 * Both stay out of git. They carry client names, commercial status and internal
 * guidance, and this repository is public. What lands in src/data/readiness.json
 * is the narrow, publishable part: an identifier, a name, a state and the dates.
 * Everything with a client's name in it goes to sources/readiness.private.json,
 * which is gitignored and feeds the presenter's planner only.
 *
 * The point of doing it this way is that nobody types a date into a component.
 * A claim on the dashboard is downstream of the register, the register is the
 * seller's own document, and when the register moves the console moves with it
 * on the next sync — or CI stops the build, which is the subject of
 * scripts/verify-readiness.mjs.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { createContext, runInNewContext } from 'node:vm';
import { readWorkbook } from './lib/xlsx.mjs';

const root = resolve(import.meta.dirname, '..');
const TRACKER = resolve(root, 'sources/readiness-tracker.html');
const SCHEDULE = resolve(root, 'sources/mvp-schedule.xlsx');

/* ---------------------------------------------------------------------------
 * Which build epic actually delivers each claim.
 *
 * This is the only hand-authored table here, and it is the one that earns its
 * keep: it is what lets the check say "the register promises this in November
 * and the plan finishes it in January". Every entry is a judgement and should
 * be argued with. An empty list means no epic delivers it — the claim rests on
 * something already running, or on an experiment, and the plan cannot support
 * or contradict it.
 *
 * `manual` marks a claim that is deliberately met by hand before the software
 * exists. Those are not contradictions, they are how October works, and they
 * are written down here rather than quietly excluded.
 * ------------------------------------------------------------------------ */
const DELIVERED_BY = {
  'B-GATES': { epics: ['E3'] },
  'B-REFUSE': { epics: ['E3'] },
  'B-HASH': { epics: ['E14', 'E6'] },
  'B-PROV': { epics: ['E8'] },
  'B-EVPACK': { epics: ['E8'], manual: 'Assembled by hand for October. The build is what makes it automatic.' },
  'B-EVAUTO': { epics: ['E8'] },
  'B-DELTA': { epics: [] },
  'B-COSMIC': { epics: [] },
  'B-CONSOLE': { epics: ['E9'] },
  'B-KIT': { epics: ['E10'] },
  'B-AGENTS': { epics: ['E4', 'E5'] },
};

/* ---------------------------------------------------------------------------
 * The dashboard's accelerators, tied to the register.
 *
 * The strip on the first screen used to carry statuses I inferred from the
 * December plan. These are the register's instead. The wording of each
 * accelerator stays in src/data/accelerators.ts, because that is client-facing
 * copy and the register is not written for a client to read; only the state and
 * the date cross over.
 * ------------------------------------------------------------------------ */
const ACCELERATOR_SOURCE = {
  'spec-driven': 'C-SPEC',
  'context-probe': 'B-REFUSE',
  mandate: 'B-AGENTS',
  gates: 'B-GATES',
  evidence: 'B-EVAUTO',
  evolution: 'P-OPERATE',
};

/* -------------------------------- tracker -------------------------------- */

const html = readFileSync(TRACKER, 'utf8');

/**
 * The register is JavaScript object literals inside a page, not JSON — keys are
 * unquoted and strings are single-quoted. Rather than write a parser for a
 * dialect of JavaScript, run the declarations in an empty context: no globals,
 * no require, nothing to reach. It is a local script over a file the operator
 * put there deliberately.
 */
function declarations(...names) {
  const wanted = names.map((n) => {
    const m = new RegExp(`const ${n}\\s*=\\s*(\\[[\\s\\S]*?\\n\\];)`).exec(html);
    if (!m) throw new Error(`the tracker has no ${n} declaration — has its shape changed?`);
    return `const ${n} = ${m[1]}`;
  });
  const context = createContext(Object.create(null));
  runInNewContext(`${wanted.join('\n')}\nresult = {${names.join(', ')}};`, context, {
    timeout: 5000,
  });
  return context.result;
}

const { CAPS, STACKS, SECTORS, ANCHORS, NEVER } = declarations(
  'CAPS',
  'STACKS',
  'SECTORS',
  'ANCHORS',
  'NEVER',
);

const dataMatch = /const DATA\s*=\s*(\{[\s\S]*?\});/.exec(html);
const DATA = dataMatch ? JSON.parse(dataMatch[1]) : { plan: [], decisions: [], risks: [], issues: [] };

/* -------------------------------- schedule ------------------------------- */

const wb = readWorkbook(SCHEDULE);
const epicRows = wb.rows('Epics');
const head = epicRows[0].map((h) => h.trim());
const col = (name) => {
  const i = head.indexOf(name);
  if (i < 0) throw new Error(`the schedule's Epics sheet has no ${name} column — have: ${head}`);
  return i;
};
const [cId, cWhat, cStage, cStart, cEnd] = [
  col('Epic'),
  col('What it is'),
  col('Stage'),
  col('Start'),
  col('End'),
];

const EPICS = {};
for (const row of epicRows.slice(1)) {
  const id = (row[cId] ?? '').trim();
  if (!id || id === 'TOTAL') continue;
  EPICS[id] = {
    id,
    what: (row[cWhat] ?? '').trim(),
    stage: (row[cStage] ?? '').trim(),
    start: (row[cStart] ?? '').trim(),
    end: (row[cEnd] ?? '').trim(),
  };
}

const assumptions = Object.fromEntries(
  wb
    .rows('Assumptions')
    .slice(1)
    .filter((r) => r[0] && r[1])
    .map((r) => [r[0].trim(), r[1].trim()]),
);

/* --------------------------------- derive -------------------------------- */

const MONTH = ['January','February','March','April','May','June','July','August','September','October','November','December'];
/** A month and a year, never a day. The schedule says so itself: every date in
 *  it is arithmetic downstream of two factors nobody has measured yet. */
const monthOf = (iso) => {
  if (!iso) return null;
  const [y, m] = iso.split('-');
  return `${MONTH[Number(m) - 1]} ${y}`;
};
const later = (a, b) => (!a ? b : !b ? a : a > b ? a : b);

const capabilities = CAPS.map((c) => {
  const link = DELIVERED_BY[c.id] ?? { epics: [] };
  const epics = link.epics.map((id) => {
    if (!EPICS[id]) throw new Error(`${c.id} is mapped to epic ${id}, which is not in the schedule`);
    return EPICS[id];
  });
  const planFrom = epics.reduce((acc, e) => later(acc, e.end), null);

  // What the console may say. For anything already live it is the register's
  // own date. For anything in build it is whichever is later, the register or
  // the plan — because a claim the plan does not reach is not a claim.
  const showFrom = c.state === 'live' ? c.from : later(c.from, link.manual ? null : planFrom);

  return {
    id: c.id,
    name: c.name,
    state: c.state,
    registerFrom: c.from,
    planFrom,
    showFrom,
    showFromLabel: monthOf(showFrom),
    epics: link.epics,
    manual: link.manual ?? null,
    stacks: c.stacks ?? ['*'],
  };
});

const byId = Object.fromEntries(capabilities.map((c) => [c.id, c]));
for (const [accelerator, capId] of Object.entries(ACCELERATOR_SOURCE)) {
  if (!byId[capId]) throw new Error(`accelerator ${accelerator} points at ${capId}, which the register does not have`);
}

// How current the register is, read off the register rather than asserted: the
// latest date any already-live capability became showable is a lower bound on
// when somebody last touched it.
const asOf = capabilities
  .filter((c) => c.state === 'live')
  .reduce((acc, c) => later(acc, c.registerFrom), null);

const digest = (path) => createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 12);

const publicData = {
  $comment:
    'Generated by scripts/sync-readiness.mjs from the readiness tracker and the MVP schedule. Do not edit by hand — run npm run sync:readiness. Deliberately carries no client names, no evidence and no internal guidance: this repository is public.',
  asOf,
  syncedAt: new Date().toISOString().slice(0, 10),
  sources: {
    tracker: { file: 'sources/readiness-tracker.html', sha256: digest(TRACKER) },
    schedule: {
      file: 'sources/mvp-schedule.xlsx',
      sha256: digest(SCHEDULE),
      start: assumptions['Start date'] ?? null,
      finishes: assumptions['Schedule'] ?? null,
      openItems: assumptions['Work items open'] ?? null,
      caveat:
        assumptions['Agent factor'] && assumptions['Review factor']
          ? 'Both scheduling factors are estimates, so every date below is a shape rather than a commitment.'
          : null,
    },
  },
  acceleratorSource: ACCELERATOR_SOURCE,
  /*
   * Only the entries the dashboard actually renders.
   *
   * The register holds twenty-eight capabilities and the console shows six of
   * them. Writing all twenty-eight here would put the whole roadmap, dated, in
   * a bundle served from a public address — a competitor reads it with view
   * source. The planner needs the full set and the planner is not published,
   * so the full set lives in the private file instead.
   */
  capabilities: capabilities
    .filter((c) => Object.values(ACCELERATOR_SOURCE).includes(c.id))
    .map(({ stacks, ...rest }) => rest),
};

const privateData = {
  $comment:
    'Generated by scripts/sync-readiness.mjs. NOT for git and NOT for the console bundle: client names, commercial status and internal guidance. Feeds the presenter planner only.',
  asOf,
  syncedAt: publicData.syncedAt,
  capabilities: CAPS.map((c) => ({ ...c, ...byId[c.id] })),
  stacks: STACKS,
  sectors: SECTORS,
  anchors: ANCHORS,
  never: NEVER,
  epics: EPICS,
  assumptions,
  register: {
    plan: DATA.plan.length,
    decisions: DATA.decisions.length,
    risks: DATA.risks,
    issues: DATA.issues,
  },
};

writeFileSync(resolve(root, 'src/data/readiness.json'), `${JSON.stringify(publicData, null, 2)}\n`);
writeFileSync(resolve(root, 'sources/readiness.private.json'), `${JSON.stringify(privateData, null, 2)}\n`);

const live = capabilities.filter((c) => c.state === 'live').length;
const build = capabilities.filter((c) => c.state === 'build').length;
const planned = capabilities.filter((c) => c.state === 'planned').length;
console.log(`readiness → src/data/readiness.json`);
console.log(
  `  ${publicData.capabilities.length} of ${capabilities.length} capabilities published (${live} live, ${build} in build, ${planned} planned in the register)`,
);
console.log(`  register current to ${asOf}; plan runs ${assumptions['Start date']} to ${assumptions['Schedule'] ?? '?'}`);
console.log(`readiness → sources/readiness.private.json (gitignored)`);

// Printed here rather than only in the check, because this is the moment
// somebody is looking: they have just re-exported the register, and the gap
// between what it promises and what the plan reaches is the thing to take to
// the next Monday meeting rather than leave to a script to absorb.
const ahead = capabilities.filter((c) => c.planFrom && c.registerFrom < c.planFrom && !c.manual);
if (ahead.length) {
  console.log(`\n! ${ahead.length} claims are dated earlier in the register than in the plan:`);
  for (const c of ahead) {
    console.log(`    ${c.id.padEnd(11)} register ${c.registerFrom}   plan ${c.planFrom}   ${c.epics.join(' ')}`);
  }
  console.log('  The console quotes the later date. The register is what a seller reads.');
}
