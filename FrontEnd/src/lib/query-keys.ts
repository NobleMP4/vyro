import type { ExerciseFilters } from '@/types/exercise';

/** Centralised TanStack Query keys — keeps cache invalidation predictable. */
export const queryKeys = {
  health: ['health'] as const,
  me: ['me'] as const,
  dashboard: ['dashboard'] as const,
  exercises: {
    all: ['exercises'] as const,
    list: (filters: ExerciseFilters) => ['exercises', 'list', filters] as const,
    detail: (id: string) => ['exercises', 'detail', id] as const,
  },
};
