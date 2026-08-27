import { useEffect } from 'react';
import { Crown, HelpCircle, Route, Sparkles, X } from 'lucide-react';
import { MODEL_DIMENSIONS, PRESENTER_SECRETS, SCREEN_HELP } from '@/data/help';
import { useDemoStore, selectModel } from '@/store/demoStore';
import { cx } from '@/components/ui/tone';

/**
 * Contextual help.
 *
 * Contextual in the literal sense: the first section describes the screen the
 * presenter is actually on and the controls actually in front of them, and the
 * model section shows the live route's own values rather than an abstract
 * explanation of routing. The last section is the part a client never sees —
 * where the hidden controls are, including how to reach God Mode.
 */
export function HelpOverlay() {
  const open = useDemoStore((s) => s.helpOpen);
  const close = useDemoStore((s) => s.closeHelp);
  const activeScreen = useDemoStore((s) => s.activeScreen);
  const model = useDemoStore(selectModel);

  const toggle = useDemoStore((s) => s.toggleHelp);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        return;
      }
      if (event.key !== '?') return;
      // Never steal the key from someone typing into the Mandate controls.
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.isContentEditable) return;
      event.preventDefault();
      toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close, toggle]);

  if (!open) return null;

  const help = SCREEN_HELP[activeScreen];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-canvas/88 p-6 backdrop-blur-md"
    >
      <div className="my-auto flex max-h-[calc(100vh-3rem)] w-full max-w-4xl animate-scale-in flex-col overflow-hidden rounded-2xl border border-hairline bg-surface shadow-panel">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-hairline px-7 py-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="mt-0.5 h-6 w-6 shrink-0 text-trust-active-soft" strokeWidth={2.2} />
            <div>
              <h2 id="help-title" className="text-[18px] font-bold uppercase tracking-wider text-ink">
                What am I looking at?
              </h2>
              <p className="mt-0.5 text-[15px] leading-relaxed text-ink-muted">
                Help for this screen, what a model change actually rewrites, and the controls a client
                should not see.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close help"
            className="shrink-0 rounded p-1 text-ink-faint transition hover:bg-card hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-7 py-5">
          {/* ---------------- This screen ---------------- */}
          <Section
            icon={<Sparkles className="h-3.5 w-3.5" />}
            eyebrow="On screen now"
            title={help.title}
          >
            <p className="text-[15px] leading-relaxed text-ink-muted">{help.what}</p>

            <dl className="mt-3 space-y-2.5">
              {help.controls.map((control) => (
                <div key={control.label} className="rounded-lg border border-hairline bg-canvas/50 px-3 py-2.5">
                  <dt className="font-mono text-[13px] font-bold uppercase tracking-wider text-trust-active-soft">
                    {control.label}
                  </dt>
                  <dd className="mt-1 text-[14px] leading-relaxed text-ink-muted">{control.effect}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-3 border-l-2 border-trust-active pl-3 text-[15px] leading-relaxed text-ink-warm">
              {help.point}
            </p>
          </Section>

          {/* ---------------- The model switch ---------------- */}
          <Section
            icon={<Route className="h-3.5 w-3.5" />}
            eyebrow="Changing the model"
            title="Six things move, and the record notices all of them"
          >
            <div
              className={cx(
                'mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2.5',
                model.piiSafe
                  ? 'border-trust-passed/50 bg-trust-passed/10'
                  : 'border-trust-violation/50 bg-trust-violation/10',
              )}
            >
              <div>
                <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-faint">
                  Routed right now
                </p>
                <p className="mt-0.5 font-mono text-[15px] font-bold text-ink">{model.name}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[13px] text-ink-muted">
                  Tier {model.tier} · {model.dataResidency}
                </p>
                <p
                  className={cx(
                    'font-mono text-[13px] font-bold',
                    model.piiSafe ? 'text-trust-passed' : 'text-trust-violation-soft',
                  )}
                >
                  pii_egress_control: {model.piiSafe ? 'PASSED' : 'FAILED'}
                </p>
              </div>
            </div>

            <dl className="space-y-2.5">
              {MODEL_DIMENSIONS.map((dimension) => (
                <div key={dimension.label} className="rounded-lg border border-hairline bg-canvas/50 px-3 py-2.5">
                  <dt className="font-mono text-[13px] font-bold uppercase tracking-wider text-trust-active-soft">
                    {dimension.label}
                  </dt>
                  <dd className="mt-1 text-[14px] leading-relaxed text-ink-muted">{dimension.detail}</dd>
                </div>
              ))}
            </dl>
          </Section>

          {/* ---------------- Presenter-only ---------------- */}
          <Section
            icon={<Crown className="h-3.5 w-3.5" />}
            eyebrow="Presenter only"
            title="The controls a client never sees"
          >
            <dl className="space-y-2.5">
              {PRESENTER_SECRETS.map((secret) => (
                <div
                  key={secret.label}
                  className="rounded-lg border border-hairline bg-canvas/50 px-3 py-2.5"
                >
                  <dt className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <span className="text-[15px] font-bold text-ink">{secret.label}</span>
                    <span className="font-mono text-[13px] text-trust-hitl-soft">{secret.how}</span>
                  </dt>
                  <dd className="mt-1 text-[14px] leading-relaxed text-ink-muted">{secret.detail}</dd>
                </div>
              ))}
            </dl>
          </Section>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-hairline bg-canvas/40 px-7 py-3">
          <p className="font-mono text-[13px] text-ink-faint">
            Press <Kbd>?</Kbd> any time to reopen · <Kbd>Esc</Kbd> to close
          </p>
          <button
            type="button"
            onClick={close}
            className="rounded border border-hairline px-3 py-1.5 text-[14px] font-bold uppercase tracking-wider text-ink-muted transition hover:border-trust-active/50 hover:text-ink"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  eyebrow,
  title,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.16em] text-ink-faint">
        {icon}
        {eyebrow}
      </p>
      <h3 className="mt-1 font-display text-[22px] leading-tight tracking-tight text-ink">{title}</h3>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-hairline px-1 text-ink-muted">{children}</kbd>
  );
}
