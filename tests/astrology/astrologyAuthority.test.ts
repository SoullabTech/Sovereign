/**
 * AUTHORITY LAYER TESTS — astrologyAuthority.ts
 *
 * Verifies the render gate that prevents date-sensitive astronomical claims
 * from appearing unless backed by facts[] or events[] in the payload.
 *
 * Coverage:
 *   1. detectClaimTypes — category detection per claim type
 *   2. assertEventBacked — event-backed / fact-backed / missing-support / relative-time
 *   3. canRenderDateSensitiveStatement — boolean gate
 *   4. getSafeFallbackText — safe vs blocked paths
 *   5. validateImpactForRendering — uses real TransitImpact fields
 *   6. buildPractitionerRenderItems — mixed-authority explainability output
 */

import {
  assertEventBacked,
  buildPractitionerRenderItems,
  canRenderDateSensitiveStatement,
  detectClaimTypes,
  getSafeFallbackText,
  validateImpactForRendering,
} from '@/lib/astrology/astrologyAuthority';

import type { AstrologyContextPayload } from '@/lib/astrology/astrologyPayload';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function makePayload(overrides: Partial<AstrologyContextPayload> = {}): AstrologyContextPayload {
  return {
    generatedAt: new Date().toISOString(),
    facts: [],
    impacts: [],
    events: [],
    guardrails: [],
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLAIM TYPE DETECTION
// ─────────────────────────────────────────────────────────────────────────────

describe('detectClaimTypes', () => {
  test('detects eclipse claims', () => {
    expect(detectClaimTypes('A solar eclipse is active here')).toContain('eclipse');
  });

  test('detects lunation claims — new moon', () => {
    expect(detectClaimTypes('The New Moon in Pisces opens a new cycle')).toContain('lunation');
  });

  test('detects lunation claims — full moon', () => {
    expect(detectClaimTypes('The Full Moon peaks emotionally')).toContain('lunation');
  });

  test('detects retrograde claims', () => {
    expect(detectClaimTypes('Mercury retrograde may slow communications')).toContain('retrograde');
  });

  test('detects ingress claims', () => {
    expect(detectClaimTypes('Mars ingress into Cancer shifts the tone')).toContain('ingress');
  });

  test('detects relative time claims', () => {
    const claims = detectClaimTypes('This eclipse lands tomorrow and intensifies this week');
    expect(claims).toContain('relative_time');
  });

  test('returns empty array for non-date-sensitive interpretation text', () => {
    expect(
      detectClaimTypes('There is pressure between assertion and restraint')
    ).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. ASSERT EVENT BACKED
// ─────────────────────────────────────────────────────────────────────────────

describe('assertEventBacked', () => {
  test('returns authoritative event_backed when payload events support the claim', () => {
    const payload = makePayload({
      events: [
        {
          id: 'event:eclipse:1',
          type: 'solar_eclipse',
          date: '2026-08-12',
          description: 'Total Solar Eclipse',
          confidence: 'known',
          source: 'event_table',
        } as any,
      ],
    });

    const result = assertEventBacked(
      { id: 'stmt:1', text: 'A solar eclipse is active', claimTypes: ['eclipse'], source: 'derived' },
      payload
    );

    expect(result.ok).toBe(true);
    expect(result.authority).toBe('authoritative');
    expect(result.reason).toBe('event_backed');
    expect(result.supportingIds).toEqual(['event:eclipse:1']);
  });

  test('returns authoritative fact_backed when payload facts support the claim', () => {
    const payload = makePayload({
      facts: [
        {
          id: 'fact:retrograde:1',
          kind: 'retrograde',
          label: 'Mercury Retrograde',
          value: '2026-04-02',
          source: 'event_table',
          confidence: 'known',
          authority: 'authoritative',
        },
      ],
    });

    const result = assertEventBacked(
      { id: 'stmt:2', text: 'Mercury retrograde is in effect', claimTypes: ['retrograde'], source: 'derived' },
      payload
    );

    expect(result.ok).toBe(true);
    expect(result.authority).toBe('authoritative');
    expect(result.reason).toBe('fact_backed');
    expect(result.supportingIds).toEqual(['fact:retrograde:1']);
  });

  test('returns missing_support when neither events nor facts back the claim', () => {
    const payload = makePayload();

    const result = assertEventBacked(
      { id: 'stmt:3', text: 'A solar eclipse is active', claimTypes: ['eclipse'], source: 'fallback' },
      payload
    );

    expect(result.ok).toBe(false);
    expect(result.authority).toBe('fallback');
    expect(result.reason).toBe('missing_support');
    expect(result.supportingIds).toEqual([]);
  });

  test('blocks relative time claims regardless of event presence', () => {
    const payload = makePayload({
      events: [
        {
          id: 'event:eclipse:2',
          type: 'solar_eclipse',
          date: '2026-08-12',
          description: 'Total Solar Eclipse',
          confidence: 'known',
          source: 'event_table',
        } as any,
      ],
    });

    const result = assertEventBacked(
      {
        id: 'stmt:4',
        text: 'The eclipse happens tomorrow',
        claimTypes: ['eclipse', 'relative_time'],
        source: 'derived',
      },
      payload
    );

    expect(result.ok).toBe(false);
    expect(result.authority).toBe('fallback');
    expect(result.reason).toBe('relative_time_not_allowed');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. CAN RENDER DATE SENSITIVE
// ─────────────────────────────────────────────────────────────────────────────

describe('canRenderDateSensitiveStatement', () => {
  test('returns true for non-date-sensitive interpretation text', () => {
    const payload = makePayload();
    const allowed = canRenderDateSensitiveStatement(
      {
        id: 'stmt:5',
        text: 'This transit increases tension between drive and restraint',
        claimTypes: [],
        source: 'derived',
      },
      payload
    );
    expect(allowed).toBe(true);
  });

  test('returns false for unsupported date-sensitive statement', () => {
    const payload = makePayload();
    const allowed = canRenderDateSensitiveStatement(
      {
        id: 'stmt:6',
        text: 'A new moon begins tomorrow',
        claimTypes: ['lunation', 'relative_time'],
        source: 'derived',
      },
      payload
    );
    expect(allowed).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. SAFE FALLBACK TEXT
// ─────────────────────────────────────────────────────────────────────────────

describe('getSafeFallbackText', () => {
  test('returns original text when the claim is event-backed', () => {
    const payload = makePayload({
      events: [
        {
          id: 'event:lunation:1',
          type: 'new_moon',
          date: '2026-03-19',
          description: 'New Moon in Pisces',
          confidence: 'known',
          source: 'event_table',
        } as any,
      ],
    });

    const text = getSafeFallbackText(
      {
        id: 'stmt:7',
        text: 'The New Moon in Pisces opens a new cycle',
        claimTypes: ['lunation'],
        source: 'derived',
      },
      payload
    );

    expect(text).toBe('The New Moon in Pisces opens a new cycle');
  });

  test('returns boundary text for relative-time claims', () => {
    const payload = makePayload();
    const text = getSafeFallbackText(
      {
        id: 'stmt:8',
        text: 'The eclipse happens tomorrow',
        claimTypes: ['eclipse', 'relative_time'],
        source: 'fallback',
      },
      payload
    );
    expect(text).toMatch(/does not have authoritative event timing/i);
  });

  test('returns boundary text for unsupported date-sensitive claims', () => {
    const payload = makePayload();
    const text = getSafeFallbackText(
      {
        id: 'stmt:9',
        text: 'Mercury retrograde begins now',
        claimTypes: ['retrograde'],
        source: 'derived',
      },
      payload
    );
    expect(text).toMatch(/not currently backed by authoritative event data/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. VALIDATE IMPACT FOR RENDERING (uses real TransitImpact fields)
// ─────────────────────────────────────────────────────────────────────────────

describe('validateImpactForRendering', () => {
  test('impact with eclipse in synthesis is backed by payload events', () => {
    const payload = makePayload({
      events: [
        {
          id: 'event:eclipse:3',
          type: 'solar_eclipse',
          date: '2026-08-12',
          description: 'Total Solar Eclipse',
          confidence: 'known',
          source: 'event_table',
        } as any,
      ],
    });

    const impact = {
      traceId: 'mars:saturn/opposition',
      source: 'derived_interpretation',
      confidence: 'derived',
      synthesis: 'A solar eclipse intensifies the threshold experience.',
      spiralogicVoice: 'Fire meets compression at the edge of emergence.',
    } as any;

    const result = validateImpactForRendering(impact, payload);

    expect(result.ok).toBe(true);
    expect(result.authority).toBe('authoritative');
    expect(result.reason).toBe('event_backed');
  });

  test('impact with clean interpretation (no events) passes as impact_only', () => {
    const payload = makePayload();

    const impact = {
      traceId: 'venus:pluto/square',
      source: 'derived_interpretation',
      confidence: 'derived',
      synthesis: 'Values under deep transformational pressure.',
      spiralogicVoice: 'Earth meets Aether — what is solid is being asked to fundamentally shift.',
    } as any;

    const result = validateImpactForRendering(impact, payload);

    expect(result.ok).toBe(true);
    expect(result.reason).toBe('impact_only');
  });

  test('impact with relative-time language in synthesis is blocked', () => {
    const payload = makePayload({
      events: [
        {
          id: 'event:lunation:2',
          type: 'new_moon',
          date: '2026-03-19',
          description: 'New Moon in Pisces',
          confidence: 'known',
          source: 'event_table',
        } as any,
      ],
    });

    const impact = {
      traceId: 'moon:neptune/conjunction',
      source: 'derived_interpretation',
      confidence: 'derived',
      synthesis: 'The New Moon arrives tomorrow and opens a subtle threshold.',
      spiralogicVoice: 'Water deepens receptivity.',
    } as any;

    const result = validateImpactForRendering(impact, payload);

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('relative_time_not_allowed');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. PRACTITIONER RENDER ITEMS — mixed authority
// ─────────────────────────────────────────────────────────────────────────────

describe('buildPractitionerRenderItems', () => {
  test('builds mixed-authority items with renderBlocked metadata', () => {
    const payload = makePayload({
      events: [
        {
          id: 'event:retrograde:1',
          type: 'retrograde',
          date: '2026-04-02',
          description: 'Mercury Retrograde',
          confidence: 'known',
          source: 'event_table',
        } as any,
      ],
      impacts: [
        {
          traceId: 'mercury:uranus/square',
          source: 'derived_interpretation',
          confidence: 'derived',
          synthesis: 'Mercury retrograde reworks perception and pacing.',
          spiralogicVoice: 'Air destabilizes and reforms pattern recognition.',
        },
        {
          traceId: 'sun:pluto/square',
          source: 'fallback',
          confidence: 'derived',
          synthesis: 'A solar eclipse happens tomorrow.',
          spiralogicVoice: 'Fire is forced through a crucible.',
        },
      ] as any,
    });

    const items = buildPractitionerRenderItems(payload);

    expect(items).toHaveLength(2);

    // First impact: retrograde-backed → should pass
    expect(items[0].traceId).toBe('mercury:uranus/square');
    expect(items[0].renderBlocked).toBe(false);
    expect(items[0].authority).toBe('authoritative');
    expect(items[0].supportingIds).toEqual(['event:retrograde:1']);

    // Second impact: "tomorrow" → relative_time blocked
    expect(items[1].traceId).toBe('sun:pluto/square');
    expect(items[1].renderBlocked).toBe(true);
    expect(items[1].blockReason).toBe('relative_time_not_allowed');
  });
});
