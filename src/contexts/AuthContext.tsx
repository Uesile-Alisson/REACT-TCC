import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getAccessToken, removeAccessToken, setAccessToken } from '../api/axios';
import { AUTH_UNAUTHORIZED_EVENT } from '../api/auth-events';
import { AuthContext, type AuthContextData, type SignInResult } from './AuthContextValue';
import { authService } from '../services/auth.service';
import type { AuthUser, SignInRequest } from '../types/auth.types';

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setToken] = useState<string | null>(() => getAccessToken());
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(getAccessToken()));

  const signin = useCallback(async (credentials: SignInRequest): Promise<SignInResult> => {
    const auth = await authService.signIn(credentials);
    const isFirstAccess = auth.user.primeiro_acesso;

    setAccessToken(auth.access_token);
    setToken(auth.access_token);
    setUser(auth.user);
    setIsLoading(false);

    return {
      user: auth.user,
      accessToken: auth.access_token,
      isFirstAccess,
      suggestedRedirectPath: isFirstAccess ? '/first-access' : '/dashboard',
    };
  }, []);

  const clearSession = useCallback((): void => {
    removeAccessToken();
    setUser(null);
    setToken(null);
  }, []);

  const logout = useCallback((): void => {
    clearSession();
    setIsLoading(false);
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;
    const storedToken = getAccessToken();

    if (!storedToken) {
      return () => {
        isMounted = false;
      };
    }

    async function hydrateAuthenticatedUser(): Promise<void> {
      try {
        const currentUser = await authService.me();

        if (!isMounted) {
          return;
        }

        setToken(storedToken);
        setUser(currentUser);
      } catch {
        if (!isMounted) {
          return;
        }

        clearSession();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void hydrateAuthenticatedUser();

    return () => {
      isMounted = false;
    };
  }, [clearSession]);

  useEffect(() => {
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, logout);

    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const completeFirstAccess = useCallback((): void => {
    setUser((currentUser) =>
      currentUser ? { ...currentUser, primeiro_acesso: false } : currentUser,
    );
  }, []);

  const value = useMemo<AuthContextData>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      isLoading,
      isFirstAccess: Boolean(user?.primeiro_acesso),
      signin,
      completeFirstAccess,
      logout,
    }),
    [accessToken, completeFirstAccess, isLoading, logout, signin, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
