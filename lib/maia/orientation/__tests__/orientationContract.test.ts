/**
 * MAIA-UNIFIED-COGNITION-CONVERGENCE-01 · Cut 1A acceptance tests.
 *
 * These mirror the founder's acceptance list for the cut (2026-09-04). Each `describe`
 * below is one line of that list; a failure here means the cut does not pass.
 */

import { describe, it, expect, jest, afterEach } from '@jest/globals';
import {
  resolveOrientationContract,
  orientationDigest,
  renderOrientationForCognition,
  emitOrientationShadow,
  type OrientationContract,
} from '../contract';

const packet = (over: Partial<OrientationContract> = {}): OrientationContract => ({
  activeFacet: 'water',
  posture: 'witness' as OrientationContract['posture'],
  integrityFlags: {
    water_rush_risk: true,
    threshold_collapse_risk: false,
    fire_burnout_risk: false,
    air_dissociation_risk: false,
    earth_rigidity_risk: false,
  },
  languageHints: { pace: 'slow', depth: 'stay_close', mode: 'witness' },
  ...over,
});

afterEach(() => jest.restoreAllMocks());

describe('/list-shaped request — no trusted packet, service computes one', () => {
  it('computes at the shared boundary and reports source "service"', () => {
    const r = resolveOrientationContract({
      input: 'I keep circling the same thing and I cannot tell if it is moving.',
      conversationHistory: [],
      sanctuary: false,
    });
    expect(r.source).toBe('service');
    expect(r.contract).not.toBeNull();
  });
});

describe('/between-shaped request — trusted packet survives, no recomputation', () => {
  it('returns the same object identity and reports source "upstream"', () => {
    const trusted = packet({ activeFacet: 'fire' });
    const r = resolveOrientationContract({
      trusted,
      input: 'anything at all',
      conversationHistory: [],
      sanctuary: false,
    });
    expect(r.source).toBe('upstream');
    // Same reference: proof it was not recomputed, not merely equal-valued.
    expect(r.contract).toBe(trusted);
    expect(r.contract!.activeFacet).toBe('fire');
  });
});

describe('client meta.facetDecision is never cognition authority', () => {
  it('resolve has no meta channel — a forged packet cannot enter through one', () => {
    // The type has no `meta`. This is the structural guarantee: the only way in is the
    // typed `trusted` field, which only a server path can populate.
    const forged = packet({ activeFacet: 'aether' });
    const r = resolveOrientationContract({
      // @ts-expect-error — meta is not part of the resolve input, by design (PBR-001).
      meta: { facetDecision: forged },
      input: 'ordinary message',
      conversationHistory: [],
      sanctuary: false,
    });
    expect(r.source).toBe('service');
    expect(r.contract).not.toBe(forged);
  });
});

describe('Sanctuary — no contract produced or accepted, no orientation body logged', () => {
  it('yields null even when a trusted packet is supplied', () => {
    const r = resolveOrientationContract({
      trusted: packet(),
      input: 'something tender',
      conversationHistory: [],
      sanctuary: true,
    });
    expect(r.contract).toBeNull();
    expect(r.source).toBe('none');
  });

  it('shadow line carries no facet or risk data under sanctuary', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation((() => {}) as never);
    const line = emitOrientationShadow({
      tier: 'FAST',
      resolved: { contract: null, source: 'none' },
      legacyPrompt: 'P',
      sentPrompt: 'P',
      sanctuary: true,
    });
    expect(line.contractPresent).toBe(false);
    expect(line.applied).toBe(false);
    const emitted = JSON.stringify(spy.mock.calls);
    expect(emitted).not.toMatch(/water|fire|earth|air|aether|risk_|invitation|transition/i);
  });
});

describe('computeFacetDecision throws — fail-soft, ordinary cognition unchanged', () => {
  it('returns no contract rather than propagating', () => {
    jest.spyOn(console, 'warn').mockImplementation((() => {}) as never);
    // The throw is induced through the real input path rather than by mocking the module:
    // a non-string input makes computeFacetDecision's internal string handling throw, which
    // is what the try/catch in resolveOrientationContract exists to absorb.
    const r = resolveOrientationContract({
      input: undefined as unknown as string,
      conversationHistory: [],
      sanctuary: false,
    });
    expect(r.contract).toBeNull();
    expect(r.source).toBe('none');
  });
});

describe('prompt zero-diff — the cut has no response authority', () => {
  it.each(['FAST', 'CORE', 'DEEP'])('%s reports zeroPromptDiff and applied:false', (tier) => {
    jest.spyOn(console, 'log').mockImplementation((() => {}) as never);
    const prompt = 'system prompt bytes as built today';
    const line = emitOrientationShadow({
      tier,
      resolved: { contract: packet(), source: 'service' },
      legacyPrompt: prompt,
      sentPrompt: prompt,
      sanctuary: false,
    });
    expect(line.zeroPromptDiff).toBe(true);
    expect(line.legacyPromptDigest).toBe(line.sentPromptDigest);
    expect(line.applied).toBe(false);
    expect(line.contractPresent).toBe(true);
    // The orientation digest is enumerable, so it must not be in the emitted line at all.
    expect(line).not.toHaveProperty('contractDigest');
    expect(JSON.stringify(line)).not.toContain(orientationDigest(packet()));
  });

  it('would report a non-zero diff if the contract were ever appended', () => {
    jest.spyOn(console, 'log').mockImplementation((() => {}) as never);
    const prompt = 'system prompt';
    const line = emitOrientationShadow({
      tier: 'FAST',
      resolved: { contract: packet(), source: 'service' },
      legacyPrompt: prompt,
      sentPrompt: prompt + '\n\n' + renderOrientationForCognition(packet()),
      sanctuary: false,
    });
    // Guard on the guard: the zero-diff assertion above is meaningful only if this fails.
    expect(line.zeroPromptDiff).toBe(false);
  });
});

describe('telemetry is content-free', () => {
  it('digest excludes member-derived language', () => {
    const a = packet({
      regulation: { dominant: 'water', complement: 'earth', invitationPhrase: 'PHRASE ONE' },
    });
    const b = packet({
      regulation: { dominant: 'water', complement: 'earth', invitationPhrase: 'ENTIRELY DIFFERENT' },
    });
    // Same structural decision, different free text → same digest. The phrase is not in it.
    expect(orientationDigest(a)).toBe(orientationDigest(b));
  });

  it('digest still distinguishes different structural decisions', () => {
    expect(orientationDigest(packet({ activeFacet: 'fire' })))
      .not.toBe(orientationDigest(packet({ activeFacet: 'water' })));
  });
});

describe('history normalization — both surface shapes', () => {
  it('expands a ConversationExchange into its two speech turns', async () => {
    const { normalizeOrientationHistory } = await import('../contract');
    expect(
      normalizeOrientationHistory([{ userMessage: 'I said this', maiaResponse: 'she said that' }]),
    ).toEqual([
      { role: 'user', content: 'I said this' },
      { role: 'assistant', content: 'she said that' },
    ]);
  });

  it('passes role/content pairs through', async () => {
    const { normalizeOrientationHistory } = await import('../contract');
    expect(normalizeOrientationHistory([{ role: 'user', content: 'hello' }])).toEqual([
      { role: 'user', content: 'hello' },
    ]);
  });
});

describe('zeroPromptDiff is literal byte equality, not a digest comparison', () => {
  it('is false for a one-character difference', () => {
    jest.spyOn(console, 'log').mockImplementation((() => {}) as never);
    const line = emitOrientationShadow({
      tier: 'FAST',
      resolved: { contract: null, source: 'none' },
      legacyPrompt: 'prompt',
      sentPrompt: 'prompt ',
      sanctuary: false,
    });
    expect(line.zeroPromptDiff).toBe(false);
  });

  it('does not derive zeroPromptDiff from the emitted digests', () => {
    jest.spyOn(console, 'log').mockImplementation((() => {}) as never);
    // Both digests are 12 hex characters — a truncation, so digest equality is weaker
    // evidence than string equality. This asserts the claim is made on the strings: the
    // line reports true only when the bytes themselves match.
    const same = emitOrientationShadow({
      tier: 'CORE',
      resolved: { contract: null, source: 'none' },
      legacyPrompt: 'x'.repeat(50000),
      sentPrompt: 'x'.repeat(50000),
      sanctuary: false,
    });
    expect(same.zeroPromptDiff).toBe(true);
    const diff = emitOrientationShadow({
      tier: 'CORE',
      resolved: { contract: null, source: 'none' },
      legacyPrompt: 'x'.repeat(50000),
      sentPrompt: 'x'.repeat(49999) + 'y',
      sanctuary: false,
    });
    expect(diff.zeroPromptDiff).toBe(false);
  });
});

describe('production shadow line carries no orientation content', () => {
  it('emits exactly the authorized fields', () => {
    jest.spyOn(console, 'log').mockImplementation((() => {}) as never);
    const line = emitOrientationShadow({
      tier: 'FAST',
      resolved: { contract: packet(), source: 'upstream' },
      legacyPrompt: 'P',
      sentPrompt: 'P',
      sanctuary: false,
    });
    expect(Object.keys(line).sort()).toEqual([
      'applied',
      'contractPresent',
      'contractSource',
      'legacyPromptDigest',
      'sanctuary',
      'sentPromptDigest',
      'tier',
      'zeroPromptDiff',
    ]);
    const emitted = JSON.stringify(line);
    expect(emitted).not.toMatch(/water|fire|earth|air|aether|threshold|witness|risk/i);
  });
});
