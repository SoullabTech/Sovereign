/**
 * RENDER CONTRACT TESTS — transitRenderContracts.ts + structured renderer helpers
 *
 * Covers:
 *   1. renderDiagnosticItems — returns audit metadata per item
 *   2. renderMAIAItems — returns safe boundary text on blocked claim
 *   3. renderSpiralogicItems — preserves traceId and rendererMode
 *   4. renderPractitionerItemsContract — authority propagated through structured items
 *   5. passthrough mode — sets passthrough: true when no payload supplied
 *   6. buildRenderBatchAudit — batch summary counts
 *   7. buildAuthoritySummary — payload-level health metrics
 */

import {
  renderDiagnosticItems,
  renderMAIAItems,
  renderSpiralogicItems,
  renderPractitionerItemsContract,
  buildRenderBatchAudit,
} from '@/lib/astrology/transitRenderers';

import { buildAuthoritySummary } from '@/lib/astrology/astrologyAuthority';
import type { AstrologyContextPayload } from '@/lib/astrology/astrologyPayload';
import type { TransitImpact } from '@/lib/astrology/transitInterpretation';

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

const cleanImpact: TransitImpact = {
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
  somaticSignature: 'May register as: jaw, head pressure.',
  source: 'derived_interpretation',
  confidence: 'derived',
  traceId: 'mars:saturn/opposition',
};

const blockedImpact: TransitImpact = {
  natalPlanet: 'moon',
  domain: 'emotion / instinct / inner needs',
  element: 'water',
  forces: [
    {
      transitPlanet: 'neptune',
      transitElement: 'water',
      aspectType: 'conjunction',
      orb: 0.5,
      effect: 'dissolution / transcendence / merging',
      elementalInteraction: 'Water merging with Water (amplification)',
      applying: true,
      source: 'fallback',
      confidence: 'derived',
    },
  ],
  synthesis: 'The eclipse tomorrow brings emotional flooding.',
  spiralogicVoice: 'Water expands tomorrow into boundlessness.',
  source: 'fallback',
  confidence: 'derived',
  traceId: 'moon:neptune/conjunction',
};

const emptyPayload: AstrologyContextPayload = {
  generatedAt: new Date().toISOString(),
  facts: [],
  impacts: [],
  events: [],
  guardrails: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. renderDiagnosticItems — audit metadata present
// ─────────────────────────────────────────────────────────────────────────────

describe('renderDiagnosticItems', () => {
  test('returns one item per impact with correct traceId', () => {
    const items = renderDiagnosticItems([cleanImpact], emptyPayload);
    expect(items).toHaveLength(1);
    expect(items[0].audit.traceId).toBe('mars:saturn/opposition');
  });

  test('clean impact: rendererMode is diagnostic, renderBlocked is false', () => {
    const [item] = renderDiagnosticItems([cleanImpact], emptyPayload);
    expect(item.audit.rendererMode).toBe('diagnostic');
    expect(item.audit.renderBlocked).toBe(false);
    expect(item.audit.passthrough).toBe(false);
  });

  test('clean impact: text contains synthesis', () => {
    const [item] = renderDiagnosticItems([cleanImpact], emptyPayload);
    expect(item.text).toContain('Drive meets resistance');
  });

  test('blocked impact: renderBlocked is true, text contains RENDER BLOCKED', () => {
    const [item] = renderDiagnosticItems([blockedImpact], emptyPayload);
    expect(item.audit.renderBlocked).toBe(true);
    expect(item.audit.blockReason).toBe('relative_time_not_allowed');
    expect(item.text).toContain('[RENDER BLOCKED');
    expect(item.text).not.toContain('tomorrow');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. renderMAIAItems — safe boundary text on blocked claim
// ─────────────────────────────────────────────────────────────────────────────

describe('renderMAIAItems', () => {
  test('clean impact: text contains spiralogic voice', () => {
    const [item] = renderMAIAItems([cleanImpact], emptyPayload);
    expect(item.text).toContain('Your Fire is trying to act');
  });

  test('blocked impact: boundary text used, "tomorrow" suppressed', () => {
    const [item] = renderMAIAItems([blockedImpact], emptyPayload);
    expect(item.text).not.toContain('tomorrow');
    expect(item.text).toMatch(/authoritative|not currently backed/i);
    expect(item.audit.renderBlocked).toBe(true);
    expect(item.audit.rendererMode).toBe('maia');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. renderSpiralogicItems — traceId and rendererMode preserved
// ─────────────────────────────────────────────────────────────────────────────

describe('renderSpiralogicItems', () => {
  test('clean impact: traceId matches, rendererMode is spiralogic', () => {
    const [item] = renderSpiralogicItems([cleanImpact], emptyPayload);
    expect(item.audit.traceId).toBe('mars:saturn/opposition');
    expect(item.audit.rendererMode).toBe('spiralogic');
  });

  test('clean impact: text contains elemental framing', () => {
    const [item] = renderSpiralogicItems([cleanImpact], emptyPayload);
    expect(item.text).toContain('Fire');
    expect(item.text).toContain('Earth');
  });

  test('blocked impact: boundary text emitted, original synthesis suppressed', () => {
    const [item] = renderSpiralogicItems([blockedImpact], emptyPayload);
    expect(item.text).not.toContain('tomorrow');
    expect(item.audit.renderBlocked).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. renderPractitionerItemsContract — authority propagated
// ─────────────────────────────────────────────────────────────────────────────

describe('renderPractitionerItemsContract', () => {
  test('clean impact: rendererMode is practitioner, not blocked', () => {
    const [item] = renderPractitionerItemsContract([cleanImpact], emptyPayload);
    expect(item.audit.rendererMode).toBe('practitioner');
    expect(item.audit.renderBlocked).toBe(false);
  });

  test('blocked impact: renderBlocked true, synthesis replaced', () => {
    const [item] = renderPractitionerItemsContract([blockedImpact], emptyPayload);
    expect(item.audit.renderBlocked).toBe(true);
    expect(item.text).not.toContain('tomorrow');
  });

  test('two impacts: each has independent audit', () => {
    const items = renderPractitionerItemsContract([cleanImpact, blockedImpact], emptyPayload);
    expect(items[0].audit.traceId).toBe('mars:saturn/opposition');
    expect(items[1].audit.traceId).toBe('moon:neptune/conjunction');
    expect(items[0].audit.renderBlocked).toBe(false);
    expect(items[1].audit.renderBlocked).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Passthrough mode — passthrough: true when no payload
// ─────────────────────────────────────────────────────────────────────────────

describe('passthrough mode (no payload)', () => {
  test('renderDiagnosticItems without payload: passthrough is true', () => {
    const [item] = renderDiagnosticItems([blockedImpact]);
    expect(item.audit.passthrough).toBe(true);
    expect(item.audit.renderBlocked).toBe(false);
  });

  test('renderMAIAItems without payload: blocked content renders', () => {
    const [item] = renderMAIAItems([blockedImpact]);
    expect(item.audit.passthrough).toBe(true);
    // In passthrough, no gating — original voice renders
    expect(item.text).toContain('tomorrow');
  });

  test('renderSpiralogicItems without payload: passthrough true', () => {
    const [item] = renderSpiralogicItems([cleanImpact]);
    expect(item.audit.passthrough).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. buildRenderBatchAudit — batch summary counts
// ─────────────────────────────────────────────────────────────────────────────

describe('buildRenderBatchAudit', () => {
  test('correctly counts blocked and total items', () => {
    const items = renderMAIAItems([cleanImpact, blockedImpact], emptyPayload);
    const summary = buildRenderBatchAudit(items, 'maia');

    expect(summary.totalItems).toBe(2);
    expect(summary.blockedItems).toBe(1);
    expect(summary.rendererMode).toBe('maia');
    expect(summary.passthroughMode).toBe(false);
  });

  test('passthrough batch has passthroughMode: true', () => {
    const items = renderMAIAItems([cleanImpact, blockedImpact]); // no payload
    const summary = buildRenderBatchAudit(items, 'maia');

    expect(summary.passthroughMode).toBe(true);
    expect(summary.blockedItems).toBe(0); // no gating in passthrough
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. buildAuthoritySummary — payload-level health metrics
// ─────────────────────────────────────────────────────────────────────────────

describe('buildAuthoritySummary', () => {
  test('empty payload returns zeroed summary', () => {
    const summary = buildAuthoritySummary(emptyPayload);
    expect(summary.totalFacts).toBe(0);
    expect(summary.totalImpacts).toBe(0);
    expect(summary.blockedImpacts).toBe(0);
    expect(summary.guardrailCount).toBe(0);
  });

  test('counts blocked and fallback impacts correctly', () => {
    const payload: AstrologyContextPayload = {
      ...emptyPayload,
      impacts: [cleanImpact, blockedImpact] as any,
    };
    const summary = buildAuthoritySummary(payload);

    expect(summary.totalImpacts).toBe(2);
    // blockedImpact has "tomorrow" → relative_time_not_allowed → blocked
    expect(summary.blockedImpacts).toBe(1);
    expect(summary.fallbackImpacts).toBe(1); // blockedImpact.source = 'fallback'
    expect(summary.derivedImpacts).toBe(1);  // cleanImpact.source = 'derived_interpretation'
  });

  test('guardrailCount matches payload.guardrails length', () => {
    const payload = { ...emptyPayload, guardrails: ['rule1', 'rule2', 'rule3'] };
    const summary = buildAuthoritySummary(payload);
    expect(summary.guardrailCount).toBe(3);
  });
});
