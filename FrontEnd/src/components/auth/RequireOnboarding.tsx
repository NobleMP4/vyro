import { Navigate, Outlet } from 'react-router';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { paths } from '@/router/paths';

/** New users complete the (short) onboarding before reaching the app. */
export function RequireOnboarding() {
  const user = useCurrentUser();
  if (!user.profile.onboardingCompleted) return <Navigate to={paths.onboarding} replace />;
  return <Outlet />;
}
