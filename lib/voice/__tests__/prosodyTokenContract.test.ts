/**
 * Prosody Token Contract Test
 *
 * Enforces the coupling between maiaPlanner.ts and prosodyFromPFI.ts.
 *
 * Rules under test:
 *   1. Every PROSODY_TOKENS value maps to exactly one prosody mode.
 *   2. Every planner template embeds exactly one canonical token.
 *   3. Each template's token maps to the expected prosody mode (round-trip).
 *
 * This test failing means the voice contract has drifted.
 * Fix: update both buildTTSInstructions() and inferProsodyModeFromInstructions()
 * in the same commit. See: docs/canon/MAIA_VOICE_DOCTRINE_v1.0.md
 */

import {
  PROSODY_TOKENS,
  inferProsodyModeFromInstructions,
} from '@/lib/voice/prosodyFromPFI';
import { buildTTSInstructions } from '@/lib/maia/maiaPlanner';
import type { MAIAResponsePlan } from '@/lib/maia/maiaPlanner';

// ── Expected mappings (source of truth for this test file) ───────────────────

type Stance = MAIAResponsePlan['stance'];

// prosody mode each stance should produce via inference
const EXPECTED_MODE: Record<Stance, string> = {
  witness:      'ceremonial',
  mirror:       'intimate',
  guide:        'calm',
  challenge:    'directive',
  hold_silence: 'ceremonial',
};

// which token each stance should embed
const EXPECTED_TOKEN: Record<Stance, string> = {
  witness:      PROSODY_TOKENS.WITNESS,
  mirror:       PROSODY_TOKENS.MIRROR,
  guide:        PROSODY_TOKENS.GUIDE,
  challenge:    PROSODY_TOKENS.CHALLENGE,
  hold_silence: PROSODY_TOKENS.HOLD_SILENCE,
};

const ALL_STANCES: Stance[] = ['witness', 'mirror', 'guide', 'challenge', 'hold_silence'];
const ALL_TOKENS = Object.values(PROSODY_TOKENS);

// Representative inputs — element does not affect token presence
const TEST_ELEMENT = 'water' as const;
const TEST_TONE = { warmth: 0.7, directness: 0.5, poetry: 0.3 };

// ── Helper ────────────────────────────────────────────────────────────────────

function buildInstructions(stance: Stance): string {
  return buildTTSInstructions({
    stance,
    element: TEST_ELEMENT,
    tone: TEST_TONE,
    maxWords: 60,
  });
}

function tokensPresent(text: string): string[] {
  return ALL_TOKENS.filter(token => text.toLowerCase().includes(token));
}

// ── Test 1: Token → prosody mode (PROSODY_TOKENS → inferProsodyModeFromInstructions) ─

describe('PROSODY_TOKENS → prosody mode mapping', () => {
  it('WITNESS maps to ceremonial', () => {
    expect(inferProsodyModeFromInstructions(PROSODY_TOKENS.WITNESS)).toBe('ceremonial');
  });

  it('HOLD_SILENCE maps to ceremonial', () => {
    expect(inferProsodyModeFromInstructions(PROSODY_TOKENS.HOLD_SILENCE)).toBe('ceremonial');
  });

  it('MIRROR maps to intimate', () => {
    expect(inferProsodyModeFromInstructions(PROSODY_TOKENS.MIRROR)).toBe('intimate');
  });

  it('CHALLENGE maps to directive', () => {
    expect(inferProsodyModeFromInstructions(PROSODY_TOKENS.CHALLENGE)).toBe('directive');
  });

  it('GUIDE maps to calm (default)', () => {
    // GUIDE falls through to default — no explicit detection branch
    expect(inferProsodyModeFromInstructions(PROSODY_TOKENS.GUIDE)).toBe('calm');
  });

  it('unknown text maps to calm (default)', () => {
    expect(inferProsodyModeFromInstructions('some random unrelated text')).toBe('calm');
  });
});

// ── Test 2: Template → exactly one canonical token ────────────────────────────

describe('buildTTSInstructions: exactly one canonical token per template', () => {
  for (const stance of ALL_STANCES) {
    it(`${stance} template contains exactly one token`, () => {
      const instructions = buildInstructions(stance);
      const found = tokensPresent(instructions);
      expect(found).toHaveLength(1);
    });
  }
});

// ── Test 3: Template → expected token ─────────────────────────────────────────

describe('buildTTSInstructions: each stance embeds its expected token', () => {
  for (const stance of ALL_STANCES) {
    it(`${stance} embeds ${EXPECTED_TOKEN[stance]}`, () => {
      const instructions = buildInstructions(stance);
      expect(instructions.toLowerCase()).toContain(EXPECTED_TOKEN[stance]);
    });
  }
});

// ── Test 4: Round-trip — template → inference → expected mode ─────────────────

describe('round-trip: template → inference → expected prosody mode', () => {
  for (const stance of ALL_STANCES) {
    it(`${stance} → ${EXPECTED_MODE[stance]}`, () => {
      const instructions = buildInstructions(stance);
      const mode = inferProsodyModeFromInstructions(instructions);
      expect(mode).toBe(EXPECTED_MODE[stance]);
    });
  }
});

// ── Test 5: All PROSODY_TOKENS values are used by at least one template ────────

describe('PROSODY_TOKENS: all values used by at least one template', () => {
  it('every exported token appears in at least one stance template', () => {
    const allInstructions = ALL_STANCES.map(buildInstructions).join('\n').toLowerCase();
    for (const [key, token] of Object.entries(PROSODY_TOKENS)) {
      expect(allInstructions).toContain(token);
    }
  });
});
