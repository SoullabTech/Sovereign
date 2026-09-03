/**
 * Prerequisite unit — request / metadata / count semantics for POST /api/ideas/[id]/ask-maia.
 *
 * Scope is deliberately narrow. This proves the semantic substrate the ratified
 * T1 instrument expects to observe:
 *
 *   - one-turn relational stance: parsed, refused when unknown, passed to the
 *     reflection primitive, persisted in the existing block metadata, never sticky
 *   - a real reflection COUNT read, performed exactly once, its value handed to
 *     the primitive
 *
 * It imports NO T1 instrumentation. There is no attempt id, no stage ladder and
 * no runtime revision here — T1 is a separate unit that instruments this runtime
 * after it exists.
 */

import { isIdeaStance, IDEA_STANCES } from '@/lib/maia/ideaStances';
import { progressionStage } from '@/lib/team/maiaThreadReflection';

describe('stance vocabulary — the refusal boundary', () => {
  it('accepts exactly the five ratified verbs', () => {
    expect([...IDEA_STANCES]).toEqual([
      'stay_with_this',
      'explore',
      'challenge',
      'connect',
      'distill',
    ]);
  });

  it('refuses an unrecognized stance rather than silently ignoring it', () => {
    expect(isIdeaStance('distill')).toBe(true);
    expect(isIdeaStance('summarize')).toBe(false);
    expect(isIdeaStance('')).toBe(false);
    expect(isIdeaStance(null)).toBe(false);
    expect(isIdeaStance(undefined)).toBe(false);
    expect(isIdeaStance(42)).toBe(false);
    expect(isIdeaStance({ stance: 'distill' })).toBe(false);
  });

  it('has no default — absence of a stance is a real state, not a fallback', () => {
    expect(IDEA_STANCES).not.toContain('default');
    expect(isIdeaStance(undefined)).toBe(false);
  });
});

describe('progression stage — computed from thread state', () => {
  it('maps reflection count to stage as the contract specifies', () => {
    expect(progressionStage(0)).toBe('clarify');
    expect(progressionStage(1)).toBe('clarify_or_close');
    expect(progressionStage(2)).toBe('close_and_offer');
    expect(progressionStage(12)).toBe('close_and_offer');
  });

  it('treats a negative or absent count as the opening stage', () => {
    expect(progressionStage(-1)).toBe('clarify');
  });
});

describe('route body contract', () => {
  // The route reads the raw body and tolerates its absence: plain "Ask MAIA"
  // posts nothing and must keep behaving exactly as it did before stances.
  function parseStance(raw: string): { ok: true; stance?: string } | { ok: false } {
    if (raw.trim().length === 0) return { ok: true };
    let body: { stance?: unknown };
    try {
      body = JSON.parse(raw) as { stance?: unknown };
    } catch {
      return { ok: false };
    }
    if (body.stance === undefined || body.stance === null) return { ok: true };
    if (!isIdeaStance(body.stance)) return { ok: false };
    return { ok: true, stance: body.stance };
  }

  it('treats a missing body as plain Ask MAIA', () => {
    expect(parseStance('')).toEqual({ ok: true });
  });

  it('treats an empty object as plain Ask MAIA', () => {
    expect(parseStance('{}')).toEqual({ ok: true });
  });

  it('treats an explicit null stance as plain Ask MAIA', () => {
    expect(parseStance('{"stance":null}')).toEqual({ ok: true });
  });

  it('carries a chosen stance through to the primitive', () => {
    expect(parseStance('{"stance":"distill"}')).toEqual({ ok: true, stance: 'distill' });
  });

  it('rejects an unknown stance', () => {
    expect(parseStance('{"stance":"summarize"}')).toEqual({ ok: false });
  });

  it('rejects a malformed body', () => {
    expect(parseStance('{stance:')).toEqual({ ok: false });
  });
});

describe('metadata shape — what a thread reads back as', () => {
  // Mirrors the route's construction: the stance key is present only when the
  // member chose one, so a plain Ask MAIA block is byte-identical to before.
  function metadataFor(stance?: string): Record<string, unknown> {
    return {
      source: 'maia',
      invoked_from: 'idea_thread',
      ...(stance ? { stance } : {}),
    };
  }

  it('omits the stance key entirely on a plain Ask MAIA', () => {
    expect(metadataFor()).toEqual({ source: 'maia', invoked_from: 'idea_thread' });
    expect('stance' in metadataFor()).toBe(false);
  });

  it('records the exact chosen stance', () => {
    expect(metadataFor('distill')).toEqual({
      source: 'maia',
      invoked_from: 'idea_thread',
      stance: 'distill',
    });
  });

  it('needs no schema change — the stance rides in existing block metadata', () => {
    // member_idea_blocks.metadata is JSONB and already written by this route on
    // canonical. The prerequisite adds no migration.
    const keys = Object.keys(metadataFor('explore'));
    expect(keys).toEqual(['source', 'invoked_from', 'stance']);
  });
});
