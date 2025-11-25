/**
 * Session Persistence - localStorage integration for session timer
 *
 * Enables sessions to survive page refreshes, browser crashes, and
 * intentional navigation away. When user returns, they can resume
 * exactly where they left off.
 */

import { SessionPhase } from './SessionTimer';

export interface PersistedSessionData {
  startTime: string; // ISO timestamp
  durationMinutes: number;
  userId: string;
  userName: string;
  sessionId: string;
  lastSavedAt: string; // ISO timestamp
  wasExtended: boolean;
  totalExtensionMinutes: number;
}

const STORAGE_KEY = 'maia_active_session';
const MAX_SESSION_AGE_HOURS = 24; // Auto-expire after 24 hours

/**
 * Save current session state to localStorage
 */
export function saveSession(data: PersistedSessionData): void {
  try {
    if (typeof window === 'undefined') return;

    const serialized = JSON.stringify({
      ...data,
      lastSavedAt: new Date().toISOString()
    });

    localStorage.setItem(STORAGE_KEY, serialized);
    console.log('💾 Session saved to localStorage');
  } catch (error) {
    console.warn('Could not save session to localStorage:', error);
  }
}

/**
 * Load saved session from localStorage
 * Returns null if no session, expired, or invalid
 */
export function loadSession(): PersistedSessionData | null {
  try {
    if (typeof window === 'undefined') return null;

    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;

    const data = JSON.parse(serialized) as PersistedSessionData;

    // Check if session is too old (expired)
    const startTime = new Date(data.startTime);
    const now = new Date();
    const ageHours = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    if (ageHours > MAX_SESSION_AGE_HOURS) {
      console.log('⏰ Saved session expired (older than 24 hours)');
      clearSession();
      return null;
    }

    // Check if session is already complete
    const elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
    const totalDuration = data.durationMinutes + data.totalExtensionMinutes;

    if (elapsedMinutes >= totalDuration) {
      console.log('⏰ Saved session already complete');
      clearSession();
      return null;
    }

    console.log('📂 Loaded active session from localStorage:', {
      startTime: data.startTime,
      duration: data.durationMinutes,
      elapsed: Math.floor(elapsedMinutes),
      remaining: Math.floor(totalDuration - elapsedMinutes)
    });

    return data;
  } catch (error) {
    console.warn('Could not load session from localStorage:', error);
    return null;
  }
}

/**
 * Clear saved session from localStorage
 */
export function clearSession(): void {
  try {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Session cleared from localStorage');
  } catch (error) {
    console.warn('Could not clear session from localStorage:', error);
  }
}

/**
 * Check if there's an active session that can be resumed
 */
export function hasActiveSession(): boolean {
  return loadSession() !== null;
}

/**
 * Get human-readable time remaining for saved session
 */
export function getSavedSessionTimeRemaining(): string | null {
  const session = loadSession();
  if (!session) return null;

  const startTime = new Date(session.startTime);
  const now = new Date();
  const elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
  const totalDuration = session.durationMinutes + session.totalExtensionMinutes;
  const remainingMinutes = Math.ceil(totalDuration - elapsedMinutes);

  if (remainingMinutes <= 0) return null;

  if (remainingMinutes === 1) return '1 minute';
  if (remainingMinutes < 60) return `${remainingMinutes} minutes`;

  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;

  if (mins === 0) return hours === 1 ? '1 hour' : `${hours} hours`;
  return `${hours}h ${mins}m`;
}

/**
 * Calculate what phase the saved session is currently in
 */
export function getSavedSessionPhase(): SessionPhase | null {
  const session = loadSession();
  if (!session) return null;

  const startTime = new Date(session.startTime);
  const now = new Date();
  const elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
  const totalDuration = session.durationMinutes + session.totalExtensionMinutes;
  const percentComplete = (elapsedMinutes / totalDuration) * 100;

  if (elapsedMinutes >= totalDuration) return 'complete';
  if (percentComplete >= 85) return 'closure';
  if (percentComplete >= 70) return 'integration';
  if (percentComplete >= 20) return 'exploration';
  return 'opening';
}

/**
 * Auto-save interval helper
 * Returns cleanup function to clear interval
 */
export function startAutoSave(
  getData: () => PersistedSessionData,
  intervalMs: number = 30000 // Save every 30 seconds
): () => void {
  const intervalId = setInterval(() => {
    const data = getData();
    saveSession(data);
  }, intervalMs);

  console.log(`💾 Auto-save enabled (every ${intervalMs / 1000}s)`);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    console.log('💾 Auto-save disabled');
  };
}
