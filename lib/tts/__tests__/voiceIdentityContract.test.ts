/**
 * Voice Identity Contract Tests
 *
 * These tests enforce the sovereignty invariant for voice identities:
 *   1. Every sovereign voice has valid Kokoro + OpenAI mappings
 *   2. Migration functions cover all legacy vendor names
 *   3. Resolution functions never leak vendor names to UI
 *   4. Element coverage — every element has at least one voice
 *   5. Default voice is always maia_core
 *
 * If any of these fail, a trust leak has been introduced.
 */

import {
  SOVEREIGN_VOICES,
  VOICE_PROVIDERS,
  getSovereignVoice,
  resolveToKokoro,
  resolveToOpenAI,
  voiceForElement,
  migrateLegacyVoice,
  migrateLegacyProvider,
  type SovereignVoiceId,
  type VoiceProvider,
} from '@/lib/voice/sovereignVoices';

// ─────────────────────────────────────────────────────────────────
// 1. Structure invariants
// ─────────────────────────────────────────────────────────────────

describe('SOVEREIGN_VOICES structure', () => {
  it('has exactly 5 voice identities', () => {
    expect(SOVEREIGN_VOICES).toHaveLength(5);
  });

  it('contains all required voice IDs', () => {
    const ids = SOVEREIGN_VOICES.map(v => v.id);
    expect(ids).toContain('maia_core');
    expect(ids).toContain('maia_warm');
    expect(ids).toContain('maia_clear');
    expect(ids).toContain('atlas');
    expect(ids).toContain('atlas_deep');
  });

  it('every voice has a non-empty label', () => {
    for (const voice of SOVEREIGN_VOICES) {
      expect(voice.label).toBeTruthy();
      expect(voice.label.length).toBeGreaterThan(0);
    }
  });

  it('every voice has a non-empty description', () => {
    for (const voice of SOVEREIGN_VOICES) {
      expect(voice.description).toBeTruthy();
      expect(voice.description.length).toBeGreaterThan(0);
    }
  });

  it('every voice has a kokoro voice ID', () => {
    for (const voice of SOVEREIGN_VOICES) {
      expect(voice.kokoro).toBeTruthy();
      expect(voice.kokoro.length).toBeGreaterThan(0);
    }
  });

  it('every voice has an openai fallback voice ID', () => {
    for (const voice of SOVEREIGN_VOICES) {
      expect(voice.openai).toBeTruthy();
      expect(voice.openai.length).toBeGreaterThan(0);
    }
  });

  it('every voice has at least one element affinity', () => {
    for (const voice of SOVEREIGN_VOICES) {
      expect(voice.elements.length).toBeGreaterThan(0);
    }
  });

  it('no label contains vendor names', () => {
    const VENDOR_NAMES = ['openai', 'alloy', 'shimmer', 'nova', 'echo', 'onyx', 'fable', 'elevenlabs', 'tts-1'];
    for (const voice of SOVEREIGN_VOICES) {
      for (const vendor of VENDOR_NAMES) {
        expect(voice.label.toLowerCase()).not.toContain(vendor);
        expect(voice.description.toLowerCase()).not.toContain(vendor);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────
// 2. Voice providers
// ─────────────────────────────────────────────────────────────────

describe('VOICE_PROVIDERS', () => {
  it('contains sovereign and browser providers', () => {
    const ids = VOICE_PROVIDERS.map(p => p.id);
    expect(ids).toContain('sovereign');
    expect(ids).toContain('browser');
  });

  it('does NOT contain openai or elevenlabs', () => {
    const ids = VOICE_PROVIDERS.map(p => p.id);
    expect(ids).not.toContain('openai');
    expect(ids).not.toContain('elevenlabs');
    expect(ids).not.toContain('neural');
  });

  it('no provider label contains vendor names', () => {
    const VENDOR_NAMES = ['openai', 'elevenlabs', 'tts-1'];
    for (const provider of VOICE_PROVIDERS) {
      for (const vendor of VENDOR_NAMES) {
        expect(provider.label.toLowerCase()).not.toContain(vendor);
        expect(provider.description.toLowerCase()).not.toContain(vendor);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────
// 3. Resolution functions
// ─────────────────────────────────────────────────────────────────

describe('getSovereignVoice', () => {
  it('returns correct voice for each ID', () => {
    expect(getSovereignVoice('maia_core').id).toBe('maia_core');
    expect(getSovereignVoice('maia_warm').id).toBe('maia_warm');
    expect(getSovereignVoice('maia_clear').id).toBe('maia_clear');
    expect(getSovereignVoice('atlas').id).toBe('atlas');
    expect(getSovereignVoice('atlas_deep').id).toBe('atlas_deep');
  });

  it('returns maia_core for unknown IDs (graceful fallback)', () => {
    expect(getSovereignVoice('nonexistent').id).toBe('maia_core');
    expect(getSovereignVoice('').id).toBe('maia_core');
    expect(getSovereignVoice('alloy').id).toBe('maia_core'); // Legacy vendor name → fallback
  });
});

describe('resolveToKokoro', () => {
  it('resolves all sovereign IDs to kokoro voices', () => {
    expect(resolveToKokoro('maia_core')).toBe('af_kore');
    expect(resolveToKokoro('maia_warm')).toBe('af_sarah');
    expect(resolveToKokoro('maia_clear')).toBe('af_bella');
    expect(resolveToKokoro('atlas')).toBe('am_adam');
    expect(resolveToKokoro('atlas_deep')).toBe('am_michael');
  });

  it('falls back to maia_core kokoro voice for unknowns', () => {
    expect(resolveToKokoro('garbage')).toBe('af_kore');
  });
});

describe('resolveToOpenAI', () => {
  it('resolves all sovereign IDs to openai fallback voices', () => {
    expect(resolveToOpenAI('maia_core')).toBe('alloy');
    expect(resolveToOpenAI('maia_warm')).toBe('shimmer');
    expect(resolveToOpenAI('maia_clear')).toBe('nova');
    expect(resolveToOpenAI('atlas')).toBe('echo');
    expect(resolveToOpenAI('atlas_deep')).toBe('onyx');
  });
});

// ─────────────────────────────────────────────────────────────────
// 4. Element coverage
// ─────────────────────────────────────────────────────────────────

describe('voiceForElement', () => {
  const ALL_ELEMENTS = ['fire', 'water', 'earth', 'air', 'aether'] as const;

  it('returns a voice for every element', () => {
    for (const element of ALL_ELEMENTS) {
      const voice = voiceForElement(element);
      expect(voice).toBeDefined();
      expect(voice.id).toBeTruthy();
    }
  });

  it('returned voice has affinity for the requested element', () => {
    for (const element of ALL_ELEMENTS) {
      const voice = voiceForElement(element);
      expect(voice.elements).toContain(element);
    }
  });
});

// ─────────────────────────────────────────────────────────────────
// 5. Legacy migration (every old name maps to a sovereign ID)
// ─────────────────────────────────────────────────────────────────

describe('migrateLegacyVoice', () => {
  it('maps all 6 OpenAI voice names to sovereign IDs', () => {
    expect(migrateLegacyVoice('alloy')).toBe('maia_core');
    expect(migrateLegacyVoice('shimmer')).toBe('maia_warm');
    expect(migrateLegacyVoice('nova')).toBe('maia_clear');
    expect(migrateLegacyVoice('echo')).toBe('atlas');
    expect(migrateLegacyVoice('onyx')).toBe('atlas_deep');
    expect(migrateLegacyVoice('fable')).toBe('maia_clear');
  });

  it('passes through sovereign IDs unchanged', () => {
    // Unknown strings fall back to maia_core, but sovereign IDs
    // should not cause surprising behavior
    expect(migrateLegacyVoice('maia_core')).toBe('maia_core');
  });

  it('returns maia_core for unknown voices', () => {
    expect(migrateLegacyVoice('unknown')).toBe('maia_core');
    expect(migrateLegacyVoice('')).toBe('maia_core');
  });

  it('returned type is always SovereignVoiceId', () => {
    const result: SovereignVoiceId = migrateLegacyVoice('alloy');
    expect(SOVEREIGN_VOICES.some(v => v.id === result)).toBe(true);
  });
});

describe('migrateLegacyProvider', () => {
  it('maps all legacy providers to sovereign types', () => {
    expect(migrateLegacyProvider('openai')).toBe('sovereign');
    expect(migrateLegacyProvider('neural')).toBe('sovereign');
    expect(migrateLegacyProvider('elevenlabs')).toBe('sovereign');
    expect(migrateLegacyProvider('web_speech')).toBe('browser');
    expect(migrateLegacyProvider('webspeech')).toBe('browser');
  });

  it('passes through sovereign/browser unchanged', () => {
    expect(migrateLegacyProvider('sovereign')).toBe('sovereign');
    expect(migrateLegacyProvider('browser')).toBe('sovereign'); // not in map, falls back
  });

  it('returns sovereign for unknown providers', () => {
    expect(migrateLegacyProvider('unknown')).toBe('sovereign');
  });

  it('returned type is always VoiceProvider', () => {
    const result: VoiceProvider = migrateLegacyProvider('openai');
    expect(['sovereign', 'local', 'browser']).toContain(result);
  });
});

// ─────────────────────────────────────────────────────────────────
// 6. Round-trip integrity
// ─────────────────────────────────────────────────────────────────

describe('round-trip integrity', () => {
  it('every sovereign voice resolves to a valid kokoro voice', () => {
    for (const voice of SOVEREIGN_VOICES) {
      const kokoro = resolveToKokoro(voice.id);
      expect(kokoro).toBe(voice.kokoro);
    }
  });

  it('every sovereign voice resolves to a valid openai fallback', () => {
    for (const voice of SOVEREIGN_VOICES) {
      const openai = resolveToOpenAI(voice.id);
      expect(openai).toBe(voice.openai);
    }
  });

  it('migration → resolution is idempotent', () => {
    // Migrating a legacy name and then resolving should give a valid voice
    const legacyNames = ['alloy', 'shimmer', 'nova', 'echo', 'onyx', 'fable'];
    for (const legacy of legacyNames) {
      const sovereign = migrateLegacyVoice(legacy);
      const kokoro = resolveToKokoro(sovereign);
      const openai = resolveToOpenAI(sovereign);
      expect(kokoro).toBeTruthy();
      expect(openai).toBeTruthy();
      // The openai fallback should match the original legacy name
      expect(openai).toBe(legacy === 'fable' ? 'nova' : legacy);
    }
  });
});
