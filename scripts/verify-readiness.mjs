/**
 * Stop a stale or unsafe claim from reaching the site.
 *
 *   npm run test:readiness
 *
 * The dashboard now puts a month beside four of its six accelerators. A month
 * that has passed is not a roadmap, it is a wrong answer in front of a client,
 * and it goes wrong by sitting still rather than by anybody changing anything —
 * which is the one kind of defect no code review catches. So it is checked on
 * every build, and the build is what deploys the site.
 *
 * The other half of the job is that this repository is public. The register
 * these dates come from names clients and carries commercial notes; the
 * generated file must not. That is checked here too, because the cost of
 * getting it wrong is not a broken page.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const DATA = resolve(root, 'src/data/readiness.json');
const TRACKER = resolve(root, 'sources/readiness-tracker.html');

const failures = [];
const notes = [];
const check = (label, ok, detail) => {
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

const data = JSON.parse(readFileSync(DATA, 'utf8'));
const today = (process.env.READINESS_TODAY ?? new Date().toISOString().slice(0, 10)).slice(0, 10);
const days = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

/* 1 ------------------------------------------------------------------ dates */

// A date in the past on something not yet delivered. Either it shipped and
// nobody moved it, or it slipped and nobody moved it. Both are the page lying.
const expired = data.capabilities.filter((c) => c.state !== 'live' && c.showFrom < today);
check(
  'no capability claims a month that has already passed',
  expired.length === 0,
  expired.length
    ? `${expired.map((c) => `${c.id} (${c.showFromLabel})`).join(', ')} — re-export the register and run npm run sync:readiness`
    : `${data.capabilities.filter((c) => c.state !== 'live').length} future-dated, checked against ${today}`,
);

const age = days(data.asOf, today);
const STALE_AFTER = 42;
const staleOk = process.env.READINESS_STALE_OK === '1';
check(
  'the register is recent enough to quote',
  age <= STALE_AFTER || staleOk,
  staleOk
    ? `${age} days old, override in force`
    : age <= STALE_AFTER
      ? `${age} days old, limit ${STALE_AFTER}`
      : `${age} days old, limit ${STALE_AFTER}. Re-export the tracker to sources/readiness-tracker.html and run npm run sync:readiness. READINESS_STALE_OK=1 overrides one build.`,
);

/* 2 ------------------------------------------------------- what we may say */

// Client names and commercial notes belong in the register, which is not in
// this repository. If one of them reaches the generated file it reaches the
// bundle, and the bundle is on a public URL.
const FORBIDDEN = [
  'Galicia', 'Claro', 'TUI', 'LinkedTrade', 'Azercell', 'Sunrise', 'Swarovski',
  'Eurocontrol', 'Allwyn', 'Bank of Cyprus', 'Atos', 'KKCG', 'Sazka',
];
const blob = readFileSync(DATA, 'utf8');
const leaked = FORBIDDEN.filter((n) => new RegExp(`\\b${n}\\b`, 'i').test(blob));
check(
  'the generated file names no client',
  leaked.length === 0,
  leaked.length ? `found ${leaked.join(', ')} — the sync is publishing more than it should` : `${FORBIDDEN.length} names checked`,
);

check(
  'every accelerator answers to a register entry',
  Object.values(data.acceleratorSource).every((id) => data.capabilities.some((c) => c.id === id)),
  `${Object.keys(data.acceleratorSource).length} accelerators`,
);

/* 3 -------------------------------------------------- register versus plan */

// Not a failure. It is a fact about two documents that disagree, and the
// console already resolves it by quoting the later date. It is printed because
// the gap is the thing worth arguing about in the Monday meeting, and because
// it should shrink rather than sit there.
const ahead = data.capabilities.filter((c) => c.planFrom && c.registerFrom < c.planFrom && !c.manual);
if (ahead.length) {
  notes.push(
    `${ahead.length} of ${data.capabilities.filter((c) => c.planFrom).length} plan-backed claims are dated earlier in the register than in the schedule:`,
    ...ahead.map((c) => `    ${c.id.padEnd(11)} register ${c.registerFrom}   plan ${c.planFrom}   epics ${c.epics.join(' ')}`),
    '  The console quotes the plan date. The register is what a seller reads, so',
    '  the two should be reconciled rather than left to this script to paper over.',
  );
}

/* 3b ---------------------------------------------- the claims we override */

// Three modules get named out loud and carry the claim we are making rather
// than the register's date. That is legitimate and it is also the easiest
// thing in this repository to forget about, so it is checked here as hard as
// the generated data: a month that has gone past is a wrong answer in front of
// an owner, whoever typed it.
const CLAIMS = resolve(root, 'src/data/claims.json');
const claims = JSON.parse(readFileSync(CLAIMS, 'utf8'));
const overrides = Object.entries(claims.overrides);

const badKey = overrides.filter(([id]) => !(id in data.acceleratorSource));
check(
  'every claim override names a real accelerator',
  badKey.length === 0,
  badKey.length ? `${badKey.map(([id]) => id).join(', ')} is not an accelerator` : `${overrides.length} overridden`,
);

const stale = overrides.filter(([, o]) => o.showFrom && o.showFrom < today);
check(
  'no overridden claim names a month that has already passed',
  stale.length === 0,
  stale.length
    ? `${stale.map(([id, o]) => `${id} (${o.showFromLabel})`).join(', ')} — decide the new month and edit src/data/claims.json`
    : `checked against ${today}`,
);

const unreasoned = overrides.filter(([, o]) => !o.why || o.why.length < 40);
check(
  'every override says why',
  unreasoned.length === 0,
  unreasoned.length ? `${unreasoned.map(([id]) => id).join(', ')} has no reason worth reading` : `${overrides.length} reasons on file`,
);

// Not a failure. It is the whole point of keeping two files: this is the
// distance between what we are saying and what the plan reaches, and whoever
// stands up in front of a room should know it before being asked.
const distance = overrides
  .map(([id, o]) => {
    const cap = data.capabilities.find((c) => c.id === data.acceleratorSource[id]);
    return { id, o, cap };
  })
  .filter(({ o, cap }) => cap && (o.state !== cap.state || o.showFrom !== cap.showFrom));
if (distance.length) {
  notes.push(
    `${distance.length} module claim${distance.length === 1 ? '' : 's'} ahead of the register, decided ${claims.decidedOn}:`,
    ...distance.map(({ id, o, cap }) => {
      const saying = o.showFromLabel ?? (o.state === 'live' ? 'available now' : o.state);
      return (
        `    ${id.padEnd(9)} saying ${saying.padEnd(15)}` +
        `register ${cap.state} ${cap.showFromLabel ?? cap.showFrom}   plan ${cap.planFrom ?? 'no epic'}`
      );
    }),
    '  Each is met by demonstration rather than by the software being finished.',
    '  If one of them cannot be demonstrated, it is the claim that moves, not the date.',
  );
}

/* 4 -------------------------------------------- generated, not hand-edited */

if (existsSync(TRACKER)) {
  // Regenerate and compare. Editing the JSON by hand is the failure mode this
  // whole arrangement exists to prevent, and it is invisible in review.
  const before = readFileSync(DATA, 'utf8');
  execFileSync(process.execPath, [resolve(root, 'scripts/sync-readiness.mjs')], { stdio: 'pipe' });
  const after = readFileSync(DATA, 'utf8');
  const strip = (s) => s.replace(/"syncedAt": "[^"]*"/, '');
  check(
    'the committed data is what the sources produce',
    strip(before) === strip(after),
    strip(before) === strip(after) ? 'in sync' : 'the file has drifted from its sources — commit the regenerated version',
  );
} else {
  notes.push(
    'The source documents are not present, so regeneration was not checked.',
    '  They are gitignored on purpose: they carry client names and this repository',
    '  is public. This check runs on the machine that holds them.',
  );
}

if (notes.length) console.log(`\n${notes.join('\n')}`);

console.log(
  failures.length
    ? `\n✗ ${failures.length} failed: ${failures.join('; ')}`
    : `\n✓ readiness is current, publishable and generated — register as at ${data.asOf}`,
);
process.exit(failures.length ? 1 : 0);
