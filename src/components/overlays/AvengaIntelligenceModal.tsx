import { Database, Layers, ScanSearch, X } from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { Button } from '@/components/ui/Button';

const PHASES = [
  {
    icon: ScanSearch,
    name: 'Phase 1 — Assess',
    price: '€25k–€45k',
    detail:
      'Value & Readiness Diagnostic: map the tool landscape, classify data flows, and deploy a low-risk vertical slice against real context.',
  },
  {
    icon: Database,
    name: 'Phase 2 — Pave',
    price: 'Data Product Factory',
    detail:
      'Audit, classify and clean the enterprise data estate. Build the Context Library, index the vector store, and set data residency policy.',
  },
  {
    icon: Layers,
    name: 'Phase 3 — Amplify',
    price: 'Control Plane',
    detail:
      'Scale Intelligent Flow gates across the estate, compile cryptographic Evidence Packs, and hold outcome-based A-UPI commitments.',
  },
];

/**
 * The Golden Bridge. Ungoverned data is what makes agents confidently wrong —
 * this is where the delivery conversation becomes a data engineering conversation.
 */
export function AvengaIntelligenceModal() {
  const open = useDemoStore((s) => s.avengaIntelligenceOpen);
  const close = useDemoStore((s) => s.closeAvengaIntelligence);
  const remediate = useDemoStore((s) => s.remediateContextLibrary);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-bridge-title"
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-canvas/85 p-6 backdrop-blur-md"
    >
      <div className="my-auto w-full max-w-2xl animate-scale-in overflow-hidden rounded-2xl border border-hairline bg-surface shadow-panel">
        <div className="h-1 w-full bg-trust-hitl shadow-glow-hitl" aria-hidden />

        <header className="flex items-start justify-between gap-4 border-b border-hairline px-7 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              The Golden Bridge · data-to-agent governance
            </p>
            <h2 id="ai-bridge-title" className="mt-1 text-base font-bold tracking-tight text-ink">
              Avenga Intelligence
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded p-1 text-ink-faint transition hover:bg-card hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="px-7 py-5">
          <blockquote className="border-l-2 border-trust-hitl/60 pl-4 text-sm italic leading-relaxed text-ink-muted">
            AI is an amplifier of your existing data hygiene. Feed an agent unclassified, outdated context and
            it will generate technical debt at machine speed. Setting up agentic workflows is the exciting
            part — governing the data is the prerequisite.
          </blockquote>

          <ul className="mt-5 space-y-2.5">
            {PHASES.map(({ icon: Icon, name, price, detail }) => (
              <li key={name} className="flex gap-3 rounded-lg border border-hairline bg-canvas/60 px-4 py-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-trust-hitl-soft" />
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink">{name}</p>
                    <span className="shrink-0 font-mono text-[10px] text-trust-hitl-soft">{price}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-hairline bg-canvas/40 px-7 py-4">
          <Button tone="neutral" variant="outline" onClick={close}>
            Keep the warning on screen
          </Button>
          <Button tone="passed" onClick={remediate}>
            Run Data Product Factory
          </Button>
        </div>
      </div>
    </div>
  );
}
