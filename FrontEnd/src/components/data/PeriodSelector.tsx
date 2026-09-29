import { SegmentedControl } from '@/components/ui/segmented-control';
import { PERIOD_OPTIONS, type Period } from '@/lib/period';
import { cn } from '@/lib/utils';

/** 7 j | 30 j | 3 m | 6 m | 1 an | Tout — shared by weight and statistics. */
export function PeriodSelector({
  value,
  onChange,
  className,
}: {
  value: Period;
  onChange: (period: Period) => void;
  className?: string;
}) {
  return (
    <SegmentedControl
      label="Période"
      value={value}
      options={PERIOD_OPTIONS}
      onChange={onChange}
      className={cn('w-full sm:w-auto [&_button]:px-2 sm:[&_button]:px-3', className)}
    />
  );
}
