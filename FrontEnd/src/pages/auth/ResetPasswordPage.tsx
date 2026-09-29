import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, LinkIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router';
import { z } from 'zod';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { PasswordInput } from '@/components/ui/password-input';
import { getErrorMessage } from '@/lib/error-messages';
import { PASSWORD_HINT, passwordSchema } from '@/lib/validation';
import { paths } from '@/router/paths';
import { authService } from '@/services/auth.service';
import { AuthCard } from './AuthCard';

const schema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirm'],
  });
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const mutation = useMutation({
    mutationFn: (password: string) => authService.resetPassword(token!, password),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const loginButton = (
    <Button asChild size="lg" className="w-full">
      <Link to={paths.login}>Se connecter</Link>
    </Button>
  );

  if (!token) {
    return (
      <EmptyState
        icon={LinkIcon}
        title="Lien incomplet"
        description="Ouvre le lien reçu par email, ou fais une nouvelle demande."
        action={
          <Button asChild>
            <Link to={paths.forgotPassword}>Nouvelle demande</Link>
          </Button>
        }
      />
    );
  }

  if (mutation.isSuccess) {
    return (
      <AuthCard title="Mot de passe modifié">
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center">
          <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
          <p className="text-sm">
            Ton nouveau mot de passe est enregistré. Par sécurité, tous tes appareils ont été
            déconnectés.
          </p>
        </div>
        {loginButton}
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Nouveau mot de passe"
      description="Choisis un mot de passe que tu n’utilises pas ailleurs."
    >
      <form
        onSubmit={handleSubmit(({ password }) => mutation.mutate(password))}
        noValidate
        className="space-y-4"
      >
        {mutation.isError && (
          <Alert>
            {getErrorMessage(mutation.error)}{' '}
            <Link to={paths.forgotPassword} className="font-medium underline">
              Nouvelle demande
            </Link>
          </Alert>
        )}
        <FormField
          label="Nouveau mot de passe"
          error={errors.password?.message}
          hint={PASSWORD_HINT}
        >
          <PasswordInput autoComplete="new-password" {...register('password')} />
        </FormField>
        <FormField label="Confirmation" error={errors.confirm?.message}>
          <PasswordInput autoComplete="new-password" {...register('confirm')} />
        </FormField>
        <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </form>
    </AuthCard>
  );
}
