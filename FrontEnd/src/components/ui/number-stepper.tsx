import { Minus, Plus } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/lib/utils';

interface NumberStepperProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  /** Decimal places kept when stepping (e.g. 1 for 2.5 kg plates). */
  precision?: number;
  className?: string;
}

const NUMERIC_INPUT = /^\d*[.,]?\d*$/;

function parse(text: string): number | null {
  if (text.trim() === '') return null;
  const n = Number(text.replace(',', '.'));
  return Number.isNaN(n) ? null : n;
}

/**
 * Large +/- control for in-workout input (weight, reps): big touch targets,
 * numeric keyboard, still directly editable. French decimal comma accepted.
 */
export function NumberStepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  unit,
  precision = 0,
  className,
}: NumberStepperProps) {
  const id = useId();
  // Raw text while typing, so intermediate states like « 42, » are not lost.
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (n: number) => Math.min(max, Math.max(min, Number(n.toFixed(precision))));
  const display = value === null ? '' : String(value).replace('.', ',');
  const shown = draft ?? display;

  const bump = (direction: 1 | -1) => {
    setDraft(null);
    onChange(clamp((value ?? 0) + direction * step));
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-center text-xs font-medium text-muted-foreground">
        {label}
        {unit && <span className="font-normal"> · {unit}</span>}
      </label>
      <div className="flex h-14 items-stretch overflow-hidden rounded-lg border bg-card">
        <button
          type="button"
          onClick={() => bump(-1)}
          disabled={value !== null && value <= min}
          aria-label={`Diminuer ${label.toLowerCase()}`}
          className="flex w-11 shrink-0 items-center justify-center transition-colors hover:bg-muted active:scale-95 disabled:opacity-40 sm:w-14"
        >
          <Minus className="size-5" />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <input
            id={id}
            inputMode={precision > 0 ? 'decimal' : 'numeric'}
            value={shown}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const text = e.target.value;
              if (!NUMERIC_INPUT.test(text)) return;
              setDraft(text);
              const parsed = parse(text);
              // Out-of-range values are corrected on blur, not while typing.
              if (parsed === null) onChange(null);
              else if (parsed >= min && parsed <= max) onChange(parsed);
            }}
            onBlur={() => {
              if (draft === null) return;
              const parsed = parse(draft);
              setDraft(null);
              onChange(parsed === null ? null : clamp(parsed));
            }}
            className={cn(
              'w-full min-w-0 bg-transparent text-center font-semibold tabular outline-none',
              shown.length > 4 ? 'text-base sm:text-lg' : 'text-lg sm:text-xl',
            )}
          />
        </div>
        <button
          type="button"
          onClick={() => bump(1)}
          disabled={value !== null && value >= max}
          aria-label={`Augmenter ${label.toLowerCase()}`}
          className="flex w-11 shrink-0 items-center justify-center transition-colors hover:bg-muted active:scale-95 disabled:opacity-40 sm:w-14"
        >
          <Plus className="size-5" />
        </button>
      </div>
    </div>
  );
}
