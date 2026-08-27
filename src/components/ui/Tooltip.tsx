import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
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

/** Distance from the anchor, and the closest a tooltip may come to a screen edge. */
const GAP = 8;
const EDGE = 10;

const OPPOSITE: Record<Side, Side> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

interface Box {
  width: number;
  height: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, Math.max(min, max)));

/**
 * Where the tooltip goes, in viewport coordinates.
 *
 * Flips to the opposite side when the preferred one would run off-screen, then
 * clamps both axes into the viewport regardless — a definition that reads
 * half-off the right edge of a projector is worse than one that is nudged.
 */
function place(anchor: DOMRect, tip: Box, preferred: Side, vw: number, vh: number) {
  const fits = (s: Side) => {
    if (s === 'top') return anchor.top - GAP - tip.height >= EDGE;
    if (s === 'bottom') return anchor.bottom + GAP + tip.height <= vh - EDGE;
    if (s === 'left') return anchor.left - GAP - tip.width >= EDGE;
    return anchor.right + GAP + tip.width <= vw - EDGE;
  };

  const side = fits(preferred) || !fits(OPPOSITE[preferred]) ? preferred : OPPOSITE[preferred];

  let top: number;
  let left: number;
  if (side === 'top' || side === 'bottom') {
    top = side === 'top' ? anchor.top - GAP - tip.height : anchor.bottom + GAP;
    left = anchor.left + anchor.width / 2 - tip.width / 2;
  } else {
    left = side === 'left' ? anchor.left - GAP - tip.width : anchor.right + GAP;
    top = anchor.top + anchor.height / 2 - tip.height / 2;
  }

  return {
    top: clamp(top, EDGE, vh - tip.height - EDGE),
    left: clamp(left, EDGE, vw - tip.width - EDGE),
  };
}

/**
 * Hover- and focus-triggered explanation.
 *
 * Rendered through a portal in viewport coordinates rather than positioned
 * inside its anchor. Two reasons, both of which bit us in a real walkthrough:
 * an absolutely-positioned tooltip is trapped in its nearest stacking context —
 * the sticky left rail is one — so no z-index can lift it above the main
 * workspace; and one anchored near a screen edge simply runs off it. Fixed
 * positioning escapes every ancestor, and the placement below flips and clamps.
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
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  const show = () => setOpen(true);
  const hide = () => {
    setOpen(false);
    setPos(null);
  };

  const reposition = useCallback(() => {
    const anchor = anchorRef.current;
    const tip = tipRef.current;
    if (!anchor || !tip) return;
    setPos(
      place(
        anchor.getBoundingClientRect(),
        { width: tip.offsetWidth, height: tip.offsetHeight },
        side,
        window.innerWidth,
        window.innerHeight,
      ),
    );
  }, [side]);

  // Measure before paint so the tooltip never appears at the wrong spot first.
  useLayoutEffect(() => {
    if (open) reposition();
  }, [open, reposition, content]);

  // The anchor moves when the page scrolls under it — including inside the
  // scrollable rail, hence the capture phase.
  useEffect(() => {
    if (!open) return;
    const onMove = () => reposition();
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [open, reposition]);

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
      ref={anchorRef}
      data-tooltip-anchor=""
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

      {open &&
        createPortal(
          <span
            ref={tipRef}
            role="tooltip"
            id={id}
            style={{
              top: pos?.top ?? 0,
              left: pos?.left ?? 0,
              // Never wider than the screen it has to fit on.
              maxWidth: `calc(100vw - ${EDGE * 2}px)`,
              // Hidden for the single frame before it has been measured.
              visibility: pos ? 'visible' : 'hidden',
            }}
            className={cx(
              'pointer-events-none fixed z-[90] animate-fade-in rounded-lg border border-hairline bg-canvas px-3 py-2 shadow-panel',
              'text-[14px] font-normal normal-case leading-relaxed tracking-normal text-ink-muted',
              wide ? 'w-80' : 'w-64',
            )}
          >
            {content}
          </span>,
          document.body,
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
