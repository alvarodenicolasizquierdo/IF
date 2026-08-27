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
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = resolve(root, 'runbook/body.html');
const OUTPUT = resolve(root, 'public/runbook.html');

const FACES = [
  ['Instrument Serif', 'instrument-serif-400.woff2', 400, 'normal'],
  ['Instrument Serif', 'instrument-serif-400-italic.woff2', 400, 'italic'],
  ['Manrope', 'manrope-400.woff2', 400, 'normal'],
  ['Manrope', 'manrope-700.woff2', 700, 'normal'],
  ['JetBrains Mono', 'jetbrains-mono-400.woff2', 400, 'normal'],
  ['JetBrains Mono', 'jetbrains-mono-700.woff2', 700, 'normal'],
];

const fontFaces = FACES.map(
  ([family, file, weight, style]) => `    @font-face {
      font-family: '${family}';
      src: url('./fonts/${file}') format('woff2');
      font-weight: ${weight}; font-style: ${style}; font-display: swap;
    }`,
).join('\n');

const body = await readFile(SOURCE, 'utf8');

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
<link rel="icon" href="./favicon.svg">
<style>
${fontFaces}
</style>
</head>
<body>
${content}
</body>
</html>
`;

await mkdir(dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, page, 'utf8');
console.log(`runbook → public/runbook.html (${(page.length / 1024).toFixed(1)} kB)`);
