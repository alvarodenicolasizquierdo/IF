import { ScrollText } from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { cx, TONE } from '@/components/ui/tone';

/** Immutable event trail — the Article 15 traceability proof, always on screen. */
export function AuditLog() {
  const entries = useDemoStore((s) => s.auditLog);

  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-hairline bg-surface/80">
      <header className="flex items-center gap-2 border-b border-hairline/70 px-4 py-3">
        <ScrollText className="h-3.5 w-3.5 text-ink-faint" />
        <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">
          Immutable audit trail
        </h2>
        <span className="ml-auto font-mono text-[10px] text-ink-faint">{entries.length}</span>
      </header>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-3 py-2">
        {entries.length === 0 ? (
          <p className="px-1 py-3 text-[11px] leading-relaxed text-ink-faint">
            No governance events recorded yet. Advance a phase or sign a Mandate to start the trail.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {entries.map((entry) => {
              const t = TONE[entry.tone];
              return (
                <li key={entry.id} className="flex gap-2 rounded px-1 py-1">
                  <span className={cx('mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full', t.dot)} aria-hidden />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-ink-faint">
                      <span>{new Date(entry.timestamp).toLocaleTimeString('en-GB')}</span>
                      <span>·</span>
                      <span className={t.text}>{entry.phase}</span>
                      <span>·</span>
                      <span className="truncate">{entry.actor}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{entry.message}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
