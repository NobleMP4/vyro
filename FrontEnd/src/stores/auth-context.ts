import { createContext } from 'react';
import type { LoginInput, RegisterInput } from '@/services/auth.service';
import type { AuthResponse } from '@/types/user';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

export interface AuthContextValue {
  status: AuthStatus;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  /** Replaces the session (e.g. after a password change returned new tokens). */
  applySession: (session: AuthResponse) => void;
  /** Local sign-out without calling the API (e.g. after account deletion). */
  endSession: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
