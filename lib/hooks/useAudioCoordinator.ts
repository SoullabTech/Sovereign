'use client';

/**
 * Audio Coordinator Hook
 *
 * Provides global coordination for audio playback and recording
 * to enable natural voice interaction flow:
 * - Stop MAIA's voice when user starts speaking
 * - Prevent multiple audio players from conflicting
 * - Enable "push to talk" style interactions
 */

type AudioPlayer = {
  id: string;
  stop: () => void;
};

type AudioListener = (event: AudioEvent) => void;

type AudioEvent = {
  type: 'interrupt' | 'recording_start' | 'recording_stop' | 'playback_start' | 'playback_stop';
  source?: string;
};

class AudioCoordinator {
  private players: Map<string, AudioPlayer> = new Map();
  private listeners: Set<AudioListener> = new Set();
  private isRecording = false;

  /**
   * Register an audio player that can be interrupted
   */
  registerPlayer(id: string, stop: () => void): () => void {
    this.players.set(id, { id, stop });

    // Return cleanup function
    return () => {
      this.players.delete(id);
    };
  }

  /**
   * Stop all currently playing audio
   */
  interruptAll(source?: string) {
    console.log(`[AudioCoordinator] Interrupting ${this.players.size} players from ${source || 'unknown'}`);

    this.players.forEach(player => {
      try {
        player.stop();
      } catch (error) {
        console.error(`[AudioCoordinator] Error stopping player ${player.id}:`, error);
      }
    });

    this.notifyListeners({ type: 'interrupt', source });
  }

  /**
   * Notify that recording has started
   * This automatically interrupts all playback
   */
  startRecording(source?: string) {
    if (!this.isRecording) {
      this.isRecording = true;
      console.log(`[AudioCoordinator] Recording started from ${source || 'unknown'}`);
      this.interruptAll('recording');
      this.notifyListeners({ type: 'recording_start', source });
    }
  }

  /**
   * Notify that recording has stopped
   */
  stopRecording(source?: string) {
    if (this.isRecording) {
      this.isRecording = false;
      console.log(`[AudioCoordinator] Recording stopped from ${source || 'unknown'}`);
      this.notifyListeners({ type: 'recording_stop', source });
    }
  }

  /**
   * Check if currently recording
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Notify playback start
   */
  notifyPlaybackStart(source?: string) {
    this.notifyListeners({ type: 'playback_start', source });
  }

  /**
   * Notify playback stop
   */
  notifyPlaybackStop(source?: string) {
    this.notifyListeners({ type: 'playback_stop', source });
  }

  /**
   * Add event listener
   */
  addListener(listener: AudioListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(event: AudioEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[AudioCoordinator] Error in listener:', error);
      }
    });
  }

  /**
   * Get stats for debugging
   */
  getStats() {
    return {
      activePlayersCount: this.players.size,
      isRecording: this.isRecording,
      listenersCount: this.listeners.size,
      playerIds: Array.from(this.players.keys())
    };
  }
}

// Singleton instance
const globalAudioCoordinator = new AudioCoordinator();

/**
 * Hook to access the global audio coordinator
 */
export function useAudioCoordinator() {
  return globalAudioCoordinator;
}

/**
 * Direct access for non-React code
 */
export const audioCoordinator = globalAudioCoordinator;
