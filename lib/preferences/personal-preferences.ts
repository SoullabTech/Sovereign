/**
 * Personal Preferences
 * "What should MAIA consider in responses?"
 * Persists user preferences that get injected into system prompts
 */

const STORAGE_KEY = 'maia_personal_preferences';
const MAX_LENGTH = 500;

export interface PersonalPreferences {
  content: string;
  updatedAt: string;
}

/**
 * Get the user's personal preferences
 */
export function getPersonalPreferences(): PersonalPreferences | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[PersonalPreferences] Failed to read from localStorage:', e);
  }

  return null;
}

/**
 * Save personal preferences
 */
export function setPersonalPreferences(content: string): void {
  if (typeof window === 'undefined') return;

  const trimmed = content.slice(0, MAX_LENGTH);

  try {
    const prefs: PersonalPreferences = {
      content: trimmed,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('maia-preferences-changed', { detail: prefs }));
  } catch (e) {
    console.warn('[PersonalPreferences] Failed to save to localStorage:', e);
  }
}

/**
 * Get the preferences content as a string (for injection into prompts)
 */
export function getPreferencesText(): string {
  const prefs = getPersonalPreferences();
  return prefs?.content || '';
}

/**
 * Subscribe to preference changes
 */
export function onPreferencesChange(callback: (prefs: PersonalPreferences) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: CustomEvent<PersonalPreferences>) => {
    callback(e.detail);
  };

  window.addEventListener('maia-preferences-changed', handler as EventListener);

  return () => {
    window.removeEventListener('maia-preferences-changed', handler as EventListener);
  };
}

/**
 * Format preferences for system prompt injection
 */
export function formatPreferencesForPrompt(): string {
  const text = getPreferencesText();
  if (!text.trim()) return '';

  return `

## User Preferences
The user has shared these preferences about how they'd like you to respond:

"${text}"

Honor these preferences in your responses while maintaining your core character.`;
}
