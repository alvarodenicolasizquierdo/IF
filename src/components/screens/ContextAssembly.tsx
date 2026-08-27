import { useState } from 'react';
import {
  AlertTriangle,
  FileLock2,
  FileWarning,
  Folder,
  FolderLock,
  KeySquare,
  Radar,
  Sparkles,
} from 'lucide-react';
import { CLIENT_CONTEXT, CONTEXT_PILLS, HYGIENE_FINDINGS, SCOPE_TREE } from '@/data/scenario';
import { GLOSSARY } from '@/data/glossary';
import { useDemoStore } from '@/store/demoStore';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { InfoTip } from '@/components/ui/Tooltip';
import { cx, TONE } from '@/components/ui/tone';

const PILL_TONE = {
  ADR: 'active',
  Compliance: 'passed',
  Interface: 'active',
  Origin: 'passed',
  Domain: 'neutral',
} as const;

export function ContextAssembly() {
  const mandate = useDemoStore((s) => s.mandate);
  const updateMandate = useDemoStore((s) => s.updateMandate);
  const signMandate = useDemoStore((s) => s.signMandate);
  const dataRemediated = useDemoStore((s) => s.dataRemediated);
  const openAvengaIntelligence = useDemoStore((s) => s.openAvengaIntelligence);
  const [probeRun, setProbeRun] = useState(false);

  const signed = mandate.status === 'ACTIVE' || mandate.status === 'DISCHARGED';
  const blockedByHygiene = probeRun && !dataRemediated;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-ink-faint">
          Discover → Decide
        </p>
        <h1 className="mt-1 font-display text-[30px] leading-tight tracking-tight text-ink">Context Assembly & the Mandate</h1>
        <p className="mt-1 text-[15px] text-ink-muted">
          {CLIENT_CONTEXT.requirement} · Jira {CLIENT_CONTEXT.workItem} · {CLIENT_CONTEXT.adr}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* -------------------- Hot-path memory context -------------------- */}
        <Panel
          eyebrow="Layer 3 · Context Registry"
          title="Hot-path memory context"
          titleTip={GLOSSARY.contextFreshness}
          action={<StatusBadge label="Top-k semantic · synchronous" tone="active" />}
        >
          <ul className="flex flex-wrap gap-2">
            {CONTEXT_PILLS.map((pill) => {
              const stale = pill.freshness < 80 || !pill.classified;
              const tone = stale ? 'violation' : (PILL_TONE[pill.kind] as keyof typeof TONE);
              const t = TONE[tone];
              return (
                <li
                  key={pill.id}
                  className={cx(
                    'flex items-center gap-2 rounded-full border px-3 py-1.5',
                    t.border,
                    t.bg,
                  )}
                  title={`Context freshness ${pill.freshness}%`}
                >
                  <span className={cx('h-1.5 w-1.5 rounded-full', t.dot)} aria-hidden />
                  <span className={cx('text-[14px] font-medium', t.text)}>{pill.label}</span>
                  <span className="font-mono text-[13px] text-ink-faint">{pill.freshness}%</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-hairline bg-canvas/50 px-3 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-trust-hitl" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-trust-hitl" />
            </span>
            <p className="font-mono text-[13px] text-ink-muted">
              Async Context Consolidation Engine processing session transcript…
            </p>
          </div>

          {/* ---------------- The Golden Bridge ---------------- */}
          <div className="mt-5 border-t border-hairline pt-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-[15px] font-bold uppercase tracking-wider text-ink">
                <Radar className="h-3.5 w-3.5 text-trust-active-soft" />
                Context Integrity &amp; Classification Probe
                <InfoTip definition={GLOSSARY.goldenBridge} side="bottom" />
              </h3>
              {!probeRun && (
                <Button size="sm" tone="active" variant="outline" onClick={() => setProbeRun(true)}>
                  Run probe
                </Button>
              )}
            </div>

            {!probeRun && (
              <p className="mt-2 text-[14px] leading-relaxed text-ink-faint">
                Scans the Context Library and the retrieval path before a single agent token is spent.
              </p>
            )}

            {probeRun && dataRemediated && (
              <div className="mt-3 flex items-start gap-3 rounded-lg border border-trust-passed/50 bg-trust-passed/10 px-3 py-2.5">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-trust-passed" />
                <div>
                  <p className="text-[14px] font-bold uppercase tracking-wider text-trust-passed">
                    Context Library remediated
                  </p>
                  <p className="mt-0.5 text-[14px] leading-relaxed text-ink-muted">
                    Data Product Factory re-indexed the tax schema and classified the billing extract. Context
                    freshness restored to 97%. Sovereign routing override released.
                  </p>
                </div>
              </div>
            )}

            {blockedByHygiene && (
              <div className="mt-3 space-y-2.5">
                <div className="flex items-center gap-2 rounded-lg border-2 border-trust-hitl/60 bg-trust-hitl/10 px-3 py-2 shadow-glow-hitl">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-trust-hitl-soft" />
                  <p className="text-[14px] font-bold uppercase tracking-wider text-trust-hitl-soft">
                    Data hygiene warning — agent initialisation held
                  </p>
                </div>

                {HYGIENE_FINDINGS.map((finding) => {
                  const t = TONE[finding.severity === 'critical' ? 'violation' : 'hitl'];
                  const Icon = finding.severity === 'critical' ? FileWarning : FileLock2;
                  return (
                    <div
                      key={finding.id}
                      className={cx('rounded-lg border px-3 py-2.5', t.border, t.bg)}
                    >
                      <div className="flex items-start gap-2.5">
                        <Icon className={cx('mt-0.5 h-3.5 w-3.5 shrink-0', t.text)} />
                        <div className="min-w-0">
                          <p className={cx('font-mono text-[14px] font-bold', t.text)}>{finding.artefact}</p>
                          <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">{finding.detail}</p>
                          <p className="mt-1.5 font-mono text-[13px] leading-relaxed text-ink-faint">
                            ↳ {finding.automaticClamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Button tone="hitl" size="sm" className="w-full" onClick={openAvengaIntelligence}>
                  Fix with Avenga Intelligence
                </Button>
              </div>
            )}
          </div>
        </Panel>

        {/* -------------------- The cryptographic Mandate -------------------- */}
        <Panel
          eyebrow="Layer 2 · Mandate Guardrail"
          title="The cryptographic Mandate"
          titleTip={GLOSSARY.mandate}
          action={
            <StatusBadge
              label={mandate.status}
              tone={
                mandate.status === 'VOIDED'
                  ? 'violation'
                  : mandate.status === 'UNSIGNED'
                    ? 'neutral'
                    : 'passed'
              }
              pulse={mandate.status === 'ACTIVE'}
            />
          }
        >
          <div className="rounded-lg border border-hairline bg-canvas/60 px-3 py-2.5">
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-faint">Mandate token</p>
            <p className="mt-0.5 font-mono text-[16px] font-bold text-trust-active-soft">{mandate.token}</p>
          </div>

          <div className="mt-4 space-y-4">
            <SliderRow
              label="Max iterations"
              value={mandate.maxIterations}
              min={1}
              max={20}
              step={1}
              display={String(mandate.maxIterations)}
              disabled={signed}
              onChange={(v) => updateMandate({ maxIterations: v })}
            />
            <SliderRow
              label="Token budget"
              tip={GLOSSARY.tokenBudget}
              value={mandate.budgetTokens}
              min={10_000}
              max={200_000}
              step={5_000}
              display={mandate.budgetTokens.toLocaleString()}
              disabled={signed}
              onChange={(v) => updateMandate({ budgetTokens: v })}
            />
            <SliderRow
              label="Expiry window"
              value={mandate.expiryMinutes}
              min={5}
              max={120}
              step={5}
              display={`${mandate.expiryMinutes} min`}
              disabled={signed}
              onChange={(v) => updateMandate({ expiryMinutes: v })}
            />
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.14em] text-ink-faint">
              Repository scope allowlist — file-system firewall
            </p>
            <ul className="space-y-0.5 rounded-lg border border-hairline bg-canvas/60 p-2">
              {SCOPE_TREE.map((node) => {
                const depth = node.path.split('/').filter(Boolean).length - 1;
                const Icon = node.allowed
                  ? node.kind === 'dir'
                    ? Folder
                    : FileLock2
                  : FolderLock;
                return (
                  <li
                    key={node.path}
                    className="flex items-center gap-2 rounded px-1.5 py-1"
                    style={{ paddingLeft: `${6 + depth * 12}px` }}
                  >
                    <Icon
                      className={cx(
                        'h-3.5 w-3.5 shrink-0',
                        node.allowed ? 'text-trust-passed' : 'text-ink-faint',
                      )}
                    />
                    <span
                      className={cx(
                        'truncate font-mono text-[14px]',
                        node.allowed ? 'text-trust-passed' : 'text-ink-faint line-through',
                      )}
                    >
                      {node.path.split('/').filter(Boolean).slice(-1)[0]}
                      {node.kind === 'dir' ? '/' : ''}
                    </span>
                    {node.note && (
                      <span className="ml-auto shrink-0 font-mono text-[12px] uppercase tracking-wider text-ink-faint">
                        {node.note}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {mandate.status === 'VOIDED' && mandate.voidReason && (
            <p className="mt-4 rounded-lg border border-trust-violation/50 bg-trust-violation/10 px-3 py-2 text-[14px] leading-relaxed text-trust-violation-soft">
              Mandate voided — {mandate.voidReason}
            </p>
          )}

          <Button
            tone="active"
            size="lg"
            className="mt-5 w-full"
            disabled={signed || blockedByHygiene}
            onClick={signMandate}
            icon={<KeySquare className="h-4 w-4" />}
          >
            {signed
              ? 'Mandate signed & agent initialised'
              : blockedByHygiene
                ? 'Blocked — remediate context first'
                : 'Sign Mandate & initialise agent'}
          </Button>
          {blockedByHygiene && (
            <p className="mt-2 text-center text-[13px] text-ink-faint">
              The control plane will not issue a Mandate against an unclassified context library.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}

interface SliderRowProps {
  label: string;
  tip?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

function SliderRow({ label, tip, value, min, max, step, display, disabled, onChange }: SliderRowProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.14em] text-ink-faint">
          {label}
          {tip && <InfoTip definition={tip} side="bottom" />}
        </label>
        <span className="font-mono text-[14px] font-bold text-ink">{display}</span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cx(
          'h-1.5 w-full cursor-pointer appearance-none rounded-full bg-hairline accent-trust-active',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      />
    </div>
  );
}
