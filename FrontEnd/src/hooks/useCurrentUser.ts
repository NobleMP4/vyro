import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { usersService } from '@/services/users.service';
import type { OnboardingInput, UpdateProfileInput, User } from '@/types/user';
import { useAuth } from './useAuth';

/** The signed-in user. Only use below <RequireAuth>, where it is always loaded. */
export function useCurrentUser(): User {
  const { status } = useAuth();
  const { data } = useQuery({
    queryKey: queryKeys.me,
    queryFn: ({ signal }) => usersService.getMe(signal),
    enabled: status === 'authenticated',
    staleTime: 5 * 60_000,
  });
  if (!data) throw new Error('useCurrentUser used without an authenticated session');
  return data;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => usersService.updateProfile(input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.me, user);
      // Goal, target and profile completion feed the dashboard.
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OnboardingInput) => usersService.completeOnboarding(input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.me, user);
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
