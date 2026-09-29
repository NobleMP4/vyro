import { apiRequest } from '@/lib/api-client';
import type { Exercise, ExerciseFilters, ExerciseInput, Page } from '@/types/exercise';

export const EXERCISES_PAGE_SIZE = 24;

export const exercisesService = {
  list: (filters: ExerciseFilters, page: number, signal?: AbortSignal) =>
    apiRequest<Page<Exercise>>('/exercises', {
      signal,
      query: { ...filters, page, pageSize: EXERCISES_PAGE_SIZE },
    }),

  get: (id: string, signal?: AbortSignal) =>
    apiRequest<Exercise>(`/exercises/${encodeURIComponent(id)}`, { signal }),

  create: (input: ExerciseInput) =>
    apiRequest<Exercise>('/exercises', { method: 'POST', body: input }),

  update: (id: string, input: Partial<ExerciseInput>) =>
    apiRequest<Exercise>(`/exercises/${encodeURIComponent(id)}`, { method: 'PATCH', body: input }),

  remove: (id: string) =>
    apiRequest<void>(`/exercises/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
