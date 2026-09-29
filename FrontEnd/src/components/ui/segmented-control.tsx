import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T | undefined;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}

/** Accessible single-choice control (radiogroup) with large touch targets. */
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('grid auto-cols-fr grid-flow-col gap-1 rounded-lg bg-muted p-1', className)}
    >
      {options.map(({ value: optionValue, label: optionLabel, icon: Icon }) => {
        const selected = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(optionValue)}
            className={cn(
              'flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors disabled:opacity-50',
              selected
                ? 'bg-card text-foreground shadow-card'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {Icon && <Icon className={cn('size-4', selected && 'text-brand')} aria-hidden="true" />}
            {optionLabel}
          </button>
        );
      })}
    </div>
  );
}
