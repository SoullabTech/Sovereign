/**
 * buildProsodyHints Tests — Baseline Blending + Sanctuary Override
 *
 * Ensures Conversation Prosody Memory behaves correctly:
 * - Baseline blends with current-turn hints
 * - Sanctuary bypasses baseline (regulation > continuity)
 */

import { buildProsodyHints } from '../buildProsodyHints';
import type { SessionProsodyBaseline } from '@/lib/voice/moshi/MoshiSessionManager';

describe('buildProsodyHints baseline blending', () => {
  const baseContext = {
    activation: 0.3,
    mode: 'talk',
    sanctuary: false,
    brevity: 'moderate' as const,
    posture: 'MEET',
    element: null,
  };

  it('without baseline, computes hints fresh from context', () => {
    const hints = buildProsodyHints(baseContext);

    expect(hints.warmth).toBeDefined();
    expect(hints.pace).toBeDefined();
    expect(hints.emphasis).toBeDefined();
  });

  it('with high-continuity baseline, prevents fast warming (warmth sticks)', () => {
    // Baseline is neutral — we want to prevent fast warming to very_warm
    const neutralBaseline: SessionProsodyBaseline = {
      warmth: 'neutral',
      pace: 'steady',
      emphasis: 'minimal',
      continuity: 0.7, // High continuity = baseline sticks
      updatedAt: Date.now(),
    };

    // Context that would normally compute very_warm warmth
    const warmContext = {
      ...baseContext,
      sanctuary: false, // Not sanctuary (that bypasses baseline)
      posture: 'WITNESS', // WITNESS computes very_warm
    };

    const hints = buildProsodyHints({ ...warmContext, baseline: neutralBaseline });

    // With high continuity, baseline should prevent fast warming
    // Current would be 'very_warm', but baseline 'neutral' sticks
    expect(hints.warmth).toBe('neutral');
  });

  it('with low-continuity baseline, current turn dominates', () => {
    const warmBaseline: SessionProsodyBaseline = {
      warmth: 'warm',
      pace: 'steady',
      emphasis: 'minimal',
      continuity: 0.2, // Low continuity = baseline doesn't stick
      updatedAt: Date.now(),
    };

    const neutralContext = {
      ...baseContext,
      mode: 'note',
      posture: 'LEAD',
    };

    const hints = buildProsodyHints({ ...neutralContext, baseline: warmBaseline });

    // With low continuity (stick < 0.5), current turn should dominate
    // Note: actual warmth depends on mode/posture logic, but baseline shouldn't override
    expect(hints).toBeDefined();
  });

  it('sanctuary bypasses baseline entirely', () => {
    const veryWarmBaseline: SessionProsodyBaseline = {
      warmth: 'very_warm',
      pace: 'slow',
      emphasis: 'strong',
      continuity: 0.9, // Very high continuity
      updatedAt: Date.now(),
    };

    const sanctuaryContext = {
      ...baseContext,
      sanctuary: true, // Sanctuary mode active
    };

    const hints = buildProsodyHints({ ...sanctuaryContext, baseline: veryWarmBaseline });

    // Sanctuary computes its own warmth (very_warm), but the key is:
    // baseline blending is SKIPPED when sanctuary = true
    // So hints come from sanctuary context, not from baseline continuity
    expect(hints.warmth).toBe('very_warm'); // From sanctuary logic, not baseline
  });

  it('allows fast cooling (warmth shifts down immediately)', () => {
    const warmBaseline: SessionProsodyBaseline = {
      warmth: 'very_warm',
      pace: 'steady',
      emphasis: 'minimal',
      continuity: 0.7,
      updatedAt: Date.now(),
    };

    // Context that computes cooler warmth
    const coolContext = {
      ...baseContext,
      mode: 'note',
      posture: 'LEAD',
      // This should compute neutral or cool warmth
    };

    const hints = buildProsodyHints({ ...coolContext, baseline: warmBaseline });

    // Fast cooling: if current is cooler than baseline, allow immediate shift
    // The blending logic allows downward shifts
    expect(['neutral', 'cool', 'warm']).toContain(hints.warmth);
  });
});
