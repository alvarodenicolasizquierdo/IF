/**
 * Wrap the run-book into a standalone page for the site.
 *
 * `runbook/body.html` is the single source. It is authored as a fragment
 * because that is what the published Artifact expects — no doctype, no head —
 * and this turns the same fragment into a complete document for GitHub Pages.
 * Two copies of a 700-line sales script would have drifted apart within a week.
 *
 * Two substitutions happen on the way:
 *   - the CDN font link becomes same-origin @font-face, for the same reason
 *     download.html does: a client network that blocks Google Fonts is the
 *     normal case, and it stops the page telling a third party who is reading.
 *   - a noindex directive is added. The page carries the verbatim script, the
 *     competitor matter and a section about controls a client should not see.
 *     Anyone with the link can read it; nobody should reach it from a search.
 *
 *   node scripts/build-runbook.mjs
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { transform } from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = resolve(root, 'runbook/body.html');
const OUTPUT = resolve(root, 'public/runbook.html');
/** The fragment that gets published as the shared Artifact. */
const FRAGMENT = resolve(root, 'runbook/.generated-body.html');
const SCENARIO = resolve(root, 'src/data/scenario.ts');

const escapeHtml = (value) =>
  String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/**
 * The competitor material comes out of the console's own data rather than
 * being retyped here. A run-book that quietly disagrees with the demo it
 * documents is worse than no run-book, and this is exactly the content a
 * presenter would read out verbatim while the screen said something else.
 */
async function loadExploits() {
  const source = await readFile(SCENARIO, 'utf8');
  // Type-only imports are erased, so the module stands alone once stripped.
  const { code } = await transform(source, { loader: 'ts', format: 'esm' });
  const module = await import(
    `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
  );
  const order = module.EXPLOIT_ORDER ?? Object.keys(module.COMPETITOR_EXPLOITS);
  return order.map((id) => module.COMPETITOR_EXPLOITS[id]);
}

function renderVault(exploits) {
  const cards = exploits
    .map(
      (e) => `      <article class="kill">
        <div class="vendor">
          <h3>${escapeHtml(e.vendor)}</h3>
          <span class="product">${escapeHtml(e.product)}</span>
        </div>
        <span class="trap">${escapeHtml(e.trap)}</span>
        <dl>
          <dt>Where they are structurally weak</dt>
          <dd>${escapeHtml(e.weakness)}</dd>
          <dt>Say</dt>
          <dd>${escapeHtml(e.script)}</dd>
          <dt>Prove it live</dt>
          <dd>${escapeHtml(e.proof)}</dd>
        </dl>
      </article>`,
    )
    .join('\n');

  return `    <div class="vault-head">
      <div>
        <p class="warn">Presenter only — not for the room</p>
        <h2>God Mode &amp; the demolition matrix</h2>
      </div>
      <button type="button" class="hide" data-vault-close>Hide</button>
    </div>

    <p style="max-width: var(--measure); color: var(--ink-soft);">
      Everything below is internal. It is hidden until asked for, and hidden again with
      <strong>Esc</strong> — but this page is reachable by anyone holding the link, so treat it as
      concealed, not protected. Never open this section while sharing your screen.
    </p>

    <section>
      <div class="section-head">
        <span class="eyebrow">The hidden panel</span>
        <h2>God Mode</h2>
        <p>Absolute authority over the demo, for when a room does not go in the order you planned.
          Open it by clicking the crown at the bottom-right of the console, or by pressing the key
          immediately left of <strong>1</strong> — backtick on a US or UK keyboard,
          <code>º</code> on a Spanish one. It is the same physical key on any layout, because the
          console matches the key's position rather than the character it prints. The key that
          actually prints a backtick on a Spanish keyboard, next to <code>P</code>, will not work.</p>
      </div>

      <div class="cards">
        <div class="card">
          <h3>Jump to any phase</h3>
          <p>Skip straight to Build or Operate when someone asks to see the gate and you have four
            minutes left. The console rebuilds the state it needs to get there.</p>
        </div>
        <div class="card">
          <h3>Force a track or an identity</h3>
          <p>Put the ungoverned baseline back on screen for a comparison, or switch to the CISO to
            show that the same signing button refuses a different person.</p>
        </div>
        <div class="card">
          <h3>Instant proofs</h3>
          <p>Fire the regulatory assessment, inject code drift, or swap to a sovereign model in one
            click, without walking the narrative to get there.</p>
        </div>
        <div class="card">
          <h3>Presenter resources</h3>
          <p>This run-book, and the offline single-file copy of the console, both one click away
            from inside the panel.</p>
        </div>
      </div>
    </section>

    <section>
      <div class="section-head">
        <span class="eyebrow">One button each, inside God Mode</span>
        <h2>The demolition matrix</h2>
        <p>Five competitors, each opened on a structural weakness rather than a feature comparison.
          Read the <em>Say</em> line as written — each one is built to be short enough to land
          before the conversation moves on. Two of them fire a live proof against the running demo,
          which is the part that is hard to argue with.</p>
      </div>

${cards}
    </section>`;
}

const exploits = await loadExploits();
const vaultHtml = renderVault(exploits);
const vaultPayload = Buffer.from(vaultHtml, 'utf8').toString('base64');

const FACES = [
  ['Instrument Serif', 'instrument-serif-400.woff2', 400, 'normal'],
  ['Instrument Serif', 'instrument-serif-400-italic.woff2', 400, 'italic'],
  ['Manrope', 'manrope-400.woff2', 400, 'normal'],
  ['Manrope', 'manrope-700.woff2', 700, 'normal'],
  ['JetBrains Mono', 'jetbrains-mono-400.woff2', 400, 'normal'],
  ['JetBrains Mono', 'jetbrains-mono-700.woff2', 700, 'normal'],
];

/**
 * Pass --standalone for a copy that can be dropped onto any web host,
 * including one that is not this site. The hosted page reads its fonts from
 * /fonts/; a file living somewhere else has to carry them, so they are inlined
 * as data URIs. Same content either way — one source, no second document to
 * keep in step.
 */
const STANDALONE = process.argv.includes('--standalone');
const STANDALONE_OUTPUT = resolve(root, 'dist-runbook/runbook.html');

async function fontSrc(file) {
  if (!STANDALONE) return `url('./fonts/${file}') format('woff2')`;
  const bytes = await readFile(resolve(root, 'public/fonts', file));
  return `url(data:font/woff2;base64,${bytes.toString('base64')}) format('woff2')`;
}

const fontFaces = (
  await Promise.all(
    FACES.map(
      async ([family, file, weight, style]) => `    @font-face {
      font-family: '${family}';
      src: ${await fontSrc(file)};
      font-weight: ${weight}; font-style: ${style}; font-display: swap;
    }`,
    ),
  )
).join('\n');

// The favicon is the last relative reference in the head; a standalone copy
// carries it inline or it 404s wherever the file is opened from.
const favicon = STANDALONE
  ? `data:image/svg+xml;base64,${(await readFile(resolve(root, 'public/favicon.svg'))).toString('base64')}`
  : './favicon.svg';

const rawBody = await readFile(SOURCE, 'utf8');
if (!rawBody.includes('__VAULT_PAYLOAD__')) {
  throw new Error('runbook/body.html has no __VAULT_PAYLOAD__ placeholder to fill');
}
const body = rawBody.replace('__VAULT_PAYLOAD__', vaultPayload);

const titleMatch = body.match(/<title>([\s\S]*?)<\/title>/i);
if (!titleMatch) throw new Error('runbook/body.html has no <title> to hoist into the document head');
const title = titleMatch[1].trim();

// Strip the pieces the Artifact host supplies and this document must own.
const content = body
  .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
  .replace(/^\s*<link rel="preconnect"[^>]*>\s*$/gim, '')
  .replace(/^\s*<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>\s*$/gim, '')
  .trim();

if (/fonts\.(googleapis|gstatic)\.com/.test(content)) {
  throw new Error('a CDN font reference survived the rewrite — the hosted page must be same-origin');
}

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="Presenter run-book for the Avenga Intelligent Flow demo console.">
<!--
  Internal. The link is shareable, but this must never surface in a search
  result: it carries the verbatim script and the presenter-only controls.
-->
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="${favicon}">
<style>
${fontFaces}
</style>
</head>
<body>
${content}
</body>
</html>
`;

if (STANDALONE) {
  await mkdir(dirname(STANDALONE_OUTPUT), { recursive: true });
  await writeFile(STANDALONE_OUTPUT, page, 'utf8');
  console.log(
    `runbook → dist-runbook/runbook.html (${(page.length / 1024).toFixed(1)} kB, self-contained)`,
  );
  console.log(`  vault: ${exploits.length} competitors, ${(vaultPayload.length / 1024).toFixed(1)} kB encoded`);
  process.exit(0);
}

await mkdir(dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, page, 'utf8');
// The same content as a fragment, for publishing as the shared Artifact — so
// the hosted page and the shared link cannot say different things.
await writeFile(FRAGMENT, body, 'utf8');

console.log(`runbook → public/runbook.html (${(page.length / 1024).toFixed(1)} kB)`);
console.log(`runbook → runbook/.generated-body.html (artifact fragment)`);
console.log(`  vault: ${exploits.length} competitors, ${(vaultPayload.length / 1024).toFixed(1)} kB encoded`);
