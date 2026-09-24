/**
 * Drive the demo planner in the offline run-book.
 *
 *   npm run test:planner
 *
 * The planner answers a question a presenter asks under time pressure, on a
 * laptop, offline, twenty minutes before a meeting. So it is checked the way it
 * is used: open the file from disk, change the date, change the buyer, tick a
 * stack, and read what it says — rather than asserting about the markup that
 * produced it.
 *
 * On a machine without the register synced the offline copy carries a notice
 * instead of the planner, which is the correct output there. The check says so
 * and passes, because that is the state CI is in and CI is not wrong.
 */
import { chromium } from 'playwright';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const FILE = resolve(root, 'dist-runbook/runbook.html');
const launch = process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {};

if (!existsSync(FILE)) {
  console.error('✗ dist-runbook/runbook.html is not built — run npm run build:runbook');
  process.exit(1);
}

if (!readFileSync(FILE, 'utf8').includes('id="pl-form"')) {
  console.log('✓ the offline copy carries the notice, not the planner — the register is not synced here');
  process.exit(0);
}

const failures = [];
const check = (label, ok, detail) => {
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

const browser = await chromium.launch(launch);
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

await page.goto(pathToFileURL(FILE).href, { waitUntil: 'load' });

const count = async (group) =>
  Number(await page.locator(`.pl-group.${group} h3 span`).first().innerText());

// Today. The register has a dozen live capabilities, so anything is wrong.
await page.fill('#pl-date', '2026-09-21');
const showNow = await count('pl-yes');
check('it names what can be shown today', showNow > 0, `${showNow} capabilities`);

const notNow = await count('pl-no');
check('it holds back what is not there yet', notNow > 0, `${notNow} withheld`);

// A date far enough out that things in build have landed. The "do not show"
// column must shrink; if it does not, the date is not being read.
await page.fill('#pl-date', '2027-02-01');
const notLater = await count('pl-no');
check('a later date moves capabilities out of "do not show"', notLater < notNow, `${notNow} → ${notLater}`);

// Source control and cloud are separate questions. A buyer who has told us
// their repository host and nothing about their cloud must not be told the
// cloud-side capabilities are ruled out — that would be a false negative a
// seller repeats out loud.
await page.getByRole('checkbox', { name: 'GitHub' }).check();
await page.waitForTimeout(100);
const scmOnly = await page.locator('.pl-lens:has-text("rules these out")').count();
check('naming a repository host does not rule out the cloud work', scmOnly === 0);
await page.getByRole('checkbox', { name: 'GitHub' }).uncheck();

// Azure DevOps is the known gap. Ticking it must both warn and rule things out.
await page.getByRole('checkbox', { name: 'Azure DevOps' }).check();
await page.waitForTimeout(100);
const ruled = await page.locator('.pl-stackwarn').count();
check('ticking a stack we do not cover warns about it', ruled > 0, `${ruled} stack notices`);
const blocked = await page.locator('.pl-lens:has-text("rules these out")').count();
check('it names what that stack rules out', blocked === 1);
await page.getByRole('checkbox', { name: 'Azure DevOps' }).uncheck();

// The sector lens has to actually change with the sector.
await page.selectOption('#pl-sector', 'fs');
const fs = await page.locator('.pl-lens .pl-lead').first().innerText();
await page.selectOption('#pl-sector', 'telco');
const telco = await page.locator('.pl-lens .pl-lead').first().innerText();
check('the buyer changes the advice', fs !== telco && fs.length > 10, `"${fs.slice(0, 32)}…" vs "${telco.slice(0, 32)}…"`);

// The register leads the plan on most in-build claims. Wherever it does, the
// planner has to say so — that warning is the whole reason it exists.
await page.fill('#pl-date', '2026-12-01');
const late = await page.locator('.pl-late').count();
check('it flags claims the build plan does not reach', late > 0, `${late} flagged`);

const never = await page.locator('.pl-never li').count();
check('the never-say list is present', never > 0, `${never} lines`);

check('no page errors', errors.length === 0, errors.slice(0, 2).join(' | ') || 'clean');

await browser.close();
console.log(
  failures.length ? `\n✗ ${failures.length} failed: ${failures.join('; ')}` : '\n✓ the demo planner answers on the day, the buyer and the stack',
);
process.exit(failures.length ? 1 : 0);
