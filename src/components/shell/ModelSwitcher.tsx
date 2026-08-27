import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Cloud, Lock, ServerCog, ShieldAlert } from 'lucide-react';
import {
  EGRESS_LABEL,
  formatUsd,
  mandateCostUsd,
  mandateGpuCostUsd,
  MODELS,
  type ModelOption,
} from '@/data/models';
import { GLOSSARY } from '@/data/glossary';
import { selectModel, useDemoStore } from '@/store/demoStore';
import { InfoTip } from '@/components/ui/Tooltip';
import { cx, TONE } from '@/components/ui/tone';

const TIER_TONE = {
  1: 'violation',
  2: 'active',
  3: 'passed',
  4: 'passed',
} as const;

/**
 * What one Mandate's budget costs on this route, however it is billed.
 * Both figures are USD; the suffix names the basis, since a self-hosted route
 * bills GPU-hours rather than metered tokens.
 */
function runCost(model: ModelOption, budget: number): string {
  const api = mandateCostUsd(model, budget);
  if (api !== null) return `${formatUsd(api)} / run`;
  const gpu = mandateGpuCostUsd(model, budget);
  return gpu !== null ? `${formatUsd(gpu)} / run · GPU-hrs` : '—';
}

/**
 * The LLM Gateway route picker.
 *
 * This is the Tool Sovereignty proof made interactive: the same governed
 * pipeline runs on a frontier cloud model or on open weights the client hosts,
 * and switching updates the Evidence Pack, the PII egress gate and the cost of
 * the run — so the tradeoff is visible rather than asserted.
 */
export function ModelSwitcher() {
  const active = useDemoStore(selectModel);
  const setModel = useDemoStore((s) => s.setModel);
  const budget = useDemoStore((s) => s.mandate.budgetTokens);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const activeTone = TONE[TIER_TONE[active.tier]];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        title="Change the routed model"
        className={cx(
          'flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition',
          open ? 'border-trust-active/60 bg-trust-active/10' : 'border-hairline bg-canvas/70 hover:border-trust-active/40',
        )}
      >
        {active.hosting === 'sovereign' ? (
          <ServerCog className={cx('h-3.5 w-3.5 shrink-0', activeTone.text)} />
        ) : (
          <Cloud className={cx('h-3.5 w-3.5 shrink-0', activeTone.text)} />
        )}
        <span className="min-w-0">
          <span className="block whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.14em] text-ink-faint">
            Model · T{active.tier}
          </span>
          <span className={cx('block truncate whitespace-nowrap font-mono text-[14px] font-bold', activeTone.text)}>
            {active.name}
          </span>
        </span>
        <ChevronDown className={cx('h-3 w-3 shrink-0 text-ink-faint transition', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-[75] mt-2 w-[440px] animate-scale-in overflow-hidden rounded-xl border border-hairline bg-surface shadow-panel backdrop-blur"
        >
          <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-faint">
                LLM Gateway · assurance tiers
              </p>
              <InfoTip definition={GLOSSARY.assuranceTier} side="bottom" />
            </div>
            <span className="font-mono text-[12px] text-ink-faint">
              cost at {budget.toLocaleString()} tok
            </span>
          </div>

          <div className="scrollbar-thin max-h-[420px] overflow-y-auto p-2">
            {MODELS.map((m) => {
              const on = m.id === active.id;
              const t = TONE[TIER_TONE[m.tier]];
              return (
                <button
                  key={m.id}
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => {
                    setModel(m.id);
                    setOpen(false);
                  }}
                  className={cx(
                    'mb-1 flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition',
                    on
                      ? cx(t.border, t.bg)
                      : 'border-transparent hover:border-hairline hover:bg-card/50',
                  )}
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                    {on ? (
                      <Check className={cx('h-3.5 w-3.5', t.text)} strokeWidth={3} />
                    ) : m.piiSafe ? (
                      <Lock className="h-3 w-3 text-ink-faint" />
                    ) : (
                      <ShieldAlert className="h-3 w-3 text-trust-violation-soft" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className={cx('truncate text-[15px] font-semibold', on ? t.text : 'text-ink')}>
                        {m.name}
                      </span>
                      <span className="shrink-0 font-mono text-[13px] tabular-nums text-ink-muted">
                        {runCost(m, budget)}
                      </span>
                    </span>

                    <span className="mt-0.5 block truncate text-[13px] text-ink-faint">
                      {m.vendor} · {m.contextWindow} context
                    </span>

                    <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className={cx(
                          'rounded border px-1.5 py-0.5 font-mono text-[12px] font-bold uppercase tracking-wider',
                          t.border,
                          t.bg,
                          t.text,
                        )}
                      >
                        T{m.tier} {m.tierLabel}
                      </span>
                      <span className="rounded border border-hairline px-1.5 py-0.5 font-mono text-[12px] text-ink-faint">
                        {EGRESS_LABEL[m.egress]}
                      </span>
                      <span
                        className={cx(
                          'rounded border px-1.5 py-0.5 font-mono text-[12px]',
                          m.weights === 'open'
                            ? 'border-trust-passed/40 text-trust-passed'
                            : 'border-hairline text-ink-faint',
                        )}
                      >
                        {m.weights === 'open' ? 'open weights' : 'proprietary'}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-hairline bg-canvas/50 px-4 py-3">
            <p className="text-[13px] leading-relaxed text-ink-muted">
              <span className={cx('font-semibold', activeTone.text)}>{active.name}</span> — {active.note}
            </p>
            <p className="mt-1.5 font-mono text-[12px] text-ink-faint">{active.dataResidency}</p>
          </div>
        </div>
      )}
    </div>
  );
}
