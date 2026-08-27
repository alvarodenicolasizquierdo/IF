import { useEffect } from 'react';
import { AlertTriangle, Ban, CheckCircle2, Fingerprint, ShieldCheck, TriangleAlert } from 'lucide-react';
import { BLAST_RADIUS, CLIENT_CONTEXT, GOVERNED_CODE, LEGACY_CODE } from '@/data/scenario';
import { GLOSSARY } from '@/data/glossary';
import { selectPersona, useDemoStore } from '@/store/demoStore';
import { Button } from '@/components/ui/Button';
import { CodeDiff } from '@/components/ui/CodeDiff';
import { InfoTip } from '@/components/ui/Tooltip';
import { cx, TONE } from '@/components/ui/tone';

const TONE_ICON = {
  passed: CheckCircle2,
  hitl: TriangleAlert,
  violation: AlertTriangle,
} as const;

/**
 * Screen 4 — the aviation-style checkpoint. Non-bypassable: there is no
 * dismiss affordance, no escape key, no backdrop click. A named human either
 * signs or rejects.
 */
export function HitlGate() {
  const open = useDemoStore((s) => s.hitlGateOpen);
  const persona = useDemoStore(selectPersona);
  const evidencePack = useDemoStore((s) => s.evidencePack);
  const mandate = useDemoStore((s) => s.mandate);
  const approveGate = useDemoStore((s) => s.approveGate);
  const rejectGate = useDemoStore((s) => s.rejectGate);

  // The gate owns the viewport while it is up.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hitl-gate-title"
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-canvas/85 p-6 backdrop-blur-md"
    >
      <div className="my-auto w-full max-w-6xl animate-scale-in overflow-hidden rounded-2xl border border-hairline bg-surface shadow-panel">
        {/* Thick Amber Gold top border — the HITL signature of the spectrum */}
        <div className="h-1 w-full bg-trust-hitl shadow-glow-hitl" aria-hidden />

        <header className="flex items-start gap-3 border-b border-hairline px-7 py-5">
          <TriangleAlert className="mt-0.5 h-6 w-6 shrink-0 text-trust-hitl-soft" strokeWidth={2.2} />
          <div>
            <h2
              id="hitl-gate-title"
              className="flex items-center gap-2 text-base font-bold uppercase tracking-wider text-trust-hitl-soft"
            >
              Critical governance gate: manual authorisation required
              <InfoTip definition={GLOSSARY.hitl} side="bottom" />
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              Agent attempts a non-reversible action — production merge of branch{' '}
              <code className="font-mono text-ink">feature/dynamic-tax-rates</code> into{' '}
              {CLIENT_CONTEXT.repository}.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 px-7 py-6 lg:grid-cols-5">
          {/* Blast radius */}
          <section className="lg:col-span-2">
            <h3 className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Blast radius analysis · pre-analysed by the security sub-agent
              <InfoTip definition={GLOSSARY.blastRadius} side="bottom" />
            </h3>
            <ul className="space-y-2">
              {BLAST_RADIUS.map((item) => {
                const t = TONE[item.tone];
                const Icon = TONE_ICON[item.tone];
                return (
                  <li
                    key={item.id}
                    className={cx('flex items-start gap-2.5 rounded-lg border px-3 py-2.5', t.border, t.bg)}
                  >
                    <Icon className={cx('mt-0.5 h-3.5 w-3.5 shrink-0', t.text)} />
                    <span className="text-[11px] leading-relaxed text-ink-muted">{item.label}</span>
                  </li>
                );
              })}
            </ul>

            <dl className="mt-4 space-y-2 rounded-lg border border-hairline bg-canvas/60 px-3 py-3">
              <Row label="Evidence Pack" value={evidencePack.id} />
              <Row label="Mandate" value={mandate.token} />
              <Row label="Model" value={evidencePack.selectedModel} />
              <Row label="Statement coverage" value={evidencePack.statementCoverage} />
              <Row label="Context integrity" value={evidencePack.contextIntegrityHash} />
            </dl>
          </section>

          {/* Diff under review */}
          <section className="flex min-h-[340px] flex-col lg:col-span-3">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Change under review
            </h3>
            <div className="min-h-0 flex-1">
              <CodeDiff before={LEGACY_CODE} after={GOVERNED_CODE} revealed />
            </div>
          </section>
        </div>

        {/* Signature ceremony */}
        <div className="border-t border-hairline bg-canvas/40 px-7 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={cx(
                  'flex h-11 w-11 items-center justify-center rounded-full border-2',
                  persona.canSignEvidencePack
                    ? 'border-trust-passed/60 bg-trust-passed/10'
                    : 'border-trust-violation/60 bg-trust-violation/10',
                )}
              >
                <Fingerprint
                  className={cx(
                    'h-5 w-5',
                    persona.canSignEvidencePack ? 'text-trust-passed' : 'text-trust-violation-soft',
                  )}
                />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">
                  Signing identity · OIDC verified
                </p>
                <p
                  className={cx(
                    'font-mono text-xs font-bold',
                    persona.canSignEvidencePack ? 'text-trust-passed' : 'text-trust-violation-soft',
                  )}
                >
                  {persona.name} — {persona.accessLevel}
                </p>
              </div>
            </div>

            {!persona.canSignEvidencePack && (
              <p className="flex items-center gap-1.5 rounded-lg border border-trust-violation/50 bg-trust-violation/10 px-3 py-2 text-[11px] font-semibold text-trust-violation-soft">
                <Ban className="h-3.5 w-3.5" />
                This persona holds no production-merge signing privilege.
              </p>
            )}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button tone="violation" variant="outline" size="lg" onClick={rejectGate} icon={<Ban className="h-4 w-4" />}>
              Reject & void Mandate
            </Button>
            <Button
              tone="passed"
              size="lg"
              onClick={approveGate}
              disabled={!persona.canSignEvidencePack}
              icon={<ShieldCheck className="h-4 w-4" />}
            >
              Approve & cryptographically sign
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">{label}</dt>
      <dd className="truncate font-mono text-[11px] text-ink-muted" title={value}>
        {value}
      </dd>
    </div>
  );
}
