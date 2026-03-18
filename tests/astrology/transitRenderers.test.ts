/**
 * RENDERER TESTS — transitRenderers.ts
 *
 * Two cases per renderer:
 *   ✅ authoritative impact — content renders normally
 *   ❌ blocked impact      — blocked text is suppressed, boundary text appears instead
 *
 * Verifies that renderers honor the authority layer rather than bypassing it.
 * The "blocked impact" always contains "tomorrow" (relative_time), which cannot
 * be rendered regardless of what events are in the payload.
 */

import {
  renderDiagnostic,
  renderMAIA,
  renderSpiralogic,
  renderPractitioner,
  renderPractitionerText,
} from '@/lib/astrology/transitRenderers';

import type { AstrologyContextPayload } from '@/lib/astrology/astrologyPayload';
import type { TransitImpact } from '@/lib/astrology/transitInterpretation';

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

const authoritativeImpact: TransitImpact = {
  natalPlanet: 'mars',
  domain: 'drive / will / action',
  element: 'fire',
  forces: [
    {
      transitPlanet: 'saturn',
      transitElement: 'earth',
      aspectType: 'opposition',
      orb: 1.2,
      effect: 'confrontation with structure / external testing',
      elementalInteraction: 'Earth opposing Fire',
      applying: true,
      source: 'derived_interpretation',
      confidence: 'derived',
    },
  ],
  synthesis: 'Drive meets resistance — discipline and patience required',
  spiralogicVoice: 'Your Fire is trying to act and initiate, but Earth is opposing it.',
  somaticSignature: 'May register as: jaw, head pressure, heaviness in shoulders.',
  source: 'derived_interpretation',
  confidence: 'derived',
  traceId: 'mars:saturn/opposition',
};

/** Impact that claims "tomorrow" — relative_time is always blocked */
const blockedImpact: TransitImpact = {
  natalPlanet: 'moon',
  domain: 'emotion / instinct / inner needs',
  element: 'water',
  forces: [
    {
      transitPlanet: 'neptune',
      transitElement: 'water',
      aspectType: 'conjunction',
      orb: 0.8,
      effect: 'dissolution / transcendence / merging',
      elementalInteraction: 'Water merging with Water (amplification)',
      applying: true,
      source: 'fallback',
      confidence: 'derived',
    },
  ],
  synthesis: 'The eclipse arrives tomorrow and opens the emotional field.',
  spiralogicVoice: 'Water deepens its sensitivity tomorrow as barriers dissolve.',
  somaticSignature: 'May register as: belly, fog.',
  source: 'fallback',
  confidence: 'derived',
  traceId: 'moon:neptune/conjunction',
};

/** Empty payload — no events, no facts — ensures any event claim fails */
const emptyPayload: AstrologyContextPayload = {
  generatedAt: new Date().toISOString(),
  facts: [],
  impacts: [],
  events: [],
  guardrails: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// renderDiagnostic
// ─────────────────────────────────────────────────────────────────────────────

describe('renderDiagnostic', () => {
  test('authoritative impact — renders synthesis content', () => {
    const output = renderDiagnostic([authoritativeImpact], emptyPayload);
    expect(output).toContain('mars');
    expect(output).toContain('saturn');
    expect(output).toContain('Drive meets resistance');
  });

  test('blocked impact — shows RENDER BLOCKED annotation, does not render synthesis', () => {
    const output = renderDiagnostic([blockedImpact], emptyPayload);
    expect(output).toContain('[RENDER BLOCKED');
    expect(output).not.toContain('tomorrow');
    // The blocked entry still includes traceId for audit purposes
    expect(output).toContain('moon:neptune/conjunction');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// renderMAIA
// ─────────────────────────────────────────────────────────────────────────────

describe('renderMAIA', () => {
  test('authoritative impact — renders spiralogic voice', () => {
    const output = renderMAIA([authoritativeImpact], emptyPayload);
    expect(output).toContain('Your Fire is trying to act and initiate');
    expect(output).toContain('Mars');
  });

  test('blocked impact — suppresses content, emits boundary text', () => {
    const output = renderMAIA([blockedImpact], emptyPayload);
    expect(output).not.toContain('tomorrow');
    // Boundary text replaces the blocked synthesis/voice
    expect(output).toMatch(/authoritative event|authoritative|not currently backed/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// renderSpiralogic
// ─────────────────────────────────────────────────────────────────────────────

describe('renderSpiralogic', () => {
  test('authoritative impact — renders elemental framing', () => {
    const output = renderSpiralogic([authoritativeImpact], emptyPayload);
    expect(output).toContain('Fire');
    expect(output).toContain('Earth');
    expect(output).toContain('Drive meets resistance');
  });

  test('blocked impact — suppresses synthesis, emits boundary text', () => {
    const output = renderSpiralogic([blockedImpact], emptyPayload);
    expect(output).not.toContain('tomorrow');
    expect(output).toMatch(/authoritative event|not currently backed/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// renderPractitioner (structured blocks)
// ─────────────────────────────────────────────────────────────────────────────

describe('renderPractitioner', () => {
  test('authoritative impact — renderBlocked is false, synthesis is original', () => {
    const [block] = renderPractitioner([authoritativeImpact], emptyPayload);
    expect(block.renderBlocked).toBe(false);
    expect(block.synthesis).toContain('Drive meets resistance');
    expect(block.integrationQuestion).toBeTruthy();
    expect(block.somaticSignature).toBeTruthy();
  });

  test('blocked impact — renderBlocked is true, synthesis is boundary text', () => {
    const [block] = renderPractitioner([blockedImpact], emptyPayload);
    expect(block.renderBlocked).toBe(true);
    expect(block.blockReason).toBe('relative_time_not_allowed');
    expect(block.synthesis).not.toContain('tomorrow');
    expect(block.synthesis).toMatch(/authoritative event|not currently backed/i);
    expect(block.somaticSignature).toBeUndefined();
    expect(block.integrationQuestion).toBe('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// renderPractitionerText
// ─────────────────────────────────────────────────────────────────────────────

describe('renderPractitionerText', () => {
  test('authoritative impact — renders full section with reflection question', () => {
    const output = renderPractitionerText([authoritativeImpact], emptyPayload);
    expect(output).toContain('Mars');
    expect(output).toContain('Synthesis:');
    expect(output).toContain('Reflection:');
    expect(output).toContain('Drive meets resistance');
  });

  test('blocked impact — emits boundary text, no synthesis or reflection', () => {
    const output = renderPractitionerText([blockedImpact], emptyPayload);
    expect(output).not.toContain('tomorrow');
    expect(output).not.toContain('Synthesis:');
    expect(output).not.toContain('Reflection:');
    expect(output).toMatch(/authoritative event|not currently backed/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WITHOUT PAYLOAD — renderers are passthrough (no authority gating)
// ─────────────────────────────────────────────────────────────────────────────

describe('renderers without payload (passthrough mode)', () => {
  test('renderMAIA without payload renders all impacts including blocked', () => {
    const output = renderMAIA([blockedImpact]);
    expect(output).toContain('tomorrow'); // no gating when payload omitted
  });

  test('renderPractitioner without payload — renderBlocked always false', () => {
    const [block] = renderPractitioner([blockedImpact]);
    expect(block.renderBlocked).toBe(false);
  });
});
