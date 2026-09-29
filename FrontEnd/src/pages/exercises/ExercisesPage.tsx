import { Dumbbell, Plus, Search, SearchX, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useExerciseList } from '@/hooks/useExercises';
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  EQUIPMENTS,
  MUSCLE_GROUP_LABELS,
  MUSCLE_GROUPS,
} from '@/lib/labels';
import type { ExerciseFilters, ExerciseScope } from '@/types/exercise';
import { ExerciseCard } from './ExerciseCard';
import { filtersFromParams, hasActiveFilters, PARAM_KEYS } from './exercise-filters';
import { ExerciseFormDialog } from './ExerciseFormDialog';

function ListSkeleton() {
  return (
    <div role="status" aria-label="Chargement des exercices" className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}

export default function ExercisesPage() {
  const [params, setParams] = useSearchParams();
  const filters = filtersFromParams(params);
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const debouncedSearch = useDebouncedValue(searchInput.trim());
  const [creating, setCreating] = useState(false);

  // URL updates are applied asynchronously by the router: chain rapid changes
  // (e.g. two filters picked quickly) from the latest written value, not a stale one.
  const latestParams = useRef(params);
  useLayoutEffect(() => {
    latestParams.current = params;
  }, [params]);
  const writeParams = (next: URLSearchParams) => {
    latestParams.current = next;
    setParams(next, { replace: true });
  };

  const setFilter = <K extends keyof ExerciseFilters>(key: K, value: ExerciseFilters[K]) => {
    const next = new URLSearchParams(latestParams.current);
    const param = PARAM_KEYS[key];
    if (!value || (key === 'scope' && value === 'all')) next.delete(param);
    else next.set(param, String(value));
    writeParams(next);
  };

  // Push the debounced search text into the URL (and therefore the query).
  useEffect(() => {
    if ((filters.search ?? '') !== debouncedSearch)
      setFilter('search', debouncedSearch || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the typed text
  }, [debouncedSearch]);

  const resetFilters = () => {
    setSearchInput('');
    writeParams(new URLSearchParams());
  };

  const list = useExerciseList(filters);
  const exercises = list.data?.pages.flatMap((page) => page.items) ?? [];
  const total = list.data?.pages[0]?.total ?? 0;

  return (
    <>
      <PageHeader
        title="Exercices"
        description="Bibliothèque d’exercices et tes exercices personnalisés."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus aria-hidden="true" />
            Nouvel exercice
          </Button>
        }
      />

      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Rechercher un exercice"
            placeholder="Rechercher un exercice…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pr-11 pl-11"
          />
          {searchInput && (
            <button
              type="button"
              aria-label="Effacer la recherche"
              onClick={() => setSearchInput('')}
              className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <SegmentedControl<ExerciseScope>
          label="Source"
          value={filters.scope}
          onChange={(scope) => setFilter('scope', scope)}
          options={[
            { value: 'all', label: 'Tous' },
            { value: 'catalog', label: 'Catalogue' },
            { value: 'mine', label: 'Perso' },
          ]}
          className="sm:max-w-md"
        />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Select
            aria-label="Groupe musculaire"
            value={filters.muscleGroup ?? ''}
            onChange={(e) =>
              setFilter(
                'muscleGroup',
                (e.target.value || undefined) as ExerciseFilters['muscleGroup'],
              )
            }
          >
            <option value="">Tous les muscles</option>
            {MUSCLE_GROUPS.map((m) => (
              <option key={m} value={m}>
                {MUSCLE_GROUP_LABELS[m]}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Équipement"
            value={filters.equipment ?? ''}
            onChange={(e) =>
              setFilter('equipment', (e.target.value || undefined) as ExerciseFilters['equipment'])
            }
          >
            <option value="">Tout l’équipement</option>
            {EQUIPMENTS.map((eq) => (
              <option key={eq} value={eq}>
                {EQUIPMENT_LABELS[eq]}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Difficulté"
            value={filters.difficulty ?? ''}
            onChange={(e) =>
              setFilter(
                'difficulty',
                (e.target.value || undefined) as ExerciseFilters['difficulty'],
              )
            }
          >
            <option value="">Toutes les difficultés</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {DIFFICULTY_LABELS[d]}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex min-h-9 items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {list.isSuccess && `${total} exercice${total > 1 ? 's' : ''}`}
            {list.isFetching && !list.isFetchingNextPage && list.isSuccess && (
              <Spinner className="ml-2 inline size-4 align-text-bottom" label="Mise à jour" />
            )}
          </p>
          {hasActiveFilters(filters) && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {list.isPending ? (
        <ListSkeleton />
      ) : list.isError ? (
        <ErrorState
          error={list.error}
          title="Impossible de charger les exercices"
          onRetry={() => void list.refetch()}
          isRetrying={list.isFetching}
        />
      ) : exercises.length === 0 ? (
        filters.scope === 'mine' && !hasActiveFilters({ ...filters, scope: 'all' }) ? (
          <EmptyState
            icon={Dumbbell}
            title="Aucun exercice personnalisé"
            description="Crée tes propres exercices s’ils ne sont pas dans le catalogue."
            action={<Button onClick={() => setCreating(true)}>Créer un exercice</Button>}
          />
        ) : (
          <EmptyState
            icon={SearchX}
            title="Aucun exercice ne correspond"
            description="Essaie une autre recherche ou retire des filtres."
            action={
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            }
          />
        )
      ) : (
        <div className="space-y-4">
          <ul aria-label="Résultats" className="grid gap-3 md:grid-cols-2">
            {exercises.map((exercise) => (
              <li key={exercise.id}>
                <ExerciseCard exercise={exercise} />
              </li>
            ))}
          </ul>
          {list.hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => void list.fetchNextPage()}
                disabled={list.isFetchingNextPage}
              >
                {list.isFetchingNextPage ? 'Chargement…' : 'Afficher plus'}
              </Button>
            </div>
          )}
        </div>
      )}

      <ExerciseFormDialog open={creating} onOpenChange={setCreating} />
    </>
  );
}
