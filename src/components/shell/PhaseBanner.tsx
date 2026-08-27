import { Check, ChevronRight } from 'lucide-react';
import { PHASES } from '@/data/scenario';
import { useDemoStore } from '@/store/demoStore';
import { cx } from '@/components/ui/tone';

/**
 * The 5-Phase Progression Banner (PRD v5 §6.2).
 * Chevron blocks: completed = emerald tick, active = Electric Indigo glow, locked = muted.
 */
export function PhaseBanner() {
  const activePhase = useDemoStore((s) => s.activePhase);
  const setPhase = useDemoStore((s) => s.setPhase);
  const activeIndex = PHASES.indexOf(activePhase);

  return (
    <nav aria-label="Lifecycle phase progression" className="flex items-stretch gap-1">
      {PHASES.map((phase, index) => {
        const isComplete = index < activeIndex;
        const isActive = index === activeIndex;
        const shape =
          index === 0 ? 'clip-chevron-first' : index === PHASES.length - 1 ? 'clip-chevron-last' : 'clip-chevron';

        return (
          <button
            key={phase}
            type="button"
            onClick={() => setPhase(phase)}
            aria-current={isActive ? 'step' : undefined}
            title={`Jump to ${phase}`}
            className={cx(
              'group relative flex h-9 items-center gap-1.5 pl-5 pr-6 text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-300',
              shape,
              isActive
                ? 'bg-trust-active/25 text-trust-active-soft shadow-glow-active'
                : isComplete
                  ? 'bg-trust-passed/12 text-trust-passed'
                  : 'bg-card/60 text-ink-faint hover:text-ink-muted',
            )}
          >
            {isComplete && <Check className="h-3 w-3" strokeWidth={3} />}
            {isActive && <ChevronRight className="h-3 w-3 animate-pulse" strokeWidth={3} />}
            {phase}
            {isActive && (
              <span className="absolute inset-x-5 bottom-0 h-px bg-trust-active-soft" aria-hidden />
            )}
          </button>
        );
      })}
    </nav>
  );
}
