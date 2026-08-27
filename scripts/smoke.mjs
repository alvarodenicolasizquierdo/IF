/**
 * End-to-end smoke test for the demo console.
 * Walks the full presenter narrative and fails on any console or page error.
 *
 *   npm run dev          # in one shell
 *   node scripts/smoke.mjs
 *
 * Set PW_CHROMIUM to override the browser binary.
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173/';
const launch = process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {};

const errors = [];
const browser = await chromium.launch(launch);
const page = await browser.newPage({ viewport: { width: 1680, height: 1000 } });
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

const click = (name) => page.getByRole('button', { name }).click();
const step = async (label, fn) => { await fn(); await page.waitForTimeout(450); console.log(`  ✓ ${label}`); };

await page.goto(BASE, { waitUntil: 'networkidle' });
console.log('Intelligent Flow — presenter walkthrough');

await step('track switching repaints metrics', async () => {
  await click(/^Track 1 €/);
  await click(/^Track 2 €/);
});

await step('Golden Bridge halts the agent', async () => {
  await click(/Context & Mandate/);
  await click('Run probe');
});
await step('Avenga Intelligence remediates context', async () => {
  await click(/Fix with Avenga Intelligence/);
  await click(/Run Data Product Factory/);
});

await step('Mandate signs and initialises the agent', () => click(/Sign Mandate & initialise agent/));

await step('MCP Gateway intercepts every tool-call', async () => {
  for (let i = 0; i < 4; i += 1) {
    await click(/Execute next tool-call|All tool-calls/);
    await page.waitForTimeout(200);
  }
});

await step('HITL gate hard-stops the merge', () => click(/Request production merge/));
await step('CISO signs the Evidence Pack', () => click(/Approve & cryptographically sign/));

await step('Continuous Evolution raises a remediation PR', async () => {
  await click(/Continuous Evolution/);
  await click(/Create remediation PR/);
});

await step('regulatory scan reports open audit vulnerabilities', async () => {
  await click(/Enforce regulation/);
  await page.waitForTimeout(2200);
  const open = await page.locator('text=/\\d+ open/').first().innerText();
  if (!/^[1-9]/.test(open)) throw new Error(`scan opened already remediated: "${open}"`);
});
await step('enforcing the control plane clears them', async () => {
  await click(/Enforce control plane/);
  const open = await page.locator('text=/0 open/').first().innerText();
  if (open !== '0 open') throw new Error(`expected 0 open, got "${open}"`);
  await click(/^Close$/);
});

await step('God Mode toggles on backtick', () => page.keyboard.press('`'));
await step('EPAM demolition point fires live drift', async () => {
  await click('EPAM');
  await click(/Run live proof/);
  await page.waitForSelector('text=Control plane lockout');
});

await step('reset restores the baseline', async () => {
  await click(/Reset simulation/);
  await click(/Executive Trust/);
  const body = await page.locator('body').innerText();
  if (!body.includes('1.44×')) throw new Error('reset did not restore the Track 2 baseline');
});

await browser.close();

if (errors.length) {
  console.error('\nRuntime errors:');
  errors.forEach((e) => console.error(`  ${e}`));
  process.exit(1);
}
console.log('\nAll steps passed with no console or page errors.');
