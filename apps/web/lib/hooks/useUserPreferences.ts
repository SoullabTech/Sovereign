// lib/hooks/useUserPreferences.ts
// React hook for seamless user preference management

import { useEffect, useState, useCallback } from 'react';
import { userPreferenceService, type UserPreferences } from '../services/userPreferenceService';
import type { VoiceMode, InteractionMode } from '../agents/modules/VoiceSelectionUI';

interface UseUserPreferencesReturn {
  // Current values
  voiceId: string;
  voiceMode: VoiceMode;
  interactionMode: InteractionMode;
  customWakeWord?: string;
  nudgesEnabled: boolean;
  elementalAffinities: Record<string, number>;
  journeyProgress: {
    daysCompleted: number;
    currentPhase: string;
    favoriteElement?: string;
  };

  // State management
  loading: boolean;
  error: string | null;

  // Update functions
  setVoiceId: (id: string) => Promise<void>;
  setVoiceMode: (mode: VoiceMode) => Promise<void>;
  setInteractionMode: (mode: InteractionMode) => Promise<void>;
  setCustomWakeWord: (word: string) => Promise<void>;
  setNudgesEnabled: (enabled: boolean) => Promise<void>;
  updateElementalAffinity: (element: string, delta: number) => Promise<void>;
  updateJourneyProgress: (progress: Partial<UserPreferences['journeyProgress']>) => Promise<void>;

  // Utility functions
  refresh: () => Promise<void>;
  getMostResonantElement: () => string;
  exportData: () => Promise<any>;
  deleteData: () => Promise<boolean>;
}

/**
 * Hook for managing user preferences with Supabase persistence
 */
export function useUserPreferences(userId: string): UseUserPreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load preferences on mount
  const loadPreferences = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const prefs = await userPreferenceService.getUserPreferences(userId);
      setPreferences(prefs);
    } catch (err) {
      console.error('Failed to load user preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Generic update function
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!userId || !preferences) return;

    try {
      const updated = await userPreferenceService.updateUserPreferences(userId, updates);
      setPreferences(updated);
    } catch (err) {
      console.error('Failed to update preferences:', err);
      setError('Failed to update preferences');
    }
  }, [userId, preferences]);

  // Specific update functions
  const setVoiceId = useCallback(async (voiceProfileId: string) => {
    await updatePreferences({ voiceProfileId });
  }, [updatePreferences]);

  const setVoiceMode = useCallback(async (voiceMode: VoiceMode) => {
    await updatePreferences({ voiceMode });
  }, [updatePreferences]);

  const setInteractionMode = useCallback(async (interactionMode: InteractionMode) => {
    await updatePreferences({ interactionMode });
  }, [updatePreferences]);

  const setCustomWakeWord = useCallback(async (customWakeWord: string) => {
    await updatePreferences({ customWakeWord });
  }, [updatePreferences]);

  const setNudgesEnabled = useCallback(async (nudgesEnabled: boolean) => {
    await updatePreferences({ nudgesEnabled });
  }, [updatePreferences]);

  const updateElementalAffinity = useCallback(async (element: string, delta: number) => {
    if (!userId) return;
    await userPreferenceService.updateElementalAffinities(userId, element, delta);
    await loadPreferences(); // Reload to get updated affinities
  }, [userId, loadPreferences]);

  const updateJourneyProgress = useCallback(async (progress: Partial<UserPreferences['journeyProgress']>) => {
    if (!userId) return;
    await userPreferenceService.updateJourneyProgress(userId, progress);
    await loadPreferences(); // Reload to get updated progress
  }, [userId, loadPreferences]);

  // Utility functions
  const getMostResonantElement = useCallback(() => {
    if (!preferences?.elementalAffinities) return 'fire';

    let maxElement = 'fire';
    let maxValue = 0;

    Object.entries(preferences.elementalAffinities).forEach(([element, value]) => {
      if (value > maxValue) {
        maxElement = element;
        maxValue = value;
      }
    });

    return maxElement;
  }, [preferences]);

  const exportData = useCallback(async () => {
    if (!userId) return null;
    return await userPreferenceService.exportUserData(userId);
  }, [userId]);

  const deleteData = useCallback(async () => {
    if (!userId) return false;
    const result = await userPreferenceService.deleteUserData(userId);
    if (result) {
      setPreferences(null);
    }
    return result;
  }, [userId]);

  // Default values when loading or no preferences
  const defaultPrefs = {
    voiceId: 'maya-alloy',
    voiceMode: 'push-to-talk' as VoiceMode,
    interactionMode: 'conversational' as InteractionMode,
    nudgesEnabled: true,
    elementalAffinities: { fire: 0, water: 0, earth: 0, air: 0, aether: 0 },
    journeyProgress: { daysCompleted: 0, currentPhase: 'initiation' }
  };

  return {
    // Current values
    voiceId: preferences?.voiceProfileId || defaultPrefs.voiceId,
    voiceMode: preferences?.voiceMode || defaultPrefs.voiceMode,
    interactionMode: preferences?.interactionMode || defaultPrefs.interactionMode,
    customWakeWord: preferences?.customWakeWord,
    nudgesEnabled: preferences?.nudgesEnabled ?? defaultPrefs.nudgesEnabled,
    elementalAffinities: preferences?.elementalAffinities || defaultPrefs.elementalAffinities,
    journeyProgress: preferences?.journeyProgress || defaultPrefs.journeyProgress,

    // State management
    loading,
    error,

    // Update functions
    setVoiceId,
    setVoiceMode,
    setInteractionMode,
    setCustomWakeWord,
    setNudgesEnabled,
    updateElementalAffinity,
    updateJourneyProgress,

    // Utility functions
    refresh: loadPreferences,
    getMostResonantElement,
    exportData,
    deleteData
  };
}

/**
 * Hook for voice configuration only (lighter version)
 */
export function useVoiceConfig(userId: string) {
  const {
    voiceId,
    voiceMode,
    interactionMode,
    customWakeWord,
    nudgesEnabled,
    setVoiceId,
    setVoiceMode,
    setInteractionMode,
    setCustomWakeWord,
    setNudgesEnabled,
    loading,
    error
  } = useUserPreferences(userId);

  return {
    voiceId,
    voiceMode,
    interactionMode,
    customWakeWord,
    nudgesEnabled,
    setVoiceId,
    setVoiceMode,
    setInteractionMode,
    setCustomWakeWord,
    setNudgesEnabled,
    loading,
    error
  };
}

/**
 * Hook for journey tracking only
 */
export function useJourneyTracking(userId: string) {
  const {
    elementalAffinities,
    journeyProgress,
    updateElementalAffinity,
    updateJourneyProgress,
    getMostResonantElement,
    loading,
    error
  } = useUserPreferences(userId);

  return {
    elementalAffinities,
    journeyProgress,
    updateElementalAffinity,
    updateJourneyProgress,
    getMostResonantElement,
    loading,
    error
  };
}