/**
 * Conductor Route Scoring Tests
 *
 * Validates the weighted scoring mechanism in lib/voice/conductor.ts.
 * Scoring refines element + archetype detection from multiple signals
 * without replacing inferSpiralogicCell or bypassing hysteresis.
 *
 * Key invariants:
 * - Scoring agrees with cell >80% of the time (refining, not contradicting)
 * - Below-threshold scores fall back to spiralogicCell's raw element
 * - Close scores (delta < 0.1) fall back to cell element
 * - Archetype overrides require confidence >= 0.75
 * - Short messages (<20 chars) bypass scoring
 *
 * Run: npx jest __tests__/conductor-scoring.test.ts
 */

import { scoreRoute, createVoiceIntent } from '@/lib/voice/conductor';

// ═══════════════════════════════════════════════════════════════
// scoreRoute() unit tests
// ═══════════════════════════════════════════════════════════════

describe('scoreRoute', () => {
  const fireCell = { element: 'fire', phase: 1, context: 'general', confidence: 0.7 };
  const waterCell = { element: 'water', phase: 1, context: 'general', confidence: 0.7 };
  const earthCell = { element: 'earth', phase: 2, context: 'general', confidence: 0.7 };
  const airCell = { element: 'air', phase: 1, context: 'general', confidence: 0.7 };

  // ── Positive cases ──

  test('strong water cues score water highest', () => {
    const result = scoreRoute(
      fireCell,
      'I am feeling overwhelmed with grief and emotion, tears keep coming',
    );
    expect(result.element).toBe('water');
    expect(result.elementScores.water).toBeGreaterThan(result.elementScores.fire);
  });

  test('strong fire cues score fire highest', () => {
    const result = scoreRoute(
      waterCell,
      'I need motivation and energy to take action and drive forward with courage',
    );
    expect(result.element).toBe('fire');
    expect(result.elementScores.fire).toBeGreaterThan(result.elementScores.water);
  });

  test('strong earth cues score earth highest', () => {
    const result = scoreRoute(
      airCell,
      'I need to build a grounding routine and practice discipline with my body',
    );
    expect(result.element).toBe('earth');
    expect(result.elementScores.earth).toBeGreaterThan(result.elementScores.air);
  });

  test('strong air cues score air highest', () => {
    const result = scoreRoute(
      earthCell,
      'Help me understand the pattern here, I need clarity and perspective to discern what this means',
    );
    expect(result.element).toBe('air');
    expect(result.elementScores.air).toBeGreaterThan(result.elementScores.earth);
  });

  // ── Agreement bias ──

  test('scoring that agrees with cell gets confidence boost', () => {
    const result = scoreRoute(
      waterCell,
      'I have been feeling deep emotion and vulnerability all week',
    );
    expect(result.element).toBe('water');
    expect(result.reasons).toContain('agrees with cell (+0.1)');
  });

  test('scoring that disagrees with cell gets confidence penalty', () => {
    const result = scoreRoute(
      fireCell,
      'I am feeling deep grief and overwhelming emotion',
    );
    expect(result.reasons).toContain('disagrees with cell (-0.1)');
  });

  // ── Negative / fallback cases ──

  test('vague input keeps cell element', () => {
    const result = scoreRoute(
      fireCell,
      'I have been thinking about things lately and wondering what comes next',
    );
    // No strong cues → cell element should have highest base score
    expect(result.elementScores.fire).toBeGreaterThanOrEqual(result.elementScores.water);
  });

  test('short message returns cell element as top', () => {
    const result = scoreRoute(fireCell, 'hi');
    // No message cues scored (< 20 chars)
    expect(result.element).toBe('fire');
  });

  test('no message returns cell element', () => {
    const result = scoreRoute(fireCell);
    expect(result.element).toBe('fire');
  });

  // ── Persisted state ──

  test('persisted state adds continuity bias', () => {
    const resultWithout = scoreRoute(fireCell, 'something neutral and unclear');
    const resultWith = scoreRoute(
      fireCell,
      'something neutral and unclear',
      { dominant_element: 'water', phase: 2 },
    );
    expect(resultWith.elementScores.water).toBeGreaterThan(resultWithout.elementScores.water);
  });

  // ── Archetype scoring ──

  test('archetype defaults to guide without strong signals', () => {
    const result = scoreRoute(fireCell, 'I want to understand my patterns better');
    expect(result.archetype).toBe('guide');
  });

  test('archetype stays guide even with some oracle cues (below 0.75)', () => {
    // Single oracle cue is not enough to override
    const result = scoreRoute(fireCell, 'I had a vision of something sacred');
    expect(result.archetype).toBe('guide');
  });
});

// ═══════════════════════════════════════════════════════════════
// createVoiceIntent() integration with scoring
// ═══════════════════════════════════════════════════════════════

describe('createVoiceIntent with scoring', () => {
  test('returns valid VoiceIntent shape', () => {
    const intent = createVoiceIntent({
      spiralogicCell: { element: 'fire', phase: 1, context: 'general', confidence: 0.7 },
      userMessage: 'I need grounding and embodiment practice for my body',
    });
    expect(intent.element).toBeDefined();
    expect(intent.phase).toBeDefined();
    expect(['fire', 'water', 'earth', 'air', 'aether']).toContain(intent.element);
    expect(intent.phase).toBeGreaterThanOrEqual(1);
    expect(intent.phase).toBeLessThanOrEqual(12);
  });

  test('attaches routeDebug when scoring disagrees with cell', () => {
    const intent = createVoiceIntent({
      spiralogicCell: { element: 'fire', phase: 1, context: 'general', confidence: 0.7 },
      userMessage: 'I am overwhelmed with grief and deep feeling, tears and vulnerability',
    });
    // Scoring should disagree (water cues vs fire cell) → routeDebug attached
    expect(intent.routeDebug).toBeDefined();
    expect(intent.routeDebug?.cellAgreement).toBe(false);
  });

  test('no routeDebug when scoring agrees and below threshold', () => {
    const intent = createVoiceIntent({
      spiralogicCell: { element: 'fire', phase: 1, context: 'general', confidence: 0.7 },
      userMessage: 'hi there',
    });
    // Short message, no disagreement → no debug
    expect(intent.routeDebug).toBeUndefined();
  });

  test('preserves member voice preferences', () => {
    const intent = createVoiceIntent({
      spiralogicCell: { element: 'water', phase: 2, context: 'general', confidence: 0.7 },
      memberVoicePrefs: { speed: 0.9, timbre: 'warm' },
      userMessage: 'I need to feel into this more deeply',
    });
    expect(intent.speed).toBe(0.9);
    expect(intent.timbre).toBe('warm');
  });
});
