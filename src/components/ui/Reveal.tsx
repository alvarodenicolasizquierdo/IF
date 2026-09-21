import type { ReactNode } from 'react';
import { Tooltip } from './Tooltip';
import { cx } from './tone';

/**
 * A short label that keeps its long description one hover away.
 *
 * Miguel Sureda's review of the console came down to one question — "¿en qué me
 * fijo?" — and one fix he offered with it: leave the label on the phase and put
 * the descriptive text behind a mouse-over, because "te descarga mucho la
 * visualización". He is right, and the Continuous Evolution stepper was the
 * proof: seven steps, each carrying a full sentence, which is seven sentences
 * competing for the same glance on a screen whose subject is a loop.
 *
 * So the sentence does not leave the product, it leaves the glance. Everything
 * a client might ask about is still one gesture away, and the screen at rest
 * shows structure rather than prose.
 *
 * It rides on the same portal tooltip as the glossary, which means it answers
 * keyboard focus as well as a pointer — a presenter driving the demo from the
 * keyboard reaches exactly the same copy.
 */
export function Reveal({
  label,
  detail,
  className,
  side = 'top',
  muted = false,
}: {
  /** What stays on screen. Keep it to a few words. */
  label: ReactNode;
  /** What used to be on screen, and is now one hover away. */
  detail: ReactNode;
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Quieter still, for labels that are not the subject of the screen. */
  muted?: boolean;
}) {
  return (
    <Tooltip content={detail} side={side} wide>
      <span
        className={cx(
          // A dotted rule rather than a solid one: enough to say there is more
          // here, not so much that seven of them become their own texture.
          'cursor-help underline decoration-dotted decoration-from-font underline-offset-4',
          'transition-colors hover:text-ink focus-visible:text-ink',
          muted ? 'decoration-ink-faint/40' : 'decoration-ink-faint/60',
          className,
        )}
      >
        {label}
      </span>
    </Tooltip>
  );
}
