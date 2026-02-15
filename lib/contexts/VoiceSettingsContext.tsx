'use client';

/**
 * SOVEREIGNTY: No vendor names. No provider nouns. No trust leaks.
 * Provider types are sovereign archetypes from lib/voice/sovereignVoices.ts
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { VoiceProvider } from '@/lib/voice/sovereignVoices';

interface VoiceSettings {
  adaptiveMode: boolean;
  silenceTimeout: number;
  minSpeechLength: number;
  voiceProvider: VoiceProvider;
  voiceSpeed: number;
  voiceModel: string;
}

interface VoiceSettingsContextType {
  settings: VoiceSettings;
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
  toggleAdaptiveMode: () => void;
  isLoading: boolean;
  error: string | null;
}

const VoiceSettingsContext = createContext<VoiceSettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: VoiceSettings = {
  adaptiveMode: true, // Default to adaptive mode for better UX
  silenceTimeout: 5000, // Strict mode fallback timeout
  minSpeechLength: 2000, // Minimum speech duration
  voiceProvider: 'sovereign', // Sovereign local-first voice synthesis
  voiceSpeed: 0.95, // Natural conversational pace
  voiceModel: 'maia_core' // Default sovereign voice identity
};

export function VoiceSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings from localStorage on mount, migrating legacy vendor names
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('voiceSettings');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Migrate legacy vendor names (openai → sovereign, tts-1-hd → maia_core)
          const PROVIDER_MAP: Record<string, VoiceProvider> = {
            openai: 'sovereign', elevenlabs: 'sovereign', neural: 'sovereign',
            webspeech: 'browser', web_speech: 'browser',
          };
          const MODEL_MAP: Record<string, string> = {
            'tts-1': 'maia_core', 'tts-1-hd': 'maia_core',
          };
          const migrated = {
            ...DEFAULT_SETTINGS,
            ...parsed,
            voiceProvider: PROVIDER_MAP[parsed.voiceProvider] ?? parsed.voiceProvider ?? 'sovereign',
            voiceModel: MODEL_MAP[parsed.voiceModel] ?? parsed.voiceModel ?? 'maia_core',
          };
          setSettings(migrated);
          // Persist the migration so it only runs once
          if (parsed.voiceProvider !== migrated.voiceProvider || parsed.voiceModel !== migrated.voiceModel) {
            localStorage.setItem('voiceSettings', JSON.stringify(migrated));
          }
        }
      } catch (err) {
        console.warn('Failed to load voice settings from localStorage:', err);
        setError('Failed to load saved settings');
        setTimeout(() => setError(null), 3000);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<VoiceSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('voiceSettings', JSON.stringify(updatedSettings));
        } catch (err) {
          console.warn('Failed to save voice settings to localStorage:', err);
          setError('Failed to save settings');
          setTimeout(() => setError(null), 3000);
        }
      }

      // Dispatch event for other components to react to settings change
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('voice-settings-changed', {
          detail: updatedSettings
        }));
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Something went wrong updating settings');
      setTimeout(() => setError(null), 3000);
    }
  };

  const toggleAdaptiveMode = () => {
    updateSettings({ adaptiveMode: !settings.adaptiveMode });
  };

  return (
    <VoiceSettingsContext.Provider value={{
      settings,
      updateSettings,
      toggleAdaptiveMode,
      isLoading,
      error
    }}>
      {children}
    </VoiceSettingsContext.Provider>
  );
}

export function useVoiceSettings() {
  const context = useContext(VoiceSettingsContext);
  if (context === undefined) {
    // Return a fallback for when not wrapped in provider
    return {
      settings: DEFAULT_SETTINGS,
      updateSettings: () => console.warn('VoiceSettings: No provider found'),
      toggleAdaptiveMode: () => console.warn('VoiceSettings: No provider found'),
      isLoading: false,
      error: null
    };
  }
  return context;
}

// Export default settings for use in other components
export { DEFAULT_SETTINGS };