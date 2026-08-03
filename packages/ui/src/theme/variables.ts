export interface ThemeVariables {
  primary: string;
  primaryHover: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  bg: string;
  bgSecondary: string;
  text: string;
  textSecondary: string;
  border: string;
  radius: number;
  shadow: string;
}

export const lightTheme: ThemeVariables = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  secondary: '#0891b2',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#ef4444',
  bg: '#f0f4f8',
  bgSecondary: '#ffffff',
  text: '#1a1d23',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  radius: 8,
  shadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
};

export const darkTheme: ThemeVariables = {
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  secondary: '#06b6d4',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  bg: '#0f172a',
  bgSecondary: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#334155',
  radius: 8,
  shadow: '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
};

export type ThemeMode = 'light' | 'dark';

export function getTheme(mode: ThemeMode): ThemeVariables {
  return mode === 'dark' ? darkTheme : lightTheme;
}