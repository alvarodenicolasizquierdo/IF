import { useEffect, useRef, useState } from 'react';
import { formatElapsed } from '../data';

export type ClockState = 'running' | 'jumping' | 'stopped';

/**
 * The elapsed clock — TalkTrack 4.5, part four.
 *
 * It carries the entire acceleration argument without a word being said, so
 * it is the one component that must never look approximate. Two rules follow
 * from that and both are load-bearing:
 *
 * Its value comes from the timeline, never from wall time. That is what makes
 * every take identical, lets a fast forward land on an exact number, and means
 * a caption change is an edit rather than a re-shoot.
 *
 * And it holds absolutely still during the refusal. Six seconds of zero motion
 * includes the seconds digit — a ticking clock under a REFUSED panel pulls the
 * eye off the only thing in the frame that matters.
 */
export function ClockHUD({
  value,
  state = 'running',
  from,
  scale = 1,
  standalone = false,
}: {
  /** Target elapsed milliseconds. */
  value: number;
  state?: ClockState;
  /** Where a jump starts from. Ignored unless state is 'jumping'. */
  from?: number;
  /** STAGE-11 renders the same component at four times HUD size. */
  scale?: number;
  /** Centred in the frame rather than pinned to the corner. */
  standalone?: boolean;
}) {
  const shown = useAnimatedElapsed(value, state, from);

  return (
    <div
      className="t-clock"
      style={{
        position: 'absolute',
        ...(standalone
          ? { top: '50%', left: '50%', transform: `translate(-50%, -50%) scale(${scale})` }
          : { top: 'var(--s-6)', right: 'var(--s-6)' }),
        background: 'color-mix(in srgb, var(--clock-bg) 88%, transparent)',
        color: '#FFFFFF',
        borderRadius: 'var(--r-pill)',
        padding: '14px 40px',
        // The advance width is fixed so the pill cannot breathe as digits change.
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        zIndex: 3,
      }}
      data-testid="clock"
      data-elapsed={formatElapsed(shown)}
    >
      {formatElapsed(shown)}
    </div>
  );
}

/**
 * Running advances a second per second. Jumping eases to the target over
 * 1500ms and then stops hard. Stopped does not move at all.
 *
 * Driven by requestAnimationFrame against a timestamp captured on mount rather
 * than by an interval, because an interval drifts and a drifting clock is
 * visible when two cuts are placed next to each other in an edit.
 */
function useAnimatedElapsed(value: number, state: ClockState, from?: number): number {
  const [shown, setShown] = useState(state === 'jumping' ? (from ?? 0) : value);
  const frame = useRef<number>();

  useEffect(() => {
    if (frame.current) cancelAnimationFrame(frame.current);

    if (state === 'stopped') {
      setShown(value);
      return;
    }

    const start = performance.now();
    const origin = state === 'jumping' ? (from ?? 0) : value;

    if (state === 'jumping') {
      const DURATION = 1500;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION);
        // Ease-in-out, then a hard stop — the spec is explicit that it settles
        // rather than coasting, so the final number reads as arrived at.
        const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
        setShown(origin + (value - origin) * eased);
        if (t < 1) frame.current = requestAnimationFrame(tick);
        else setShown(value);
      };
      frame.current = requestAnimationFrame(tick);
    } else {
      const tick = (now: number) => {
        setShown(origin + (now - start));
        frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    }

    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value, state, from]);

  return shown;
}
