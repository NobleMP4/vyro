/**
 * Chart conventions (see docs/design-system.md § Graphiques):
 * fixed categorical order, 2px lines, ≥8px markers with a surface ring,
 * ≤24px bars with 4px rounded ends, hairline recessive grid, one y-axis.
 */
export type ChartSlot = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface ChartSeries {
  key: string;
  label: string;
  /** Categorical slot, assigned to the entity — never by rank. */
  slot: ChartSlot;
  /** `dashed`: secondary/derived series (e.g. 7-day average). */
  variant?: 'line' | 'area' | 'dashed';
}

export const seriesColor = (slot: ChartSlot) => `var(--chart-${slot})`;

export const CHART_MARGIN = { top: 8, right: 12, bottom: 0, left: 0 };

export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: 'var(--muted-foreground)', fontSize: 12 },
  tickMargin: 8,
} as const;

export const gridProps = {
  vertical: false,
  stroke: 'var(--chart-grid)',
  strokeWidth: 1,
} as const;
