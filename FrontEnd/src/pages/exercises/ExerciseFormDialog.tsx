import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateExercise, useUpdateExercise } from '@/hooks/useExercises';
import { getErrorMessage } from '@/lib/error-messages';
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  EQUIPMENTS,
  MUSCLE_GROUP_LABELS,
  MUSCLE_GROUPS,
  TRACKING_TYPE_LABELS,
  TRACKING_TYPES,
} from '@/lib/labels';
import { cn } from '@/lib/utils';
import { exercisePath } from '@/router/paths';
import type { Difficulty, Equipment, Exercise, MuscleGroup, TrackingType } from '@/types/exercise';

const schema = z.object({
  name: z.string().trim().min(1, 'Donne un nom à l’exercice.').max(100, '100 caractères maximum.'),
  muscleGroup: z.string().min(1, 'Choisis le muscle principal.'),
  secondaryMuscles: z.array(z.string()).max(6, '6 muscles secondaires maximum.'),
  equipment: z.string().min(1, 'Choisis l’équipement.'),
  difficulty: z.string(),
  trackingType: z.string(),
  description: z.string().trim().max(2000, '2000 caractères maximum.'),
  instructions: z.string().trim().max(4000, '4000 caractères maximum.'),
  tips: z.string().trim().max(2000, '2000 caractères maximum.'),
});
type FormValues = z.infer<typeof schema>;

const toValues = (exercise?: Exercise): FormValues => ({
  name: exercise?.name ?? '',
  muscleGroup: exercise?.muscleGroup ?? '',
  secondaryMuscles: exercise?.secondaryMuscles ?? [],
  equipment: exercise?.equipment ?? '',
  difficulty: exercise?.difficulty ?? 'BEGINNER',
  trackingType: exercise?.trackingType ?? 'WEIGHT_REPS',
  description: exercise?.description ?? '',
  instructions: exercise?.instructions ?? '',
  tips: exercise?.tips ?? '',
});

interface ExerciseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit mode when provided. */
  exercise?: Exercise;
}

/** Create or edit a custom exercise. */
export function ExerciseFormDialog({ open, onOpenChange, exercise }: ExerciseFormDialogProps) {
  const navigate = useNavigate();
  const create = useCreateExercise();
  const update = useUpdateExercise(exercise?.id ?? '');
  const mutation = exercise ? update : create;
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), values: toValues(exercise) });
  const primary = useWatch({ control, name: 'muscleGroup' });
  const trackingType = useWatch({ control, name: 'trackingType' }) as TrackingType;

  const close = (next: boolean) => {
    if (!next) {
      reset();
      mutation.reset();
    }
    onOpenChange(next);
  };

  const onSubmit = handleSubmit((values) => {
    const input = {
      name: values.name,
      muscleGroup: values.muscleGroup as MuscleGroup,
      secondaryMuscles: values.secondaryMuscles.filter(
        (m) => m !== values.muscleGroup,
      ) as MuscleGroup[],
      equipment: values.equipment as Equipment,
      difficulty: values.difficulty as Difficulty,
      trackingType: values.trackingType as TrackingType,
      description: values.description || undefined,
      instructions: values.instructions || undefined,
      tips: values.tips || undefined,
    };
    mutation.mutate(input, {
      onSuccess: (saved) => {
        toast.success(exercise ? 'Exercice mis à jour' : 'Exercice créé');
        close(false);
        if (!exercise) navigate(exercisePath(saved.id));
      },
    });
  });

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{exercise ? 'Modifier l’exercice' : 'Nouvel exercice'}</DialogTitle>
          <DialogDescription>Visible uniquement par toi.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField label="Nom" error={errors.name?.message}>
            <Input maxLength={100} {...register('name')} />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Muscle principal" error={errors.muscleGroup?.message}>
              <Select {...register('muscleGroup')}>
                <option value="">Choisir…</option>
                {MUSCLE_GROUPS.map((m) => (
                  <option key={m} value={m}>
                    {MUSCLE_GROUP_LABELS[m]}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Équipement" error={errors.equipment?.message}>
              <Select {...register('equipment')}>
                <option value="">Choisir…</option>
                {EQUIPMENTS.map((eq) => (
                  <option key={eq} value={eq}>
                    {EQUIPMENT_LABELS[eq]}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="space-y-2">
            <Label>Muscles secondaires</Label>
            <Controller
              control={control}
              name="secondaryMuscles"
              render={({ field }) => (
                <div role="group" aria-label="Muscles secondaires" className="flex flex-wrap gap-2">
                  {MUSCLE_GROUPS.filter((m) => m !== primary).map((m) => {
                    const selected = field.value.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          field.onChange(
                            selected ? field.value.filter((v) => v !== m) : [...field.value, m],
                          )
                        }
                        className={cn(
                          'h-9 rounded-full border px-3 text-sm transition-colors',
                          selected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'bg-card hover:bg-muted',
                        )}
                      >
                        {MUSCLE_GROUP_LABELS[m]}
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.secondaryMuscles && (
              <p role="alert" className="text-sm text-destructive">
                {errors.secondaryMuscles.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Difficulté</Label>
            <Controller
              control={control}
              name="difficulty"
              render={({ field }) => (
                <SegmentedControl
                  label="Difficulté"
                  value={field.value}
                  onChange={field.onChange}
                  options={DIFFICULTIES.map((d) => ({ value: d, label: DIFFICULTY_LABELS[d] }))}
                />
              )}
            />
          </div>

          <FormField
            label="Suivi des séries"
            hint={TRACKING_TYPE_LABELS[trackingType]?.description}
          >
            <Select {...register('trackingType')}>
              {TRACKING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TRACKING_TYPE_LABELS[t].label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Description" error={errors.description?.message} hint="Optionnel">
            <Textarea rows={2} {...register('description')} />
          </FormField>
          <FormField label="Exécution" error={errors.instructions?.message} hint="Optionnel">
            <Textarea rows={3} {...register('instructions')} />
          </FormField>
          <FormField label="Conseils" error={errors.tips?.message} hint="Optionnel">
            <Textarea rows={2} {...register('tips')} />
          </FormField>

          {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => close(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Enregistrement…' : exercise ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
