import type { ReactNode } from 'react';
import { cx } from './tone';

interface PanelProps {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * The base enterprise surface. Audit-suite restraint: one hairline border,
 * no gradients, no decorative shadow unless a tone demands it.
 */
export function Panel({ title, eyebrow, action, children, className, bodyClassName }: PanelProps) {
  return (
    <section
      className={cx(
        'flex flex-col rounded-xl border border-hairline bg-surface/80 backdrop-blur-sm',
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-hairline/70 px-5 py-4">
          <div className="min-w-0">
            {eyebrow && (
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">
                {eyebrow}
              </p>
            )}
            {title && <h2 className="truncate text-sm font-semibold text-ink">{title}</h2>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cx('flex-1 p-5', bodyClassName)}>{children}</div>
    </section>
  );
}
