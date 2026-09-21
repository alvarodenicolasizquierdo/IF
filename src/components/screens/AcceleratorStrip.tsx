import { ACCELERATORS, STATUS_LABEL, type AcceleratorStatus } from '@/data/accelerators';
import { Panel } from '@/components/ui/Panel';
import { Reveal } from '@/components/ui/Reveal';
import { cx } from '@/components/ui/tone';

/**
 * The accelerators, in the column beside the chart.
 *
 * They replaced a paragraph of prose about the engagement track, which was the
 * most skippable block on the dashboard and the last one anybody read — and
 * then they were below the fold, which is the same thing as not being there.
 * They sit in the first screen now, next to the argument they belong to: the
 * chart says the governed curve compounds, and this says what you actually buy
 * to get it.
 *
 * The same rule as everywhere else in this pass: the name and the status stay
 * on screen, the sentence explaining the module is one hover away.
 */
export function AcceleratorStrip({ className }: { className?: string }) {
  return (
    <Panel
      eyebrow="Delivered a module at a time"
      title="The accelerators"
      className={className}
      bodyClassName="p-3"
      action={<p className="whitespace-nowrap text-[12px] text-ink-faint">Hover for detail</p>}
    >
      <ul className="flex flex-col gap-1">
        {ACCELERATORS.map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-hairline/60 bg-canvas/40 px-3 py-2"
          >
            <span className="min-w-0 text-[14px] font-semibold leading-snug text-ink">
              <Reveal label={a.name} detail={a.line} side="left" />
            </span>
            <StatusChip status={a.status} when={a.when} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/**
 * Shape and word, never hue alone. A filled square is shipped, a half square
 * is under way, an outline is intended — legible after the frame has been
 * converted to greyscale, which is the only test that survives a projector.
 */
function StatusChip({ status, when }: { status: AcceleratorStatus; when?: string }) {
  const label = status === 'building' && when ? `${STATUS_LABEL[status]} ${when}` : STATUS_LABEL[status];

  return (
    <span
      className={cx(
        'inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider',
        status === 'now'
          ? 'border-trust-passed/50 text-trust-passed'
          : status === 'building'
            ? 'border-hairline text-ink-muted'
            : 'border-hairline/60 text-ink-faint',
      )}
    >
      <Glyph status={status} />
      {label}
    </span>
  );
}

function Glyph({ status }: { status: AcceleratorStatus }) {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden focusable="false" className="shrink-0">
      {status === 'now' && <rect width="8" height="8" fill="currentColor" />}
      {status === 'building' && (
        <>
          <rect width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <rect width="4" height="8" fill="currentColor" />
        </>
      )}
      {status === 'planned' && (
        <rect width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
      )}
    </svg>
  );
}
