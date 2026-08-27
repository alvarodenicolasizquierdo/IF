/**
 * Vector check for the pure-JS SHA-256 used to sign Evidence Packs.
 * Run with: node src/lib/sha256.test.mjs
 */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Strip TypeScript annotations well enough to import the algorithm directly.
const source = readFileSync(new URL('./sha256.ts', import.meta.url), 'utf8')
  .replace(/^\s*\/\*\*[\s\S]*?\*\/\s*$/gm, '')
  .replace(/export function sha256Hex\(message: string\): string/, 'export function sha256Hex(message)')
  .replace(/export function truncateHash[\s\S]*$/, '')
  .replace(/const rotr = \(x: number, n: number\)/, 'const rotr = (x, n)');

const module = await import(`data:text/javascript,${encodeURIComponent(source)}`);

const cases = [
  '',
  'abc',
  'Avenga Intelligent Flow',
  JSON.stringify({ id: 'EP-7A9B4C2D', mandate: 'MND-F839A2B91C' }),
  'a'.repeat(1000),
  '€180 per COSMIC Function Point — Palantino',
];

let failures = 0;
for (const input of cases) {
  const expected = createHash('sha256').update(input, 'utf8').digest('hex');
  const actual = module.sha256Hex(input);
  if (actual !== expected) {
    failures += 1;
    console.error(`FAIL for input of length ${input.length}\n  expected ${expected}\n  actual   ${actual}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures}/${cases.length} vectors failed.`);
  process.exit(1);
}
console.log(`sha256Hex: ${cases.length}/${cases.length} vectors match node:crypto.`);
