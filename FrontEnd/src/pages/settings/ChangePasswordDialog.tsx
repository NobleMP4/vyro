import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api-error';
import { getErrorMessage } from '@/lib/error-messages';
import { PASSWORD_HINT, passwordSchema } from '@/lib/validation';
import { usersService } from '@/services/users.service';
import { useState } from 'react';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Renseigne ton mot de passe actuel.'),
    newPassword: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirm'],
  });
type FormValues = z.infer<typeof schema>;

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const { applySession } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      usersService.changePassword(values.currentPassword, values.newPassword),
    onSuccess: (session) => {
      applySession(session);
      toast.success('Mot de passe modifié. Tes autres appareils ont été déconnectés.');
      setOpen(false);
      reset();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'INVALID_PASSWORD') {
        setError('currentPassword', { message: getErrorMessage(error) }, { shouldFocus: true });
      }
    },
  });
  const showBanner =
    mutation.isError &&
    !(mutation.error instanceof ApiError && mutation.error.code === 'INVALID_PASSWORD');

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          reset();
          mutation.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Changer le mot de passe</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changer le mot de passe</DialogTitle>
          <DialogDescription>Tes autres appareils seront déconnectés.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate className="space-y-4">
          {showBanner && <Alert>{getErrorMessage(mutation.error)}</Alert>}
          <FormField label="Mot de passe actuel" error={errors.currentPassword?.message}>
            <PasswordInput autoComplete="current-password" {...register('currentPassword')} />
          </FormField>
          <FormField
            label="Nouveau mot de passe"
            error={errors.newPassword?.message}
            hint={PASSWORD_HINT}
          >
            <PasswordInput autoComplete="new-password" {...register('newPassword')} />
          </FormField>
          <FormField label="Confirmation" error={errors.confirm?.message}>
            <PasswordInput autoComplete="new-password" {...register('confirm')} />
          </FormField>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
