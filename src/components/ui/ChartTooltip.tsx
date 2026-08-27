import type { TooltipProps } from 'recharts';

interface Formatter {
  (value: number): string;
}

/**
 * Shared crosshair tooltip. Values wear text tokens; the coloured chip beside
 * each row carries series identity, so colour is never the only cue.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  format,
}: TooltipProps<number, string> & { format?: Formatter }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-hairline bg-canvas/95 px-3 py-2 shadow-panel backdrop-blur">
      <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-faint">{label}</p>
      <ul className="space-y-1">
        {payload.map((entry) => (
          <li key={String(entry.dataKey)} className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[11px] text-ink-muted">{entry.name}</span>
            <span className="ml-auto font-mono text-[11px] font-bold text-ink">
              {format ? format(Number(entry.value)) : entry.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
