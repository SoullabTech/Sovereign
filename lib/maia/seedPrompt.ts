/**
 * Seed Prompt Helper - Shared module for "Take to MAIA" functionality
 *
 * Used by Guide, Academy, and any component that wants to pre-seed
 * a prompt before navigating to /maia.
 *
 * The OracleConversation component consumes these on mount and clears
 * them to ensure one-shot behavior.
 *
 * Supports both simple string prompts and rich seed payloads with
 * source tracking for return-loop functionality.
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rich seed payload for enhanced context passing
 */
export interface SeedPayload {
  /** The prompt text to send to MAIA */
  prompt: string;
  /** Source identifier for return-loop (e.g., 'guide:first-entry', 'academy:grounding') */
  source?: string;
  /** Human-readable source label for MAIA to reference */
  sourceLabel?: string;
  /** Path to return to after session (e.g., '/maia/guide') */
  returnTo?: string;
  /** Optional tone hint for MAIA's response style */
  tone?: 'gentle' | 'direct' | 'exploratory' | 'supportive';
  /** Optional context ID for deeper tracking */
  contextId?: string;
}

/**
 * Consumed seed result - always includes prompt, optionally includes metadata
 */
export interface ConsumedSeed {
  prompt: string;
  source?: string;
  sourceLabel?: string;
  returnTo?: string;
  tone?: string;
  contextId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE KEYS
// ─────────────────────────────────────────────────────────────────────────────

export const MAIA_SEED_PROMPT_KEY = 'maia_seed_prompt';
export const MAIA_SEED_TS_KEY = 'maia_seed_ts';
export const MAIA_SEED_META_KEY = 'maia_seed_meta';

// Max age for seed prompts (10 minutes) - stale seeds are ignored
const SEED_MAX_AGE_MS = 10 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────
// CORE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Store a seed prompt for MAIA to pick up on next load
 *
 * Accepts either a simple string or a rich payload:
 * - seedMaiaPrompt("Hello MAIA")
 * - seedMaiaPrompt({ prompt: "Hello", source: "guide:first-entry", returnTo: "/maia/guide" })
 */
export function seedMaiaPrompt(input: string | SeedPayload): void {
  try {
    const payload: SeedPayload = typeof input === 'string' ? { prompt: input } : input;

    localStorage.setItem(MAIA_SEED_PROMPT_KEY, payload.prompt);
    localStorage.setItem(MAIA_SEED_TS_KEY, String(Date.now()));

    // Store metadata separately if present
    if (payload.source || payload.sourceLabel || payload.returnTo || payload.tone || payload.contextId) {
      const meta = {
        source: payload.source,
        sourceLabel: payload.sourceLabel,
        returnTo: payload.returnTo,
        tone: payload.tone,
        contextId: payload.contextId,
      };
      localStorage.setItem(MAIA_SEED_META_KEY, JSON.stringify(meta));
    } else {
      // Clear any stale metadata
      localStorage.removeItem(MAIA_SEED_META_KEY);
    }
  } catch (e) {
    console.warn('[seedPrompt] Failed to store seed prompt:', e);
  }
}

/**
 * Clear any stored seed prompt and metadata (called after consumption)
 */
export function clearMaiaSeedPrompt(): void {
  try {
    localStorage.removeItem(MAIA_SEED_PROMPT_KEY);
    localStorage.removeItem(MAIA_SEED_TS_KEY);
    localStorage.removeItem(MAIA_SEED_META_KEY);
  } catch {}
}

/**
 * Read and validate a stored seed prompt (legacy simple API)
 * Returns null if no prompt, or if prompt is stale
 *
 * @deprecated Use consumeMaiaSeed() for full payload access
 */
export function consumeMaiaSeedPrompt(): string | null {
  const seed = consumeMaiaSeed();
  return seed?.prompt ?? null;
}

/**
 * Read and validate a stored seed with full metadata
 * Returns null if no prompt, or if prompt is stale
 */
export function consumeMaiaSeed(): ConsumedSeed | null {
  try {
    const prompt = localStorage.getItem(MAIA_SEED_PROMPT_KEY);
    const tsRaw = localStorage.getItem(MAIA_SEED_TS_KEY);
    const metaRaw = localStorage.getItem(MAIA_SEED_META_KEY);

    if (!prompt) return null;

    // Check if stale
    if (tsRaw) {
      const ts = Number(tsRaw);
      if (Number.isFinite(ts)) {
        const ageMs = Date.now() - ts;
        if (ageMs > SEED_MAX_AGE_MS) {
          // Stale - clear and ignore
          clearMaiaSeedPrompt();
          return null;
        }
      }
    }

    // Parse metadata if present
    let meta: Partial<ConsumedSeed> = {};
    if (metaRaw) {
      try {
        meta = JSON.parse(metaRaw);
      } catch {
        // Malformed metadata - ignore
      }
    }

    // Valid prompt - clear first (one-shot guarantee even if send fails)
    clearMaiaSeedPrompt();

    return {
      prompt,
      source: meta.source,
      sourceLabel: meta.sourceLabel,
      returnTo: meta.returnTo,
      tone: meta.tone,
      contextId: meta.contextId,
    };
  } catch (e) {
    console.warn('[seedPrompt] Failed to consume seed prompt:', e);
    return null;
  }
}

/**
 * Check if there's a pending seed prompt (without consuming it)
 */
export function hasPendingSeedPrompt(): boolean {
  try {
    return !!localStorage.getItem(MAIA_SEED_PROMPT_KEY);
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RETURN LOOP HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Store a return-to path for after the current session
 * This is separate from seed prompts - it persists across the session
 */
export function setReturnPath(path: string, label?: string): void {
  try {
    localStorage.setItem('maia_return_path', path);
    if (label) {
      localStorage.setItem('maia_return_label', label);
    }
  } catch {}
}

/**
 * Get the stored return path (if any)
 */
export function getReturnPath(): { path: string; label?: string } | null {
  try {
    const path = localStorage.getItem('maia_return_path');
    if (!path) return null;
    const label = localStorage.getItem('maia_return_label') || undefined;
    return { path, label };
  } catch {
    return null;
  }
}

/**
 * Clear the return path (call when user declines return or navigates away)
 */
export function clearReturnPath(): void {
  try {
    localStorage.removeItem('maia_return_path');
    localStorage.removeItem('maia_return_label');
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE REGISTRY - Human-readable labels for known sources
// ─────────────────────────────────────────────────────────────────────────────

const SOURCE_LABELS: Record<string, { label: string; returnTo: string }> = {
  'guide:first-entry': { label: 'First Entry', returnTo: '/maia/guide' },
  'guide:practice': { label: 'Ways of Practice', returnTo: '/maia/guide' },
  'guide:term': { label: 'Living Terms', returnTo: '/maia/guide' },
  'academy:grounding': { label: 'Grounding Practice', returnTo: '/maia/academy' },
  'academy:discernment': { label: 'Discernment Practice', returnTo: '/maia/academy' },
  'fields:encounter': { label: 'Field Encounter', returnTo: '/maia/fields' },
  'patterns:return': { label: 'Patterns', returnTo: '/worlds/patterns' },
  'relationships:thread': { label: 'Relational Field', returnTo: '/relationships' },
  'reflections:capsule': { label: 'Reflection', returnTo: '/reflections' },
};

/**
 * Get source info from registry (for consistent labeling)
 */
export function getSourceInfo(source: string): { label: string; returnTo: string } | null {
  return SOURCE_LABELS[source] || null;
}

/**
 * Convenience: seed with auto-populated source info from registry
 */
export function seedFromSource(source: string, prompt: string, overrides?: Partial<SeedPayload>): void {
  const info = getSourceInfo(source);
  seedMaiaPrompt({
    prompt,
    source,
    sourceLabel: info?.label || overrides?.sourceLabel,
    returnTo: info?.returnTo || overrides?.returnTo,
    ...overrides,
  });
}
