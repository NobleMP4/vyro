import { cn } from '@/lib/utils';

const OPTIONS = [1, 2, 3, 4, 5, 6, 7];

interface WeeklyTargetPickerProps {
  value: number | null | undefined;
  onChange: (value: number) => void;
}

export function WeeklyTargetPicker({ value, onChange }: WeeklyTargetPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Entraînements par semaine"
      className="grid grid-cols-7 gap-1.5"
    >
      {OPTIONS.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${option} par semaine`}
            onClick={() => onChange(option)}
            className={cn(
              'h-12 rounded-md border text-base font-semibold tabular transition-colors',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'bg-card hover:bg-muted',
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
