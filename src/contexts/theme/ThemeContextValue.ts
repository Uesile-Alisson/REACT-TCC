import { createContext } from 'react';

export type Theme = 'dark' | 'light';

export type ThemeContextData = {
  theme: Theme;
  isDark: boolean;
  isLight: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextData | null>(null);
