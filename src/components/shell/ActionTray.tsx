import { AlertTriangle, PlayCircle, RotateCcw, Scale, ShieldCheck } from 'lucide-react';
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

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
      <Button tone="active" onClick={advancePhase} icon={<PlayCircle className="h-4 w-4" />}>
        Trigger next phase
      </Button>
      <Tooltip content={GLOSSARY.opa} side="bottom" wide>
        <Button tone="active" variant="outline" onClick={runOpaCheck} icon={<ShieldCheck className="h-4 w-4" />} className="w-full">
          OPA policy check
        </Button>
      </Tooltip>
      <Tooltip content={GLOSSARY.codeDrift} side="bottom" wide>
        <Button
          tone="hitl"
          onClick={injectDrift}
          disabled={driftDetected}
          icon={<AlertTriangle className="h-4 w-4" />}
          className="w-full"
        >
          {driftDetected ? 'Mandate voided' : 'Inject code drift'}
        </Button>
      </Tooltip>
      <Tooltip content={GLOSSARY.auditVulnerability} side="bottom" wide>
        <Button
          tone="violation"
          variant="outline"
          onClick={openRegulatoryOverlay}
          icon={<Scale className="h-4 w-4" />}
          className="w-full"
        >
          Enforce regulation
        </Button>
      </Tooltip>
      <Button tone="neutral" variant="outline" onClick={resetDemo} icon={<RotateCcw className="h-4 w-4" />}>
        Reset simulation
      </Button>
    </div>
  );
}
