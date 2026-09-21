/**
 * Check Stage Mode against the acceptance criteria in TalkTrack 4.5, part eleven.
 *
 * These are not general UI assertions. They are the specific properties the
 * recording depends on, each of which fails silently: a frame that looks fine
 * on a laptop and is unreadable from row ten, a status that reads only in
 * colour, a claim badge quietly missing from one shot in six minutes.
 *
 *   npm run build && npm run preview -- --port 4173
 *   BASE_URL=http://localhost:4173/ node scripts/verify-stage.mjs
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/';
const OUT = process.env.SHOT_DIR ?? 'stage-frames';
const launch = process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {};

const failures = [];
const check = (label, ok, detail) => {
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch(launch);
// Capture size is the authored size, so the frame scale is exactly 1.
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

const FRAMES = [
  ['app-search',   'app?screen=search&claim=now&caption=A real application'],
  ['app-results',  'app?screen=results&claim=now&caption=A real application'],
  ['app-after-a',  'app?screen=results&app=after&feature=A&price=nightly&claim=building'],
  ['app-after-b',  'app?screen=results&app=after&feature=B&filtered=1&claim=building'],
  ['spec',         'spec?feature=A&claim=building&caption=The machine wrote this from one sentence'],
  ['gate-refused', 'gate?state=refused&claim=building&caption=Refused: it cannot say what it is for'],
  ['gate-passed',  'gate?state=passed&claim=building&caption=Same change. Now it can prove itself.'],
  ['pack',         'pack?feature=A&claim=building&caption=Requirement. Decisions. Checks. Tests.'],
  ['clock',        'clock?ms=707000&clock=stopped'],
];

const shots = {};
for (const [name, hash] of FRAMES) {
  await page.goto(`${BASE}#/stage/${hash}`);
  await page.waitForTimeout(700);
  const buf = await page.screenshot();
  shots[name] = buf.toString('base64');
  await writeFile(`${OUT}/${name}.png`, buf);
}
console.log(`\n${FRAMES.length} frames captured into ${OUT}/\n`);

// ---- every frame ------------------------------------------------------

for (const [name, hash] of FRAMES) {
  await page.goto(`${BASE}#/stage/${hash}`);
  await page.waitForTimeout(400);

  if (name !== 'clock') {
    const badge = await page.locator('[data-testid="claim-badge"]').count();
    check(`${name}: carries a claim badge`, badge === 1);
  }

  // Absolute minimum type size. Anything under 24px at 1080p is unreadable
  // beyond the fourth row and should be cut rather than shrunk.
  const tooSmall = await page.evaluate(() => {
    const bad = [];
    for (const el of document.querySelectorAll('body *')) {
      const text = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!text) continue;
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size < 24) bad.push(`${el.tagName.toLowerCase()} ${size}px "${el.textContent.trim().slice(0, 24)}"`);
    }
    return bad;
  });
  check(`${name}: nothing below 24px`, tooSmall.length === 0, tooSmall.slice(0, 2).join(' / ') || undefined);

  // No code, no terminal, no log line, in any cut.
  const forbidden = await page.evaluate(() =>
    document.querySelectorAll('pre, code, [class*="terminal"], [class*="log-line"]').length,
  );
  check(`${name}: no code or terminal in frame`, forbidden === 0);
}

// ---- the gate ---------------------------------------------------------

const box = async (sel) => {
  const b = await page.locator(sel).boundingBox();
  return b ? `${Math.round(b.x)},${Math.round(b.y)},${Math.round(b.width)},${Math.round(b.height)}` : null;
};

const geometry = {};
for (const state of ['refused', 'passed']) {
  await page.goto(`${BASE}#/stage/gate?state=${state}&claim=building`);
  await page.waitForTimeout(400);
  geometry[state] = {
    panel: await box('[data-testid="gate-panel"]'),
    word: await page.locator('[data-testid="gate-word"]').innerText(),
    sentenceBox: await box('[data-testid="gate-sentence"]'),
  };
}

check(
  'the gate panel does not move between states',
  geometry.refused.panel === geometry.passed.panel,
  `${geometry.refused.panel} vs ${geometry.passed.panel}`,
);
check(
  'the sentence occupies the same box in both states',
  geometry.refused.sentenceBox === geometry.passed.sentenceBox,
  `${geometry.refused.sentenceBox} vs ${geometry.passed.sentenceBox}`,
);
check('the word changes', geometry.refused.word !== geometry.passed.word,
  `${geometry.refused.word} / ${geometry.passed.word}`);

// ---- the greyscale test ----------------------------------------------
// The palette carries exactly one status hue on purpose: green against red
// and amber against red are the pairs that collapse under the common forms of
// colour blindness, and a projector makes every pair worse. So the real test
// is the spec's own: convert the frame to greyscale and the two states must
// still be instantly distinguishable.

const grey = await page.evaluate(async ([a, b]) => {
  const load = (src) => new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.src = `data:image/png;base64,${src}`;
  });
  const [ia, ib] = await Promise.all([load(a), load(b)]);
  const draw = (img) => {
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const x = c.getContext('2d');
    x.filter = 'grayscale(1)';
    x.drawImage(img, 0, 0);
    return x.getImageData(0, 0, c.width, c.height).data;
  };
  const [da, db] = [draw(ia), draw(ib)];
  let diff = 0;
  for (let i = 0; i < da.length; i += 4) diff += Math.abs(da[i] - db[i]);
  return diff / (da.length / 4);
}, [shots['gate-refused'], shots['gate-passed']]);

check(
  'refused and passed are distinguishable in greyscale',
  grey > 2,
  `mean luminance difference ${grey.toFixed(2)} per pixel`,
);

// ---- before and after must overlay -----------------------------------
// Shot 3.1 only works if it is visibly the same screen as 1.1. The spec makes
// that verifiable by overlaying the two exported frames, so the card has to
// land on the same pixels in both states.

const cardBox = {};
for (const [key, hash] of [['before', 'app?screen=results'], ['after', 'app?screen=results&app=after&feature=A']]) {
  await page.goto(`${BASE}#/stage/${hash}`);
  await page.waitForTimeout(400);
  cardBox[key] = await box('[data-testid="property-card"]');
}
check('before and after render the card at the same scale and crop', cardBox.before === cardBox.after,
  `${cardBox.before} vs ${cardBox.after}`);

// ---- the features actually change something --------------------------

await page.goto(`${BASE}#/stage/app?screen=results&app=after&feature=A&price=total`);
await page.waitForTimeout(300);
const totalPrice = await page.locator('[data-testid="price"]').innerText();
await page.goto(`${BASE}#/stage/app?screen=results&app=after&feature=A&price=nightly`);
await page.waitForTimeout(300);
const nightlyPrice = await page.locator('[data-testid="price"]').innerText();
check('feature A switches the price figure', totalPrice !== nightlyPrice,
  `${totalPrice.replace(/\n/g, ' ')} / ${nightlyPrice.replace(/\n/g, ' ')}`);

await page.goto(`${BASE}#/stage/app?screen=results&app=after&feature=B&filtered=1`);
await page.waitForTimeout(300);
const filtered = await page.locator('[data-testid="stack-counter"]').innerText();
await page.goto(`${BASE}#/stage/app?screen=results&app=after&feature=B`);
await page.waitForTimeout(300);
const unfiltered = await page.locator('[data-testid="stack-counter"]').innerText();
check('feature B reduces the stack from six to three', unfiltered === '1 of 6' && filtered === '1 of 3',
  `${unfiltered} → ${filtered}`);

// ---- the clock --------------------------------------------------------

await page.goto(`${BASE}#/stage/clock?ms=707000&clock=stopped`);
await page.waitForTimeout(600);
const stopped = await page.locator('[data-testid="clock"]').getAttribute('data-elapsed');
await page.waitForTimeout(1200);
const stillStopped = await page.locator('[data-testid="clock"]').getAttribute('data-elapsed');
check('a stopped clock does not move', stopped === stillStopped && stopped === '00:11:47', stopped);

check('no console or page errors', errors.length === 0, errors.join('; ') || undefined);

await browser.close();

if (failures.length) {
  console.error(`\n✗ ${failures.length} stage check${failures.length === 1 ? '' : 's'} failed`);
  process.exit(1);
}
console.log('\n✓ every frame is legible, badged, and readable without colour');
