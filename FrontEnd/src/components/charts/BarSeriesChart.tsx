import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { axisProps, CHART_MARGIN, gridProps, seriesColor, type ChartSeries } from './chart-config';
import { ChartTooltip } from './ChartTooltip';
import { niceDomain } from './nice-domain';
import type { ChartDatum } from './TimeSeriesChart';

interface BarSeriesChartProps {
  data: ChartDatum[];
  xKey: string;
  series: ChartSeries[];
  formatValue: (value: number) => string;
  formatX?: (value: string) => string;
  height?: number;
  ariaLabel: string;
}

/** Magnitude per period (sessions per week, km per month…). Bars start at zero. */
export function BarSeriesChart({
  data,
  xKey,
  series,
  formatValue,
  formatX,
  height = 220,
  ariaLabel,
}: BarSeriesChartProps) {
  const values = data.flatMap((d) =>
    series.map((s) => d[s.key]).filter((v): v is number => typeof v === 'number'),
  );
  const { domain, ticks } = niceDomain(values, { includeZero: true });

  return (
    <div role="img" aria-label={ariaLabel} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={CHART_MARGIN} barGap={2}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} {...axisProps} tickFormatter={formatX} />
          <YAxis
            {...axisProps}
            width={44}
            domain={domain}
            ticks={ticks}
            tickFormatter={(v: number) => formatValue(v)}
          />
          <Tooltip
            cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
            content={(props) => (
              <ChartTooltip
                active={props.active}
                payload={props.payload}
                label={props.label}
                series={series}
                formatValue={formatValue}
                formatLabel={formatX}
              />
            )}
          />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={seriesColor(s.slot)}
              maxBarSize={24}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
