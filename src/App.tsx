import avengaWordmark from '@/assets/avenga-wordmark.png';
import { CLIENT_CONTEXT, PHASE_BLURB } from '@/data/scenario';
import { useDemoStore } from '@/store/demoStore';

import { PhaseBanner } from '@/components/shell/PhaseBanner';
import { IdentityConsole } from '@/components/shell/IdentityConsole';
import { ModelSwitcher } from '@/components/shell/ModelSwitcher';
import { TrackSelector } from '@/components/shell/TrackSelector';
import { ScreenRail } from '@/components/shell/ScreenRail';
import { ActionTray } from '@/components/shell/ActionTray';
import { ToastStack } from '@/components/shell/ToastStack';
import { AuditLog } from '@/components/shell/AuditLog';

import { ExecutiveDashboard } from '@/components/screens/ExecutiveDashboard';
import { ContextAssembly } from '@/components/screens/ContextAssembly';
import { GroundedExecution } from '@/components/screens/GroundedExecution';
import { ContinuousEvolution } from '@/components/screens/ContinuousEvolution';

import { HitlGate } from '@/components/overlays/HitlGate';
import { RegulatoryOverlay } from '@/components/overlays/RegulatoryOverlay';
import { AvengaIntelligenceModal } from '@/components/overlays/AvengaIntelligenceModal';
import { ExploitBriefing } from '@/components/overlays/ExploitBriefing';
import { GodModePanel } from '@/components/presenter/GodModePanel';

export default function App() {
  const activeScreen = useDemoStore((s) => s.activeScreen);
  const activePhase = useDemoStore((s) => s.activePhase);

  return (
    <div className="flex min-h-screen flex-col">
      {/* ---------------- Persistent global shell ---------------- */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/90 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 px-5 py-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Avenga is the company; Intelligent Flow is the product it wraps around. */}
              <img
                src={avengaWordmark}
                alt="Avenga"
                className="h-[15px] w-auto"
              />
              <span aria-hidden className="h-6 w-px bg-hairline" />
              <p className="whitespace-nowrap font-display text-[19px] leading-none tracking-tight text-ink">
                Intelligent Flow
              </p>
            </div>
            <PhaseBanner />
          </div>
          <div className="flex items-center gap-3">
            <ModelSwitcher />
            <IdentityConsole />
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ---------------- Left rail ---------------- */}
        <aside className="sticky top-[69px] hidden h-[calc(100vh-69px)] w-[248px] shrink-0 flex-col gap-5 border-r border-hairline bg-surface/40 px-4 py-5 xl:flex">
          <div>
            <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.16em] text-ink-faint">Screens</p>
            <ScreenRail />
          </div>

          <div>
            <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Engagement track
            </p>
            <TrackSelector />
          </div>

          <div className="rounded-lg border border-hairline bg-canvas/60 px-3 py-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-ink-faint">Client context</p>
            <dl className="mt-2 space-y-1.5">
              <Meta label="Client" value={CLIENT_CONTEXT.client} />
              <Meta label="Work item" value={CLIENT_CONTEXT.workItem} />
              <Meta label="SCM" value={CLIENT_CONTEXT.scmConnector} />
            </dl>
          </div>

          <div className="min-h-0 flex-1">
            <AuditLog />
          </div>
        </aside>

        {/* ---------------- Main workspace ---------------- */}
        <main className="min-w-0 flex-1 px-5 py-4">
          <div className="mb-4 space-y-3">
            <ActionTray />
            <p className="px-1 text-[14px] leading-snug text-ink-muted">
              <span className="font-mono text-[13px] font-bold uppercase tracking-wider text-trust-active-soft">
                {activePhase}
              </span>{' '}
              — {PHASE_BLURB[activePhase]}
            </p>
          </div>

          {activeScreen === 'dashboard' && <ExecutiveDashboard />}
          {activeScreen === 'context' && <ContextAssembly />}
          {activeScreen === 'execution' && <GroundedExecution />}
          {activeScreen === 'evolution' && <ContinuousEvolution />}
        </main>
      </div>

      {/* ---------------- Overlays & presenter controls ---------------- */}
      <HitlGate />
      <RegulatoryOverlay />
      <AvengaIntelligenceModal />
      <ExploitBriefing />
      <GodModePanel />
      <ToastStack />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="shrink-0 text-[12px] uppercase tracking-wider text-ink-faint">{label}</dt>
      <dd className="truncate font-mono text-[13px] text-ink-muted" title={value}>
        {value}
      </dd>
    </div>
  );
}
