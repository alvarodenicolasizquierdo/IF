import { cx } from './tone';

interface CodeDiffProps {
  before: string;
  after: string;
  revealed: boolean;
}

/**
 * Side-by-side git diff. Faint red is the ungoverned legacy function; faint
 * green is the governed replacement produced under Mandate.
 */
export function CodeDiff({ before, after, revealed }: CodeDiffProps) {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');

  return (
    <div className="grid h-full grid-cols-2 gap-2">
      <DiffColumn
        title="billing.js @ main"
        subtitle="Legacy — ungoverned"
        lines={beforeLines}
        marker="-"
        tone="violation"
      />
      <DiffColumn
        title="billing.js @ feature/dynamic-tax-rates"
        subtitle="Modernised under Mandate"
        lines={revealed ? afterLines : []}
        marker="+"
        tone="passed"
        placeholder="Awaiting agent execution…"
      />
    </div>
  );
}

interface DiffColumnProps {
  title: string;
  subtitle: string;
  lines: string[];
  marker: string;
  tone: 'violation' | 'passed';
  placeholder?: string;
}

function DiffColumn({ title, subtitle, lines, marker, tone, placeholder }: DiffColumnProps) {
  const isPassed = tone === 'passed';
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-hairline bg-canvas/70">
      <header className="border-b border-hairline/70 px-3 py-2">
        <p className="truncate font-mono text-[13px] font-bold text-ink-muted">{title}</p>
        <p
          className={cx(
            'text-[12px] font-bold uppercase tracking-[0.14em]',
            isPassed ? 'text-trust-passed' : 'text-trust-violation-soft',
          )}
        >
          {subtitle}
        </p>
      </header>
      <div className="scrollbar-thin flex-1 overflow-auto p-2">
        {lines.length === 0 ? (
          <p className="px-2 py-4 font-mono text-[14px] text-ink-faint">
            {placeholder}
            <span className="ml-0.5 inline-block animate-caret-blink">▋</span>
          </p>
        ) : (
          <pre className="font-mono text-[14px] leading-[1.7]">
            {lines.map((line, i) => (
              <div
                key={i}
                className={cx(
                  'flex gap-2 rounded px-2',
                  line.trim() === ''
                    ? ''
                    : isPassed
                      ? 'bg-trust-passed/[0.07] text-trust-passed'
                      : 'bg-trust-violation/[0.07] text-trust-violation-soft',
                )}
              >
                <span className="select-none text-ink-faint/70">{line.trim() === '' ? ' ' : marker}</span>
                <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
              </div>
            ))}
          </pre>
        )}
      </div>
    </div>
  );
}
