import { apiRequest } from '@/lib/api-client';
import type { AuthResponse, OnboardingInput, UpdateProfileInput, User } from '@/types/user';

export const usersService = {
  getMe: (signal?: AbortSignal) => apiRequest<User>('/users/me', { signal }),

  updateProfile: (input: UpdateProfileInput) =>
    apiRequest<User>('/users/me/profile', { method: 'PATCH', body: input }),

  completeOnboarding: (input: OnboardingInput) =>
    apiRequest<User>('/users/me/onboarding', { method: 'POST', body: input }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<AuthResponse>('/users/me/password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    }),

  deleteAccount: (password: string) =>
    apiRequest<void>('/users/me', { method: 'DELETE', body: { password } }),
};
