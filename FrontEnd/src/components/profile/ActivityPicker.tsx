import { ACTIVITY_LABELS, ACTIVITY_TYPES } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { ActivityType } from '@/types/user';

interface ActivityPickerProps {
  value: ActivityType[];
  onChange: (activities: ActivityType[]) => void;
}

/** Multi-select chips (toggle buttons). */
export function ActivityPicker({ value, onChange }: ActivityPickerProps) {
  const toggle = (activity: ActivityType) =>
    onChange(value.includes(activity) ? value.filter((a) => a !== activity) : [...value, activity]);

  return (
    <div role="group" aria-label="Activités principales" className="flex flex-wrap gap-2">
      {ACTIVITY_TYPES.map((activity) => {
        const selected = value.includes(activity);
        return (
          <button
            key={activity}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(activity)}
            className={cn(
              'h-10 rounded-full border px-4 text-sm font-medium transition-colors',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'bg-card hover:bg-muted',
            )}
          >
            {ACTIVITY_LABELS[activity]}
          </button>
        );
      })}
    </div>
  );
}
