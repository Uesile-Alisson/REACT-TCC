import { createContext } from 'react';
import type { AuthUser, SignInRequest } from '../types/auth.types';

export type SignInResult = {
  user: AuthUser;
  accessToken: string;
  isFirstAccess: boolean;
  suggestedRedirectPath: '/first-access' | '/dashboard';
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

export const AuthContext = createContext<AuthContextData | undefined>(undefined);
