/**
 * Proves the standalone bundle runs from a file:// URL with the network cut
 * off — the state a sales engineer is in on a client's guest wifi, or with no
 * wifi at all.
 *
 *   npm run build:standalone
 *   node scripts/verify-standalone.mjs
 *
 * Set PW_CHROMIUM to override the browser binary.
 */
import { chromium } from 'playwright';
import path from 'node:path';

const FILE = path.resolve('dist-standalone/index.html');
const launch = process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {};

const browser = await chromium.launch(launch);
const ctx = await browser.newContext({ viewport: { width: 1680, height: 1000 } });

// Block every off-origin request: nothing may load from the network.
const blocked = [];
await ctx.route('**', (route) => {
  const u = route.request().url();
  if (u.startsWith('file://') || u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
  blocked.push(u);
  return route.abort();
});

const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

await page.goto(`file://${FILE}`);
await page.waitForTimeout(2500);

const click = (n) => page.getByRole('button', { name: n }).click();
await click(/Context & Mandate/);
await page.getByRole('button', { name: 'Run probe' }).click();
await page.waitForTimeout(500);
await click(/Fix with Avenga Intelligence/);
await click(/Run Data Product Factory/);
await page.waitForTimeout(400);
await click(/Sign Mandate & initialise agent/);
await page.waitForTimeout(400);
await click(/^Regulation$/);
await page.waitForTimeout(2400);
await click(/Enforce control plane/);
await page.waitForTimeout(600);

const body = await page.locator('body').innerText();
const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
const markOk = await page.evaluate(() => {
  const img = document.querySelector('img[alt="Avenga"]');
  return !!img && img.complete && img.naturalWidth > 0;
});

await browser.close();

let fail = 0;
const check = (label, ok) => { if (!ok) fail += 1; console.log(`${ok ? '✓' : '✗'} ${label}`); };

check('renders offline from file://', body.includes('Intelligent Flow'));
check('Manrope is embedded, not a system fallback', font.startsWith('Manrope'));
check('the avenga wordmark is inlined and painted', markOk);
check('Golden Bridge and Mandate signing work', body.includes('MANDATE ACTIVE') || body.includes('Mandate signed'));
check('the regulatory scan enforces', body.includes('ENFORCED') || body.includes('Control plane enforced'));
check('nothing reached for the network', blocked.length === 0);
check('no console or page errors', errs.length === 0);

if (blocked.length) blocked.slice(0, 5).forEach((u) => console.log('   requested:', u.slice(0, 100)));
if (errs.length) errs.slice(0, 5).forEach((e) => console.log('   error:', e.slice(0, 100)));

process.exit(fail ? 1 : 0);
