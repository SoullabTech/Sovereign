'use client';
import React from 'react';
import RefreshButton from './components/RefreshButton';
import ElementalThemeSelector from './components/ElementalThemeSelector';
import { ElementalThemeProvider } from './context/ElementalThemeContext';
import ExportControls from './components/ExportControls';
import SystemHealthWidget from './components/SystemHealthWidget';

export default function AnalyticsDashboardClient() {
  return (
    <ElementalThemeProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
            MAIA Analytics Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <ExportControls />
            <ElementalThemeSelector />
            <RefreshButton />
          </div>
        </div>
        <div className="rounded-xl bg-white dark:bg-gray-900 shadow p-6">
          <SystemHealthWidget />
        </div>
        <div className="rounded-xl bg-white dark:bg-gray-900 shadow p-6">
          <p className="text-gray-700 dark:text-gray-300">
            Overview metrics load server-side for instant visibility.
          </p>
        </div>
      </div>
    </ElementalThemeProvider>
  );
}
