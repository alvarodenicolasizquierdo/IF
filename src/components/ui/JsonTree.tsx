import { cx } from './tone';

/**
 * Evidence Pack rendered as a syntax-coloured JSON stream. Keys, strings and
 * verdicts are tokenised so a CIO can read the audit record without squinting.
 */
export function JsonTree({ value }: { value: unknown }) {
  return (
    <pre className="scrollbar-thin h-full overflow-auto rounded-lg border border-hairline bg-canvas/80 p-4 font-mono text-[11px] leading-relaxed">
      {render(value, 0)}
    </pre>
  );
}

function render(value: unknown, depth: number): React.ReactNode {
  const pad = '  '.repeat(depth);
  const padInner = '  '.repeat(depth + 1);

  if (value === null) return <span className="text-ink-faint">null</span>;
  if (typeof value === 'number') return <span className="text-trust-active-soft">{value}</span>;
  if (typeof value === 'boolean') return <span className="text-trust-active-soft">{String(value)}</span>;
  if (typeof value === 'string') return <span className={cx(verdictTone(value))}>"{value}"</span>;

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-ink-muted">[]</span>;
    return (
      <>
        <span className="text-ink-muted">[</span>
        {value.map((item, i) => (
          <span key={i}>
            {'\n'}
            {padInner}
            {render(item, depth + 1)}
            {i < value.length - 1 && <span className="text-ink-muted">,</span>}
          </span>
        ))}
        {'\n'}
        {pad}
        <span className="text-ink-muted">]</span>
      </>
    );
  }

  const entries = Object.entries(value as Record<string, unknown>);
  return (
    <>
      <span className="text-ink-muted">{'{'}</span>
      {entries.map(([key, val], i) => (
        <span key={key}>
          {'\n'}
          {padInner}
          <span className="text-ink">"{key}"</span>
          <span className="text-ink-muted">: </span>
          {render(val, depth + 1)}
          {i < entries.length - 1 && <span className="text-ink-muted">,</span>}
        </span>
      ))}
      {'\n'}
      {pad}
      <span className="text-ink-muted">{'}'}</span>
    </>
  );
}

function verdictTone(value: string): string {
  if (value === 'PASSED' || value === 'SIGNED_AND_SEALED') return 'text-trust-passed font-bold';
  if (value === 'FAILED' || value === 'VOIDED') return 'text-trust-violation-soft font-bold';
  if (value === 'PENDING' || value === 'PENDING_HUMAN_SIGNATURE') return 'text-trust-hitl-soft font-bold';
  return 'text-trust-passed/80';
}
