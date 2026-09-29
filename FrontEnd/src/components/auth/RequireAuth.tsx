import { Navigate, Outlet, useLocation } from 'react-router';
import { AppBootFallback } from '@/components/feedback/AppBootFallback';
import { useAuth } from '@/hooks/useAuth';
import { paths } from '@/router/paths';

/** Protects every private route: anonymous visitors go to the login page. */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <AppBootFallback />;
  if (status === 'anonymous') {
    return (
      <Navigate to={paths.login} replace state={{ from: location.pathname + location.search }} />
    );
  }
  return <Outlet />;
}
