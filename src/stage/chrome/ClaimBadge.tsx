import { CLAIM_LABEL, type ClaimState } from '../data';

/**
 * The claim badge — TalkTrack 4.5, part four.
 *
 * Present in every single frame, with no exceptions. When something on screen
 * is not built yet the badge says so while it is on screen, rather than in an
 * apology afterwards. In a room with fifteen analysts in it that discipline is
 * worth more than any feature it sits next to, and it costs one pill.
 *
 * It rides at the right-hand end of the caption band rather than floating
 * 168px above it, which is a deviation from part four and a deliberate one.
 * Floating, it landed on top of the gate panel and half on white, half on ink,
 * which made the one component that must never be missable the least legible
 * thing in the frame. On the band it has a ground of its own, it collides with
 * nothing at any panel size, and "no exceptions" becomes enforceable.
 */
export function ClaimBadge({ state, month }: { state: ClaimState; month?: string }) {
  const label = state === 'building' && month ? `In build ${month}` : CLAIM_LABEL[state];

  return (
    <div
      className="t-meta"
      style={{
        position: 'absolute',
        right: 'var(--s-6)',
        bottom: 0,
        height: 132,
        display: 'flex',
        alignItems: 'center',
        color: 'var(--border)',
        whiteSpace: 'nowrap',
        zIndex: 3,
      }}
      data-testid="claim-badge"
      data-claim={state}
    >
      {label}
    </div>
  );
}
