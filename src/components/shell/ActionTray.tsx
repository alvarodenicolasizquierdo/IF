import { AlertTriangle, PlayCircle, RotateCcw, Scale, ShieldCheck, Square, Zap } from 'lucide-react';
import { GLOSSARY } from '@/data/glossary';
import { useDemoStore } from '@/store/demoStore';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';

/** The presenter's always-visible control tray. */
export function ActionTray() {
  const advancePhase = useDemoStore((s) => s.advancePhase);
  const runOpaCheck = useDemoStore((s) => s.runOpaCheck);
  const injectDrift = useDemoStore((s) => s.injectDrift);
  const openRegulatoryOverlay = useDemoStore((s) => s.openRegulatoryOverlay);
  const resetDemo = useDemoStore((s) => s.resetDemo);
  const driftDetected = useDemoStore((s) => s.driftDetected);
  const startAutoPlay = useDemoStore((s) => s.startAutoPlay);
  const stopAutoPlay = useDemoStore((s) => s.stopAutoPlay);
  const autoPlaying = useDemoStore((s) => s.autoPlayIndex !== null);

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-6">
      {/*
        * First, because it is the control a presenter reaches for before the
        * room has settled. It runs the narrative from the baseline through to
        * the human decision and then hands back — twelve correct clicks
        * under pressure become one.
        */}
      <Tooltip
        content={
          autoPlaying
            ? 'Stop the scripted run and take the controls back. Nothing is undone.'
            : 'Runs the demo from the ungoverned baseline through context, the Mandate and execution, then stops at the human decision. Resets to the baseline first.'
        }
        side="bottom"
        wide
        interactiveChild
      >
        <Button
          tone={autoPlaying ? 'hitl' : 'passed'}
          onClick={autoPlaying ? stopAutoPlay : startAutoPlay}
          icon={autoPlaying ? <Square className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
          className="w-full"
        >
          {autoPlaying ? 'Stop' : 'Run cycle'}
        </Button>
      </Tooltip>
      <Button tone="active" onClick={advancePhase} icon={<PlayCircle className="h-4 w-4" />}>
        Next phase
      </Button>
      <Tooltip content={GLOSSARY.opa} side="bottom" wide interactiveChild>
        <Button tone="active" variant="outline" onClick={runOpaCheck} icon={<ShieldCheck className="h-4 w-4" />} className="w-full">
          OPA check
        </Button>
      </Tooltip>
      <Tooltip content={GLOSSARY.codeDrift} side="bottom" wide interactiveChild>
        <Button
          tone="hitl"
          onClick={injectDrift}
          disabled={driftDetected}
          icon={<AlertTriangle className="h-4 w-4" />}
          className="w-full"
        >
          {driftDetected ? 'Voided' : 'Inject drift'}
        </Button>
      </Tooltip>
      <Tooltip content={GLOSSARY.auditVulnerability} side="bottom" wide interactiveChild>
        <Button
          tone="violation"
          variant="outline"
          onClick={openRegulatoryOverlay}
          icon={<Scale className="h-4 w-4" />}
          className="w-full"
        >
          Regulation
        </Button>
      </Tooltip>
      <Button tone="neutral" variant="outline" onClick={resetDemo} icon={<RotateCcw className="h-4 w-4" />}>
        Reset
      </Button>
    </div>
  );
}
