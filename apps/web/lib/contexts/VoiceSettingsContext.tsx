'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VoiceSettings {
  adaptiveMode: boolean;
  silenceTimeout: number;
  minSpeechLength: number;
}

interface VoiceSettingsContextType {
  settings: VoiceSettings;
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
  toggleAdaptiveMode: () => void;
}

const VoiceSettingsContext = createContext<VoiceSettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: VoiceSettings = {
  adaptiveMode: true, // Default to adaptive mode for better UX
  silenceTimeout: 5000, // Strict mode fallback timeout
  minSpeechLength: 2000, // Minimum speech duration
};

export function VoiceSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('voiceSettings');
        if (stored) {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }
      } catch (error) {
        console.warn('Failed to load voice settings from localStorage:', error);
      }
    }
    return DEFAULT_SETTINGS;
  });

  const updateSettings = (newSettings: Partial<VoiceSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('voiceSettings', JSON.stringify(updatedSettings));
      } catch (error) {
        console.warn('Failed to save voice settings to localStorage:', error);
      }
    }
  };

  const toggleAdaptiveMode = () => {
    updateSettings({ adaptiveMode: !settings.adaptiveMode });
  };

  return (
    <VoiceSettingsContext.Provider value={{ settings, updateSettings, toggleAdaptiveMode }}>
      {children}
    </VoiceSettingsContext.Provider>
  );
}

export function useVoiceSettings() {
  const context = useContext(VoiceSettingsContext);
  if (context === undefined) {
    throw new Error('useVoiceSettings must be used within a VoiceSettingsProvider');
  }
  return context;
}