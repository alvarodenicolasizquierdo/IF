import { Cpu, Fingerprint, ShieldCheck } from 'lucide-react';
import { selectModelRouting, selectPersona, useDemoStore } from '@/store/demoStore';
import { cx, TONE } from '@/components/ui/tone';

/**
 * Top-right console: routed model tier plus the active RBAC persona.
 * Separation of duties is the visible proof for DORA and EU AI Act Article 14.
 */
export function IdentityConsole() {
  const persona = useDemoStore(selectPersona);
  const routing = useDemoStore(selectModelRouting);
  const sovereign = useDemoStore((s) => s.modelRoutingOverride !== null);
  const tone = TONE[persona.tone];

  return (
    <div className="flex items-stretch divide-x divide-hairline/70 rounded-lg border border-hairline bg-canvas/70">
      <div className="flex min-w-0 items-center gap-2.5 px-4 py-2">
        <Cpu className={cx('h-3.5 w-3.5 shrink-0', sovereign ? 'text-trust-passed' : 'text-trust-active-soft')} />
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-faint">Model routing</p>
          <p
            className={cx(
              'truncate font-mono text-[11px] font-bold',
              sovereign ? 'text-trust-passed' : 'text-trust-active-soft',
            )}
            title={routing}
          >
            {routing}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-4 py-2">
        <Fingerprint className={cx('h-3.5 w-3.5 shrink-0', tone.text)} />
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-faint">Active RBAC persona</p>
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
        <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-trust-passed">
          <ShieldCheck className="h-3 w-3" />
          OIDC VERIFIED
        </span>
      </div>
    </div>
  );
}
