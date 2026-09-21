/**
 * Capture the thumbnails the run-book shows beside each stage.
 *
 * A presenter reading a stage should not have to work out which part of the
 * screen the words are about. One small picture of the right panel answers it
 * faster than a sentence describing it, and it survives someone skimming the
 * page ninety seconds before they present.
 *
 * Driven against the real console rather than mocked, for the same reason the
 * competitor cards are generated from the console's own data: a run-book that
 * quietly disagrees with the product it documents is worse than no run-book.
 * If a panel is renamed, these go stale visibly on the next run rather than
 * silently staying right-looking and wrong.
 *
 *   npm run build && npm run preview -- --port 4173
 *   BASE_URL=http://localhost:4173/ node scripts/capture-runbook-shots.mjs
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/';
const OUT = resolve('runbook/shots');
const launch = process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {};

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch(launch);
// Captured at 2x and then shown small, so the thumbnails stay sharp on the
// retina screen a presenter is most likely reading this on.
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });

const go = async (screen) => {
  await page.getByRole('button', { name: new RegExp(screen, 'i') }).first().click();
  await page.waitForTimeout(650);
};

const shot = async (name, locator) => {
  const el = page.locator(locator).first();
  await el.waitFor({ state: 'visible', timeout: 5000 });
  const buf = await el.screenshot();
  await writeFile(`${OUT}/${name}.png`, buf);
  console.log(`  ${name}  ${(buf.length / 1024).toFixed(0)} kB`);
};

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);

console.log('capturing:');

// The numbers, and the accelerators beside them.
await shot('metrics', '[data-testid="metric-row"]');
await shot('accelerators', 'section:has-text("The accelerators")');

// Context: the library, the hygiene refusal, then the Mandate.
await go('Context');
await shot('context-library', 'section:has-text("The context library")');
await page.getByRole('button', { name: /Run probe/i }).first().click();
await page.waitForTimeout(900);
await shot('probe-blocked', 'section:has-text("The context library")');
await shot('mandate', 'section:has-text("The Mandate")');

// Execution: the Evidence Pack building itself.
await go('Grounded Execution');
await shot('evidence-pack', 'section:has-text("The Evidence Pack")');

// The loop after go-live.
await go('Continuous Evolution');
await shot('loop', 'section:has-text("The loop")');
await shot('drift', 'section:has-text("Dependency audit")');

// The tray, which is where most of the clicks in the run-book live.
await shot('tray', '[data-testid="action-tray"]');

// The two overlays. The gate is the beat the whole demo turns on, so a
// presenter skimming this page ninety seconds beforehand should see exactly
// what is about to fill the screen.
// Run cycle plays the narrative and halts at the human decision, which is
// precisely the frame wanted here — so the capture takes the same path a
// presenter does rather than reaching for the button directly, which is
// disabled until the work in front of it has actually happened.
await page.getByRole('button', { name: /^Run cycle$/i }).first().click();
await page.waitForSelector('text=Approve & cryptographically sign', { timeout: 90000 });
await page.waitForTimeout(700);
await shot('gate', '[role="dialog"] > div');

// The gate does not take Escape — it is a hard stop, which is the whole
// point of it — so the way back to a clean surface is a reload.
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

await page.getByRole('button', { name: /^Regulation$/i }).first().click();
await page.waitForTimeout(900);
await shot('regulation', '[role="dialog"] > div');
await page.keyboard.press('Escape');

await browser.close();
console.log(`\n✓ thumbnails written to runbook/shots/`);
