import type { ReactNode } from 'react';
import { seriesColor, type ChartSeries } from './chart-config';

interface TooltipEntry {
  dataKey?: unknown;
  value?: unknown;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: readonly TooltipEntry[];
  label?: unknown;
  series: ChartSeries[];
  formatLabel?: (label: string) => ReactNode;
  formatValue: (value: number) => string;
}

/** One tooltip for every series at this X: values lead, keyed by a short line. */
export function ChartTooltip({
  active,
  payload,
  label,
  series,
  formatLabel,
  formatValue,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const rows = series
    .map((s) => ({ s, entry: payload.find((p) => p.dataKey === s.key) }))
    .filter(({ entry }) => typeof entry?.value === 'number');
  if (!rows.length) return null;

  return (
    <div className="min-w-36 rounded-md border bg-card px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 text-xs text-muted-foreground">
        {formatLabel ? formatLabel(String(label)) : String(label)}
      </p>
      <ul className="space-y-1">
        {rows.map(({ s, entry }) => (
          <li key={s.key} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-0.5 w-3 rounded-full"
              style={{ backgroundColor: seriesColor(s.slot) }}
            />
            <span className="font-semibold">{formatValue(entry!.value as number)}</span>
            <span className="text-muted-foreground">{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
