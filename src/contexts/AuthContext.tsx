import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getAccessToken, removeAccessToken, setAccessToken } from '../api/axios';
import { authService } from '../services/auth.service';
import type { AuthUser, SignInRequest } from '../types/auth.types';

type SignInResult = {
  user: AuthUser;
  accessToken: string;
  isFirstAccess: boolean;
  suggestedRedirectPath: '/first-access' | '/dashboard';
};

type AuthProviderProps = {
  children: ReactNode;
};

export type AuthContextData = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirstAccess: boolean;
  signin: (credentials: SignInRequest) => Promise<SignInResult>;
  completeFirstAccess: () => void;
  logout: () => void;
};

// AuthContext is exported so the dedicated useAuth hook can consume the provider state.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setToken] = useState<string | null>(() => getAccessToken());
  const [isLoading] = useState<boolean>(false);
  // Future improvement: validate the stored JWT and hydrate the user via a /me endpoint.

  const signin = useCallback(async (credentials: SignInRequest): Promise<SignInResult> => {
    const auth = await authService.signIn(credentials);
    const isFirstAccess = auth.user.primeiro_acesso;

    setAccessToken(auth.access_token);
    setToken(auth.access_token);
    setUser(auth.user);

    return {
      user: auth.user,
      accessToken: auth.access_token,
      isFirstAccess,
      suggestedRedirectPath: isFirstAccess ? '/first-access' : '/dashboard',
    };
  }, []);

  const logout = useCallback((): void => {
    removeAccessToken();
    setUser(null);
    setToken(null);
  }, []);

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
