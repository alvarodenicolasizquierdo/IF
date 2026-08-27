import { cloneElement, isValidElement, useId, useState, type ReactNode } from 'react';
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
  /**
   * Set when the child is already focusable — a button, a link, a control.
   * The tooltip then hangs its description off the child itself rather than
   * adding a second tab stop in front of it.
   */
  interactiveChild?: boolean;
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
 * Focus matters as much as hover: a presenter tabbing through the console on a
 * client's machine should reach the same copy. So the description is attached
 * to whatever actually receives focus — the child when it is already a
 * control, otherwise a focusable wrapper we supply. Escape dismisses.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  wide = false,
  className,
  interactiveChild = false,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  // Describe the element the user is actually on. Wrapping an interactive
  // child in a focusable span would add a phantom tab stop and leave the
  // description on the wrapper, where a screen reader never reaches it.
  const described =
    interactiveChild && isValidElement(children)
      ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
          'aria-describedby': open ? id : undefined,
        })
      : children;

  return (
    <span
      className={cx('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(e) => {
        if (e.key === 'Escape') hide();
      }}
    >
      {interactiveChild ? (
        described
      ) : (
        <span
          aria-describedby={open ? id : undefined}
          tabIndex={0}
          className="inline-flex rounded outline-none focus-visible:ring-1 focus-visible:ring-trust-active-soft"
        >
          {children}
        </span>
      )}

      {open && (
        <span
          role="tooltip"
          id={id}
          className={cx(
            'pointer-events-none absolute z-[80] animate-fade-in rounded-lg border border-hairline bg-canvas px-3 py-2 shadow-panel',
            'text-[14px] font-normal normal-case leading-relaxed tracking-normal text-ink-muted',
            wide ? 'w-80' : 'w-64',
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
      <span className="cursor-help underline decoration-ink-faint decoration-dotted decoration-from-font underline-offset-[3px]">
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
        className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-hairline text-[11px] font-bold text-ink-faint transition hover:border-trust-active/60 hover:text-trust-active-soft"
      >
        i
      </span>
    </Tooltip>
  );
}
