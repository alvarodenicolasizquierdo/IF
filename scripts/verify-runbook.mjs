/**
 * Check the hosted run-book.
 *
 * It is generated from runbook/body.html rather than hand-maintained, so the
 * failure modes are the generator's: a stale build, a CDN font surviving the
 * rewrite, the noindex being dropped, or the page simply not being legible at
 * the width someone reads it on. None of those announce themselves.
 *
 * The noindex check matters most. The page carries the verbatim sales script,
 * competitor matter and a section about controls a client should not see. The
 * link is shareable; a search result is not.
 *
 *   npm run build && npm run preview -- --port 4173
 *   BASE_URL=http://localhost:4173/ node scripts/verify-runbook.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173/';
const launch = process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {};

const failures = [];
const check = (label, ok, detail) => {
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

const browser = await chromium.launch(launch);

const pageErrors = [];
const offOrigin = new Set();
const origin = new URL(BASE).origin;

// 1280 is the narrow case — a laptop beside the demo, or half a screen.
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on('pageerror', (e) => pageErrors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') pageErrors.push(`console: ${m.text()}`);
});
page.on('request', (request) => {
  const url = request.url();
  if (!url.startsWith('data:') && !url.startsWith('blob:') && new URL(url).origin !== origin) {
    offOrigin.add(url);
  }
});

const response = await page.goto(new URL('runbook.html', BASE).href, { waitUntil: 'networkidle' });
check('the run-book is served', response?.status() === 200, `HTTP ${response?.status()}`);

const robots = await page.locator('meta[name="robots"]').getAttribute('content').catch(() => null);
check('it is marked noindex', /noindex/i.test(robots ?? ''), robots ?? 'no robots meta');

check(
  'nothing on the page is fetched from a third party',
  offOrigin.size === 0,
  [...offOrigin].join(', ') || 'same-origin only',
);

// A generated page is only as good as its last regeneration. Assert on content
// that only exists in the current source, so a stale build is caught.
//
// Substring search over the rendered text, not a locator: several of these
// phrases are split across inline markup, and an element-level matcher would
// report the page as stale when it is simply marked up.
const rendered = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
for (const [label, needle] of [
  ['the verbatim script is present', 'Let me start with the outcome'],
  ['the model-switch section is present', 'What actually changes when you switch the AI'],
  ['it documents the auto-play control', 'Run cycle'],
]) {
  check(label, rendered.includes(needle), needle);
}

// Its own front door has to work from here.
const download = await page.locator('a[href*="download.html"]').count();
check('it links to the offline download', download > 0);

const overflowX = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
check('it does not scroll sideways at 1280', overflowX <= 1, `${overflowX}px`);

// The page is read in whatever theme the reader keeps. Both must be legible,
// which means neither may inherit a colour it never defined.
for (const scheme of ['dark', 'light']) {
  await page.emulateMedia({ colorScheme: scheme });
  await page.waitForTimeout(150);
  const { background, colour } = await page.evaluate(() => ({
    background: getComputedStyle(document.body).backgroundColor,
    colour: getComputedStyle(document.body).color,
  }));
  const painted = background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent';
  check(`the ${scheme} theme paints its own ground`, painted, `${background} / ${colour}`);
}

// ---- the vault -------------------------------------------------------
// Two properties, and the first is the one that matters: a client who opens
// this link must not find the competitor material by scrolling or searching.
await page.emulateMedia({ colorScheme: 'dark' });
const beforeReveal = await page.locator('body').innerText();
const SECRETS = ['EPAM', 'Coforge', 'Cognizant', 'Persistent', 'demolition matrix', 'God Mode'];
const leaked = SECRETS.filter((needle) => beforeReveal.includes(needle));
check('nothing presenter-only is visible before it is asked for', leaked.length === 0, leaked.join(', ') || 'clean');

check('the vault section is empty until opened', (await page.locator('#vault').innerHTML()) === '');

// The trigger is deliberately unmarked, so this is also a check that a
// presenter who knows the gesture can still find it.
await page.locator('#vault-key').click();
await page.waitForTimeout(400);
const afterReveal = (await page.locator('#vault').innerText()).replace(/\s+/g, ' ');

check('clicking the unmarked trigger opens it', afterReveal.length > 0);
for (const vendor of ['EPAM', 'Coforge', 'Cognizant', 'Persistent', 'Wonderful']) {
  check(`the ${vendor} demolition point is present`, afterReveal.includes(vendor));
}
// Case-insensitive: these labels are uppercased by CSS, and innerText
// reports what is rendered rather than what is in the markup.
check('each one carries a line to say', (afterReveal.match(/\bSay\b/gi) ?? []).length >= 5);
check('each one carries a live proof', (afterReveal.match(/Prove it live/gi) ?? []).length >= 5);
check('God Mode itself is documented', /key immediately left of 1/i.test(afterReveal));
check('it names the Spanish keyboard case', /on a Spanish one/i.test(afterReveal));
check(
  'it warns that this is concealment, not protection',
  /concealed, not protected/i.test(afterReveal),
);

// Mid-meeting, the way out has to be instant.
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
check('Escape hides it again', await page.locator('#vault').isHidden());

// And the same gesture as the console reopens it.
await page.keyboard.press('Backquote');
await page.waitForTimeout(300);
check('the console\'s own key opens it too', await page.locator('#vault').isVisible());
await page.keyboard.press('Escape');
await page.waitForTimeout(200);

// A remapper or soft keyboard can report the character with no code at all.
// Position stays the primary signal; this is the fallback.
await page.evaluate(() =>
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'º', bubbles: true })),
);
await page.waitForTimeout(300);
check('the Spanish character alone opens it', await page.locator('#vault').isVisible());
await page.keyboard.press('Escape');
await page.waitForTimeout(200);

// Discreet, not invisible: nothing at rest, a cue under a pointer already on
// the words. A presenter told "click the product name" must be able to confirm
// they are on the right thing.
const atRest = await page.locator('#vault-key').evaluate((el) => getComputedStyle(el).cursor);
check('the trigger is unmarked at rest', atRest === 'default', atRest);
await page.locator('#vault-key').hover();
await page.waitForTimeout(200);
const onHover = await page.locator('#vault-key').evaluate((el) => getComputedStyle(el).cursor);
check('it answers a pointer that finds it', onHover === 'pointer', onHover);

check('no page errors', pageErrors.length === 0, pageErrors.join('; ') || undefined);

await browser.close();

if (failures.length) {
  console.error(`\n✗ ${failures.length} run-book check${failures.length === 1 ? '' : 's'} failed`);
  process.exit(1);
}
console.log('\n✓ the hosted run-book is current, private to search, and legible');
