import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  onSessionExpired,
  onSessionRefreshed,
  refreshSession,
  setSession,
} from '@/lib/auth-session';
import { queryKeys } from '@/lib/query-keys';
import { authService, type LoginInput, type RegisterInput } from '@/services/auth.service';
import type { AuthResponse } from '@/types/user';
import { AuthContext, type AuthStatus } from './auth-context';

/**
 * Owns the authentication status. On start it tries to restore the session
 * from the refresh cookie; the current user is kept in the query cache (`me`).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('loading');

  const applySession = useCallback(
    (session: AuthResponse) => {
      setSession(session);
      queryClient.setQueryData(queryKeys.me, session.user);
      setStatus('authenticated');
    },
    [queryClient],
  );

  const endSession = useCallback(() => {
    setSession(null);
    setStatus('anonymous');
    // Clear private data once the protected screens have unmounted.
    setTimeout(() => queryClient.clear(), 0);
  }, [queryClient]);

  useEffect(() => {
    let active = true;
    refreshSession()
      .then((session) => active && applySession(session))
      .catch(() => active && setStatus('anonymous'));
    const unsubscribeExpired = onSessionExpired(() => active && endSession());
    const unsubscribeRefreshed = onSessionRefreshed((session) =>
      queryClient.setQueryData(queryKeys.me, session.user),
    );
    return () => {
      active = false;
      unsubscribeExpired();
      unsubscribeRefreshed();
    };
  }, [applySession, endSession, queryClient]);

  const login = useCallback(
    async (input: LoginInput) => applySession(await authService.login(input)),
    [applySession],
  );

  const register = useCallback(
    async (input: RegisterInput) => applySession(await authService.register(input)),
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the API is unreachable, the local session must end.
    } finally {
      endSession();
    }
  }, [endSession]);

  const value = useMemo(
    () => ({ status, login, register, logout, applySession, endSession }),
    [status, login, register, logout, applySession, endSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
