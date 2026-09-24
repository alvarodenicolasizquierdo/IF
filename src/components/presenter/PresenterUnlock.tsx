import { useEffect, useRef, useState } from 'react';
import { Crown, X } from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { Button } from '@/components/ui/Button';
import { cx } from '@/components/ui/tone';

/**
 * The password prompt in front of God Mode.
 *
 * Sized and placed where the panel itself appears, so the presenter's hand is
 * already in the right corner and the transition from prompt to panel is a
 * replacement rather than a jump.
 *
 * It says as little as possible about what it is guarding. A client who
 * stumbles into it should read "presenter controls" and lose interest, not
 * find a description of the demolition matrix sitting behind a lock.
 */
export function PresenterUnlock() {
  const open = useDemoStore((s) => s.presenterPrompt);
  const close = useDemoStore((s) => s.closePresenterPrompt);
  const submit = useDemoStore((s) => s.submitPresenterPassword);

  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // Focus on open, and clear anything typed on close, so a wrong attempt is
  // never left sitting in the box for the next person who opens it.
  useEffect(() => {
    if (!open) {
      setValue('');
      setWrong(false);
      return;
    }
    input.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  const attempt = () => {
    if (submit(value)) return;
    // No "incorrect password" alarm bell. It shakes, it clears, it waits.
    setWrong(true);
    setValue('');
    input.current?.focus();
  };

  return (
    <aside
      aria-label="Presenter controls locked"
      data-testid="presenter-unlock"
      className="fixed bottom-5 right-5 z-50 w-[340px] animate-slide-in-up overflow-hidden rounded-xl border border-hairline bg-surface/95 shadow-panel backdrop-blur-md"
    >
      <header className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
        <span className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.14em] text-ink-muted">
          <Crown className="h-3.5 w-3.5" />
          Presenter controls
        </span>
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="rounded p-0.5 text-ink-faint transition hover:bg-card hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </header>

      <form
        className="space-y-3 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          attempt();
        }}
      >
        <label className="block text-[13px] text-ink-muted" htmlFor="presenter-password">
          Password
        </label>
        <input
          ref={input}
          id="presenter-password"
          name="presenter-password"
          type="password"
          autoComplete="off"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setWrong(false);
          }}
          className={cx(
            'w-full rounded-lg border bg-canvas px-3 py-2 font-mono text-[14px] text-ink outline-none transition',
            wrong
              ? 'animate-shake border-trust-violation/70'
              : 'border-hairline focus:border-trust-active/60',
          )}
        />
        <div className="flex items-center justify-between gap-3">
          <p aria-live="polite" className="text-[12px] text-ink-faint">
            {wrong ? 'Not that one.' : 'Unlocks for this tab.'}
          </p>
          <Button type="submit" size="sm" tone="active" disabled={value.length === 0}>
            Unlock
          </Button>
        </div>
      </form>
    </aside>
  );
}
