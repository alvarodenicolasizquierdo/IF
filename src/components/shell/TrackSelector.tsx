import { TRACK_ORDER, TRACKS } from '@/data/tracks';
import { GLOSSARY } from '@/data/glossary';
import { useDemoStore } from '@/store/demoStore';
import { Tooltip } from '@/components/ui/Tooltip';
import { cx } from '@/components/ui/tone';

const TRACK_TONE = {
  track1: 'data-[on=true]:border-trust-violation/60 data-[on=true]:bg-trust-violation/10 data-[on=true]:text-trust-violation-soft',
  'track1.5': 'data-[on=true]:border-trust-hitl/60 data-[on=true]:bg-trust-hitl/10 data-[on=true]:text-trust-hitl-soft',
  track2: 'data-[on=true]:border-trust-active/60 data-[on=true]:bg-trust-active/15 data-[on=true]:text-trust-active-soft data-[on=true]:shadow-glow-active',
} as const;

export function TrackSelector({ compact = false }: { compact?: boolean }) {
  const activeTrack = useDemoStore((s) => s.activeTrack);
  const setTrack = useDemoStore((s) => s.setTrack);

  return (
    <Tooltip content={GLOSSARY.track} side="right" wide>
      <div className={cx('flex w-full gap-1.5', compact ? 'flex-row' : 'flex-col')}>
      {TRACK_ORDER.map((id) => {
        const track = TRACKS[id];
        const on = activeTrack === id;
        return (
          <button
            key={id}
            type="button"
            data-on={on}
            onClick={() => setTrack(id)}
            className={cx(
              'rounded-lg border border-hairline bg-card/40 px-3 py-2 text-left transition',
              'hover:border-hairline hover:bg-card/70',
              TRACK_TONE[id],
              compact ? 'flex-1' : 'w-full',
            )}
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider">{track.shortLabel}</span>
            {!compact && (
              <span className="mt-0.5 block font-mono text-[10px] text-ink-faint">
                €{track.metrics.tcoPerCfp.toLocaleString()} / CFP · {track.metrics.maturityMultiplier.toFixed(2)}×
              </span>
            )}
          </button>
        );
      })}
      </div>
    </Tooltip>
  );
}
