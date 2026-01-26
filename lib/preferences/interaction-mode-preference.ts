/**
 * Interaction Mode Preference
 * Persists the user's preferred MAIA interaction mode (Talk/Care/Note)
 */

export type InteractionMode = 'dialogue' | 'counsel' | 'scribe';

const STORAGE_KEY = 'maia_interaction_mode';
const DEFAULT_MODE: InteractionMode = 'dialogue';

/**
 * Get the saved interaction mode from localStorage
 */
export function getInteractionMode(): InteractionMode {
  if (typeof window === 'undefined') return DEFAULT_MODE;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['dialogue', 'counsel', 'scribe'].includes(stored)) {
      return stored as InteractionMode;
    }
  } catch (e) {
    console.warn('[InteractionMode] Failed to read from localStorage:', e);
  }

  return DEFAULT_MODE;
}

/**
 * Save the interaction mode to localStorage
 */
export function setInteractionMode(mode: InteractionMode): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, mode);
    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('maia-mode-changed', { detail: { mode } }));
  } catch (e) {
    console.warn('[InteractionMode] Failed to save to localStorage:', e);
  }
}

/**
 * Subscribe to mode changes
 */
export function onInteractionModeChange(callback: (mode: InteractionMode) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: CustomEvent<{ mode: InteractionMode }>) => {
    callback(e.detail.mode);
  };

  window.addEventListener('maia-mode-changed', handler as EventListener);

  return () => {
    window.removeEventListener('maia-mode-changed', handler as EventListener);
  };
}

/**
 * Get user-friendly label for a mode
 */
export function getModeLabel(mode: InteractionMode): string {
  switch (mode) {
    case 'dialogue': return 'Talk';
    case 'counsel': return 'Care';
    case 'scribe': return 'Note';
    default: return 'Talk';
  }
}

/**
 * Get description for a mode
 */
export function getModeDescription(mode: InteractionMode): string {
  switch (mode) {
    case 'dialogue': return 'Peer presence in conversation';
    case 'counsel': return 'Therapeutic guidance and support';
    case 'scribe': return 'Capture and witness patterns';
    default: return '';
  }
}
