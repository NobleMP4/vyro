import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { MailCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { z } from 'zod';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/error-messages';
import { emailSchema } from '@/lib/validation';
import { paths } from '@/router/paths';
import { authService } from '@/services/auth.service';
import { AuthCard } from './AuthCard';

const schema = z.object({ email: emailSchema });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const mutation = useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const backToLogin = (
    <Link to={paths.login} className="font-medium text-brand hover:underline">
      Retour à la connexion
    </Link>
  );

  if (mutation.isSuccess) {
    return (
      <AuthCard title="Vérifie tes emails" footer={backToLogin}>
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center">
          <MailCheck className="size-8 text-brand" aria-hidden="true" />
          <p className="text-sm">
            Si un compte existe pour <strong>{getValues('email')}</strong>, tu vas recevoir un lien
            pour choisir un nouveau mot de passe. Il est valable 1 heure.
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Mot de passe oublié"
      description="Indique ton email, on t’envoie un lien de réinitialisation."
      footer={backToLogin}
    >
      <form
        onSubmit={handleSubmit(({ email }) => mutation.mutate(email))}
        noValidate
        className="space-y-4"
      >
        {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}
        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" inputMode="email" {...register('email')} />
        </FormField>
        <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Envoi…' : 'Envoyer le lien'}
        </Button>
      </form>
    </AuthCard>
  );
}
