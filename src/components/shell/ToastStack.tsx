import { AlertOctagon, CheckCircle2, Info, ShieldAlert, X } from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { cx, TONE } from '@/components/ui/tone';

const ICON = {
  active: Info,
  passed: CheckCircle2,
  hitl: ShieldAlert,
  violation: AlertOctagon,
} as const;

/**
 * MCP Gateway intercepts and control-plane events.
 *
 * Top right, not bottom centre. Every screen's primary action is now pinned to
 * the bottom of its panel, and a toast centred down there landed squarely on
 * the button the presenter had to click next — each tool-call fired a notice
 * that covered the control advancing it.
 */
export function ToastStack() {
  const toasts = useDemoStore((s) => s.toasts);
  const dismissToast = useDemoStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-5 top-[76px] z-[60] flex w-full max-w-xl flex-col items-end gap-2 pl-4"
    >
      {toasts.map((toast) => {
        const t = TONE[toast.tone];
        const Icon = ICON[toast.tone];
        return (
          <div
            key={toast.id}
            className={cx(
              'pointer-events-auto flex w-full animate-slide-in-down items-start gap-3 rounded-lg border bg-surface/95 px-4 py-3 shadow-panel backdrop-blur',
              t.border,
              t.glow,
            )}
          >
            <Icon className={cx('mt-0.5 h-4 w-4 shrink-0', t.text)} />
            <div className="min-w-0 flex-1">
              <p className={cx('text-[15px] font-bold uppercase tracking-wider', t.text)}>{toast.title}</p>
              <p className="mt-0.5 font-mono text-[14px] leading-relaxed text-ink-muted">{toast.detail}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded p-0.5 text-ink-faint transition hover:bg-card hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
