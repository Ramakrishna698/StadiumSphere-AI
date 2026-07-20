import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { authenticationApi } from '@/services/api-client';
import type { UserProfile } from '@/services/api-client';

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF' | 'USER';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  register(email: string, password: string, role?: string): Promise<void>;
  user: UserProfile | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PERSONA_KEY = 'stadiumsphere-persona';

export function getStoredPersona(): UserRole | null {
  const value = window.localStorage.getItem(PERSONA_KEY);
  return value === 'ADMIN' || value === 'USER' ? value : null;
}

export function setStoredPersona(role: UserRole): void {
  window.localStorage.setItem(PERSONA_KEY, role);
}

export function clearStoredPersona(): void {
  window.localStorage.removeItem(PERSONA_KEY);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* Session restore on mount */
  useEffect(() => {
    if (!authenticationApi.hasTokens()) {
      setIsLoading(false);
      return;
    }

    authenticationApi
      .getMe()
      .then((profile) => {
        setUser(profile);
        setStoredPersona(profile.role as UserRole);
      })
      .catch(() => {
        /* Token invalid or expired; try refresh */
        authenticationApi
          .refresh()
          .then(() => authenticationApi.getMe())
          .then((profile) => {
            setUser(profile);
            setStoredPersona(profile.role as UserRole);
          })
          .catch(() => {
            /* Refresh also failed — clear session */
            void authenticationApi.logout();
            setUser(null);
          });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await authenticationApi.login(email, password);
    const profile = await authenticationApi.getMe();
    setUser(profile);
    setStoredPersona(profile.role as UserRole);
  }, []);

  const register = useCallback(async (email: string, password: string, role?: string) => {
    await authenticationApi.register(email, password, role);
    const profile = await authenticationApi.getMe();
    setUser(profile);
    setStoredPersona(profile.role as UserRole);
  }, []);

  const logout = useCallback(async () => {
    await authenticationApi.logout();
    setUser(null);
    clearStoredPersona();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: user !== null,
      isLoading,
      login,
      logout,
      register,
      user,
    }),
    [isLoading, login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === 'ADMIN' || user?.role === 'MANAGER';
}
