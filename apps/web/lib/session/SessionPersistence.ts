// frontend
// apps/web/lib/session/SessionPersistence.ts

/**
 * Session persistence for MAIA sacred sessions.
 * Handles saving, loading, and managing session state data
 * across browser sessions and page reloads.
 */

import type { SessionPreset } from './SessionTimer';

export interface SessionData {
  /**
   * Session identifier
   */
  id: string;

  /**
   * When the session was created
   */
  createdAt: Date;

  /**
   * When the session was last updated
   */
  updatedAt: Date;

  /**
   * Session preset used
   */
  preset?: SessionPreset;

  /**
   * Duration in minutes
   */
  duration: number;

  /**
   * Whether the session is currently active
   */
  isActive: boolean;

  /**
   * Start time of the session
   */
  startTime?: Date;

  /**
   * End time of the session (if completed)
   */
  endTime?: Date;

  /**
   * Remaining time in seconds (if paused/resumed)
   */
  remainingTime?: number;

  /**
   * Session notes or reflections
   */
  notes?: string;

  /**
   * Session metadata
   */
  metadata?: {
    location?: string;
    intention?: string;
    mood?: string;
    [key: string]: any;
  };
}

export interface SessionSummary {
  id: string;
  createdAt: Date;
  duration: number;
  preset?: SessionPreset;
  completed: boolean;
}

/**
 * Storage keys for session persistence
 */
const STORAGE_KEYS = {
  CURRENT_SESSION: 'maia_current_session',
  SESSION_HISTORY: 'maia_session_history',
  SESSION_PREFERENCES: 'maia_session_preferences',
} as const;

/**
 * Maximum number of sessions to keep in history
 */
const MAX_SESSION_HISTORY = 50;

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safe JSON parsing with fallback
 */
function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    const parsed = JSON.parse(json);
    // Convert date strings back to Date objects
    if (parsed && typeof parsed === 'object') {
      ['createdAt', 'updatedAt', 'startTime', 'endTime'].forEach(key => {
        if (parsed[key] && typeof parsed[key] === 'string') {
          parsed[key] = new Date(parsed[key]);
        }
      });
    }
    return parsed;
  } catch {
    return fallback;
  }
}

/**
 * Load the current active session from localStorage
 */
export function loadSession(): SessionData | null {
  if (typeof window === 'undefined') {
    return null; // Server-side safety
  }

  try {
    const sessionJson = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    return safeJsonParse(sessionJson, null);
  } catch (error) {
    console.warn('[SessionPersistence] Failed to load session:', error);
    return null;
  }
}

/**
 * Save session data to localStorage
 */
export function saveSession(session: SessionData): boolean {
  if (typeof window === 'undefined') {
    return false; // Server-side safety
  }

  try {
    // Update timestamp
    session.updatedAt = new Date();

    // Save current session
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));

    // Also add to session history if completed
    if (!session.isActive && session.endTime) {
      addToSessionHistory(session);
    }

    return true;
  } catch (error) {
    console.warn('[SessionPersistence] Failed to save session:', error);
    return false;
  }
}

/**
 * Clear the current session from localStorage
 */
export function clearSession(): boolean {
  if (typeof window === 'undefined') {
    return false; // Server-side safety
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    return true;
  } catch (error) {
    console.warn('[SessionPersistence] Failed to clear session:', error);
    return false;
  }
}

/**
 * Create a new session with initial data
 */
export function createSession(preset?: SessionPreset, duration?: number): SessionData {
  const now = new Date();
  return {
    id: generateSessionId(),
    createdAt: now,
    updatedAt: now,
    preset,
    duration: duration || preset?.duration || 20,
    isActive: false,
  };
}

/**
 * Start an existing session
 */
export function startSession(session: SessionData): SessionData {
  const updatedSession: SessionData = {
    ...session,
    isActive: true,
    startTime: new Date(),
    updatedAt: new Date(),
  };

  saveSession(updatedSession);
  return updatedSession;
}

/**
 * End an existing session
 */
export function endSession(session: SessionData, notes?: string): SessionData {
  const updatedSession: SessionData = {
    ...session,
    isActive: false,
    endTime: new Date(),
    updatedAt: new Date(),
    notes: notes || session.notes,
  };

  saveSession(updatedSession);
  return updatedSession;
}

/**
 * Update session with new data
 */
export function updateSession(session: SessionData, updates: Partial<SessionData>): SessionData {
  const updatedSession: SessionData = {
    ...session,
    ...updates,
    updatedAt: new Date(),
  };

  saveSession(updatedSession);
  return updatedSession;
}

/**
 * Add a session to the session history
 */
function addToSessionHistory(session: SessionData): void {
  try {
    const historyJson = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
    const history: SessionSummary[] = safeJsonParse(historyJson, []);

    const summary: SessionSummary = {
      id: session.id,
      createdAt: session.createdAt,
      duration: session.duration,
      preset: session.preset,
      completed: !session.isActive && !!session.endTime,
    };

    // Add to beginning of history
    history.unshift(summary);

    // Limit history size
    if (history.length > MAX_SESSION_HISTORY) {
      history.splice(MAX_SESSION_HISTORY);
    }

    localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.warn('[SessionPersistence] Failed to add to session history:', error);
  }
}

/**
 * Get session history
 */
export function getSessionHistory(): SessionSummary[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const historyJson = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
    return safeJsonParse(historyJson, []);
  } catch (error) {
    console.warn('[SessionPersistence] Failed to load session history:', error);
    return [];
  }
}

/**
 * Clear all session data (current session + history)
 */
export function clearAllSessionData(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    localStorage.removeItem(STORAGE_KEYS.SESSION_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.SESSION_PREFERENCES);
    return true;
  } catch (error) {
    console.warn('[SessionPersistence] Failed to clear all session data:', error);
    return false;
  }
}

/**
 * Check if there's a recoverable session (interrupted/crashed)
 */
export function hasRecoverableSession(): boolean {
  const session = loadSession();
  return !!(session?.isActive && session.startTime);
}

/**
 * Get recovery information for an interrupted session
 */
export function getRecoveryInfo(): { session: SessionData; minutesElapsed: number } | null {
  const session = loadSession();

  if (!session?.isActive || !session.startTime) {
    return null;
  }

  const now = new Date();
  const startTime = new Date(session.startTime);
  const minutesElapsed = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));

  return { session, minutesElapsed };
}

/**
 * Auto-save session state at regular intervals
 */
let autoSaveInterval: number | null = null;

export function startAutoSave(session: SessionData, intervalMs: number = 30000): void {
  if (typeof window === 'undefined') {
    return; // Server-side safety
  }

  // Clear existing interval
  if (autoSaveInterval !== null) {
    clearInterval(autoSaveInterval);
  }

  // Start new auto-save interval
  autoSaveInterval = window.setInterval(() => {
    if (session.isActive) {
      saveSession(session);
    }
  }, intervalMs);

  console.log('🔄 [SessionPersistence] Auto-save started');
}

/**
 * Stop auto-save functionality
 */
export function stopAutoSave(): void {
  if (autoSaveInterval !== null) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
    console.log('🛑 [SessionPersistence] Auto-save stopped');
  }
}

/**
 * Get remaining time from saved session in seconds
 */
export function getSavedSessionTimeRemaining(): number {
  const session = loadSession();

  if (!session?.isActive || !session.startTime) {
    return 0;
  }

  const now = new Date();
  const startTime = new Date(session.startTime);
  const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
  const totalSeconds = session.duration * 60; // Convert minutes to seconds

  return Math.max(0, totalSeconds - elapsedSeconds);
}

/**
 * Get current session phase based on elapsed time
 */
export function getSavedSessionPhase(): 'opening' | 'deepening' | 'integration' | 'closing' | 'complete' {
  const session = loadSession();

  if (!session?.isActive || !session.startTime) {
    return 'complete';
  }

  const now = new Date();
  const startTime = new Date(session.startTime);
  const elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
  const totalMinutes = session.duration;
  const progress = elapsedMinutes / totalMinutes;

  if (progress < 0.1) return 'opening';
  if (progress < 0.7) return 'deepening';
  if (progress < 0.9) return 'integration';
  if (progress < 1.0) return 'closing';
  return 'complete';
}