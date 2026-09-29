import { Table2, TrendingUp } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { seriesColor, type ChartSeries } from './chart-config';

export interface ChartTable {
  columns: string[];
  rows: ReactNode[][];
}

interface ChartFrameProps {
  title: string;
  description?: ReactNode;
  /** Right-aligned controls (e.g. period selector). */
  actions?: ReactNode;
  series: ChartSeries[];
  /** Same data as a table: accessible alternative to the chart. */
  table: ChartTable;
  children: ReactNode;
}

/**
 * Card around a chart: title, legend (only with ≥ 2 series, so identity is
 * never color alone), and a chart/table toggle.
 */
export function ChartFrame({
  title,
  description,
  actions,
  series,
  table,
  children,
}: ChartFrameProps) {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView(view === 'chart' ? 'table' : 'chart')}
            aria-pressed={view === 'table'}
          >
            {view === 'chart' ? <Table2 aria-hidden="true" /> : <TrendingUp aria-hidden="true" />}
            {view === 'chart' ? 'Tableau' : 'Graphique'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {series.length > 1 && view === 'chart' && (
          <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label="Légende">
            {series.map((s) => (
              <li key={s.key} className="flex items-center gap-2 text-muted-foreground">
                <svg width="16" height="4" aria-hidden="true">
                  <line
                    x1="1"
                    y1="2"
                    x2="15"
                    y2="2"
                    stroke={seriesColor(s.slot)}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={s.variant === 'dashed' ? '3 3' : undefined}
                  />
                </svg>
                {s.label}
              </li>
            ))}
          </ul>
        )}
        {view === 'chart' ? (
          children
        ) : (
          <div className="max-h-72 overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  {table.columns.map((column) => (
                    <th key={column} scope="col" className="px-3 py-2 text-left font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {table.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2 tabular">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
