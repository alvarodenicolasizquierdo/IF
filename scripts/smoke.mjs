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
  await click(/^Regulation$/);
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

await step('Track 1 shows an ungoverned identity, not an FDE', async () => {
  await click(/^Track 1 €/);
  const persona = await page.locator('text=Developer (Ungoverned)').first().innerText();
  if (!/Ungoverned/.test(persona)) throw new Error(`Track 1 persona was "${persona}"`);
  await click(/^Track 2 €/);
});

await step('contextual help explains this screen and the live route', async () => {
  await page.getByRole('button', { name: /Open help/i }).click();
  await page.waitForSelector('text=What am I looking at?');
  // Contextual: it must name the screen the presenter is actually on.
  await page.waitForSelector('text=Continuous Evolution');
  // And it must read the live route rather than describing routing abstractly.
  await page.waitForSelector('text=/pii_egress_control: (PASSED|FAILED)/');
  await page.waitForSelector('text=/key immediately left of/');
  await page.keyboard.press('Escape');
});

await step('the traceability spine reflects the library it is drawing', async () => {
  // The context library was remediated earlier in this walkthrough, so the
  // spine must show every path whole rather than a stock diagram.
  await click(/Context & Mandate/);
  await click(/View spine/);
  await page.waitForSelector('text=The traceability spine');
  await page.waitForSelector('text=/Every path is whole/');
  await click(/^Close$/);

  // Back to the baseline, the same graph must show the broken edge.
  await click(/^Reset$/);
  await click(/Context & Mandate/);
  await click(/View spine/);
  await page.waitForSelector('text=/dashed red path is the reason/');
  await click(/^Close$/);
});

await step('auto-play runs the narrative and stops at the human decision', async () => {
  await click(/Run cycle/);
  await page.waitForSelector('text=/AUTO-PLAY|Auto-play/', { timeout: 5000 });
  await page.waitForSelector('text=Approve & cryptographically sign', { timeout: 60000 });
  // It must hand back rather than clicking through the gate itself.
  const stillRunning = await page.getByRole('button', { name: /^Stop$/ }).count();
  if (stillRunning) throw new Error('auto-play did not stop at the gate');
  await click(/Reject & void Mandate/);
  await click(/^Reset$/);
});

await step('God Mode toggles on backtick', () => page.keyboard.press('`'));
await step('EPAM demolition point fires live drift', async () => {
  await click('EPAM');
  await click(/Run live proof/);
  await page.waitForSelector('text=Control plane lockout');
});

await step('the model switcher lists every assurance tier', async () => {
  await page.getByRole('button', { name: /^Model · T/ }).click();
  await page.waitForSelector('text=LLM Gateway');
  const opts = await page.getByRole('option').count();
  if (opts < 6) throw new Error(`expected the full catalogue, saw ${opts} routes`);
});

await step('switching to a public-API route fails the PII egress gate', async () => {
  await page.getByRole('option', { name: /Claude Haiku 4\.5/ }).click();
  await page.waitForTimeout(400);
  await click(/Grounded Execution/);
  const body = await page.locator('body').innerText();
  if (!body.includes('anthropic.claude-haiku-4-5')) throw new Error('Evidence Pack did not take the new route');
  if (!body.includes('"pii_egress_control": "FAILED"')) throw new Error('public-internet egress did not fail the gate');
});

await step('switching to sovereign open weights bills GPU-hours, not tokens', async () => {
  await page.getByRole('button', { name: /^Model · T/ }).click();
  await page.getByRole('option', { name: /Mistral Large 2/ }).click();
  await page.waitForTimeout(400);
  const body = await page.locator('body').innerText();
  if (!body.includes('GPU-hours, self-hosted')) throw new Error('sovereign route did not switch the cost basis');
  if (!body.includes('"pii_egress_control": "PASSED"')) throw new Error('air-gapped route did not clear the gate');
  if (!body.includes('Tier 4')) throw new Error('Evidence Pack did not record the assurance tier');
});

await step('tooltips explain the non-obvious terms', async () => {
  await click(/Executive Trust/);
  await page.waitForTimeout(300);
  const tip = page.getByLabel('More information').first();
  await tip.hover();
  await page.waitForTimeout(250);
  const tooltip = await page.getByRole('tooltip').first().innerText();
  if (tooltip.length < 40) throw new Error(`tooltip looks empty: "${tooltip}"`);
});

await step('reset restores the baseline', async () => {
  await click(/^Reset$/);
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
