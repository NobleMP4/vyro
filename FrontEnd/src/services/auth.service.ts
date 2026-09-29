import { apiRequest } from '@/lib/api-client';
import { CLIENT_HEADERS } from '@/lib/auth-session';
import type { AuthResponse } from '@/types/user';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  displayName: string;
}

export const authService = {
  login: (input: LoginInput) =>
    apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: input, auth: false }),

  register: (input: RegisterInput) =>
    apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: input, auth: false }),

  logout: () =>
    apiRequest<void>('/auth/logout', { method: 'POST', auth: false, headers: CLIENT_HEADERS }),

  forgotPassword: (email: string) =>
    apiRequest<void>('/auth/forgot-password', { method: 'POST', body: { email }, auth: false }),

  resetPassword: (token: string, password: string) =>
    apiRequest<void>('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
      auth: false,
    }),
};
