import { ACCELERATORS, STATUS_LABEL, type AcceleratorStatus } from '@/data/accelerators';
import { READINESS, longDate } from '@/data/readiness';
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
      eyebrow="One module at a time"
      title="The accelerators"
      className={className}
      bodyClassName="p-3"
      action={
        /*
         * The provenance line, and it is not decoration. Every date in this
         * panel is a claim with a month on it, and the first fair question is
         * how old the claim is. Answering it on the panel costs one line and
         * saves the presenter from being asked it in front of the room.
         */
        <Reveal
          className="whitespace-nowrap text-[12px] text-ink-faint"
          label={`As at ${longDate(READINESS.asOf)}`}
          detail={`Read from the readiness register and the build schedule rather than written here, and synced on ${longDate(READINESS.syncedAt)}. Dates are months because the schedule's own assumptions say so: it runs on two estimating factors that have not been measured yet, so a month is the honest precision and a day would not be. Hover any accelerator for what it does.`}
          side="left"
          muted
        />
      }
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
function StatusChip({ status, when }: { status: AcceleratorStatus; when: string | null }) {
  const label = status !== 'live' && when ? `${STATUS_LABEL[status]} · ${when}` : STATUS_LABEL[status];

  return (
    <span
      className={cx(
        'inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider',
        status === 'live'
          ? 'border-trust-passed/50 text-trust-passed'
          : status === 'build'
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
      {status === 'live' && <rect width="8" height="8" fill="currentColor" />}
      {status === 'build' && (
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
