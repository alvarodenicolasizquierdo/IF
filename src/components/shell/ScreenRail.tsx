import { Boxes, GitPullRequestArrow, LayoutDashboard, Repeat } from 'lucide-react';
import type { ScreenId } from '@/types';
import { useDemoStore } from '@/store/demoStore';
import { cx } from '@/components/ui/tone';

const SCREENS: { id: ScreenId; label: string; sub: string; Icon: typeof Boxes }[] = [
  { id: 'dashboard', label: 'Executive Trust', sub: 'A-UPI & TCO', Icon: LayoutDashboard },
  { id: 'context', label: 'Context & Mandate', sub: 'Discover · Decide', Icon: Boxes },
  { id: 'execution', label: 'Grounded Execution', sub: 'Build · Operate', Icon: GitPullRequestArrow },
  { id: 'evolution', label: 'Continuous Evolution', sub: 'Improve', Icon: Repeat },
];

export function ScreenRail() {
  const activeScreen = useDemoStore((s) => s.activeScreen);
  const setScreen = useDemoStore((s) => s.setScreen);

  return (
    <nav aria-label="Demo screens" className="flex flex-col gap-1">
      {SCREENS.map(({ id, label, sub, Icon }) => {
        const on = activeScreen === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setScreen(id)}
            aria-current={on ? 'page' : undefined}
            className={cx(
              'group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition',
              on
                ? 'border-trust-active/50 bg-trust-active/12 text-ink'
                : 'border-transparent text-ink-muted hover:border-hairline hover:bg-card/50 hover:text-ink',
            )}
          >
            <Icon
              className={cx('h-4 w-4 shrink-0', on ? 'text-trust-active-soft' : 'text-ink-faint')}
              strokeWidth={2}
            />
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold">{label}</span>
              <span className="block truncate font-mono text-[13px] text-ink-faint">{sub}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
