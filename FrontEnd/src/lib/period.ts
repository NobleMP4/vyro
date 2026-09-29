import type { SegmentOption } from '@/components/ui/segmented-control';

export type Period = '7d' | '30d' | '3m' | '6m' | '1y' | 'all';

export const PERIOD_OPTIONS: SegmentOption<Period>[] = [
  { value: '7d', label: '7 j' },
  { value: '30d', label: '30 j' },
  { value: '3m', label: '3 m' },
  { value: '6m', label: '6 m' },
  { value: '1y', label: '1 an' },
  { value: 'all', label: 'Tout' },
];

const LONG_LABELS: Record<Period, string> = {
  '7d': '7 derniers jours',
  '30d': '30 derniers jours',
  '3m': '3 derniers mois',
  '6m': '6 derniers mois',
  '1y': '12 derniers mois',
  all: 'depuis le début',
};

export const periodLabel = (period: Period) => LONG_LABELS[period];

/** Start date of a period (inclusive), or null for « all ». */
export function periodStart(period: Period, now: Date = new Date()): Date | null {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (period) {
    case '7d':
      start.setDate(start.getDate() - 6);
      return start;
    case '30d':
      start.setDate(start.getDate() - 29);
      return start;
    case '3m':
      start.setMonth(start.getMonth() - 3);
      return start;
    case '6m':
      start.setMonth(start.getMonth() - 6);
      return start;
    case '1y':
      start.setFullYear(start.getFullYear() - 1);
      return start;
    case 'all':
      return null;
  }
}
