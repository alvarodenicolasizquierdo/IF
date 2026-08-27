import { useId, useState, type ReactNode } from 'react';
import { cx } from './tone';

type Side = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  /** What the tooltip explains. */
  content: ReactNode;
  children: ReactNode;
  side?: Side;
  /** Widen for longer definitions. */
  wide?: boolean;
  className?: string;
}

const SIDE: Record<Side, string> = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
};

/**
 * Hover- and focus-triggered explanation.
 *
 * Focus matters as much as hover here: a presenter tabbing through the console
 * on a client's machine, or anyone driving it by keyboard, should reach the
 * same copy. Escape dismisses so a tooltip never sits over the thing behind it.
 */
export function Tooltip({ content, children, side = 'top', wide = false, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className={cx('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false);
      }}
    >
      <span aria-describedby={open ? id : undefined} tabIndex={0} className="inline-flex outline-none focus-visible:ring-1 focus-visible:ring-trust-active-soft rounded">
        {children}
      </span>

      {open && (
        <span
          role="tooltip"
          id={id}
          className={cx(
            'pointer-events-none absolute z-[80] animate-fade-in rounded-lg border border-hairline bg-canvas px-3 py-2 shadow-panel backdrop-blur',
            'text-[11px] font-normal normal-case leading-relaxed tracking-normal text-ink-muted',
            wide ? 'w-72' : 'w-56',
            SIDE[side],
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}

/**
 * A term carrying its own definition — dotted underline, tooltip on hover or
 * focus. Used for the vocabulary a client will not know on first sight.
 */
export function Term({
  children,
  definition,
  side = 'top',
  wide = true,
}: {
  children: ReactNode;
  definition: ReactNode;
  side?: Side;
  wide?: boolean;
}) {
  return (
    <Tooltip content={definition} side={side} wide={wide}>
      <span className="cursor-help decoration-dotted decoration-from-font underline underline-offset-[3px] decoration-ink-faint">
        {children}
      </span>
    </Tooltip>
  );
}

/** A small (i) affordance for places where underlining the label would be noisy. */
export function InfoTip({
  definition,
  side = 'top',
  wide = true,
}: {
  definition: ReactNode;
  side?: Side;
  wide?: boolean;
}) {
  return (
    <Tooltip content={definition} side={side} wide={wide}>
      <span
        aria-label="More information"
        role="img"
        className="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-hairline text-[8px] font-bold text-ink-faint transition hover:border-trust-active/60 hover:text-trust-active-soft"
      >
        i
      </span>
    </Tooltip>
  );
}
