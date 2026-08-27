import { cx, TONE, type Tone } from './tone';

interface StatusBadgeProps {
  label: string;
  tone?: Tone;
  pulse?: boolean;
  className?: string;
}

export function StatusBadge({ label, tone = 'neutral', pulse = false, className }: StatusBadgeProps) {
  const t = TONE[tone];
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
        t.border,
        t.bg,
        t.text,
        className,
      )}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={cx('absolute inline-flex h-full w-full rounded-full opacity-70 animate-pulse-ring', t.dot)} />
          <span className={cx('relative inline-flex h-1.5 w-1.5 rounded-full', t.dot)} />
        </span>
      )}
      {label}
    </span>
  );
}
