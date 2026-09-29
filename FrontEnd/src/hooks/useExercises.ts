import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { exercisesService } from '@/services/exercises.service';
import type { Exercise, ExerciseFilters, ExerciseInput } from '@/types/exercise';

/** Paginated library; « Afficher plus » loads the next page. */
export function useExerciseList(filters: ExerciseFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.exercises.list(filters),
    queryFn: ({ pageParam, signal }) => exercisesService.list(filters, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    // Keep results on screen while a new search is loading (no flicker).
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: queryKeys.exercises.detail(id),
    queryFn: ({ signal }) => exercisesService.get(id, signal),
    staleTime: 5 * 60_000,
  });
}

function useInvalidateExercises() {
  const queryClient = useQueryClient();
  return (exercise?: Exercise) => {
    if (exercise) queryClient.setQueryData(queryKeys.exercises.detail(exercise.id), exercise);
    return queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all });
  };
}

export function useCreateExercise() {
  const invalidate = useInvalidateExercises();
  return useMutation({
    mutationFn: (input: ExerciseInput) => exercisesService.create(input),
    onSuccess: (exercise) => invalidate(exercise),
  });
}

export function useUpdateExercise(id: string) {
  const invalidate = useInvalidateExercises();
  return useMutation({
    mutationFn: (input: Partial<ExerciseInput>) => exercisesService.update(id, input),
    onSuccess: (exercise) => invalidate(exercise),
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => exercisesService.remove(id),
    onSuccess: (_void, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.exercises.detail(id) });
      return queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all });
    },
  });
}
