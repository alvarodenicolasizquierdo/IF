import { useEffect } from 'react';
import { FileWarning, GitBranch, Network, X } from 'lucide-react';
import { CLIENT_CONTEXT, CONTEXT_PILLS } from '@/data/scenario';
import { useDemoStore } from '@/store/demoStore';
import { cx } from '@/components/ui/tone';

/**
 * The context library as a traceability spine rather than a row of pills.
 *
 * Left is where the work came from, middle is what the agent is allowed to
 * know, right is the one file the Mandate lets it touch. The point of drawing
 * it is the broken edge: the stale, unclassified schema is visibly wired into
 * the same target as everything else, which is why the probe holds the run.
 * Remediating the library heals that edge on screen.
 *
 * Positions are percentages in a fixed coordinate space, so the edges can be
 * drawn without measuring the DOM — no layout thrash, and it scales cleanly
 * from a 720p share to a projector.
 */

const ORIGIN = { x: 9, y: 50 };
const TARGET = { x: 91, y: 50 };
const MID_X = 50;

/**
 * Spread the artefacts evenly rather than into fixed slots: a hard-coded list
 * left a gap whenever the library had fewer entries than slots, and the empty
 * band pushed the caption below the fold.
 */
function rowY(index: number, count: number) {
  if (count <= 1) return 50;
  return 8 + (index * 84) / (count - 1);
}

export function ContextGraph() {
  const open = useDemoStore((s) => s.contextGraphOpen);
  const close = useDemoStore((s) => s.closeContextGraph);
  const dataRemediated = useDemoStore((s) => s.dataRemediated);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  // The origin ticket anchors the spine; it is not one of the leaves.
  const leaves = CONTEXT_PILLS.filter((pill) => pill.kind !== 'Origin');
  const isBroken = (pill: (typeof CONTEXT_PILLS)[number]) =>
    !dataRemediated && (pill.freshness < 80 || !pill.classified);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="graph-title"
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-canvas/88 p-6 backdrop-blur-md"
    >
      <div className="my-auto flex max-h-[calc(100vh-3rem)] w-full max-w-6xl animate-scale-in flex-col overflow-hidden rounded-2xl border border-hairline bg-surface shadow-panel">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-hairline px-7 py-4">
          <div className="flex items-start gap-3">
            <Network className="mt-0.5 h-6 w-6 shrink-0 text-trust-active-soft" strokeWidth={2.2} />
            <div>
              <h2 id="graph-title" className="text-[18px] font-bold uppercase tracking-wider text-ink">
                The traceability spine
              </h2>
              <p className="mt-0.5 text-[15px] leading-relaxed text-ink-muted">
                Every artefact the agent may rely on, traced from the system of record to the single
                file it is permitted to change.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close the traceability spine"
            className="shrink-0 rounded p-1 text-ink-faint transition hover:bg-card hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-5">
          <div className="relative aspect-[16/7] min-h-[280px] w-full">
            {/* ---- edges, behind everything ---- */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              {leaves.map((pill, i) => {
                const y = rowY(i, leaves.length);
                const broken = isBroken(pill);
                return (
                  <g key={pill.id}>
                    {/* origin → artefact */}
                    <path
                      d={`M ${ORIGIN.x + 5} ${ORIGIN.y} C ${MID_X - 18} ${ORIGIN.y}, ${MID_X - 18} ${y}, ${MID_X - 12} ${y}`}
                      fill="none"
                      stroke={broken ? '#FF5A2C' : '#4A3568'}
                      strokeWidth={broken ? 2 : 1.2}
                      strokeDasharray={broken ? '3 2' : undefined}
                      vectorEffect="non-scaling-stroke"
                    />
                    {/* artefact → target file */}
                    <path
                      d={`M ${MID_X + 12} ${y} C ${TARGET.x - 18} ${y}, ${TARGET.x - 18} ${TARGET.y}, ${TARGET.x - 5} ${TARGET.y}`}
                      fill="none"
                      stroke={broken ? '#FF5A2C' : '#4A3568'}
                      strokeWidth={broken ? 2 : 1.2}
                      strokeDasharray={broken ? '3 2' : undefined}
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                );
              })}
            </svg>

            {/* ---- origin ---- */}
            <Node x={ORIGIN.x} y={ORIGIN.y} tone="passed" eyebrow="System of record">
              <span className="font-mono text-[14px] font-bold">Jira {CLIENT_CONTEXT.workItem}</span>
              <span className="text-[13px] text-ink-faint">{CLIENT_CONTEXT.requirement}</span>
            </Node>

            {/* ---- artefacts ---- */}
            {leaves.map((pill, i) => {
              const broken = isBroken(pill);
              return (
                <Node
                  key={pill.id}
                  x={MID_X}
                  y={rowY(i, leaves.length)}
                  tone={broken ? 'violation' : 'active'}
                  eyebrow={pill.kind}
                  wide
                >
                  <span className="flex items-center gap-1.5 truncate font-mono text-[13px] font-bold">
                    {broken && <FileWarning className="h-3 w-3 shrink-0" />}
                    {pill.label.replace(/^[^:]+:\s*/, '')}
                  </span>
                  <span className="text-[12px] text-ink-faint">
                    freshness {dataRemediated && broken ? 97 : pill.freshness}% ·{' '}
                    {dataRemediated || pill.classified ? 'classified' : 'UNCLASSIFIED'}
                  </span>
                </Node>
              );
            })}

            {/* ---- target ---- */}
            <Node x={TARGET.x} y={TARGET.y} tone="hitl" eyebrow="Mandate target">
              <span className="flex items-center gap-1.5 font-mono text-[14px] font-bold">
                <GitBranch className="h-3 w-3 shrink-0" />
                billing.js
              </span>
              <span className="text-[13px] text-ink-faint">the only writable path</span>
            </Node>
          </div>

          <p
            className={cx(
              'mt-3 rounded-lg border px-3 py-2.5 text-[14px] leading-relaxed',
              dataRemediated
                ? 'border-trust-passed/50 bg-trust-passed/10 text-ink-muted'
                : 'border-trust-violation/50 bg-trust-violation/10 text-ink-muted',
            )}
          >
            {dataRemediated ? (
              <>
                Every path is whole. The rebuilt schema is classified and fresh, so no route into{' '}
                <span className="font-mono text-trust-passed">billing.js</span> passes through an
                artefact the platform cannot vouch for.
              </>
            ) : (
              <>
                The dashed red path is the reason the run is held. That schema is stale and its
                contents were never classified, yet it feeds the same target file as everything
                else — so anything the agent produces inherits it. Remediating the library reconnects
                it.
              </>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-hairline bg-canvas/40 px-7 py-3">
          <button
            type="button"
            onClick={close}
            className="rounded border border-hairline px-3 py-1.5 text-[14px] font-bold uppercase tracking-wider text-ink-muted transition hover:border-trust-active/50 hover:text-ink"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const NODE_TONE = {
  active: 'border-trust-active/50 bg-trust-active/10 text-ink',
  passed: 'border-trust-passed/50 bg-trust-passed/10 text-trust-passed',
  hitl: 'border-trust-hitl/60 bg-trust-hitl/10 text-trust-hitl-soft',
  violation: 'border-trust-violation/70 bg-trust-violation/15 text-trust-violation-soft',
} as const;

function Node({
  x,
  y,
  tone,
  eyebrow,
  wide,
  children,
}: {
  x: number;
  y: number;
  tone: keyof typeof NODE_TONE;
  eyebrow: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        'absolute flex -translate-x-1/2 -translate-y-1/2 flex-col gap-0.5 rounded-lg border px-2.5 py-1.5 shadow-panel',
        wide ? 'w-[30%]' : 'w-[17%]',
        NODE_TONE[tone],
      )}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-faint">
        {eyebrow}
      </span>
      {children}
    </div>
  );
}
