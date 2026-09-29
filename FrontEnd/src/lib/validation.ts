import { z } from 'zod';

/** Mirrors the API rules (BackEnd/src/common/validation) for instant feedback. */
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Renseigne ton email.')
  .max(254, 'Email trop long.')
  .pipe(z.email('Email invalide.'));

export const passwordSchema = z
  .string()
  .min(8, 'Au moins 8 caractères.')
  .max(128, '128 caractères maximum.')
  .regex(/\p{L}/u, 'Au moins une lettre.')
  .regex(/\d/, 'Au moins un chiffre.');

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, 'Comment doit-on t’appeler ?')
  .max(50, '50 caractères maximum.');

export const PASSWORD_HINT = '8 caractères minimum, avec au moins une lettre et un chiffre.';
