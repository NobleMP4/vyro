import { ArrowLeft, Lightbulb, ListOrdered, Pencil, SearchX, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteExercise, useExercise } from '@/hooks/useExercises';
import { ApiError } from '@/lib/api-error';
import { getErrorMessage } from '@/lib/error-messages';
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_GROUP_LABELS,
  TRACKING_TYPE_LABELS,
} from '@/lib/labels';
import { paths } from '@/router/paths';
import { ExerciseFormDialog } from './ExerciseFormDialog';

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof ListOrdered;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <Icon className="size-4 text-brand" aria-hidden="true" />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="leading-relaxed whitespace-pre-line">{children}</CardContent>
    </Card>
  );
}

export default function ExerciseDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const query = useExercise(id);
  const remove = useDeleteExercise();
  const [editing, setEditing] = useState(false);

  const back = (
    <Button asChild variant="ghost" size="sm" className="mb-4 -ml-3">
      <Link to={paths.exercises}>
        <ArrowLeft aria-hidden="true" />
        Exercices
      </Link>
    </Button>
  );

  if (query.isPending) {
    return (
      <div role="status" aria-label="Chargement de l’exercice" className="space-y-4">
        {back}
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-6 w-80 max-w-full" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (query.isError) {
    const notFound = query.error instanceof ApiError && query.error.status === 404;
    return (
      <>
        {back}
        {notFound ? (
          <EmptyState
            icon={SearchX}
            title="Exercice introuvable"
            description="Il n’existe pas ou a été supprimé."
            action={
              <Button asChild>
                <Link to={paths.exercises}>Voir la bibliothèque</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState
            error={query.error}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        )}
      </>
    );
  }

  const exercise = query.data;
  const tracking = TRACKING_TYPE_LABELS[exercise.trackingType];

  return (
    <>
      {back}
      <header className="mb-6 animate-fade-up space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold md:text-3xl">{exercise.name}</h1>
          {exercise.isCustom && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Pencil aria-hidden="true" />
                Modifier
              </Button>
              <ConfirmDialog
                trigger={
                  <Button variant="ghost" aria-label="Supprimer l’exercice">
                    <Trash2 aria-hidden="true" />
                  </Button>
                }
                title="Supprimer cet exercice ?"
                description="Il disparaîtra de ta bibliothèque. Les séances passées qui l’utilisent le conserveront."
                confirmLabel="Supprimer"
                destructive
                pending={remove.isPending}
                onConfirm={() =>
                  remove.mutate(exercise.id, {
                    onSuccess: () => {
                      toast.success('Exercice supprimé');
                      navigate(paths.exercises, { replace: true });
                    },
                    onError: (error) => toast.error(getErrorMessage(error)),
                  })
                }
              />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-primary/10 text-brand">
            {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
          </Badge>
          <Badge variant="outline">{EQUIPMENT_LABELS[exercise.equipment]}</Badge>
          <Badge variant="outline">{DIFFICULTY_LABELS[exercise.difficulty]}</Badge>
          {exercise.isCustom && <Badge variant="neutral">Exercice perso</Badge>}
        </div>
        {exercise.description && (
          <p className="max-w-2xl text-muted-foreground">{exercise.description}</p>
        )}
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          {exercise.instructions && (
            <Section title="Exécution" icon={ListOrdered}>
              {exercise.instructions}
            </Section>
          )}
          {exercise.tips && (
            <Section title="Conseils" icon={Lightbulb}>
              {exercise.tips}
            </Section>
          )}
          {!exercise.instructions && !exercise.tips && (
            <p className="text-sm text-muted-foreground">Aucune consigne pour cet exercice.</p>
          )}
        </div>
        <Card className="h-fit">
          <CardContent className="space-y-4 pt-5">
            <div>
              <p className="text-sm text-muted-foreground">Suivi des séries</p>
              <p className="font-medium">{tracking.label}</p>
              <p className="text-xs text-muted-foreground">{tracking.description}</p>
            </div>
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Muscles sollicités</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary/10 text-brand">
                  {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
                </Badge>
                {exercise.secondaryMuscles.map((m) => (
                  <Badge key={m} variant="outline">
                    {MUSCLE_GROUP_LABELS[m]}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {exercise.isCustom && (
        <ExerciseFormDialog open={editing} onOpenChange={setEditing} exercise={exercise} />
      )}
    </>
  );
}
