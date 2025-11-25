'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface VoiceSettings {
  adaptiveMode: boolean;
  silenceTimeout: number;
  minSpeechLength: number;
  voiceProvider: 'openai' | 'elevenlabs' | 'webspeech';
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
  voiceProvider: 'openai', // Default to OpenAI TTS
  voiceSpeed: 0.95, // Natural conversational pace
  voiceModel: 'tts-1-hd' // High quality model
};

export function VoiceSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('voiceSettings');
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
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