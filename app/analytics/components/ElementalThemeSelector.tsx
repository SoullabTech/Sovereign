'use client';
import React from 'react';
import { useElementalTheme } from '../context/ElementalThemeContext';

export default function ElementalThemeSelector() {
  const { theme, setTheme } = useElementalTheme();
  const themes = ['fire','water','earth','air','aether','balanced'] as const;
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-600 dark:text-gray-300">Theme:</label>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as any)}
        className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
      >
        {themes.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
