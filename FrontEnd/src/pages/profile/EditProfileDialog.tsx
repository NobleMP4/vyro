import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { ActivityPicker } from '@/components/profile/ActivityPicker';
import { GoalPicker } from '@/components/profile/GoalPicker';
import { WeeklyTargetPicker } from '@/components/profile/WeeklyTargetPicker';
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
import { useUpdateProfile } from '@/hooks/useCurrentUser';
import { getErrorMessage } from '@/lib/error-messages';
import { cmToFeetInches, feetInchesToCm } from '@/lib/units';
import { displayNameSchema } from '@/lib/validation';
import type { ActivityType, MainGoal, User } from '@/types/user';

const optionalNumber = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === '' || (Number(v) >= min && Number(v) <= max), message);

const schema = z.object({
  displayName: displayNameSchema,
  mainGoal: z.string().nullable(),
  weeklyWorkoutTarget: z.number().nullable(),
  favoriteActivities: z.array(z.string()),
  birthDate: z
    .string()
    .refine(
      (v) => v === '' || (v >= '1900-01-01' && v <= new Date().toISOString().slice(0, 10)),
      'Date invalide.',
    ),
  heightCm: optionalNumber(50, 272, 'Entre 50 et 272 cm.'),
  heightFeet: optionalNumber(1, 8, 'Entre 1 et 8 ft.'),
  heightInches: optionalNumber(0, 11, 'Entre 0 et 11 in.'),
});
type FormValues = z.infer<typeof schema>;

function toFormValues(user: User): FormValues {
  const { profile } = user;
  const ftIn = profile.heightCm ? cmToFeetInches(profile.heightCm) : null;
  return {
    displayName: profile.displayName,
    mainGoal: profile.mainGoal,
    weeklyWorkoutTarget: profile.weeklyWorkoutTarget,
    favoriteActivities: profile.favoriteActivities,
    birthDate: profile.birthDate ?? '',
    heightCm: profile.heightCm?.toString() ?? '',
    heightFeet: ftIn?.feet.toString() ?? '',
    heightInches: ftIn?.inches.toString() ?? '',
  };
}

interface EditProfileDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ user, open, onOpenChange }: EditProfileDialogProps) {
  const updateProfile = useUpdateProfile();
  const usesFeet = user.profile.heightUnit === 'FT';
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), values: toFormValues(user) });

  const onSubmit = handleSubmit((values) => {
    let heightCm: number | null = null;
    if (usesFeet && values.heightFeet !== '') {
      heightCm = feetInchesToCm(Number(values.heightFeet), Number(values.heightInches || 0));
    } else if (!usesFeet && values.heightCm !== '') {
      heightCm = Math.round(Number(values.heightCm) * 10) / 10;
    }
    updateProfile.mutate(
      {
        displayName: values.displayName,
        mainGoal: values.mainGoal as MainGoal | null,
        weeklyWorkoutTarget: values.weeklyWorkoutTarget,
        favoriteActivities: values.favoriteActivities as ActivityType[],
        birthDate: values.birthDate || null,
        heightCm,
      },
      {
        onSuccess: () => {
          toast.success('Profil mis à jour');
          onOpenChange(false);
        },
      },
    );
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset();
          updateProfile.reset();
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier mon profil</DialogTitle>
          <DialogDescription>Ces informations personnalisent ton suivi.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <FormField label="Prénom ou pseudo" error={errors.displayName?.message}>
            <Input autoComplete="nickname" maxLength={50} {...register('displayName')} />
          </FormField>

          <div className="space-y-2">
            <Label>Objectif principal</Label>
            <Controller
              control={control}
              name="mainGoal"
              render={({ field }) => (
                <GoalPicker value={field.value as MainGoal | null} onChange={field.onChange} />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Entraînements par semaine</Label>
            <Controller
              control={control}
              name="weeklyWorkoutTarget"
              render={({ field }) => (
                <WeeklyTargetPicker value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Activités principales</Label>
            <Controller
              control={control}
              name="favoriteActivities"
              render={({ field }) => (
                <ActivityPicker value={field.value as ActivityType[]} onChange={field.onChange} />
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Date de naissance" error={errors.birthDate?.message} hint="Optionnel">
              <Input type="date" {...register('birthDate')} />
            </FormField>
            {usesFeet ? (
              <div className="grid grid-cols-2 gap-2">
                <FormField label="Taille (ft)" error={errors.heightFeet?.message}>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={8}
                    {...register('heightFeet')}
                  />
                </FormField>
                <FormField label="(in)" error={errors.heightInches?.message}>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={11}
                    {...register('heightInches')}
                  />
                </FormField>
              </div>
            ) : (
              <FormField label="Taille (cm)" error={errors.heightCm?.message} hint="Optionnel">
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min={50}
                  max={272}
                  {...register('heightCm')}
                />
              </FormField>
            )}
          </div>

          {updateProfile.isError && <Alert>{getErrorMessage(updateProfile.error)}</Alert>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
