import { DIFFICULTIES, EQUIPMENTS, MUSCLE_GROUPS } from '@/lib/labels';
import type {
  Difficulty,
  Equipment,
  ExerciseFilters,
  ExerciseScope,
  MuscleGroup,
} from '@/types/exercise';

/** Filters live in the URL (shareable, survive back navigation). Invalid values are ignored. */
export function filtersFromParams(params: URLSearchParams): ExerciseFilters {
  const pick = <T extends string>(key: string, allowed: readonly T[]) => {
    const value = params.get(key);
    return value && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
  };
  return {
    search: params.get('q')?.trim() || undefined,
    muscleGroup: pick<MuscleGroup>('muscle', MUSCLE_GROUPS),
    equipment: pick<Equipment>('equipment', EQUIPMENTS),
    difficulty: pick<Difficulty>('difficulty', DIFFICULTIES),
    scope: pick<ExerciseScope>('scope', ['all', 'catalog', 'mine']) ?? 'all',
  };
}

export const PARAM_KEYS = {
  search: 'q',
  muscleGroup: 'muscle',
  equipment: 'equipment',
  difficulty: 'difficulty',
  scope: 'scope',
} as const;

export const hasActiveFilters = (f: ExerciseFilters) =>
  Boolean(
    f.search || f.muscleGroup || f.equipment || f.difficulty || (f.scope && f.scope !== 'all'),
  );
