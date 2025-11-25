'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface VoiceSettings {
  gender: 'feminine' | 'masculine' | 'neutral';
  style: string;
  speed: number;
  pitch: number;
  volume: number;
}

export interface PersonalizationSettings {
  oracleName: string;
  voice: VoiceSettings;
  relationshipMode: 'companion' | 'guide' | 'mirror' | 'oracle';
  elementalAffinity: 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'balanced';
  visualTheme: 'warm' | 'cool' | 'cosmic' | 'earth' | 'adaptive';
  language: string;
  timezone: string;
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    screenReaderMode: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

interface PersonalizationContextType {
  settings: PersonalizationSettings;
  updateSettings: (updates: Partial<PersonalizationSettings>) => Promise<void>;
  resetToDefaults: () => void;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const defaultSettings: PersonalizationSettings = {
  oracleName: 'Maya',
  voice: {
    gender: 'feminine',
    style: 'warm-guide',
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8
  },
  relationshipMode: 'companion',
  elementalAffinity: 'balanced',
  visualTheme: 'adaptive',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    screenReaderMode: false,
    fontSize: 'medium'
  }
};

const PersonalizationContext = createContext<PersonalizationContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
  resetToDefaults: () => {},
  isLoading: false,
  isSaving: false,
  error: null
});

export const usePersonalization = () => {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within PersonalizationProvider');
  }
  return context;
};

interface PersonalizationProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export const PersonalizationProvider: React.FC<PersonalizationProviderProps> = ({ 
  children, 
  userId 
}) => {
  const [settings, setSettings] = useState<PersonalizationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [userId]);

  // Detect system preferences
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setSettings(prev => ({
        ...prev,
        accessibility: { ...prev.accessibility, reducedMotion: true }
      }));
    }

    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    if (contrastQuery.matches) {
      setSettings(prev => ({
        ...prev,
        accessibility: { ...prev.accessibility, highContrast: true }
      }));
    }

    // Check for color scheme preference
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      if (settings.visualTheme === 'adaptive') {
        // Theme will adapt automatically via CSS
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    };
    
    darkModeQuery.addEventListener('change', handleThemeChange);
    return () => darkModeQuery.removeEventListener('change', handleThemeChange);
  }, [settings.visualTheme]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to load from API if user is authenticated
      if (userId) {
        const response = await fetch(`/api/user/personalization`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSettings({ ...defaultSettings, ...data.settings });
          return;
        }
      }

      // Fall back to localStorage
      const localSettings = localStorage.getItem('oracle_personalization');
      if (localSettings) {
        const parsed = JSON.parse(localSettings);
        // Merge with defaults to ensure all fields exist
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (err) {
      console.error('Failed to load personalization settings:', err);
      setError('Failed to load your preferences. Using defaults.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = useCallback(async (updates: Partial<PersonalizationSettings>) => {
    try {
      setIsSaving(true);
      setError(null);

      const newSettings = { ...settings, ...updates };
      
      // Optimistic update
      setSettings(newSettings);

      // Save to API if authenticated
      if (userId) {
        const response = await fetch(`/api/user/personalization`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({ settings: newSettings })
        });

        if (!response.ok) {
          throw new Error('Failed to save to server');
        }
      }

      // Always save to localStorage as backup
      localStorage.setItem('oracle_personalization', JSON.stringify(newSettings));

      // Apply accessibility settings immediately
      if (updates.accessibility) {
        applyAccessibilitySettings(newSettings.accessibility);
      }

      // Notify other components of changes
      window.dispatchEvent(new CustomEvent('personalization-updated', { 
        detail: newSettings 
      }));

    } catch (err) {
      console.error('Failed to save personalization settings:', err);
      setError('Failed to save your preferences. Please try again.');
      // Revert optimistic update on error
      setSettings(settings);
    } finally {
      setIsSaving(false);
    }
  }, [settings, userId]);

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem('oracle_personalization');
    applyAccessibilitySettings(defaultSettings.accessibility);
  }, []);

  const applyAccessibilitySettings = (accessibility: PersonalizationSettings['accessibility']) => {
    const root = document.documentElement;
    
    // Apply font size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '20px'
    };
    root.style.setProperty('--base-font-size', fontSizes[accessibility.fontSize]);
    
    // Apply high contrast
    root.setAttribute('data-high-contrast', accessibility.highContrast.toString());
    
    // Apply reduced motion
    root.setAttribute('data-reduced-motion', accessibility.reducedMotion.toString());
    
    // Set ARIA attributes for screen readers
    if (accessibility.screenReaderMode) {
      root.setAttribute('aria-live', 'polite');
      root.setAttribute('role', 'application');
    }
  };

  const value: PersonalizationContextType = {
    settings,
    updateSettings,
    resetToDefaults,
    isLoading,
    isSaving,
    error
  };

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
};