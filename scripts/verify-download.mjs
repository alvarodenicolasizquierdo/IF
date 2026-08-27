/**
 * Prove the offline download actually downloads.
 *
 * A plain link to intelligent-flow-console.html cannot do this: the file is
 * served as text/html, so the browser renders the console in a tab instead of
 * saving it. public/download.html fetches it same-origin and hands over a
 * blob, which is easy to break silently — the button still looks fine, and
 * nobody finds out until a presenter is offline and has nothing to open.
 *
 * So this drives the real button in a real browser and inspects the bytes
 * that land on disk.
 *
 *   npm run build && npm run build:standalone
 *   cp dist-standalone/index.html dist/intelligent-flow-console.html
 *   npm run preview -- --port 4173
 *   BASE_URL=http://localhost:4173/ node scripts/verify-download.mjs
 */
import { readFile, stat } from 'node:fs/promises';
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173/';
const launch = process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {};

const failures = [];
const check = (label, ok, detail) => {
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

const browser = await chromium.launch(launch);
const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });

// Console errors count too: a blocked resource or a failed request never
// throws, so watching pageerror alone would let a page that is quietly broken
// pass. Off-origin requests are recorded rather than blocked so the failure
// message can name what reached out.
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') pageErrors.push(`console: ${m.text()}`);
});

const origin = new URL(BASE).origin;
const offOrigin = new Set();
page.on('request', (request) => {
  const url = request.url();
  if (!url.startsWith('data:') && !url.startsWith('blob:') && new URL(url).origin !== origin) {
    offOrigin.add(url);
  }
});

await page.goto(new URL('download.html', BASE).href, { waitUntil: 'domcontentloaded' });

// The fallback link matters as much as the button: it is what a locked-down
// browser leaves the presenter with.
const fallback = await page.locator('#direct').getAttribute('href');
check('a manual Save Link As fallback is offered', fallback === './intelligent-flow-console.html', fallback ?? 'missing');

let saved = null;
try {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30_000 }),
    page.getByRole('button', { name: /Download the offline console/i }).click(),
  ]);
  saved = { name: download.suggestedFilename(), path: await download.path() };
} catch (error) {
  check('clicking the button starts a download', false, error.message);
}

if (saved) {
  check('clicking the button starts a download', true);
  check('it saves under the right filename', saved.name === 'intelligent-flow-console.html', saved.name);

  const { size } = await stat(saved.path);
  // The standalone build is ~1.8 MB. A few hundred bytes means an error page
  // was saved instead, which is exactly the failure worth catching.
  check('the saved file is the whole console', size > 1_000_000, `${size.toLocaleString()} bytes`);

  const head = await readFile(saved.path, 'utf8').then((t) => t.slice(0, 4000));
  check('the saved bytes are the console itself', /Avenga Intelligent Flow/.test(head));
  check('the saved copy is self-contained', !/<script[^>]+src=/i.test(head), 'no external script tags');
}

// The status line is the only feedback a presenter gets; a silent button
// reads as a broken one.
const status = (await page.locator('#status').innerText()).trim();
check('the page confirms the save in words', /saved/i.test(status), status);

// This page is what a presenter reaches for when the network is already being
// difficult, so it must not depend on anyone else's. The console self-hosts
// its fonts for the same reason; this keeps the download page honest about it.
check(
  'nothing on the page is fetched from a third party',
  offOrigin.size === 0,
  [...offOrigin].join(', ') || 'same-origin only',
);

check('no page errors', pageErrors.length === 0, pageErrors.join('; ') || undefined);

await browser.close();

if (failures.length) {
  console.error(`\n✗ ${failures.length} download check${failures.length === 1 ? '' : 's'} failed`);
  process.exit(1);
}
console.log('\n✓ the offline download works end to end');
