'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'balanced';
interface ThemeContextProps {
  theme: Theme;
  setTheme: (t: Theme) => void;
}
const ElementalThemeContext = createContext<ThemeContextProps>({
  theme: 'balanced',
  setTheme: () => {},
});

export const ElementalThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('balanced');
  useEffect(() => {
    const stored = localStorage.getItem('maia_theme');
    if (stored) setTheme(stored as Theme);
  }, []);
  useEffect(() => {
    localStorage.setItem('maia_theme', theme);
    document.body.dataset.theme = theme;
  }, [theme]);
  return (
    <ElementalThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ElementalThemeContext.Provider>
  );
};
export const useElementalTheme = () => useContext(ElementalThemeContext);
