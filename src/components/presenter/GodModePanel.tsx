import { useEffect } from 'react';
import { Crown, Download, Scale, ServerCog, X, Zap } from 'lucide-react';
import { PHASES } from '@/data/scenario';
import { COMPETITOR_EXPLOITS, EXPLOIT_ORDER } from '@/data/scenario';
import { PERSONA_ORDER, PERSONAS, TRACK_ORDER, TRACKS } from '@/data/tracks';
import { getModel } from '@/data/models';
import { useDemoStore } from '@/store/demoStore';
import { cx, TONE } from '@/components/ui/tone';

/**
 * The Presenter "God Mode" panel (PRD v5 §6.9).
 * Toggled with the backtick key so it stays invisible to the client during
 * normal delivery, and gives the pre-sales engineer absolute authority over
 * pace, identity and which competitor claim gets destroyed next.
 */
export function GodModePanel() {
  const open = useDemoStore((s) => s.presenterMode);
  const toggle = useDemoStore((s) => s.togglePresenterMode);
  const setPresenterMode = useDemoStore((s) => s.setPresenterMode);

  const activePhase = useDemoStore((s) => s.activePhase);
  const activeTrack = useDemoStore((s) => s.activeTrack);
  const activePersona = useDemoStore((s) => s.activePersona);
  const sovereign = useDemoStore((s) => getModel(s.activeModelId).hosting === 'sovereign');

  const setPhase = useDemoStore((s) => s.setPhase);
  const setTrack = useDemoStore((s) => s.setTrack);
  const setPersona = useDemoStore((s) => s.setPersona);
  const openRegulatory = useDemoStore((s) => s.openRegulatoryOverlay);
  const injectDrift = useDemoStore((s) => s.injectDrift);
  const swapModel = useDemoStore((s) => s.swapToSovereignModel);
  const triggerExploit = useDemoStore((s) => s.triggerExploit);

  // Backtick toggles the panel from anywhere, except while typing in a field.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '`' && event.code !== 'Backquote') return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.isContentEditable) return;
      event.preventDefault();
      toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setPresenterMode(true)}
        aria-label="Open presenter God Mode panel"
        title="Presenter God Mode — press ` to toggle"
        className="fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-surface/80 text-ink-faint shadow-panel backdrop-blur transition hover:border-trust-active/50 hover:text-trust-active-soft"
      >
        <Crown className="h-4 w-4" />
      </button>
    );
  }

  return (
    <aside
      aria-label="Presenter God Mode panel"
      className="fixed bottom-5 right-5 z-50 flex max-h-[calc(100vh-2.5rem)] w-[340px] animate-slide-in-up flex-col overflow-hidden rounded-xl border-2 border-trust-active/60 bg-surface/95 shadow-panel shadow-glow-active backdrop-blur-md"
    >
      <header className="flex shrink-0 items-center justify-between bg-trust-active px-4 py-2.5">
        <span className="flex items-center gap-2 text-[14px] font-bold uppercase tracking-[0.14em] text-white">
          <Crown className="h-3.5 w-3.5" />
          Presenter God Mode
        </span>
        <button
          type="button"
          onClick={() => setPresenterMode(false)}
          aria-label="Collapse panel"
          className="rounded p-0.5 text-white/80 transition hover:bg-white/15 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </header>

      <div className="scrollbar-thin min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <Group label="Jump to phase">
          <div className="grid grid-cols-5 gap-1">
            {PHASES.map((phase) => (
              <GodButton key={phase} on={activePhase === phase} onClick={() => setPhase(phase)}>
                {phase.slice(0, 4)}
              </GodButton>
            ))}
          </div>
        </Group>

        <Group label="Force engagement track">
          <div className="grid grid-cols-3 gap-1">
            {TRACK_ORDER.map((id) => (
              <GodButton key={id} on={activeTrack === id} onClick={() => setTrack(id)}>
                {TRACKS[id].shortLabel.replace('Track ', 'T')}
              </GodButton>
            ))}
          </div>
        </Group>

        <Group label="Force RBAC persona">
          <div className="flex flex-col gap-1">
            {PERSONA_ORDER.map((id) => {
              const persona = PERSONAS[id];
              const t = TONE[persona.tone];
              const on = activePersona === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPersona(id)}
                  className={cx(
                    'flex items-center justify-between rounded border px-2.5 py-1.5 text-left transition',
                    on ? cx(t.border, t.bg) : 'border-transparent bg-canvas/60 hover:bg-card/60',
                  )}
                >
                  <span className={cx('font-mono text-[13px] font-bold', on ? t.text : 'text-ink-muted')}>
                    {persona.name}
                  </span>
                  <span className="font-mono text-[12px] text-ink-faint">{persona.trackContext}</span>
                </button>
              );
            })}
          </div>
        </Group>

        <Group label="Instant proofs">
          <div className="grid grid-cols-1 gap-1">
            <WideButton tone="violation" icon={<Scale className="h-3.5 w-3.5" />} onClick={openRegulatory}>
              Regulatory exposure assessment
            </WideButton>
            <WideButton tone="hitl" icon={<Zap className="h-3.5 w-3.5" />} onClick={injectDrift}>
              Inject code drift
            </WideButton>
            <WideButton tone="passed" icon={<ServerCog className="h-3.5 w-3.5" />} onClick={swapModel}>
              {sovereign ? 'Restore Bedrock routing' : 'Swap to sovereign Llama tier'}
            </WideButton>
          </div>
        </Group>

        <Group label="Demolition matrix">
          <div className="grid grid-cols-2 gap-1">
            {EXPLOIT_ORDER.map((id) => {
              const exploit = COMPETITOR_EXPLOITS[id];
              const t = TONE[exploit.tone];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => triggerExploit(id)}
                  title={exploit.trap}
                  className={cx(
                    'rounded border px-2 py-1.5 text-[12px] font-bold uppercase tracking-wider transition',
                    t.border,
                    t.bg,
                    t.text,
                    t.hoverBg,
                    id === 'wonderful' && 'col-span-2',
                  )}
                >
                  {exploit.vendor.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </Group>

        {/*
          * Lives here rather than in the shell: taking a copy offline is a
          * presenter errand, and the header is what a client is looking at.
          */}
        <Group label="Take it offline">
          <a
            href="./download.html"
            className="flex items-center justify-center gap-2 rounded border border-hairline bg-canvas/60 px-2.5 py-2 text-[13px] font-bold uppercase tracking-wider text-ink-muted transition hover:border-trust-active/50 hover:text-trust-active-soft"
          >
            <Download className="h-3.5 w-3.5" />
            Download single file
          </a>
        </Group>

        <p className="text-center font-mono text-[12px] text-ink-faint">
          Press <kbd className="rounded border border-hairline px-1 text-ink-muted">`</kbd> to collapse
        </p>
      </div>
    </aside>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.16em] text-ink-faint">{label}</p>
      {children}
    </div>
  );
}

function GodButton({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded px-1 py-1.5 font-mono text-[12px] font-bold uppercase transition',
        on
          ? 'bg-trust-active/25 text-trust-active-soft'
          : 'bg-canvas/60 text-ink-faint hover:bg-card/70 hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}

function WideButton({
  tone,
  icon,
  onClick,
  children,
}: {
  tone: 'violation' | 'hitl' | 'passed';
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const t = TONE[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'flex items-center gap-2 rounded border px-2.5 py-2 text-[13px] font-bold uppercase tracking-wider transition',
        t.border,
        t.bg,
        t.text,
        t.hoverBg,
      )}
    >
      {icon}
      {children}
    </button>
  );
}
