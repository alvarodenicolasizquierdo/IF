/**
 * Layout audit for the demo console.
 *
 * The presenter walkthrough (scripts/smoke.mjs) drives the *behaviour* at a
 * generous 1680×1000 and passed happily while three layout bugs shipped: a
 * tooltip painting behind the main workspace, a tooltip running off the right
 * edge of the screen, and the Mandate's primary action sitting below the fold
 * at 100% browser zoom. Behaviour tests do not look at geometry, so this one
 * does nothing else.
 *
 * Three rules, checked on every screen at every viewport the demo actually
 * runs on:
 *
 *   1. No horizontal page scroll.
 *   2. Every screen's primary action is fully on screen without scrolling.
 *      A presenter should never hunt for the button the story turns on.
 *   3. Every tooltip is fully on screen, painted above everything it overlaps,
 *      and not clipping its own text.
 *
 *   npm run preview -- --port 4173
 *   BASE_URL=http://localhost:4173/ node scripts/layout-audit.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173/';
const launch = process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {};

/**
 * The viewports that matter. 1280×720 is a Teams share compressed onto a
 * laptop and the harshest realistic case; 1440×790 is a MacBook at 100% zoom
 * with a browser chrome and bookmarks bar eating the top; 1680×1000 is the
 * roomy case the walkthrough already covers.
 */
const VIEWPORTS = [
  { name: '1280×720  (compressed Teams share)', width: 1280, height: 720 },
  { name: '1440×790  (laptop at 100% zoom)', width: 1440, height: 790 },
  { name: '1680×1000 (presenter display)', width: 1680, height: 1000 },
];

/**
 * Per screen: how to reach it, and the actions that must be reachable without
 * scrolling. `setup` puts the screen into the state where that action matters.
 */
const SCREENS = [
  {
    name: 'Executive Trust',
    rail: /Executive Trust/,
    mustBeVisible: [/^Next phase$/, /^OPA check$/, /^Regulation$/],
  },
  {
    name: 'Context & Mandate',
    rail: /Context & Mandate/,
    mustBeVisible: [/Sign Mandate & initialise agent/],
  },
  {
    name: 'Context & Mandate (hygiene block)',
    rail: /Context & Mandate/,
    setup: async (page) => page.getByRole('button', { name: 'Run probe' }).click(),
    mustBeVisible: [/Fix with Avenga Intelligence/],
  },
  {
    name: 'Grounded Execution',
    rail: /Grounded Execution/,
    mustBeVisible: [/Execute next tool-call|All tool-calls/],
  },
  {
    name: 'Continuous Evolution',
    rail: /Continuous Evolution/,
    mustBeVisible: [/Create remediation PR/, /Advance loop/],
  },
];

/**
 * The overlays and floating surfaces. These sit above the workspace, so they
 * are exactly where a tooltip is most likely to be trapped underneath
 * something — and the HITL gate is the demo's climax, so its ceremony must
 * never need scrolling to reach.
 */
const OVERLAYS = [
  {
    name: 'Model switcher',
    open: async (page) => page.getByRole('button', { name: /^Model · T/ }).click(),
    mustBeVisible: [/Claude Opus 5/],
  },
  {
    name: 'Avenga Intelligence',
    open: async (page) => {
      await page.getByRole('button', { name: /Context & Mandate/ }).click();
      await page.getByRole('button', { name: 'Run probe' }).click();
      await page.getByRole('button', { name: /Fix with Avenga Intelligence/ }).click();
    },
    mustBeVisible: [/Run Data Product Factory/],
  },
  {
    name: 'Regulatory exposure',
    open: async (page) => {
      await page.getByRole('button', { name: /^Regulation$/ }).click();
      await page.waitForTimeout(2400);
    },
    mustBeVisible: [/Enforce control plane/, /^Close$/],
  },
  {
    name: 'HITL gate',
    open: async (page) => {
      const click = (name) => page.getByRole('button', { name }).click();
      await click(/Context & Mandate/);
      await click('Run probe');
      await click(/Fix with Avenga Intelligence/);
      await click(/Run Data Product Factory/);
      await click(/Sign Mandate & initialise agent/);
      for (let i = 0; i < 4; i += 1) {
        await click(/Execute next tool-call|All tool-calls/);
        await page.waitForTimeout(150);
      }
      await click(/Request production merge/);
    },
    mustBeVisible: [/Approve & cryptographically sign/],
  },
  {
    name: 'God Mode',
    open: async (page) => page.keyboard.press('`'),
    mustBeVisible: [/EPAM/],
  },
];

const failures = [];
const fail = (where, message) => failures.push(`${where}\n      ${message}`);

const browser = await chromium.launch(launch);

console.log('Intelligent Flow — layout audit');

for (const viewport of VIEWPORTS) {
  console.log(`\n  ${viewport.name}`);
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
  });

  const audit = async (where, mustBeVisible) => {
    // ---- 1. no horizontal scroll -------------------------------------
    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflowX > 1) fail(where, `page scrolls horizontally by ${overflowX}px`);

    // ---- 2. primary actions are above the fold -----------------------
    for (const name of mustBeVisible) {
      const button = page.getByRole('button', { name }).first();
      if ((await button.count()) === 0) {
        fail(where, `expected a button matching ${name} and found none`);
        continue;
      }
      const box = await button.boundingBox();
      if (!box) {
        fail(where, `button ${name} has no box — it is not rendered`);
        continue;
      }
      const below = Math.round(box.y + box.height - viewport.height);
      if (below > 0) {
        fail(where, `"${(await button.innerText()).trim()}" is ${below}px below the fold`);
      }
      if (box.y < 0) fail(where, `"${name}" is above the top of the viewport`);
    }

    // ---- 3. tooltips ---------------------------------------------------
    const anchors = page.locator('[data-tooltip-anchor]');
    const count = await anchors.count();

    let checked = 0;
    for (let i = 0; i < count; i += 1) {
      const anchor = anchors.nth(i);
      if (!(await anchor.isVisible())) continue;

      // Only audit tooltips a presenter could actually open. An anchor sitting
      // under an open dropdown or modal is unreachable by design, not broken.
      const reachable = await anchor.evaluate((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return false;
        const top = document.elementFromPoint(
          Math.round(r.left + r.width / 2),
          Math.round(r.top + r.height / 2),
        );
        return !!top && (el === top || el.contains(top));
      });
      if (!reachable) continue;

      try {
        await anchor.hover({ timeout: 2000 });
      } catch {
        fail(where, `tooltip anchor #${i} could not be hovered`);
        continue;
      }
      checked += 1;

      const tip = page.getByRole('tooltip').first();
      try {
        await tip.waitFor({ state: 'visible', timeout: 1500 });
      } catch {
        fail(where, `tooltip anchor #${i} never opened on hover`);
        continue;
      }

      const report = await page.evaluate(() => {
        const el = document.querySelector('[role="tooltip"]');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const label = (el.textContent ?? '').slice(0, 48).replace(/\s+/g, ' ').trim();

        // Paint order, not hit-testing: the tooltip is pointer-events:none by
        // design, so lift that for the length of one measurement or
        // elementsFromPoint would look straight through it.
        const previous = el.style.pointerEvents;
        el.style.pointerEvents = 'auto';
        const stack = document.elementsFromPoint(
          Math.round(r.left + r.width / 2),
          Math.round(r.top + r.height / 2),
        );
        el.style.pointerEvents = previous;

        return {
          label,
          rect: { top: r.top, left: r.left, right: r.right, bottom: r.bottom },
          viewport: { width: window.innerWidth, height: window.innerHeight },
          // Anything painted above the tooltip lands ahead of it in the stack.
          occludedBy:
            stack.length && !el.contains(stack[0]) && stack[0] !== el
              ? `${stack[0].tagName.toLowerCase()}.${(stack[0].className || '').toString().split(' ')[0]}`
              : null,
          // A tooltip that has to scroll its own body is cutting its text off.
          clipsOwnText:
            el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1,
        };
      });

      if (!report) {
        fail(where, `tooltip anchor #${i} vanished before it could be measured`);
        continue;
      }

      const { label, rect, viewport: vp } = report;
      const off = [];
      if (rect.left < 0) off.push(`${Math.round(-rect.left)}px off the left`);
      if (rect.top < 0) off.push(`${Math.round(-rect.top)}px off the top`);
      if (rect.right > vp.width) off.push(`${Math.round(rect.right - vp.width)}px off the right`);
      if (rect.bottom > vp.height) off.push(`${Math.round(rect.bottom - vp.height)}px off the bottom`);
      if (off.length) fail(where, `tooltip "${label}…" runs ${off.join(' and ')}`);

      if (report.occludedBy) {
        fail(where, `tooltip "${label}…" is painted behind ${report.occludedBy}`);
      }
      if (report.clipsOwnText) {
        fail(where, `tooltip "${label}…" clips its own text`);
      }

      // Move the pointer somewhere inert so the next hover is a real change.
      await page.mouse.move(4, viewport.height - 4);
      await page.waitForTimeout(60);
    }

    return checked;
  };

  for (const screen of SCREENS) {
    // A fresh load per screen so a previous screen's state cannot leak in.
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: screen.rail }).click();
    if (screen.setup) await screen.setup(page);
    await page.waitForTimeout(350);
    const count = await audit(`${viewport.name} · ${screen.name}`, screen.mustBeVisible);
    console.log(`    ${screen.name} — ${count} tooltip${count === 1 ? '' : 's'} checked`);
  }

  for (const overlay of OVERLAYS) {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await overlay.open(page);
    await page.waitForTimeout(400);
    const count = await audit(`${viewport.name} · ${overlay.name}`, overlay.mustBeVisible);
    console.log(`    ${overlay.name} (overlay) — ${count} tooltip${count === 1 ? '' : 's'} checked`);
  }

  await page.close();
}

await browser.close();

if (failures.length) {
  console.error(`\n✗ ${failures.length} layout problem${failures.length === 1 ? '' : 's'}:\n`);
  for (const f of failures) console.error(`   • ${f}\n`);
  process.exit(1);
}

console.log('\n✓ every screen fits, every tooltip lands on top and on screen');
