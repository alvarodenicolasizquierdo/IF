import { CheckCircle2, Circle, GitPullRequestArrow, PackageSearch, Radio } from 'lucide-react';
import { FCEE_STEPS } from '@/data/scenario';
import { GLOSSARY } from '@/data/glossary';
import { useDemoStore } from '@/store/demoStore';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cx } from '@/components/ui/tone';

export function ContinuousEvolution() {
  const stepIndex = useDemoStore((s) => s.fceeStepIndex);
  const advanceFcee = useDemoStore((s) => s.advanceFcee);
  const remediationPrRaised = useDemoStore((s) => s.remediationPrRaised);
  const raiseRemediationPr = useDemoStore((s) => s.raiseRemediationPr);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-ink-faint">
            Improve · post-deployment
          </p>
          <h1 className="mt-1 font-display text-[30px] leading-tight tracking-tight text-ink">Continuous Evolution Engine</h1>
          <p className="mt-1 text-[15px] text-ink-muted">
            What happens after the merge — the loop that stops post-deployment software decay.
          </p>
        </div>
        <StatusBadge label="FCEE loop active" tone="active" pulse />
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* ---------------- The 7-step FCEE stepper ---------------- */}
        <Panel
          className="lg:col-span-3"
          eyebrow="The 7-step post-deployment loop"
          title="Continuous Evolution stepper"
          titleTip={GLOSSARY.fcee}
          action={
            <Button size="sm" tone="active" variant="outline" onClick={advanceFcee} disabled={stepIndex >= 6}>
              {stepIndex >= 6 ? 'Loop complete' : 'Advance loop'}
            </Button>
          }
        >
          <ol className="relative">
            {FCEE_STEPS.map((step, index) => {
              const done = index < stepIndex;
              const active = index === stepIndex;
              const last = index === FCEE_STEPS.length - 1;

              return (
                <li key={step.id} className="relative flex gap-4 pb-5 last:pb-0">
                  {!last && (
                    <span
                      aria-hidden
                      className={cx(
                        'absolute left-[11px] top-6 h-[calc(100%-12px)] w-px',
                        done ? 'bg-trust-passed/50' : 'bg-hairline',
                      )}
                    />
                  )}
                  <span className="relative z-10 mt-0.5 shrink-0">
                    {done ? (
                      <CheckCircle2 className="h-[22px] w-[22px] text-trust-passed" strokeWidth={2.2} />
                    ) : active ? (
                      <span className="flex h-[22px] w-[22px] items-center justify-center">
                        <span className="absolute h-[22px] w-[22px] animate-pulse-ring rounded-full bg-trust-active/60" />
                        <Radio className="relative h-[22px] w-[22px] text-trust-active-soft" strokeWidth={2.2} />
                      </span>
                    ) : (
                      <Circle className="h-[22px] w-[22px] text-ink-faint/60" strokeWidth={2} />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={cx(
                          'text-[15px] font-bold uppercase tracking-wider',
                          done ? 'text-trust-passed' : active ? 'text-trust-active-soft' : 'text-ink-faint',
                        )}
                      >
                        {step.name}
                      </h3>
                      {active && <StatusBadge label="Active" tone="active" />}
                    </div>
                    <p
                      className={cx(
                        'mt-1 text-[14px] leading-relaxed',
                        index <= stepIndex ? 'text-ink-muted' : 'text-ink-faint/70',
                      )}
                    >
                      {step.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Panel>

        {/* ---------------- Supply chain drift ---------------- */}
        <div className="space-y-5 lg:col-span-2">
          <Panel
            eyebrow="Supply chain drift detection"
            title="Dependency audit vulnerability"
            action={
              <StatusBadge
                label={remediationPrRaised ? 'PR raised' : 'Action required'}
                tone={remediationPrRaised ? 'passed' : 'hitl'}
                pulse={!remediationPrRaised}
              />
            }
          >
            <div
              className={cx(
                'rounded-lg border px-3 py-3',
                remediationPrRaised
                  ? 'border-trust-passed/50 bg-trust-passed/10'
                  : 'border-trust-hitl/50 bg-trust-hitl/10',
              )}
            >
              <div className="flex items-start gap-2.5">
                <PackageSearch
                  className={cx(
                    'mt-0.5 h-4 w-4 shrink-0',
                    remediationPrRaised ? 'text-trust-passed' : 'text-trust-hitl-soft',
                  )}
                />
                <div>
                  <p
                    className={cx(
                      'text-[14px] font-bold uppercase tracking-wider',
                      remediationPrRaised ? 'text-trust-passed' : 'text-trust-hitl-soft',
                    )}
                  >
                    API version deprecated
                  </p>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">
                    FCEE detected an out-of-date tax API dependency version in{' '}
                    <code className="font-mono text-ink">billing-gateway-v2</code>. Security risk high.
                  </p>
                </div>
              </div>
            </div>

            <dl className="mt-4 space-y-2 border-t border-hairline pt-3">
              <Row label="Repository" value="core-billing-gateway" />
              <Row label="Detected by" value="Supply chain probe · DORA Art. 8–9" />
              <Row label="Impact" value="Security risk high · un-scanned transitive" />
            </dl>

            <Button
              tone="active"
              className="mt-4 w-full"
              onClick={raiseRemediationPr}
              disabled={remediationPrRaised}
              icon={<GitPullRequestArrow className="h-4 w-4" />}
            >
              {remediationPrRaised ? 'Remediation PR open' : 'Create remediation PR & test'}
            </Button>
          </Panel>

          {remediationPrRaised && (
            <Panel eyebrow="Fresh mandate" title="Remediation under the same gates" className="animate-scale-in">
              <p className="text-[14px] leading-relaxed text-ink-muted">
                The remediation PR is bound to a new, temporally bounded Mandate and must clear the same
                non-bypassable OPA gate pack and the same aviation-style human checkpoint. Automation never
                earns itself a shortcut around the control plane.
              </p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-faint">{label}</dt>
      <dd className="truncate font-mono text-[14px] text-ink-muted">{value}</dd>
    </div>
  );
}
