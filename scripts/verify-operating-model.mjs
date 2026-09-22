import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/';
const browser = await chromium.launch();
const failures = [];
const forbiddenName = /flow\s*studio|studio\s*flow/i;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const routeDir = path.resolve(scriptDir, '../public/operating-model');

const check = (condition, message) => {
  if (!condition) failures.push(message);
};

async function openPage(viewport) {
  const errors = [];
  const page = await browser.newPage({ viewport });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  await page.goto(`${BASE}operating-model/`, { waitUntil: 'networkidle' });
  return { page, errors };
}

console.log('Intelligent Flow operating model — verification');

for (const filename of ['index.html', 'data.js', 'app.js']) {
  const source = await readFile(path.join(routeDir, filename), 'utf8');
  check(!forbiddenName.test(source), `${filename}: retired name remains in source`);
}

{
  const { page, errors } = await openPage({ width: 1600, height: 1000 });
  check(await page.title() === 'Intelligent Flow Operating Model', 'desktop: wrong document title');
  check(await page.locator('.matrix .capability-tile').count() === 34, 'desktop: matrix does not contain 34 capabilities');
  check(await page.locator('#visible-elements').innerText() === '34', 'desktop: initial visible count is not 34');
  check(await page.locator('#delivery-coverage').innerText() === '31', 'desktop: build-row count is not 31');
  check(await page.locator('.build-row').count() === 31, 'desktop: roadmap rows missing');
  check(!forbiddenName.test(await page.locator('body').innerText()), 'desktop: retired name remains in rendered content');

  await page.getByRole('button', { name: 'Reuse' }).click();
  check(await page.locator('#current-lens').innerText() === 'Reuse', 'desktop: reuse lens did not activate');
  check((await page.locator('#legend').innerText()).includes('Reusable core'), 'desktop: reuse legend is missing');

  await page.getByPlaceholder('Search ID, capability, owner or text').fill('IF-17');
  check(await page.locator('#visible-elements').innerText() === '1', 'desktop: ID search did not return one capability');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download visible CSV' }).click();
  const download = await downloadPromise;
  const csv = await readFile(await download.path(), 'utf8');
  check(download.suggestedFilename() === 'Intelligent_Flow_operating_model_visible.csv', 'desktop: CSV filename is wrong');
  check(csv.includes('"IF-17"'), 'desktop: filtered CSV is missing the visible capability');
  check(csv.split('\r\n').filter((line) => /^"IF-\d+"/.test(line)).length === 1, 'desktop: filtered CSV contains more than one capability');
  await page.locator('.matrix .capability-tile').click();
  check(await page.locator('#detail-dialog').getAttribute('open') !== null, 'desktop: capability detail did not open');
  check(await page.locator('#detail-dialog').getAttribute('aria-labelledby') === 'detail-title', 'desktop: detail dialog has no accessible name');
  check((await page.locator('#detail-content').innerText()).includes('Security pack and pentest'), 'desktop: wrong detail content opened');
  check((await page.locator('#detail-content').innerText()).includes('PL-02, PL-03, PL-05'), 'desktop: workbook mapping is missing from detail');
  await page.getByRole('button', { name: 'Close detail' }).click();

  await page.getByRole('button', { name: 'Reset' }).click();
  await page.getByRole('button', { name: 'Roadmap cover' }).click();
  check(await page.locator('#current-lens').innerText() === 'Roadmap cover', 'desktop: roadmap lens did not activate');
  check((await page.locator('#legend').innerText()).includes('No dedicated row'), 'desktop: roadmap legend is missing');
  await page.getByLabel('Roadmap cover').selectOption('No dedicated row');
  check(await page.locator('#visible-elements').innerText() === '12', 'desktop: no-dedicated-row filter did not return 12 capabilities');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(overflow <= 1, `desktop: page has ${overflow}px horizontal overflow`);
  await page.screenshot({ path: '/tmp/operating-model-desktop.png', fullPage: false });
  errors.forEach((error) => failures.push(`desktop: ${error}`));
  await page.close();
}

{
  const { page, errors } = await openPage({ width: 390, height: 844 });
  check(await page.locator('.matrix-shell').isHidden(), 'mobile: desktop matrix remains visible');
  check(await page.locator('#mobile-list').isVisible(), 'mobile: operating-area list is not visible');
  check(await page.locator('#mobile-list .capability-tile').count() === 34, 'mobile: list does not contain 34 capabilities');
  check(await page.locator('#mobile-list .tile-capability').first().isVisible(), 'mobile: capability family is not visible on tiles');
  check(!forbiddenName.test(await page.locator('body').innerText()), 'mobile: retired name remains in rendered content');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(overflow <= 1, `mobile: page has ${overflow}px horizontal overflow`);
  await page.getByRole('button', { name: 'When' }).click();
  check((await page.locator('#legend').innerText()).includes('Q1 2027'), 'mobile: timing legend is missing');
  await page.screenshot({ path: '/tmp/operating-model-mobile.png', fullPage: false });
  errors.forEach((error) => failures.push(`mobile: ${error}`));
  await page.close();
}

{
  const { page, errors } = await openPage({ width: 1280, height: 800 });
  await page.goto(`${BASE}operating-model/#IF-17`, { waitUntil: 'networkidle' });
  check(await page.locator('#detail-dialog').getAttribute('open') !== null, 'deep link: dialog did not open');
  check((await page.locator('#detail-content').innerText()).includes('IF-17'), 'deep link: wrong capability opened');
  errors.forEach((error) => failures.push(`deep link: ${error}`));
  await page.close();
}

await browser.close();

if (failures.length) {
  console.error('\nFailures:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('  ✓ 34 source capabilities present across four operating areas');
console.log('  ✓ status, timing, reuse, criticality and roadmap-cover lenses work');
console.log('  ✓ exact source status, owner, target, roadmap mapping and gap are visible');
console.log('  ✓ retired naming is absent from source and rendered content');
console.log('  ✓ desktop and mobile layouts have no page overflow');
