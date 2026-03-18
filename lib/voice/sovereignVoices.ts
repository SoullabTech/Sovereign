/**
 * Sovereign Voice Identities — Single Source of Truth
 *
 * No vendor names. No provider nouns. No trust leaks.
 *
 * The UI shows archetypes (Maia Kore, Maia Warm, Atlas, etc.)
 * The backend resolves them to Kokoro voice IDs (local-first)
 * OpenAI voices exist ONLY as a silent cloud fallback — never shown to users.
 *
 * This file is the ONLY place where voice identities are defined.
 * All UI components, settings pages, and voice pickers import from here.
 */

import type { Element } from '@/lib/types/voiceIntent';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type SovereignVoiceId =
  | 'maia_core'
  | 'maia_warm'
  | 'maia_clear'
  | 'atlas'
  | 'atlas_deep';

export type VoiceProvider = 'sovereign' | 'local' | 'browser';

export interface SovereignVoice {
  id: SovereignVoiceId;
  label: string;
  description: string;
  /** Internal Kokoro voice ID — never shown to users */
  kokoro: string;
  /** Internal OpenAI fallback voice — never shown to users */
  openai: string;
  /** Which elements this voice suits best */
  elements: Element[];
}

// ═══════════════════════════════════════════════════════════════
// Voice Definitions
// ═══════════════════════════════════════════════════════════════

export const SOVEREIGN_VOICES: readonly SovereignVoice[] = [
  {
    id: 'maia_core',
    label: 'Maia (Kore)',
    description: 'Steady center. Neutral warmth. Clear attunement.',
    kokoro: 'af_kore',
    openai: 'alloy',
    elements: ['earth', 'aether'],
  },
  {
    id: 'maia_warm',
    label: 'Maia (Warm)',
    description: 'Soft edge. Holds silence well. For when you need room.',
    kokoro: 'af_sarah',
    openai: 'shimmer',
    elements: ['water'],
  },
  {
    id: 'maia_clear',
    label: 'Maia (Clear)',
    description: 'Bright and precise. Cuts through. For direction.',
    kokoro: 'af_bella',
    openai: 'nova',
    elements: ['fire', 'air'],
  },
  {
    id: 'atlas',
    label: 'Atlas',
    description: 'Grounded resonance. Steady weight. Holds the line.',
    kokoro: 'am_adam',
    openai: 'echo',
    elements: ['earth', 'fire'],
  },
  {
    id: 'atlas_deep',
    label: 'Atlas (Deep)',
    description: 'Low and slow. For thresholds and deep water.',
    kokoro: 'am_michael',
    openai: 'onyx',
    elements: ['aether', 'water'],
  },
] as const;

// ═══════════════════════════════════════════════════════════════
// Voice Providers (what the UI shows)
// ═══════════════════════════════════════════════════════════════

export const VOICE_PROVIDERS = [
  {
    id: 'sovereign' as VoiceProvider,
    label: 'Sovereign Voice',
    description: 'Local neural synthesis. Private, no cloud.',
  },
  {
    id: 'browser' as VoiceProvider,
    label: 'Browser Speech',
    description: 'System voices. Instant but basic quality.',
  },
] as const;

// ═══════════════════════════════════════════════════════════════
// Resolution Functions
// ═══════════════════════════════════════════════════════════════

/** Look up a sovereign voice by ID */
export function getSovereignVoice(id: string): SovereignVoice {
  return SOVEREIGN_VOICES.find((v) => v.id === id) ?? SOVEREIGN_VOICES[0];
}

/** Resolve sovereign voice ID to Kokoro voice ID */
export function resolveToKokoro(id: string): string {
  return getSovereignVoice(id).kokoro;
}

/** Resolve sovereign voice ID to OpenAI fallback voice ID (for silent fallback only) */
export function resolveToOpenAI(id: string): string {
  return getSovereignVoice(id).openai;
}

/** Get the best sovereign voice for an element */
export function voiceForElement(element: Element): SovereignVoice {
  return SOVEREIGN_VOICES.find((v) => v.elements.includes(element)) ?? SOVEREIGN_VOICES[0];
}

/**
 * Migrate legacy OpenAI voice IDs to sovereign IDs.
 * Used for database migration and localStorage cleanup.
 */
export function migrateLegacyVoice(legacyVoice: string): SovereignVoiceId {
  const LEGACY_MAP: Record<string, SovereignVoiceId> = {
    alloy: 'maia_core',
    shimmer: 'maia_warm',
    nova: 'maia_clear',
    echo: 'atlas',
    onyx: 'atlas_deep',
    fable: 'maia_clear',
  };
  return LEGACY_MAP[legacyVoice] ?? 'maia_core';
}

/**
 * Migrate legacy provider names to sovereign providers.
 */
export function migrateLegacyProvider(legacyProvider: string): VoiceProvider {
  const LEGACY_MAP: Record<string, VoiceProvider> = {
    openai: 'sovereign',
    neural: 'sovereign',
    elevenlabs: 'sovereign',
    web_speech: 'browser',
    webspeech: 'browser',
  };
  return LEGACY_MAP[legacyProvider] ?? 'sovereign';
}
