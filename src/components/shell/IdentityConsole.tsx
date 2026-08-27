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
      <div className="flex items-center gap-2.5 px-4 py-2">
        <Fingerprint className={cx('h-3.5 w-3.5 shrink-0', tone.text)} />
        <div>
          <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-ink-faint">
            Active RBAC persona
            <InfoTip definition={GLOSSARY.rbacPersona} side="bottom" />
          </p>
          <p data-testid="active-persona" className={cx('font-mono text-[11px] font-bold', tone.text)}>
            {persona.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-4 py-2">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-faint">Role access level</p>
          <p className="font-mono text-[11px] font-bold text-ink-muted">{persona.accessLevel}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-trust-passed" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-trust-passed" />
        </span>
        <Tooltip content={GLOSSARY.oidc} side="bottom">
          <span className="flex cursor-help items-center gap-1 font-mono text-[10px] font-bold text-trust-passed">
            <ShieldCheck className="h-3 w-3" />
            OIDC VERIFIED
          </span>
        </Tooltip>
      </div>
    </div>
  );
}
