// Sovereignty mode: localStorage-only theme persistence (Supabase removed)

export type ThemePreference = 'light' | 'dark' | 'system';

const THEME_KEY = 'maia_theme_preference';

export function getUserThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const v = window.localStorage.getItem(THEME_KEY);
  if (v === 'light' || v === 'dark' || v === 'system') return v;
  return 'system';
}

export function setUserThemePreference(theme: ThemePreference) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(THEME_KEY, theme);
}

export function clearUserThemePreference() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(THEME_KEY);
}
