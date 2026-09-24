/**
 * Change the password on God Mode.
 *
 *   npm run set:presenter-password -- 'the new password'
 *
 * Writes the SHA-256 digest into src/lib/presenterLock.ts and the plaintext
 * into sources/presenter-password.txt, which is gitignored. The plaintext must
 * never be committed: this repository is public, and so is the site it builds.
 *
 * The digest in the bundle is public by necessity — a page with no server
 * behind it has to carry whatever it checks against. It stops the accident,
 * not the determined; scripts/../src/lib/presenterLock.ts says so at length.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const password = process.argv[2];

if (!password) {
  console.error("usage: npm run set:presenter-password -- 'the new password'");
  process.exit(1);
}
if (password.length < 8) {
  console.error('Use at least eight characters. This is typed in front of a room, not into a vault.');
  process.exit(1);
}

const digest = createHash('sha256').update(password, 'utf8').digest('hex');
const lock = resolve(root, 'src/lib/presenterLock.ts');
const before = readFileSync(lock, 'utf8');
const after = before.replace(/const DIGEST = '[0-9a-f]{64}';/, `const DIGEST = '${digest}';`);

if (after === before) {
  console.error('Could not find the DIGEST line in src/lib/presenterLock.ts — has it been renamed?');
  process.exit(1);
}

writeFileSync(lock, after);
mkdirSync(resolve(root, 'sources'), { recursive: true });
writeFileSync(resolve(root, 'sources/presenter-password.txt'), `${password}\n`);

console.log('presenter password set');
console.log(`  digest   src/lib/presenterLock.ts  ${digest.slice(0, 12)}…`);
console.log('  plaintext sources/presenter-password.txt (gitignored — never commit it)');
console.log('\nRebuild and redeploy for it to take effect, and tell whoever presents.');
