import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { DIFFICULTY_LABELS, EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '@/lib/labels';
import { exercisePath } from '@/router/paths';
import type { Exercise } from '@/types/exercise';

export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <Link
      to={exercisePath(exercise.id)}
      className="flex min-h-20 items-center gap-3 rounded-xl border bg-card p-4 shadow-card transition-colors hover:border-primary/40"
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="truncate font-medium">{exercise.name}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="default" className="bg-primary/10 text-brand">
            {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {EQUIPMENT_LABELS[exercise.equipment]} · {DIFFICULTY_LABELS[exercise.difficulty]}
          </span>
          {exercise.isCustom && <Badge variant="outline">Perso</Badge>}
        </div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  );
}
