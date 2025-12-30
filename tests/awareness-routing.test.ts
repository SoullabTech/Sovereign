/**
 * Awareness-Level Model Routing Tests
 *
 * Validates that the 7-level developmental awareness system correctly
 * routes to Opus vs Sonnet based on member stage and conversation context.
 *
 * Test categories:
 * - CASUAL: Should route to Sonnet for established members (L3+, 6+ messages)
 * - DEEP: Should route to Opus (sacred keywords, care mode, L1-2 members)
 * - EDGE: Ambiguous cases that should route consistently (not flap)
 */

import { describe, it, expect } from 'vitest';

// Type for awareness level
type AwarenessLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Model configuration (mirrors claudeClient.ts)
const OPUS_MODEL = 'claude-opus-4-5-20251101';
const SONNET_MODEL = 'claude-sonnet-4-5-20250929';

// Deep dive patterns (must match claudeClient.ts)
const DEEP_DIVE_PATTERNS = /shadow|archetype|dream|trauma|grief|initiation|spiraling|pattern across|help me see|what I can't see|breakthrough|soul|transformation|sacred|ceremony|ritual|death|rebirth|integration|wound|healing crisis/i;

// Threshold for Sonnet (must match claudeClient.ts)
const SONNET_THRESHOLD_TURNS = 5;

interface ModelSelection {
  model: string;
  tier: 'opus' | 'sonnet';
  reason: string;
}

interface TestMeta {
  userId?: string;
  mode?: string;
  messageCount?: number;
  awarenessLevel?: AwarenessLevel;
  consciousnessPolicy?: { awarenessLevel?: AwarenessLevel };
  forceOpus?: boolean;
  forceSonnet?: boolean;
}

// Replicate the routing logic for testing
function selectModelByAwareness(
  awarenessLevel: AwarenessLevel | undefined,
  hasDeepPattern: boolean,
  mode: string
): { tier: 'opus' | 'sonnet'; reason: string } | null {
  if (!awarenessLevel) return null;

  if (awarenessLevel <= 2) {
    return { tier: 'opus', reason: `awareness_L${awarenessLevel}_trust` };
  }

  if (awarenessLevel === 3) {
    if (hasDeepPattern || mode === 'care') {
      return { tier: 'opus', reason: 'awareness_L3_deep' };
    }
    return null;
  }

  if (awarenessLevel === 4) {
    if (hasDeepPattern || mode === 'care') {
      return { tier: 'opus', reason: 'awareness_L4_teaching' };
    }
    return null;
  }

  if (awarenessLevel >= 5) {
    if (hasDeepPattern || mode === 'care') {
      return { tier: 'opus', reason: `awareness_L${awarenessLevel}_depth` };
    }
    return null;
  }

  return null;
}

function selectClaudeModel(meta: TestMeta = {}, userInput: string = ''): ModelSelection {
  const userId = meta.userId || '';
  const mode = meta.mode || 'talk';
  const messageCount = meta.messageCount || 0;
  const awarenessLevel = meta.consciousnessPolicy?.awarenessLevel ?? meta.awarenessLevel;
  const forceOpus = Boolean(meta.forceOpus);
  const forceSonnet = Boolean(meta.forceSonnet);

  // Simplified opus user check (in prod uses env var)
  const isOpusTierUser = ['kelly', 'kelly-nezat', 'local-dev'].some(
    id => userId.toLowerCase().includes(id.toLowerCase())
  );

  const hasDeepPattern = DEEP_DIVE_PATTERNS.test(userInput);

  // 0. Force flags
  if (forceOpus) return { model: OPUS_MODEL, tier: 'opus', reason: 'force_opus_flag' };
  if (forceSonnet) return { model: SONNET_MODEL, tier: 'sonnet', reason: 'force_sonnet_flag' };

  // 1. Opus-tier users
  if (isOpusTierUser) return { model: OPUS_MODEL, tier: 'opus', reason: 'opus_tier_user' };

  // 2. Deep dive patterns
  if (hasDeepPattern) return { model: OPUS_MODEL, tier: 'opus', reason: 'deep_dive_detected' };

  // 3. Awareness-level routing
  const awarenessSelection = selectModelByAwareness(awarenessLevel, hasDeepPattern, mode);
  if (awarenessSelection) {
    return {
      model: awarenessSelection.tier === 'opus' ? OPUS_MODEL : SONNET_MODEL,
      ...awarenessSelection
    };
  }

  // 4. Care mode
  if (mode === 'care' || mode === 'counsel') {
    return { model: OPUS_MODEL, tier: 'opus', reason: 'care_mode' };
  }

  // 5. New conversations
  if (messageCount <= 3) {
    return { model: OPUS_MODEL, tier: 'opus', reason: 'new_conversation' };
  }

  // 6. Established casual
  if (messageCount >= SONNET_THRESHOLD_TURNS) {
    return { model: SONNET_MODEL, tier: 'sonnet', reason: 'established_casual' };
  }

  // 7. Default
  return { model: OPUS_MODEL, tier: 'opus', reason: 'default_opus' };
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST PROMPTS
// ─────────────────────────────────────────────────────────────────────────────

interface TestCase {
  name: string;
  input: string;
  meta: TestMeta;
  expectedTier: 'opus' | 'sonnet';
  expectedReason?: string;
}

// CASUAL PROMPTS - Should route to Sonnet for established members
const CASUAL_PROMPTS: TestCase[] = [
  {
    name: 'simple greeting (established L5)',
    input: 'Hey, how are you doing today?',
    meta: { awarenessLevel: 5, messageCount: 10, mode: 'talk' },
    expectedTier: 'sonnet',
    expectedReason: 'established_casual',
  },
  {
    name: 'weather small talk (established L4)',
    input: "It's really nice outside today, isn't it?",
    meta: { awarenessLevel: 4, messageCount: 8, mode: 'talk' },
    expectedTier: 'sonnet',
    expectedReason: 'established_casual',
  },
  {
    name: 'schedule question (established L3)',
    input: 'What should I work on this week?',
    meta: { awarenessLevel: 3, messageCount: 12, mode: 'talk' },
    expectedTier: 'sonnet',
    expectedReason: 'established_casual',
  },
  {
    name: 'quick check-in (established L6)',
    input: 'Just checking in before my meeting.',
    meta: { awarenessLevel: 6, messageCount: 20, mode: 'talk' },
    expectedTier: 'sonnet',
    expectedReason: 'established_casual',
  },
  {
    name: 'logistical question (established L7)',
    input: 'Can you remind me what we discussed yesterday?',
    meta: { awarenessLevel: 7, messageCount: 15, mode: 'talk' },
    expectedTier: 'sonnet',
    expectedReason: 'established_casual',
  },
];

// DEEP PROMPTS - Should route to Opus
const DEEP_PROMPTS: TestCase[] = [
  {
    name: 'shadow work inquiry',
    input: 'I want to explore my shadow patterns around relationships.',
    meta: { awarenessLevel: 5, messageCount: 10, mode: 'talk' },
    expectedTier: 'opus',
    expectedReason: 'deep_dive_detected',
  },
  {
    name: 'dream interpretation',
    input: 'I had this strange dream last night about water and transformation.',
    meta: { awarenessLevel: 4, messageCount: 8, mode: 'talk' },
    expectedTier: 'opus',
    expectedReason: 'deep_dive_detected',
  },
  {
    name: 'new member (L1)',
    input: 'Hello, this is my first time here.',
    meta: { awarenessLevel: 1, messageCount: 1, mode: 'talk' },
    expectedTier: 'opus',
    expectedReason: 'awareness_L1_trust',
  },
  {
    name: 'care mode (counseling)',
    input: 'I need to talk through some difficult feelings.',
    meta: { awarenessLevel: 5, messageCount: 10, mode: 'care' },
    expectedTier: 'opus',
    expectedReason: 'awareness_L5_depth',
  },
  {
    name: 'sacred ceremony reference',
    input: 'How can I prepare for a meaningful ceremony?',
    meta: { awarenessLevel: 3, messageCount: 6, mode: 'talk' },
    expectedTier: 'opus',
    expectedReason: 'deep_dive_detected',
  },
];

// EDGE PROMPTS - Ambiguous cases that should be stable
const EDGE_PROMPTS: TestCase[] = [
  {
    name: 'borderline deep (no keywords, L3, care mode)',
    input: 'I have been thinking about some things lately.',
    meta: { awarenessLevel: 3, messageCount: 6, mode: 'care' },
    expectedTier: 'opus',
    expectedReason: 'awareness_L3_deep',
  },
  {
    name: 'exactly at threshold (L4, msgCount=5)',
    input: 'Just wanted to share something with you.',
    meta: { awarenessLevel: 4, messageCount: 5, mode: 'talk' },
    expectedTier: 'sonnet',
    expectedReason: 'established_casual',
  },
  {
    name: 'L2 explorer (always Opus)',
    input: 'What else can we explore together?',
    meta: { awarenessLevel: 2, messageCount: 10, mode: 'talk' },
    expectedTier: 'opus',
    expectedReason: 'awareness_L2_trust',
  },
  {
    name: 'healing mention (deep keyword)',
    input: 'I have been working on healing some old wounds.',
    meta: { awarenessLevel: 5, messageCount: 10, mode: 'talk' },
    expectedTier: 'opus',
    expectedReason: 'deep_dive_detected',
  },
  {
    name: 'new conversation override (L5, low msgCount)',
    input: 'Hi there!',
    meta: { awarenessLevel: 5, messageCount: 2, mode: 'talk' },
    expectedTier: 'opus',
    expectedReason: 'new_conversation',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITES
// ─────────────────────────────────────────────────────────────────────────────

describe('Awareness-Level Model Routing', () => {
  describe('CASUAL prompts → Sonnet', () => {
    CASUAL_PROMPTS.forEach((tc) => {
      it(tc.name, () => {
        const result = selectClaudeModel(tc.meta, tc.input);
        expect(result.tier).toBe(tc.expectedTier);
        if (tc.expectedReason) {
          expect(result.reason).toBe(tc.expectedReason);
        }
      });
    });
  });

  describe('DEEP prompts → Opus', () => {
    DEEP_PROMPTS.forEach((tc) => {
      it(tc.name, () => {
        const result = selectClaudeModel(tc.meta, tc.input);
        expect(result.tier).toBe(tc.expectedTier);
        if (tc.expectedReason) {
          expect(result.reason).toBe(tc.expectedReason);
        }
      });
    });
  });

  describe('EDGE prompts → stable routing', () => {
    EDGE_PROMPTS.forEach((tc) => {
      it(tc.name, () => {
        const result = selectClaudeModel(tc.meta, tc.input);
        expect(result.tier).toBe(tc.expectedTier);
        if (tc.expectedReason) {
          expect(result.reason).toBe(tc.expectedReason);
        }
      });
    });
  });

  describe('Force flags', () => {
    it('forceOpus overrides everything', () => {
      const result = selectClaudeModel(
        { awarenessLevel: 5, messageCount: 20, mode: 'talk', forceOpus: true },
        'casual message'
      );
      expect(result.tier).toBe('opus');
      expect(result.reason).toBe('force_opus_flag');
    });

    it('forceSonnet overrides everything', () => {
      const result = selectClaudeModel(
        { awarenessLevel: 1, messageCount: 1, mode: 'care', forceSonnet: true },
        'shadow work'
      );
      expect(result.tier).toBe('sonnet');
      expect(result.reason).toBe('force_sonnet_flag');
    });
  });

  describe('Consistency (no flapping)', () => {
    it('same input/meta always produces same result', () => {
      const meta: TestMeta = { awarenessLevel: 4, messageCount: 6, mode: 'talk' };
      const input = 'How can I make progress on my goals?';

      const results = Array.from({ length: 10 }, () => selectClaudeModel(meta, input));
      const tiers = results.map(r => r.tier);
      const reasons = results.map(r => r.reason);

      // All should be identical
      expect(new Set(tiers).size).toBe(1);
      expect(new Set(reasons).size).toBe(1);
    });
  });
});
