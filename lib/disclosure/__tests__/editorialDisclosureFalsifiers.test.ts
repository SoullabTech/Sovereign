/**
 * EDITORIAL DISCLOSURE — the five falsifiers.
 *
 * Founder ruling 2026-09-21 · spec:
 * docs/programme/EDITORIAL_DISCLOSURE_REPAIR_SPEC_2026-09-21.md
 *
 * ⭐ SYNTHETIC TEXT ONLY. No manuscript passage appears here, and the prose
 * check below is written so that it could not.
 *
 * Source assertions strip comments first — these modules DISCUSS the things
 * they must not do, and a check that counted prose would pass or fail for the
 * wrong reason. The same discipline `seamIsolation.test.ts` uses, and for the
 * same reason.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { shouldConfirmCrossing } from '../crossingConfirmation';

const ROOT = join(__dirname, '..', '..', '..');
const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const src = (p: string) => strip(readFileSync(join(ROOT, p), 'utf8'));

const TURN = 'lib/manuscript/editorialRuntime/turn.ts';

/* ── F1 · NO AUTHORIZATION → NO DISPATCH ─────────────────────────────────── */
describe('F1 · authorization precedes dispatch', () => {
  it('refuses before the structured call when the boundary does not permit', () => {
    const s = src(TURN);
    const guard = s.indexOf('if (!mayCrossBoundary(boundary))');
    const dispatch = s.indexOf('await runStructured(request)');
    expect(guard).toBeGreaterThan(-1);
    expect(dispatch).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(dispatch);
  });

  it('the refusal is its own reason, not folded into a provider failure', () => {
    expect(src(TURN)).toContain("reason: 'disclosure_unavailable'");
  });

  it('nothing between the guard and the dispatch can reach a provider', () => {
    const s = src(TURN);
    const between = s.slice(
      s.indexOf('if (!mayCrossBoundary(boundary))'),
      s.indexOf('await runStructured(request)'),
    );
    expect(between).not.toContain('runStructured');
  });
});

/* ── F2 · THE RECEIPT EXISTS BEFORE THE REQUEST LEAVES ───────────────────── */
describe('F2 · an attempted receipt precedes the crossing', () => {
  it('the boundary is established before the structured call', () => {
    const s = src(TURN);
    expect(s.indexOf('await establishDisclosureBoundary(')).toBeLessThan(
      s.indexOf('await runStructured(request)'));
  });

  it('the boundary is established before the author words enter cognition', () => {
    const s = src(TURN);
    expect(s.indexOf('await establishDisclosureBoundary(')).toBeLessThan(
      s.indexOf('const cognitionBlocks'));
  });
});

/* ── F3 · CONFIRMED ARRIVAL → CROSSED ────────────────────────────────────── */
describe('F3 · confirmation follows arrival, not success', () => {
  it('a result confirms', () => {
    expect(shouldConfirmCrossing({ kind: 'result' })).toBe(true);
  });

  it('⭐ a provider that answered with an error still confirms', () => {
    // The ruling: independently of whether the response passes validation.
    expect(shouldConfirmCrossing({ kind: 'refusal', dispatch: 'response_observed' }))
      .toBe(true);
  });
});

/* ── F4 · AMBIGUOUS FAILURE STAYS ATTEMPTED ──────────────────────────────── */
describe('F4 · ambiguity does not confirm, and does not deny', () => {
  it('⚠️ a timeout does not confirm', () => {
    expect(shouldConfirmCrossing({ kind: 'refusal', dispatch: 'unknown' })).toBe(false);
  });

  it('nothing observed does not confirm', () => {
    expect(shouldConfirmCrossing({ kind: 'refusal', dispatch: 'no_response_observed' }))
      .toBe(false);
  });

  it('a refusal before any provider was reached does not confirm', () => {
    expect(shouldConfirmCrossing({ kind: 'refusal', dispatch: undefined })).toBe(false);
  });

  it('⛔ there is no state meaning "nothing crossed" to fall back to', () => {
    // The vocabulary admits attempted and crossed only. A third value would
    // assert a negative the database cannot prove.
    const receipt = src('lib/disclosure/contextDisclosureReceipt.ts');
    expect(receipt).not.toMatch(/'withheld'|'not_crossed'|'refused_crossing'/);
  });

  it('⭐ exhaustive: response_observed is the ONLY confirming refusal', () => {
    const all = ['response_observed', 'no_response_observed', 'unknown', undefined] as const;
    const confirming = all.filter((d) => shouldConfirmCrossing({ kind: 'refusal', dispatch: d }));
    expect(confirming).toEqual(['response_observed']);
  });
});

/* ── F5 · NO PROSE IN THE RECEIPT ────────────────────────────────────────── */
describe('F5 · the receipt carries identities, never words', () => {
  it('the disclosure argument names no text-bearing field', () => {
    const s = src(TURN);
    const call = s.slice(
      s.indexOf('await establishDisclosureBoundary('),
      s.indexOf('if (!mayCrossBoundary(boundary))'));
    for (const forbidden of [
      'locusText', 'expectedText', 'authorSample', 'body', 'text',
      'excerpt', 'digest', 'hash', 'offset', 'length',
    ]) {
      expect(call).not.toContain(forbidden);
    }
  });

  it('⭐ it names the section as a scope kind, and does NOT pass a sectionRef', () => {
    // A passage's containing section materially narrows reconstruction, so it is
    // refused here as well as by a CHECK.
    const s = src(TURN);
    const call = s.slice(
      s.indexOf('await establishDisclosureBoundary('),
      s.indexOf('if (!mayCrossBoundary(boundary))'));
    expect(call).toContain("scopeKind: 'passage'");
    expect(call).not.toContain('sectionRef');
  });

  it('the boundary and gesture are the ruled values', () => {
    const s = src(TURN);
    expect(s).toContain("boundary: 'writers_studio.editorial_turn->maia_cognition'");
    expect(s).toContain("gesture: 'work_with_this'");
  });

  it('the migration admits that boundary', () => {
    const m = readFileSync(join(ROOT,
      'database/migrations/20260921000001_disclosure_boundary_editorial_turn.sql'), 'utf8');
    expect(m).toContain("'writers_studio.editorial_turn->maia_cognition'");
  });
});

/* ── SEAM · the new module must not widen what may see the vendor ────────── */
describe('the dispatch module names no vendor', () => {
  it('imports no SDK', () => {
    expect(src('lib/ai/structured/dispatch.ts')).not.toMatch(/from\s+'@anthropic-ai\/sdk'/);
  });

  it('the router still imports no SDK after carrying the observation', () => {
    expect(src('lib/ai/structured/router.ts')).not.toMatch(/from\s+'@anthropic-ai\/sdk'/);
  });
});
