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
import { ApiError } from '@/lib/api-error';
import { getErrorMessage } from '@/lib/error-messages';
import { displayNameSchema, emailSchema, PASSWORD_HINT, passwordSchema } from '@/lib/validation';
import { paths } from '@/router/paths';
import { AuthCard } from './AuthCard';

const schema = z.object({
  displayName: displayNameSchema,
  email: emailSchema,
  password: passwordSchema,
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: signUp } = useAuth();
  const [error, setError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await signUp(values);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'EMAIL_ALREADY_USED') {
        setFieldError('email', { message: getErrorMessage(e) }, { shouldFocus: true });
      } else {
        setError(e);
      }
    }
  });

  return (
    <AuthCard
      title="Crée ton compte"
      description="Quelques secondes suffisent pour commencer."
      footer={
        <>
          Déjà un compte ?{' '}
          <Link to={paths.login} className="font-medium text-brand hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {error !== null && <Alert>{getErrorMessage(error)}</Alert>}
        <FormField label="Prénom ou pseudo" error={errors.displayName?.message}>
          <Input autoComplete="nickname" maxLength={50} {...register('displayName')} />
        </FormField>
        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" inputMode="email" {...register('email')} />
        </FormField>
        <FormField label="Mot de passe" error={errors.password?.message} hint={PASSWORD_HINT}>
          <PasswordInput autoComplete="new-password" {...register('password')} />
        </FormField>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Création…' : 'Créer mon compte'}
        </Button>
      </form>
    </AuthCard>
  );
}
