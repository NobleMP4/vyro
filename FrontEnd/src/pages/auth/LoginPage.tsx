import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { z } from 'zod';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/error-messages';
import { emailSchema } from '@/lib/validation';
import { paths } from '@/router/paths';
import { AuthCard } from './AuthCard';

const schema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Renseigne ton mot de passe.'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await login(values);
      // GuestOnly redirects to the requested page once authenticated.
    } catch (e) {
      setError(e);
    }
  });

  return (
    <AuthCard
      title="Content de te revoir"
      description="Connecte-toi pour retrouver ta progression."
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link to={paths.register} className="font-medium text-brand hover:underline">
            Créer un compte
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {error !== null && <Alert>{getErrorMessage(error)}</Alert>}
        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" inputMode="email" {...register('email')} />
        </FormField>
        <FormField
          label="Mot de passe"
          error={errors.password?.message}
          labelAction={
            <Link
              to={paths.forgotPassword}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mot de passe oublié ?
            </Link>
          }
        >
          <PasswordInput autoComplete="current-password" {...register('password')} />
        </FormField>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </AuthCard>
  );
}
