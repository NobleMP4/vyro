import type { ReactNode } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { axisProps, CHART_MARGIN, gridProps, seriesColor, type ChartSeries } from './chart-config';
import { ChartTooltip } from './ChartTooltip';
import { niceDomain } from './nice-domain';

export type ChartDatum = Record<string, string | number | null>;

interface TimeSeriesChartProps {
  data: ChartDatum[];
  xKey: string;
  series: ChartSeries[];
  formatValue: (value: number) => string;
  formatX?: (value: string) => string;
  formatTooltipLabel?: (value: string) => ReactNode;
  /** Horizontal target, e.g. a goal weight. */
  reference?: { value: number; label: string };
  height?: number;
  ariaLabel: string;
}

/** Markers on measured points when they are few enough to stay readable. */
const MAX_POINTS_WITH_DOTS = 31;

/**
 * Change over time: lines/areas with a crosshair tooltip. Missing days are
 * bridged (a skipped weigh-in is not a drop to zero); round y-axis ticks.
 */
export function TimeSeriesChart({
  data,
  xKey,
  series,
  formatValue,
  formatX,
  formatTooltipLabel,
  reference,
  height = 240,
  ariaLabel,
}: TimeSeriesChartProps) {
  const values = data.flatMap((d) =>
    series.map((s) => d[s.key]).filter((v): v is number => typeof v === 'number'),
  );
  const { domain, ticks } = niceDomain(reference ? [...values, reference.value] : values);
  const showDots = data.length <= MAX_POINTS_WITH_DOTS;
  const dot = (slot: ChartSeries['slot']) =>
    showDots ? { r: 4, strokeWidth: 2, stroke: 'var(--card)', fill: seriesColor(slot) } : false;

  return (
    <div role="img" aria-label={ariaLabel} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} {...axisProps} tickFormatter={formatX} minTickGap={24} />
          <YAxis
            {...axisProps}
            width={44}
            domain={domain}
            ticks={ticks}
            tickFormatter={(v: number) => formatValue(v)}
          />
          <Tooltip
            cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }}
            content={(props) => (
              <ChartTooltip
                active={props.active}
                payload={props.payload}
                label={props.label}
                series={series}
                formatValue={formatValue}
                formatLabel={formatTooltipLabel}
              />
            )}
          />
          {reference && (
            <ReferenceLine
              y={reference.value}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              label={{
                value: reference.label,
                position: 'insideTopRight',
                fill: 'var(--muted-foreground)',
                fontSize: 12,
              }}
            />
          )}
          {series.map((s) =>
            s.variant === 'area' ? (
              <Area
                key={s.key}
                dataKey={s.key}
                name={s.label}
                type="monotone"
                stroke={seriesColor(s.slot)}
                strokeWidth={2}
                fill={seriesColor(s.slot)}
                fillOpacity={0.1}
                connectNulls
                dot={dot(s.slot)}
                activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--card)' }}
                isAnimationActive={false}
              />
            ) : (
              <Line
                key={s.key}
                dataKey={s.key}
                name={s.label}
                type="monotone"
                stroke={seriesColor(s.slot)}
                strokeWidth={2}
                strokeDasharray={s.variant === 'dashed' ? '5 4' : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
                connectNulls
                dot={s.variant === 'dashed' ? false : dot(s.slot)}
                activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--card)' }}
                isAnimationActive={false}
              />
            ),
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
