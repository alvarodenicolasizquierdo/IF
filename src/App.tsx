import avengaWordmark from '@/assets/avenga-wordmark.png';
import { GLOSSARY } from '@/data/glossary';
import { CLIENT_CONTEXT, PHASE_BLURB } from '@/data/scenario';
import { AUTO_PLAY_LENGTH, useDemoStore } from '@/store/demoStore';

import { PhaseBanner } from '@/components/shell/PhaseBanner';
import { IdentityConsole } from '@/components/shell/IdentityConsole';
import { ModelSwitcher } from '@/components/shell/ModelSwitcher';
import { TrackSelector } from '@/components/shell/TrackSelector';
import { ScreenRail } from '@/components/shell/ScreenRail';
import { ActionTray } from '@/components/shell/ActionTray';
import { ToastStack } from '@/components/shell/ToastStack';
import { HelpCircle } from 'lucide-react';
import { InfoTip, Tooltip } from '@/components/ui/Tooltip';
import { AuditLog } from '@/components/shell/AuditLog';

import { ExecutiveDashboard } from '@/components/screens/ExecutiveDashboard';
import { ContextAssembly } from '@/components/screens/ContextAssembly';
import { GroundedExecution } from '@/components/screens/GroundedExecution';
import { ContinuousEvolution } from '@/components/screens/ContinuousEvolution';

import { HitlGate } from '@/components/overlays/HitlGate';
import { RegulatoryOverlay } from '@/components/overlays/RegulatoryOverlay';
import { AvengaIntelligenceModal } from '@/components/overlays/AvengaIntelligenceModal';
import { ExploitBriefing } from '@/components/overlays/ExploitBriefing';
import { HelpOverlay } from '@/components/overlays/HelpOverlay';
import { ContextGraph } from '@/components/overlays/ContextGraph';
import { GodModePanel } from '@/components/presenter/GodModePanel';

export default function App() {
  const activeScreen = useDemoStore((s) => s.activeScreen);
  const activePhase = useDemoStore((s) => s.activePhase);
  const autoPlayLabel = useDemoStore((s) => s.autoPlayLabel);
  const autoPlayIndex = useDemoStore((s) => s.autoPlayIndex);

  return (
    /*
     * A fixed-height app frame, not a scrolling document. The workspace owns
     * its own scrollport, which is what lets a screen say "fill the pane" and
     * keep its primary action on screen — as a document, every panel grew to
     * fit its content and pushed the button the story turns on below the fold.
     */
    <div className="flex h-screen flex-col overflow-hidden">
      {/* ---------------- Persistent global shell ---------------- */}
      <header className="z-40 shrink-0 border-b border-hairline bg-canvas/90 backdrop-blur-md">
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
            <HelpButton />
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ---------------- Left rail ---------------- */}
        <aside className="hidden h-full w-[248px] shrink-0 flex-col gap-5 overflow-y-auto border-r border-hairline bg-surface/40 px-4 py-5 xl:flex">
          <div>
            <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.16em] text-ink-faint">Screens</p>
            <ScreenRail />
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Engagement track
              <InfoTip definition={GLOSSARY.track} side="right" />
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
        <main className="flex min-h-0 min-w-0 flex-1 flex-col px-5 py-4">
          <div className="mb-4 shrink-0 space-y-3">
            <ActionTray />
            {/*
              * One slot, two jobs. While a scripted run is going the narration
              * line becomes the run's own commentary, so the progress readout
              * costs no vertical space on a 720p share.
              */}
            {autoPlayLabel !== null ? (
              <div className="px-1">
                <p className="flex items-center gap-2 text-[14px] leading-snug text-ink">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-trust-passed" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-trust-passed" />
                  </span>
                  <span className="font-mono text-[13px] font-bold uppercase tracking-wider text-trust-passed">
                    Auto-play
                  </span>
                  <span className="text-ink-muted">— {autoPlayLabel}</span>
                </p>
                <div
                  className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-hairline"
                  role="progressbar"
                  aria-label="Scripted run progress"
                  aria-valuenow={(autoPlayIndex ?? 0) + 1}
                  aria-valuemin={1}
                  aria-valuemax={AUTO_PLAY_LENGTH}
                >
                  <div
                    className="h-full rounded-full bg-trust-passed transition-all duration-500"
                    style={{ width: `${(((autoPlayIndex ?? 0) + 1) / AUTO_PLAY_LENGTH) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="px-1 text-[14px] leading-snug text-ink-muted">
                <span className="font-mono text-[13px] font-bold uppercase tracking-wider text-trust-active-soft">
                  {activePhase}
                </span>{' '}
                — {PHASE_BLURB[activePhase]}
              </p>
            )}
          </div>

          {/*
            * The screens' scrollport. Giving it a definite height (flex-1 with
            * min-h-0) is what makes h-full mean something to a screen inside
            * it, so a split canvas can fill the pane and scroll its panes
            * rather than the page.
            */}
          <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-1">
            {activeScreen === 'dashboard' && <ExecutiveDashboard />}
            {activeScreen === 'context' && <ContextAssembly />}
            {activeScreen === 'execution' && <GroundedExecution />}
            {activeScreen === 'evolution' && <ContinuousEvolution />}
          </div>
        </main>
      </div>

      {/* ---------------- Overlays & presenter controls ---------------- */}
      <HitlGate />
      <RegulatoryOverlay />
      <AvengaIntelligenceModal />
      <ExploitBriefing />
      <HelpOverlay />
      <ContextGraph />
      <GodModePanel />
      <ToastStack />
    </div>
  );
}

/**
 * Deliberately in the header rather than tucked away. The help is where a
 * presenter finds out that God Mode exists at all, so it cannot itself be
 * hidden behind a shortcut nobody has been told about.
 */
function HelpButton() {
  const openHelp = useDemoStore((s) => s.openHelp);
  return (
    <Tooltip content="What am I looking at? Explains this screen, what a model change rewrites, and the presenter-only controls." side="bottom" wide interactiveChild>
      <button
        type="button"
        onClick={openHelp}
        aria-label="Open help"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline text-ink-faint transition hover:border-trust-active/50 hover:text-trust-active-soft"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
    </Tooltip>
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
