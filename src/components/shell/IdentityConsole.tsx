import { Fingerprint, ShieldCheck } from 'lucide-react';
import { GLOSSARY } from '@/data/glossary';
import { selectPersona, useDemoStore } from '@/store/demoStore';
import { InfoTip, Tooltip } from '@/components/ui/Tooltip';
import { cx, TONE } from '@/components/ui/tone';

/**
 * Top-right console: routed model tier plus the active RBAC persona.
 * Separation of duties is the visible proof for DORA and EU AI Act Article 14.
 */
export function IdentityConsole() {
  const persona = useDemoStore(selectPersona);
  const tone = TONE[persona.tone];

  return (
    <div className="flex items-stretch divide-x divide-hairline/70 rounded-lg border border-hairline bg-canvas/70">
      <div className="flex items-center gap-2.5 px-3 py-1.5">
        <Fingerprint className={cx('h-4 w-4 shrink-0', tone.text)} />
        <div>
          <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-ink-faint">
            Persona
            <InfoTip definition={GLOSSARY.rbacPersona} side="bottom" />
          </p>
          <p data-testid="active-persona" className={cx('font-mono text-[14px] font-bold leading-tight', tone.text)}>
            {persona.name}
          </p>
        </div>
      </div>

      <Tooltip content={`${persona.accessLevel} — ${GLOSSARY.oidc}`} side="bottom" wide>
        <span className="flex h-full cursor-help items-center gap-2 px-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-trust-passed" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-trust-passed" />
          </span>
          <ShieldCheck className="h-4 w-4 text-trust-passed" />
          <span className="font-mono text-[12px] font-bold text-trust-passed">OIDC</span>
        </span>
      </Tooltip>
    </div>
  );
}
