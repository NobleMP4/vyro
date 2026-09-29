import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { formatDelta } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface StatDelta {
  value: number;
  /** Named comparison period, e.g. « cette semaine ». */
  period: string;
  /** Whether an increase is good (volume) or bad (weight when cutting). */
  goodWhen?: 'up' | 'down' | 'neutral';
  unit?: string;
  fractionDigits?: number;
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  icon?: LucideIcon;
  delta?: StatDelta;
  footer?: ReactNode;
  className?: string;
}

function deltaTone(delta: StatDelta): 'good' | 'bad' | 'neutral' {
  if (!delta.goodWhen || delta.goodWhen === 'neutral' || delta.value === 0) return 'neutral';
  const up = delta.value > 0;
  return up === (delta.goodWhen === 'up') ? 'good' : 'bad';
}

/**
 * Stat tile: label · value (proportional figures) · optional signed delta vs a
 * named period, colored by whether the direction is good — never color alone
 * (arrow + sign + text).
 */
export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  delta,
  footer,
  className,
}: StatCardProps) {
  const tone = delta ? deltaTone(delta) : 'neutral';
  const DeltaIcon =
    !delta || delta.value === 0 ? Minus : delta.value > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className={cn('flex flex-col gap-3 p-5', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && <Icon className="size-4 text-muted-foreground" aria-hidden="true" />}
      </div>
      <p className="flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
        {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
      </p>
      {delta && (
        <p
          className={cn(
            'flex flex-wrap items-center gap-x-1 text-sm',
            tone === 'good' && 'text-success',
            tone === 'bad' && 'text-destructive',
            tone === 'neutral' && 'text-muted-foreground',
          )}
        >
          <DeltaIcon className="size-4" aria-hidden="true" />
          <span className="font-medium whitespace-nowrap">
            {formatDelta(delta.value, delta.fractionDigits)}
            {delta.unit && ` ${delta.unit}`}
          </span>
          <span className="text-muted-foreground">{delta.period}</span>
        </p>
      )}
      {footer}
    </Card>
  );
}
