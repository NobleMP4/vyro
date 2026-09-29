import { Navigate, Outlet, useLocation } from 'react-router';
import { AppBootFallback } from '@/components/feedback/AppBootFallback';
import { useAuth } from '@/hooks/useAuth';
import { paths } from '@/router/paths';

/** Login/register pages: a signed-in user is sent back to where they were going. */
export function GuestOnly() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <AppBootFallback />;
  if (status === 'authenticated') {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? paths.dashboard} replace />;
  }
  return <Outlet />;
}
