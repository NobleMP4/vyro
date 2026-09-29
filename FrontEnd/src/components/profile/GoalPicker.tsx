import { Check } from 'lucide-react';
import { MAIN_GOAL_LABELS, MAIN_GOALS } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { MainGoal } from '@/types/user';

interface GoalPickerProps {
  value: MainGoal | null | undefined;
  onChange: (goal: MainGoal) => void;
}

export function GoalPicker({ value, onChange }: GoalPickerProps) {
  return (
    <div role="radiogroup" aria-label="Objectif principal" className="grid gap-2">
      {MAIN_GOALS.map((goal) => {
        const selected = value === goal;
        return (
          <button
            key={goal}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(goal)}
            className={cn(
              'flex min-h-14 items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
              selected ? 'border-primary bg-primary/8' : 'bg-card hover:bg-muted',
            )}
          >
            <span className="flex-1">
              <span className="block font-medium">{MAIN_GOAL_LABELS[goal].label}</span>
              <span className="block text-sm text-muted-foreground">
                {MAIN_GOAL_LABELS[goal].description}
              </span>
            </span>
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full border',
                selected && 'border-primary bg-primary text-primary-foreground',
              )}
            >
              {selected && <Check className="size-3.5" aria-hidden="true" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
