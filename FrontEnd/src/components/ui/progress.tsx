import { cn } from '@/lib/utils';

interface ProgressProps {
  /** 0–100; clamped. */
  value: number;
  label: string;
  tone?: 'brand' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const TONES = {
  brand: { fill: 'bg-primary', track: 'bg-primary/15' },
  success: { fill: 'bg-success', track: 'bg-success/15' },
  warning: { fill: 'bg-warning', track: 'bg-warning/15' },
  destructive: { fill: 'bg-destructive', track: 'bg-destructive/15' },
};

/** Meter: the unfilled track is a lighter step of the same hue. */
export function Progress({ value, label, tone = 'brand', className }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn('h-2 w-full overflow-hidden rounded-full', TONES[tone].track, className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-500 ease-out',
          TONES[tone].fill,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
