import { AlertTriangle, PlayCircle, RotateCcw, Scale, ShieldCheck } from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { Button } from '@/components/ui/Button';

/** The presenter's always-visible control tray. */
export function ActionTray() {
  const advancePhase = useDemoStore((s) => s.advancePhase);
  const runOpaCheck = useDemoStore((s) => s.runOpaCheck);
  const injectDrift = useDemoStore((s) => s.injectDrift);
  const openRegulatoryOverlay = useDemoStore((s) => s.openRegulatoryOverlay);
  const resetDemo = useDemoStore((s) => s.resetDemo);
  const driftDetected = useDemoStore((s) => s.driftDetected);

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
      <Button tone="active" onClick={advancePhase} icon={<PlayCircle className="h-4 w-4" />}>
        Trigger next phase
      </Button>
      <Button tone="active" variant="outline" onClick={runOpaCheck} icon={<ShieldCheck className="h-4 w-4" />}>
        OPA policy check
      </Button>
      <Button
        tone="hitl"
        onClick={injectDrift}
        disabled={driftDetected}
        icon={<AlertTriangle className="h-4 w-4" />}
      >
        {driftDetected ? 'Mandate voided' : 'Inject code drift'}
      </Button>
      <Button
        tone="violation"
        variant="outline"
        onClick={openRegulatoryOverlay}
        icon={<Scale className="h-4 w-4" />}
      >
        Enforce regulation
      </Button>
      <Button tone="neutral" variant="outline" onClick={resetDemo} icon={<RotateCcw className="h-4 w-4" />}>
        Reset simulation
      </Button>
    </div>
  );
}
