import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
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
import { usersService } from '@/services/users.service';

const schema = z.object({ password: z.string().min(1, 'Confirme avec ton mot de passe.') });
type FormValues = z.infer<typeof schema>;

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const { endSession } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: ({ password }: FormValues) => usersService.deleteAccount(password),
    onSuccess: () => {
      toast.success('Ton compte et toutes tes données ont été supprimés.');
      endSession();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'INVALID_PASSWORD') {
        setError('password', { message: 'Mot de passe incorrect.' }, { shouldFocus: true });
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
        <Button variant="destructive">Supprimer mon compte</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer ton compte ?</DialogTitle>
          <DialogDescription>
            Ton compte et toutes tes données (profil, entraînements, progression…) seront
            définitivement supprimés. Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate className="space-y-4">
          {showBanner && <Alert>{getErrorMessage(mutation.error)}</Alert>}
          <FormField label="Mot de passe" error={errors.password?.message}>
            <PasswordInput autoComplete="current-password" {...register('password')} />
          </FormField>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="destructive" disabled={mutation.isPending}>
              {mutation.isPending ? 'Suppression…' : 'Supprimer définitivement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
