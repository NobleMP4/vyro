import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm, type FieldPath } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';
import { LogoMark } from '@/components/brand/Logo';
import { ActivityPicker } from '@/components/profile/ActivityPicker';
import { GoalPicker } from '@/components/profile/GoalPicker';
import {
  DISTANCE_UNIT_OPTIONS,
  HEIGHT_UNIT_OPTIONS,
  WEIGHT_UNIT_OPTIONS,
} from '@/components/profile/unit-options';
import { WeeklyTargetPicker } from '@/components/profile/WeeklyTargetPicker';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useCompleteOnboarding, useCurrentUser } from '@/hooks/useCurrentUser';
import { getErrorMessage } from '@/lib/error-messages';
import { displayNameSchema } from '@/lib/validation';
import { paths } from '@/router/paths';

const schema = z.object({
  displayName: displayNameSchema,
  mainGoal: z.enum(
    ['LOSE_WEIGHT', 'BUILD_MUSCLE', 'GET_STRONGER', 'IMPROVE_ENDURANCE', 'STAY_ACTIVE'],
    { error: 'Choisis ton objectif principal.' },
  ),
  weeklyWorkoutTarget: z.number({ error: 'Choisis une fréquence.' }).int().min(1).max(14),
  favoriteActivities: z
    .array(
      z.enum([
        'RUNNING',
        'WALKING',
        'CYCLING',
        'SWIMMING',
        'STRENGTH',
        'FOOTBALL',
        'BASKETBALL',
        'BOXING',
        'HIKING',
        'CLIMBING',
        'YOGA',
        'HIIT',
        'OTHER',
      ]),
    )
    .min(1, 'Choisis au moins une activité.'),
  weightUnit: z.enum(['KG', 'LB']),
  distanceUnit: z.enum(['KM', 'MI']),
  heightUnit: z.enum(['CM', 'FT']),
});
type FormValues = z.infer<typeof schema>;

const STEPS: { title: string; description: string; fields: FieldPath<FormValues>[] }[] = [
  {
    title: 'Faisons connaissance',
    description: 'Comment t’appeler, et qu’est-ce qui te motive ?',
    fields: ['displayName', 'mainGoal'],
  },
  {
    title: 'Ton rythme',
    description: 'Pour adapter ton suivi et tes objectifs.',
    fields: ['weeklyWorkoutTarget', 'favoriteActivities'],
  },
  {
    title: 'Tes unités',
    description: 'Modifiables à tout moment dans les paramètres.',
    fields: ['weightUnit', 'distanceUnit', 'heightUnit'],
  },
];

export default function OnboardingPage() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const completeOnboarding = useCompleteOnboarding();
  const [step, setStep] = useState(0);
  const { profile } = user;

  const {
    control,
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: profile.displayName,
      mainGoal: profile.mainGoal ?? undefined,
      weeklyWorkoutTarget: profile.weeklyWorkoutTarget ?? undefined,
      favoriteActivities: profile.favoriteActivities,
      weightUnit: profile.weightUnit,
      distanceUnit: profile.distanceUnit,
      heightUnit: profile.heightUnit,
    },
  });

  if (profile.onboardingCompleted) return <Navigate to={paths.dashboard} replace />;

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const next = async () => {
    if (await trigger(current.fields, { shouldFocus: true })) setStep((s) => s + 1);
  };

  const onSubmit = handleSubmit((values) =>
    completeOnboarding.mutate(values, {
      onSuccess: (updated) => {
        toast.success(`C’est parti, ${updated.profile.displayName} !`);
        navigate(paths.dashboard, { replace: true });
      },
    }),
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pt-safe pb-safe">
      <header className="flex items-center gap-3 py-5">
        {step > 0 ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Étape précédente"
            onClick={() => setStep(step - 1)}
          >
            <ArrowLeft className="size-5" />
          </Button>
        ) : (
          <LogoMark className="m-1.5 size-8" />
        )}
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Progression"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={step + 1}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <span className="w-10 text-right text-sm text-muted-foreground tabular">
          {step + 1}/{STEPS.length}
        </span>
      </header>

      <form
        onSubmit={isLast ? onSubmit : (e) => (e.preventDefault(), void next())}
        noValidate
        className="flex flex-1 flex-col"
      >
        <div key={step} className="flex-1 animate-fade-up space-y-6 pb-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold">{current.title}</h1>
            <p className="text-muted-foreground">{current.description}</p>
          </div>

          {step === 0 && (
            <>
              <FormField label="Prénom ou pseudo" error={errors.displayName?.message}>
                <Input autoComplete="nickname" maxLength={50} {...register('displayName')} />
              </FormField>
              <div className="space-y-2">
                <Label>Objectif principal</Label>
                <Controller
                  control={control}
                  name="mainGoal"
                  render={({ field }) => (
                    <GoalPicker value={field.value} onChange={field.onChange} />
                  )}
                />
                {errors.mainGoal && (
                  <p role="alert" className="text-sm text-destructive">
                    {errors.mainGoal.message}
                  </p>
                )}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Combien d’entraînements par semaine ?</Label>
                <Controller
                  control={control}
                  name="weeklyWorkoutTarget"
                  render={({ field }) => (
                    <WeeklyTargetPicker value={field.value} onChange={field.onChange} />
                  )}
                />
                {errors.weeklyWorkoutTarget && (
                  <p role="alert" className="text-sm text-destructive">
                    {errors.weeklyWorkoutTarget.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Tes activités principales</Label>
                <Controller
                  control={control}
                  name="favoriteActivities"
                  render={({ field }) => (
                    <ActivityPicker value={field.value} onChange={field.onChange} />
                  )}
                />
                {errors.favoriteActivities && (
                  <p role="alert" className="text-sm text-destructive">
                    {errors.favoriteActivities.message}
                  </p>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-5">
              {(
                [
                  ['weightUnit', 'Poids', WEIGHT_UNIT_OPTIONS],
                  ['distanceUnit', 'Distance', DISTANCE_UNIT_OPTIONS],
                  ['heightUnit', 'Taille', HEIGHT_UNIT_OPTIONS],
                ] as const
              ).map(([name, label, options]) => (
                <div key={name} className="space-y-2">
                  <Label>{label}</Label>
                  <Controller
                    control={control}
                    name={name}
                    render={({ field }) => (
                      <SegmentedControl
                        label={label}
                        value={field.value}
                        options={options as { value: string; label: string }[]}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 space-y-3 bg-background py-4">
          {completeOnboarding.isError && <Alert>{getErrorMessage(completeOnboarding.error)}</Alert>}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={completeOnboarding.isPending}
          >
            {isLast
              ? completeOnboarding.isPending
                ? 'Enregistrement…'
                : 'Commencer'
              : 'Continuer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
