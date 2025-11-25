"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ConsciousnessVisualizationSettings {
  oscillatorEnabled: boolean;
  visualizationIntensity: 'subtle' | 'medium' | 'intense';
  elementalVisualization: boolean;
  sacredGeometryDynamics: boolean;
  performanceMode: 'auto' | 'high' | 'low';
}

interface ConsciousnessVisualizationContextType {
  settings: ConsciousnessVisualizationSettings;
  updateSetting: <K extends keyof ConsciousnessVisualizationSettings>(
    key: K,
    value: ConsciousnessVisualizationSettings[K]
  ) => void;
  toggleOscillator: () => void;
  isOscillatorEnabled: boolean;
}

const defaultSettings: ConsciousnessVisualizationSettings = {
  oscillatorEnabled: true, // Default to ON for the enhanced experience
  visualizationIntensity: 'medium',
  elementalVisualization: true,
  sacredGeometryDynamics: true,
  performanceMode: 'auto'
};

const ConsciousnessVisualizationContext = createContext<ConsciousnessVisualizationContextType | undefined>(undefined);

export function ConsciousnessVisualizationProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ConsciousnessVisualizationSettings>(defaultSettings);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('consciousness-visualization-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn('Failed to parse consciousness visualization settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('consciousness-visualization-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof ConsciousnessVisualizationSettings>(
    key: K,
    value: ConsciousnessVisualizationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleOscillator = () => {
    setSettings(prev => ({ ...prev, oscillatorEnabled: !prev.oscillatorEnabled }));
  };

  const contextValue: ConsciousnessVisualizationContextType = {
    settings,
    updateSetting,
    toggleOscillator,
    isOscillatorEnabled: settings.oscillatorEnabled
  };

  return (
    <ConsciousnessVisualizationContext.Provider value={contextValue}>
      {children}
    </ConsciousnessVisualizationContext.Provider>
  );
}

export function useConsciousnessVisualization() {
  const context = useContext(ConsciousnessVisualizationContext);
  if (context === undefined) {
    throw new Error('useConsciousnessVisualization must be used within a ConsciousnessVisualizationProvider');
  }
  return context;
}