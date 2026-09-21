import { FEATURES, GATE_COPY, type FeatureId } from '../data';

/**
 * STAGE-08, the gate — the single most important component in the build.
 *
 * Refused and passed are one component in two states, and the acceptance
 * criterion is unusually strict: exactly four things may differ between them —
 * the word, the glyph, the bar and the sentence — and every one has to occupy
 * the same box it occupied before. Nothing else moves.
 *
 * That constraint is the argument. If the panel re-flowed between 2.4 and 2.5
 * the room would read it as a different change, and the point of the beat is
 * that it is the same change. It only had to be able to say what it was for.
 *
 * So the two states are written as one tree with four ternaries rather than as
 * two components that happen to look alike. Two components would drift.
 *
 * One deviation from part five, and it is forced by arithmetic rather than
 * taste. The spec puts the work item "at the bottom of the frame" beneath the
 * panel, but a 720px panel centred in 1080 leaves 48px between its lower edge
 * and the caption band. The card cannot go there. It goes inside the panel
 * instead, on the right, at 50% opacity — the room still sees what was
 * refused rather than being told, and the panel's geometry is untouched,
 * which is the property the whole beat depends on.
 */
export function GatePanel({
  state,
  feature,
  showWorkItem = true,
}: {
  state: 'refused' | 'passed';
  feature: FeatureId;
  /** The refused frame carries the work item beneath, so the room can see
   *  what was refused rather than being told. */
  showWorkItem?: boolean;
}) {
  const refused = state === 'refused';
  const f = FEATURES[feature];

  return (
    <>
      <div
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 1400, height: 720,
          background: 'var(--surface)', color: 'var(--ink)',
          borderRadius: 'var(--r-panel)',
          display: 'flex', overflow: 'hidden',
        }}
        data-testid="gate-panel"
        data-state={state}
      >
        {/* 1 of 4 — the bar. Accent on refusal, muted on pass. */}
        <div style={{ width: 16, flexShrink: 0, background: refused ? 'var(--accent)' : 'var(--muted)' }} />

        <div style={{ flex: 1, padding: 'var(--s-5)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)' }}>
            {/* 2 of 4 — the glyph. Octagon against a check reads in silhouette;
             *  a cross against a check does not, because at speed the eye takes
             *  both for small symmetrical marks. */}
            {refused ? <Octagon /> : <Check />}
            {/* 3 of 4 — the word. */}
            <span className="t-hero" data-testid="gate-word">
              {refused ? GATE_COPY.refused.word : GATE_COPY.passed.word}
            </span>
          </div>

          {/* 4 of 4 — the sentence. Same box, same size, either way. */}
          <p
            className="t-display"
            style={{ margin: 'var(--s-5) 0 0', minHeight: 166 }}
            data-testid="gate-sentence"
          >
            {refused
              ? GATE_COPY.refused.sentence
              : `${f.requirement}  ${f.specTitle}`}
          </p>

          <div
            style={{
              marginTop: 'auto',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--s-4)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-1)' }}>
            {refused ? (
              GATE_COPY.refused.lines.map((line) => (
                <p key={line} className="t-meta" style={{ margin: 0 }}>{line}</p>
              ))
            ) : (
              <>
                <p className="t-meta" style={{ margin: 0 }}>
                  Approved by {GATE_COPY.passed.approver.name}, {GATE_COPY.passed.approver.role}, {GATE_COPY.passed.approvedAt}
                </p>
                <p className="t-meta" style={{ margin: 0, visibility: 'hidden' }} aria-hidden>
                  {/* Holds the second line's height so the block does not shift. */}
                  placeholder
                </p>
              </>
            )}
            </div>

            {showWorkItem && refused && (
              <div
                style={{
                  width: 640, opacity: 0.5, flexShrink: 0,
                  border: '1px solid var(--border)', borderRadius: 'var(--r-panel)',
                  padding: 'var(--s-3)',
                }}
                data-testid="gate-work-item"
              >
                <p className="t-meta" style={{ margin: 0 }}>
                  {f.requester.name}  ·  {f.requester.role}  ·  {f.timestamp}
                </p>
                <p className="t-body" style={{ margin: 'var(--s-1) 0 0' }}>{f.request}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/** 88px, solid. Deliberately not a cross. */
function Octagon() {
  return (
    <svg width={88} height={88} viewBox="0 0 100 100" aria-hidden focusable="false">
      <polygon
        points="30,3 70,3 97,30 97,70 70,97 30,97 3,70 3,30"
        fill="var(--accent)"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg width={88} height={88} viewBox="0 0 100 100" aria-hidden focusable="false">
      <path
        d="M18 54 L40 76 L84 24"
        fill="none"
        stroke="var(--ink)"
        strokeWidth={14}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
