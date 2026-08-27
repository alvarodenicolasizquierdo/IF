import { useEffect } from 'react';
import { Gavel, Radar, ShieldCheck, X } from 'lucide-react';
import { CLIENT_CONTEXT, REGULATORY_FINDINGS } from '@/data/scenario';
import { useDemoStore } from '@/store/demoStore';
import { Button } from '@/components/ui/Button';
import { cx, TONE } from '@/components/ui/tone';

/**
 * Screen 6 — the Regulatory Exposure Assessment.
 * Runs a mock heuristic scan of an ungoverned pipeline against the EU AI Act,
 * DORA and GDPR, then remediates in one action by enforcing the Control Plane.
 */
export function RegulatoryOverlay() {
  const open = useDemoStore((s) => s.regulatoryOverlayOpen);
  const scanComplete = useDemoStore((s) => s.regulatoryScanComplete);
  const remediated = useDemoStore((s) => s.regulatoryRemediated);
  const completeScan = useDemoStore((s) => s.completeRegulatoryScan);
  const close = useDemoStore((s) => s.closeRegulatoryOverlay);
  const enforce = useDemoStore((s) => s.enforceControlPlane);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(completeScan, 1_900);
    return () => clearTimeout(timer);
  }, [open, completeScan]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  const failures = REGULATORY_FINDINGS.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reg-title"
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-canvas/90 p-6 backdrop-blur-md"
    >
      <div className="my-auto w-full max-w-3xl animate-scale-in overflow-hidden rounded-2xl border border-hairline bg-surface shadow-panel">
        <div
          className={cx(
            'h-1 w-full transition-colors duration-500',
            remediated ? 'bg-trust-passed shadow-glow-passed' : 'bg-trust-violation shadow-glow-violation',
          )}
          aria-hidden
        />

        <header className="flex items-start justify-between gap-4 border-b border-hairline px-7 py-5">
          <div className="flex items-start gap-3">
            <Gavel
              className={cx(
                'mt-0.5 h-6 w-6 shrink-0',
                remediated ? 'text-trust-passed' : 'text-trust-violation-soft',
              )}
              strokeWidth={2.2}
            />
            <div>
              <h2 id="reg-title" className="text-[18px] font-bold uppercase tracking-wider text-ink">
                Regulatory Exposure Assessment
              </h2>
              <p className="mt-1 font-mono text-[14px] text-ink-muted">
                Target: {CLIENT_CONTEXT.scmConnector} · scope {CLIENT_CONTEXT.repository} ·{' '}
                {CLIENT_CONTEXT.client}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close assessment"
            className="rounded p-1 text-ink-faint transition hover:bg-card hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {!scanComplete ? (
          <div className="relative overflow-hidden px-7 py-16 text-center">
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-16 animate-sweep-scan bg-gradient-to-b from-transparent via-trust-violation/25 to-transparent"
            />
            <Radar className="mx-auto h-8 w-8 animate-spin text-trust-violation-soft" style={{ animationDuration: '2.4s' }} />
            <p className="mt-4 font-mono text-[15px] font-bold uppercase tracking-[0.16em] text-trust-violation-soft">
              Scanning pipeline against EU AI Act · DORA · GDPR
            </p>
            <p className="mt-1.5 text-[14px] text-ink-faint">
              Evaluating commit provenance, agent oversight, dependency scanning and PII egress…
            </p>
          </div>
        ) : (
          <>
            <div className="px-7 py-5">
              <div
                className={cx(
                  'mb-4 flex items-center justify-between rounded-lg border px-4 py-3',
                  remediated
                    ? 'border-trust-passed/50 bg-trust-passed/10'
                    : 'border-trust-violation/50 bg-trust-violation/10',
                )}
              >
                <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-faint">
                  Aggregate audit vulnerability
                </span>
                <span
                  className={cx(
                    'font-mono text-lg font-bold tabular-nums',
                    remediated ? 'text-trust-passed' : 'text-trust-violation-soft',
                  )}
                >
                  {remediated ? '0 open' : `${failures} open`}
                </span>
              </div>

              <ul className="space-y-2.5">
                {REGULATORY_FINDINGS.map((finding) => {
                  const tone = remediated ? 'passed' : finding.verdict === 'FAILED' ? 'violation' : 'hitl';
                  const t = TONE[tone];
                  return (
                    <li
                      key={finding.id}
                      className={cx('rounded-lg border px-4 py-3 transition-colors duration-500', t.border, t.bg)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className={cx('text-[14px] font-bold uppercase tracking-wider', t.text)}>
                            {finding.regulation} — {finding.article}
                          </p>
                          <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">
                            {remediated ? finding.remediation : finding.finding}
                          </p>
                        </div>
                        <span
                          className={cx(
                            'shrink-0 rounded border px-2 py-0.5 font-mono text-[13px] font-bold uppercase tracking-wider',
                            t.border,
                            t.bg,
                            t.text,
                          )}
                        >
                          {remediated ? finding.remediatedVerdict : finding.verdict}
                        </span>
                      </div>
                      {!remediated && (
                        <p className="mt-2 font-mono text-[13px] uppercase tracking-wider text-ink-faint">
                          Audit vulnerability: {finding.auditVulnerability}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-hairline bg-canvas/40 px-7 py-4">
              <Button tone="neutral" variant="outline" onClick={close}>
                Close
              </Button>
              <Button
                tone="passed"
                onClick={enforce}
                disabled={remediated}
                icon={<ShieldCheck className="h-4 w-4" />}
              >
                {remediated ? 'Control plane enforced' : 'Enforce control plane'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
