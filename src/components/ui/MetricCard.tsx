import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { InfoTip } from './Tooltip';
import { cx, TONE, type Tone } from './tone';

interface MetricCardProps {
  label: string;
  /** Explanation shown behind an (i) beside the label. */
  definition?: ReactNode;
  baseline: string;
  current: string;
  /** Signed percentage delta, e.g. -85 */
  delta: number;
  /** For quality metrics a fall is an improvement. */
  lowerIsBetter?: boolean;
  hero?: boolean;
  footnote?: string;
}

/**
 * A stat tile, not a chart. The number is the story — audit-suite typography,
 * baseline shown small above the current value so the shift is legible at a glance.
 */
export function MetricCard({
  label,
  baseline,
  current,
  delta,
  lowerIsBetter = true,
  hero = false,
  footnote,
  definition,
}: MetricCardProps) {
  const improved = lowerIsBetter ? delta < 0 : delta > 0;
  const tone: Tone = delta === 0 ? 'neutral' : improved ? 'passed' : 'violation';
  const t = TONE[tone];
  const Arrow = delta < 0 ? ArrowDownRight : ArrowUpRight;

  return (
    <div
      className={cx(
        'rounded-xl border bg-surface/70 px-3.5 py-3',
        hero ? cx('border-2 border-trust-hitl/50 shadow-glow-hitl') : 'border-hairline',
      )}
    >
      <p className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.14em] text-ink-faint">
        {label}
        {definition && <InfoTip definition={definition} side="bottom" />}
      </p>

      <div className="mt-1.5 flex items-baseline gap-2">
        <span
          className={cx(
            'font-mono font-bold tabular-nums tracking-tight',
            hero ? 'text-3xl text-trust-hitl-soft' : 'text-2xl text-ink',
          )}
        >
          {current}
        </span>
        {!hero && (
          <span className="font-mono text-[14px] text-ink-faint line-through decoration-ink-faint/60">
            {baseline}
          </span>
        )}
      </div>

      {delta !== 0 && (
        <div className={cx('mt-1 flex items-center gap-1', t.text)}>
          <Arrow className="h-3 w-3" strokeWidth={3} />
          <span className="font-mono text-[14px] font-bold tabular-nums">
            {delta > 0 ? '+' : ''}
            {delta.toFixed(0)}%
          </span>
          <span className="text-[13px] text-ink-faint">vs baseline</span>
        </div>
      )}

      {footnote && <p className="mt-1.5 hidden text-[13px] leading-snug text-ink-faint 2xl:block">{footnote}</p>}
    </div>
  );
}
