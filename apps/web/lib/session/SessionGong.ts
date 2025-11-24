// frontend
// apps/web/lib/session/SessionGong.ts

/**
 * Session Gong functionality for MAIA sacred sessions.
 * Provides sound markers for session transitions, time awareness,
 * and sacred container management.
 */

export type GongSound = 'opening' | 'closing' | 'interval' | 'gentle-reminder' | 'transition';

export interface SessionGongConfig {
  /**
   * Whether gong sounds are enabled
   */
  enabled: boolean;

  /**
   * Volume level (0.0 to 1.0)
   */
  volume: number;

  /**
   * Which gong sounds to play during session
   */
  sounds: {
    opening?: boolean;
    closing?: boolean;
    intervals?: boolean;
    reminders?: boolean;
  };

  /**
   * Interval for gentle time reminders in minutes
   */
  reminderInterval?: number;

  /**
   * Custom gong sound URLs or identifiers
   */
  customSounds?: Partial<Record<GongSound, string>>;
}

export interface SessionGong {
  /**
   * Current configuration
   */
  config: SessionGongConfig;

  /**
   * Play a specific gong sound
   */
  play: (sound: GongSound) => Promise<void>;

  /**
   * Update gong configuration
   */
  updateConfig: (config: Partial<SessionGongConfig>) => void;

  /**
   * Check if gong is available (audio context, permissions, etc.)
   */
  isAvailable: () => boolean;

  /**
   * Prepare gong for session (preload sounds, etc.)
   */
  prepare: () => Promise<void>;

  /**
   * Cleanup resources
   */
  cleanup: () => void;
}

/**
 * Default configuration for session gongs
 */
export const DEFAULT_GONG_CONFIG: SessionGongConfig = {
  enabled: false, // Conservative default - user must opt-in
  volume: 0.6,
  sounds: {
    opening: true,
    closing: true,
    intervals: false,
    reminders: false,
  },
  reminderInterval: 10, // 10 minutes
};

/**
 * Create a session gong instance for sacred session management.
 *
 * @param volumeOrConfig Volume level (0-1) or full configuration object
 * @returns SessionGong instance
 */
export function getSessionGong(volumeOrConfig?: number | Partial<SessionGongConfig>): SessionGong {
  // Handle both volume number and config object for backward compatibility
  let gongConfig: SessionGongConfig;
  if (typeof volumeOrConfig === 'number') {
    gongConfig = {
      ...DEFAULT_GONG_CONFIG,
      enabled: true,
      volume: Math.max(0, Math.min(1, volumeOrConfig)),
    };
  } else {
    gongConfig = {
      ...DEFAULT_GONG_CONFIG,
      ...volumeOrConfig,
    };
  }

  // Stub implementation - in production would integrate with Web Audio API
  const play = async (sound: GongSound): Promise<void> => {
    if (!gongConfig.enabled) {
      return;
    }

    console.log(`🔔 [SessionGong] Playing ${sound} gong (volume: ${gongConfig.volume})`);

    // Future implementation would:
    // 1. Load audio file for the specific gong sound
    // 2. Create audio context if needed
    // 3. Play with appropriate volume and fade
    // 4. Handle user gesture requirements for audio
  };

  // Convenience methods for specific gong sounds (legacy compatibility)
  const playOpeningGong = async (): Promise<void> => {
    await play('opening');
  };

  const playClosingGong = async (): Promise<void> => {
    await play('closing');
  };

  const updateConfig = (newConfig: Partial<SessionGongConfig>) => {
    Object.assign(gongConfig, newConfig);
  };

  const isAvailable = (): boolean => {
    // In production, would check:
    // - AudioContext availability
    // - User gesture for audio permissions
    // - Sound files loaded
    return typeof window !== 'undefined' && 'AudioContext' in window;
  };

  const prepare = async (): Promise<void> => {
    console.log('🔔 [SessionGong] Preparing gong sounds...');
    // Future: Preload audio files, initialize audio context
  };

  const cleanup = (): void => {
    console.log('🔔 [SessionGong] Cleaning up gong resources');
    // Future: Cleanup audio context, cancel scheduled gongs
  };

  return {
    config: gongConfig,
    play,
    playOpeningGong, // Legacy compatibility method
    playClosingGong, // Legacy compatibility method
    updateConfig,
    isAvailable,
    prepare,
    cleanup,
  };
}

/**
 * Convenience function to create a gong with common session presets
 */
export function createSessionGongWithPreset(preset: 'minimal' | 'standard' | 'full'): SessionGong {
  const presets: Record<string, Partial<SessionGongConfig>> = {
    minimal: {
      enabled: true,
      sounds: {
        opening: true,
        closing: true,
        intervals: false,
        reminders: false,
      },
    },
    standard: {
      enabled: true,
      sounds: {
        opening: true,
        closing: true,
        intervals: true,
        reminders: false,
      },
      reminderInterval: 15,
    },
    full: {
      enabled: true,
      sounds: {
        opening: true,
        closing: true,
        intervals: true,
        reminders: true,
      },
      reminderInterval: 10,
    },
  };

  return getSessionGong(presets[preset]);
}

export default getSessionGong;