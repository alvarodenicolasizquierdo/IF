import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Gauge, TrendingDown } from 'lucide-react';
import { TRACKS } from '@/data/tracks';
import { CLIENT_CONTEXT } from '@/data/scenario';
import { GLOSSARY } from '@/data/glossary';
import { selectAupiSeries, selectMetrics, selectTrack, useDemoStore } from '@/store/demoStore';
import { Panel } from '@/components/ui/Panel';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CHART, SPRINT_LABELS } from '@/components/ui/chartTokens';
import { ChartTooltip } from '@/components/ui/ChartTooltip';

const BASELINE = TRACKS.track1.metrics;

const pctDelta = (baseline: number, current: number) =>
  baseline === 0 ? 0 : ((current - baseline) / baseline) * 100;

export function ExecutiveDashboard() {
  const metrics = useDemoStore(selectMetrics);
  const track = useDemoStore(selectTrack);
  const governedSeries = useDemoStore(selectAupiSeries);
  const signed = useDemoStore((s) => s.evidencePack.verificationStatus === 'SIGNED_AND_SEALED');

  /**
   * One measure, one axis. Both series are the A-UPI composite index, so the
   * governed and ungoverned trajectories are directly comparable — never a
   * second y-scale bolted onto the same plot.
   */
  const aupiData = SPRINT_LABELS.map((sprint, i) => ({
    sprint,
    ungoverned: TRACKS.track1.aupiSeries[i],
    governed: governedSeries[i],
  }));

  const tcoData = SPRINT_LABELS.map((sprint, i) => ({ sprint, tco: track.tcoSeries[i] }));

  const finalGoverned = governedSeries[governedSeries.length - 1];
  const finalUngoverned = TRACKS.track1.aupiSeries[TRACKS.track1.aupiSeries.length - 1];
  const finalTco = track.tcoSeries[track.tcoSeries.length - 1];

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] leading-tight tracking-tight text-ink">
            Executive Trust Dashboard
          </h1>
          <p className="mt-0.5 text-[15px] text-ink-muted">
            {CLIENT_CONTEXT.client} · {track.label}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {signed && <StatusBadge label="Evidence Pack signed" tone="passed" pulse />}
          <StatusBadge label={track.controlPlaneBadge} tone={track.controlPlaneTone} />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          label="Lead time"
          definition={GLOSSARY.leadTime}
          baseline={`${BASELINE.leadTimeDays.toFixed(1)}d`}
          current={`${metrics.leadTimeDays.toFixed(1)}d`}
          delta={pctDelta(BASELINE.leadTimeDays, metrics.leadTimeDays)}
        />
        <MetricCard
          label="Change failure"
          definition={GLOSSARY.changeFailureRate}
          baseline={`${BASELINE.changeFailureRate.toFixed(1)}%`}
          current={`${metrics.changeFailureRate.toFixed(1)}%`}
          delta={pctDelta(BASELINE.changeFailureRate, metrics.changeFailureRate)}
        />
        <MetricCard
          label="Defect escape"
          definition={GLOSSARY.defectEscape}
          baseline={`${BASELINE.defectEscapeRatio.toFixed(1)}%`}
          current={`${metrics.defectEscapeRatio.toFixed(1)}%`}
          delta={pctDelta(BASELINE.defectEscapeRatio, metrics.defectEscapeRatio)}
        />
        <MetricCard
          label="Maturity ×"
          definition={GLOSSARY.maturityMultiplier}
          baseline={`${BASELINE.maturityMultiplier.toFixed(2)}×`}
          current={`${metrics.maturityMultiplier.toFixed(2)}×`}
          delta={pctDelta(BASELINE.maturityMultiplier, metrics.maturityMultiplier)}
          lowerIsBetter={false}
          hero
          footnote="Computed via OPA gate adherence and context freshness."
        />
        <MetricCard
          label="TCO / CFP"
          definition={GLOSSARY.cfp}
          baseline={`€${BASELINE.tcoPerCfp.toLocaleString()}`}
          current={`€${metrics.tcoPerCfp.toLocaleString()}`}
          delta={pctDelta(BASELINE.tcoPerCfp, metrics.tcoPerCfp)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          eyebrow="The traceability spine"
          title="A-UPI composite index"
          titleTip={GLOSSARY.aupi}
          action={
            <div className="flex items-center gap-4">
              <LegendChip color={CHART.ungoverned} label="Ungoverned" />
              <LegendChip color={CHART.governed} label="Governed" />
            </div>
          }
          bodyClassName="p-4"
        >
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aupiData} margin={{ top: 14, right: 78, left: 6, bottom: 4 }}>
                <defs>
                  <linearGradient id="fill-ungoverned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART.ungoverned} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={CHART.ungoverned} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fill-governed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART.governed} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={CHART.governed} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART.grid} strokeWidth={1} vertical={false} />
                <XAxis
                  dataKey="sprint"
                  tick={{ fill: CHART.axis, fontSize: 14 }}
                  tickLine={false}
                  axisLine={{ stroke: CHART.grid }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: CHART.axis, fontSize: 14 }}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                >
                  <Label
                    value="A-UPI index"
                    angle={-90}
                    position="insideLeft"
                    style={{ fill: CHART.axis, fontSize: 13, textAnchor: 'middle' }}
                  />
                </YAxis>
                <Tooltip
                  cursor={{ stroke: CHART.axis, strokeWidth: 1 }}
                  content={<ChartTooltip />}
                />
                <Area
                  type="monotone"
                  dataKey="ungoverned"
                  name="Ungoverned AI output"
                  stroke={CHART.ungoverned}
                  strokeWidth={2}
                  fill="url(#fill-ungoverned)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: CHART.surface }}
                  isAnimationActive
                  animationDuration={700}
                />
                <Area
                  type="monotone"
                  dataKey="governed"
                  name="Intelligent Flow governed"
                  stroke={CHART.governed}
                  strokeWidth={2}
                  fill="url(#fill-governed)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: CHART.surface }}
                  isAnimationActive
                  animationDuration={700}
                />
                {/* Selective direct labels: endpoints only, never a number on every point. */}
                <ReferenceDot
                  x={SPRINT_LABELS[SPRINT_LABELS.length - 1]}
                  y={finalGoverned}
                  r={4}
                  fill={CHART.governed}
                  stroke={CHART.surface}
                  strokeWidth={2}
                >
                  <Label
                    value={String(finalGoverned)}
                    position="right"
                    offset={10}
                    style={{ fill: '#FFFFFF', fontSize: 16, fontWeight: 700 }}
                  />
                </ReferenceDot>
                <ReferenceDot
                  x={SPRINT_LABELS[SPRINT_LABELS.length - 1]}
                  y={finalUngoverned}
                  r={4}
                  fill={CHART.ungoverned}
                  stroke={CHART.surface}
                  strokeWidth={2}
                >
                  <Label
                    value={String(finalUngoverned)}
                    position="right"
                    offset={10}
                    style={{ fill: '#C7BDCB', fontSize: 16, fontWeight: 700 }}
                  />
                </ReferenceDot>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-ink-faint">
            <Gauge className="h-3 w-3" />
            Both series are the same measure on one axis — ungoverned AI amplifies chaos while governed
            delivery compounds.
          </p>
        </Panel>

        <Panel
          eyebrow="Outcome-based model"
          title="TCO per function point"
          bodyClassName="p-4"
        >
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tcoData} margin={{ top: 14, right: 72, left: 6, bottom: 4 }}>
                <defs>
                  <linearGradient id="fill-tco" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART.tco} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={CHART.tco} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART.grid} strokeWidth={1} vertical={false} />
                <XAxis
                  dataKey="sprint"
                  tick={{ fill: CHART.axis, fontSize: 13 }}
                  tickLine={false}
                  axisLine={{ stroke: CHART.grid }}
                  tickFormatter={(v: string) => v.replace('Sprint ', 'S')}
                />
                <YAxis
                  domain={[0, 1400]}
                  tick={{ fill: CHART.axis, fontSize: 13 }}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(v: number) => `€${v}`}
                />
                <Tooltip
                  cursor={{ stroke: CHART.axis, strokeWidth: 1 }}
                  content={<ChartTooltip format={(v) => `€${v.toLocaleString()}`} />}
                />
                <Area
                  type="monotone"
                  dataKey="tco"
                  name="TCO per CFP"
                  stroke={CHART.tco}
                  strokeWidth={2}
                  fill="url(#fill-tco)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: CHART.surface }}
                  isAnimationActive
                  animationDuration={700}
                />
                <ReferenceDot
                  x={SPRINT_LABELS[SPRINT_LABELS.length - 1]}
                  y={finalTco}
                  r={4}
                  fill={CHART.tco}
                  stroke={CHART.surface}
                  strokeWidth={2}
                >
                  <Label
                    value={`€${finalTco}`}
                    position="right"
                    offset={10}
                    style={{ fill: '#FFFFFF', fontSize: 16, fontWeight: 700 }}
                  />
                </ReferenceDot>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-ink-faint">
            <TrendingDown className="h-3 w-3" />
            €{BASELINE.tcoPerCfp.toLocaleString()} at Track 1 → €{TRACKS.track2.metrics.tcoPerCfp} under full
            control plane enforcement.
          </p>
        </Panel>
      </div>

      <Panel eyebrow="Way of working" title={track.label}>
        <p className="text-[16px] leading-relaxed text-ink-muted">{track.wow}</p>
      </Panel>
    </div>
  );
}

function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span aria-hidden className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: color }} />
      <span className="text-[13px] font-semibold uppercase tracking-wider text-ink-muted">{label}</span>
    </span>
  );
}
