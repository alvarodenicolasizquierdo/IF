/**
 * The lock on God Mode.
 *
 * God Mode gives away the whole apparatus: the phase jumps, the forced
 * identities, the competitor demolition matrix. Until now the only thing
 * between a client and all of it was a small crown in the corner and a key
 * nobody had told them about, which is fine right up until somebody idly
 * clicks the crown while you are pouring the coffee.
 *
 * ---------------------------------------------------------------------------
 * What this is, said plainly, because the rest of this console is built on not
 * overclaiming: it is concealment with a lock on it, not protection.
 *
 * The console is a static page served from a public address. Anyone who opens
 * the developer tools can set the flag by hand, and the digest below can be
 * attacked offline by anybody who wants to badly enough. It is not protecting
 * a secret; it is stopping the accident — a client on your laptop, a link
 * forwarded one hop further than you meant, a curious evaluator pressing keys.
 * For that it is entirely sufficient, and nothing stronger is available to a
 * page with no server behind it.
 *
 * The password itself is not in this repository, which is public. Only its
 * SHA-256 digest is, and the plaintext lives with the presenter.
 * ---------------------------------------------------------------------------
 */
import { sha256Hex } from './sha256';

/** SHA-256 of the presenter password. Regenerate with npm run set:presenter-password. */
const DIGEST = 'eea5e8169deefad6e074bfb8bcaade492eab629213bd9ec94a23029d039405f8';

/**
 * Per tab, not per click.
 *
 * Asking again on every toggle would be unusable in front of a room — the
 * panel goes up and down a dozen times in a twelve-minute demo. It lasts the
 * tab, survives a reload mid-demo, and a fresh tab asks again. Reset does not
 * clear it: resetting the scenario is something you do while presenting, and
 * locking the presenter out of their own controls at that moment would be
 * exactly the wrong behaviour.
 */
const KEY = 'if-presenter-unlocked';

export function isPresenterUnlocked(): boolean {
  try {
    return sessionStorage.getItem(KEY) === DIGEST;
  } catch {
    // Private windows and locked-down browsers throw rather than return null.
    // A presenter in that state simply retypes the password when they reload.
    return false;
  }
}

/** @returns true if the password was right, and the tab is now unlocked. */
export function unlockPresenter(password: string): boolean {
  if (sha256Hex(password) !== DIGEST) return false;
  try {
    sessionStorage.setItem(KEY, DIGEST);
  } catch {
    // Unlocked for this page load regardless; it just will not survive a reload.
  }
  return true;
}
