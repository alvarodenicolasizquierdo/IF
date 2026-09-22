import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/';
const browser = await chromium.launch();
const failures = [];

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

console.log('Intelligent Flow offering map — verification');

{
  const { page, errors } = await openPage({ width: 1600, height: 1000 });
  check(await page.title() === 'Intelligent Flow Offering Map', 'desktop: wrong document title');
  check(await page.locator('.matrix .capability-tile').count() === 116, 'desktop: lifecycle matrix does not contain 116 elements');
  check(await page.locator('#cross-list .capability-tile').count() === 5, 'desktop: cross-cutting strip does not contain 5 elements');
  check(await page.locator('#visible-elements').innerText() === '121', 'desktop: initial visible count is not 121');

  await page.getByRole('button', { name: 'Reuse' }).click();
  check(await page.locator('#current-lens').innerText() === 'Reuse', 'desktop: reuse lens did not activate');
  check((await page.locator('#legend').innerText()).includes('Reusable core'), 'desktop: reuse legend is missing');

  await page.getByPlaceholder('Search ID, capability, owner or text').fill('S6.03');
  check(await page.locator('#visible-elements').innerText() === '1', 'desktop: ID search did not return one element');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download visible CSV' }).click();
  const download = await downloadPromise;
  const csv = await readFile(await download.path(), 'utf8');
  check(download.suggestedFilename() === 'Intelligent_Flow_offering_map_visible.csv', 'desktop: CSV filename is wrong');
  check(csv.includes('"S6.03"'), 'desktop: filtered CSV is missing the visible element');
  check(csv.split('\r\n').filter((line) => /^"S\d/.test(line)).length === 1, 'desktop: filtered CSV contains more than one element');
  await page.locator('.matrix .capability-tile').click();
  check(await page.locator('#detail-dialog').getAttribute('open') !== null, 'desktop: element detail did not open');
  check(await page.locator('#detail-dialog').getAttribute('aria-labelledby') === 'detail-title', 'desktop: detail dialog has no accessible name');
  check((await page.locator('#detail-content').innerText()).includes('Policy-as-code gate catalogue'), 'desktop: wrong detail content opened');
  await page.getByRole('button', { name: 'Close detail' }).click();

  await page.getByRole('button', { name: 'Reset' }).click();
  await page.getByRole('button', { name: 'Criticality' }).click();
  check(await page.locator('#current-lens').innerText() === 'Criticality', 'desktop: criticality lens did not activate');
  check((await page.locator('#legend').innerText()).includes('Foundational'), 'desktop: criticality legend is missing');
  await page.getByLabel('Source priority').selectOption('H');
  check(await page.locator('#visible-elements').innerText() === '51', 'desktop: high-priority filter did not return 51 elements');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(overflow <= 1, `desktop: page has ${overflow}px horizontal overflow`);
  await page.screenshot({ path: '/tmp/operating-model-desktop.png', fullPage: false });
  errors.forEach((error) => failures.push(`desktop: ${error}`));
  await page.close();
}

{
  const { page, errors } = await openPage({ width: 390, height: 844 });
  check(await page.locator('.matrix-shell').isHidden(), 'mobile: desktop matrix remains visible');
  check(await page.locator('#mobile-list').isVisible(), 'mobile: lifecycle list is not visible');
  check(await page.locator('#mobile-list .capability-tile').count() === 116, 'mobile: lifecycle list does not contain 116 elements');
  check(await page.locator('#mobile-list .tile-capability').first().isVisible(), 'mobile: capability family is not visible on tiles');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(overflow <= 1, `mobile: page has ${overflow}px horizontal overflow`);
  await page.getByRole('button', { name: 'When' }).click();
  check((await page.locator('#legend').innerText()).includes('Cross-cutting'), 'mobile: timing legend is missing');
  await page.screenshot({ path: '/tmp/operating-model-mobile.png', fullPage: false });
  errors.forEach((error) => failures.push(`mobile: ${error}`));
  await page.close();
}

{
  const { page, errors } = await openPage({ width: 1280, height: 800 });
  await page.goto(`${BASE}operating-model/#S6.03`, { waitUntil: 'networkidle' });
  check(await page.locator('#detail-dialog').getAttribute('open') !== null, 'deep link: dialog did not open');
  check((await page.locator('#detail-content').innerText()).includes('S6.03'), 'deep link: wrong element opened');
  errors.forEach((error) => failures.push(`deep link: ${error}`));
  await page.close();
}

await browser.close();

if (failures.length) {
  console.error('\nFailures:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('  ✓ 121 source elements present');
console.log('  ✓ maturity, reuse, timing and criticality lenses work');
console.log('  ✓ search, filters, CSV export, detail and deep links work');
console.log('  ✓ desktop and mobile layouts have no page overflow');
