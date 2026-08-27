import { Fingerprint, PlugZap, ShieldAlert, Timer } from 'lucide-react';
import { CLIENT_CONTEXT, GOVERNED_CODE, LEGACY_CODE, MCP_INTERCEPTS } from '@/data/scenario';
import { useDemoStore } from '@/store/demoStore';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CodeDiff } from '@/components/ui/CodeDiff';
import { JsonTree } from '@/components/ui/JsonTree';
import { truncateHash } from '@/lib/sha256';
import { cx } from '@/components/ui/tone';

export function GroundedExecution() {
  const mandate = useDemoStore((s) => s.mandate);
  const evidencePack = useDemoStore((s) => s.evidencePack);
  const interceptIndex = useDemoStore((s) => s.interceptIndex);
  const codeRevealed = useDemoStore((s) => s.codeRevealed);
  const driftDetected = useDemoStore((s) => s.driftDetected);
  const advanceIntercept = useDemoStore((s) => s.advanceIntercept);
  const openHitlGate = useDemoStore((s) => s.openHitlGate);

  const budgetPct = Math.min(100, (mandate.tokensConsumed / mandate.budgetTokens) * 100);
  const interceptsDone = interceptIndex >= MCP_INTERCEPTS.length;

  const packView = {
    id: evidencePack.id,
    timestamp: evidencePack.timestamp,
    mandate_id: evidencePack.mandateId,
    selected_model: evidencePack.selectedModel,
    verification_status: evidencePack.verificationStatus,
    context_integrity_hash: evidencePack.contextIntegrityHash,
    statement_coverage: evidencePack.statementCoverage,
    token_budget: {
      limit: mandate.budgetTokens,
      consumed: mandate.tokensConsumed,
    },
    opa_gates: evidencePack.opaGates,
    ...(evidencePack.signature
      ? {
          signature: `sha256:${evidencePack.signature}`,
          signed_by: evidencePack.signedBy,
        }
      : {}),
  };

  return (
    <div className="flex h-full flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
            Build · grounded execution
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ink">
            Split-panel execution canvas
          </h1>
          <p className="mt-1 font-mono text-xs text-ink-muted">{CLIENT_CONTEXT.targetFile}</p>
        </div>
        <div className="flex items-center gap-2">
          {driftDetected && <StatusBadge label="Control plane lockout" tone="violation" pulse />}
          <StatusBadge
            label={`Mandate ${mandate.status}`}
            tone={mandate.status === 'VOIDED' ? 'violation' : mandate.status === 'UNSIGNED' ? 'neutral' : 'passed'}
          />
        </div>
      </header>

      {/* ---------------- Mandate budget bar ---------------- */}
      <div className="rounded-xl border border-hairline bg-surface/80 px-5 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-3.5 w-3.5 text-trust-active-soft" />
            <span className="font-mono text-[11px] font-bold text-trust-active-soft">{mandate.token}</span>
            <span className="font-mono text-[10px] text-ink-faint">
              scope {mandate.allowedScope}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-ink-muted">
              <Timer className="h-3 w-3" />
              expires in {mandate.expiryMinutes} min
            </span>
            <span className="font-mono text-[11px] font-bold tabular-nums text-ink">
              {mandate.tokensConsumed.toLocaleString()} / {mandate.budgetTokens.toLocaleString()} tokens
            </span>
          </div>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-hairline">
          <div
            className={cx(
              'h-full rounded-full transition-all duration-700',
              budgetPct > 85 ? 'bg-trust-violation' : budgetPct > 60 ? 'bg-trust-hitl' : 'bg-trust-active',
            )}
            style={{ width: `${budgetPct}%` }}
            role="progressbar"
            aria-valuenow={Math.round(budgetPct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Mandate token budget consumed"
          />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-2">
        {/* ---------------- Strategy & Evidence pane ---------------- */}
        <Panel
          eyebrow="Layer 2 · Evidence Pack compiler"
          title="Evidence_Pack.json — live"
          action={
            <span className="font-mono text-[10px] text-ink-faint">
              {evidencePack.signature
                ? `sig ${truncateHash(evidencePack.signature)}`
                : `hash ${evidencePack.contextIntegrityHash}`}
            </span>
          }
          className="min-h-0"
          bodyClassName="flex min-h-0 flex-col p-4"
        >
          <div className="min-h-[280px] flex-1">
            <JsonTree value={packView} />
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">
                <PlugZap className="h-3 w-3" />
                MCP Gateway interceptions
              </p>
              <span className="font-mono text-[10px] text-ink-faint">
                {interceptIndex} / {MCP_INTERCEPTS.length}
              </span>
            </div>
            <div className="flex gap-1">
              {MCP_INTERCEPTS.map((intercept, i) => (
                <span
                  key={intercept.tool}
                  title={intercept.tool}
                  className={cx(
                    'h-1 flex-1 rounded-full transition-colors duration-500',
                    i < interceptIndex ? 'bg-trust-passed' : 'bg-hairline',
                  )}
                />
              ))}
            </div>
            <Button
              tone={interceptsDone ? 'passed' : 'active'}
              variant="outline"
              size="sm"
              className="w-full"
              onClick={advanceIntercept}
              disabled={interceptsDone || driftDetected}
            >
              {driftDetected
                ? 'Execution frozen — Mandate voided'
                : interceptsDone
                  ? 'All tool-calls schema-validated'
                  : `Execute next tool-call · ${MCP_INTERCEPTS[interceptIndex].tool}`}
            </Button>
          </div>
        </Panel>

        {/* ---------------- Execution canvas ---------------- */}
        <Panel
          eyebrow="Layer 3 · Grounded repository"
          title="Code diff canvas"
          action={
            <StatusBadge
              label={codeRevealed ? 'Mutation applied' : 'Awaiting agent'}
              tone={codeRevealed ? 'passed' : 'neutral'}
            />
          }
          className="min-h-0"
          bodyClassName="flex min-h-0 flex-col p-4"
        >
          <div className="min-h-[280px] flex-1">
            <CodeDiff before={LEGACY_CODE} after={GOVERNED_CODE} revealed={codeRevealed && !driftDetected} />
          </div>

          {driftDetected ? (
            <div className="mt-4 flex items-start gap-3 rounded-lg border-2 border-trust-violation/60 bg-trust-violation/10 px-3 py-2.5 shadow-glow-violation">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-trust-violation-soft" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-trust-violation-soft">
                  Control plane lockout
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">
                  Out-of-band file system mutation detected. Mandate voided immediately and the merge path is
                  frozen until the diff matches the signed Mandate.
                </p>
              </div>
            </div>
          ) : (
            <Button
              tone="hitl"
              size="lg"
              className="mt-4 w-full"
              onClick={openHitlGate}
              disabled={!codeRevealed}
            >
              Request production merge
            </Button>
          )}
        </Panel>
      </div>
    </div>
  );
}
