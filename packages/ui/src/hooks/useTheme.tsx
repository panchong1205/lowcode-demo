import React, { useState, createContext, useContext, useCallback } from 'react';
import type { ThemeMode, ThemeVariables } from '../theme';
import { getTheme, lightTheme } from '../theme';

interface ThemeContextValue {
  theme: ThemeVariables;
  mode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  mode: 'light',
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export function ThemeProvider({ children, defaultMode = 'light' }: { children: React.ReactNode; defaultMode?: ThemeMode }) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);
  const theme = getTheme(mode);

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setThemeMode: setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}