import { PHASES, PHASE_LABEL, type Phase } from '../data';

/**
 * The five-phase rail — TalkTrack 4.5, part four.
 *
 * The current phase is marked three ways at once: the segment fills, the label
 * goes heavier, and a marker sits beneath it. That redundancy is the whole
 * point. On a projector any single signal can be lost — a washed-out accent, a
 * weight difference that disappears at distance — and the audience learns this
 * layout in the first twenty seconds and must never have to hunt in it again.
 *
 * It is also the shape Juan puts on screen on Day 1. Taking the exact visual is
 * worth more than drawing a better one, because the callback is the point.
 */
export function PhaseRail({ current, tone = 'dark' }: { current: Phase; tone?: 'dark' | 'light' }) {
  // The rail sits over ink on most frames and over a white document on some.
  // A label that only reads on one of the two is a label that disappears
  // exactly when somebody in row ten is trying to find their place.
  const restLabel = tone === 'dark' ? 'var(--muted)' : 'var(--muted)';
  const liveLabel = tone === 'dark' ? 'var(--surface)' : 'var(--ink)';
  return (
    <div
      style={{
        position: 'absolute',
        top: 'var(--s-6)',
        left: 'var(--s-6)',
        // Stops 200px clear of the clock so the two never crowd each other.
        right: 'calc(var(--s-6) + 320px + 200px)',
        zIndex: 3,
      }}
      data-testid="phase-rail"
      data-current={current}
    >
      <div style={{ display: 'flex', gap: 'var(--s-3)' }}>
        {PHASES.map((phase) => {
          const active = phase === current;
          return (
            <div key={phase} style={{ flex: 1 }}>
              <div
                style={{
                  height: 4,
                  background: active ? 'var(--accent)' : 'var(--border)',
                  transition: 'background 500ms ease-out',
                }}
              />
              <div
                className="t-meta"
                style={{
                  marginTop: 'var(--s-2)',
                  fontWeight: active ? 600 : 400,
                  color: active ? liveLabel : restLabel,
                  letterSpacing: '0.02em',
                }}
              >
                {PHASE_LABEL[phase]}
              </div>
              {/* The third signal. Present only under the lit segment. */}
              <div
                style={{
                  marginTop: 'var(--s-1)',
                  height: 10,
                  width: 10,
                  borderRadius: 'var(--r-pill)',
                  background: active ? 'var(--accent)' : 'transparent',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
