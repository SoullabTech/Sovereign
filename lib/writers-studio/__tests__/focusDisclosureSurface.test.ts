/**
 * §3a — SURFACE CONTRACT FALSIFIERS, S1–S8, plus the mutation test.
 *
 *   ⭐⭐ The surface may state only what the receipt outcome proves about THIS
 *       invocation and any prior one.
 *
 * ⛔ Three of these states are failures that look superficially identical and are
 * epistemically different. That resemblance is exactly why the mutation test at
 * the bottom exists: it deliberately writes the wrong copy and proves a falsifier
 * goes red, so the drift that would otherwise creep in later is caught.
 */

import {
  presentBoundaryOutcome, presentCrossing, permitsCognition,
  authorizeOrdinaryScope, WRITER_FACING_COPY,
  type FocusDisclosurePresentation,
} from '../focusDisclosureSurface';
import type { BoundaryOutcome } from '@/lib/disclosure/disclosureBoundary';

const consentFail: BoundaryOutcome = { kind: 'consent_unavailable', reason: 'substrate unavailable' };
const receiptUnavailable: BoundaryOutcome = { kind: 'receipt_refused', outcome: { kind: 'unavailable' } };
const receiptMismatch: BoundaryOutcome = {
  kind: 'receipt_refused', outcome: { kind: 'identity_mismatch', differing: ['source_ref'] } };
const priorAttempted: BoundaryOutcome = {
  kind: 'receipt_refused', outcome: { kind: 'existing', id: 'r1', state: 'attempted' } };
const priorCrossed: BoundaryOutcome = {
  kind: 'receipt_refused', outcome: { kind: 'existing', id: 'r1', state: 'crossed' } };
const mayCross: BoundaryOutcome = { kind: 'may_cross', disclosureId: 'd-1', receiptId: 'r1' };

/** The claim under test everywhere below: an unqualified "nothing was sent". */
const claimsNothingSent = (p: FocusDisclosurePresentation) =>
  /nothing from this focus was sent|nothing was sent/i.test(p.message ?? '');

describe('S1 · a definite non-crossing may say nothing was sent', () => {
  it.each([
    ['consent_unavailable', consentFail],
    ['receipt unavailable', receiptUnavailable],
    ['receipt identity mismatch', receiptMismatch],
  ] as const)('%s', (_label, outcome) => {
    const p = presentBoundaryOutcome(outcome);
    expect(p.state).toBe('did_not_cross');
    expect(p.mayClaimNothingSent).toBe(true);
    expect(claimsNothingSent(p)).toBe(true);
  });

  it('a mismatch is a governance anomaly internally while reading as ordinary trouble', () => {
    expect(presentBoundaryOutcome(receiptMismatch).severity).toBe('governance_anomaly');
    expect(presentBoundaryOutcome(receiptUnavailable).severity).toBe('infrastructure');
    // ⭐ Same words to the writer; different urgency to us. Both are honest.
    expect(presentBoundaryOutcome(receiptMismatch).message)
      .toBe(presentBoundaryOutcome(receiptUnavailable).message);
  });
});

describe('S2 · an unresolved prior attempt may NEVER make an unqualified non-crossing claim', () => {
  const p = () => presentBoundaryOutcome(priorAttempted);

  it('does not say nothing was sent — a prior crossing may have occurred', () => {
    expect(p().state).toBe('prior_unresolved');
    expect(p().mayClaimNothingSent).toBe(false);
    expect(claimsNothingSent(p())).toBe(false);
  });

  it('states BOTH facts: the previous attempt is unresolved, and this one sent nothing again', () => {
    expect(p().message).toMatch(/previous attempt is unresolved/i);
    expect(p().message).toMatch(/haven't sent it again/i);
  });

  it('⭐ withholds Try again — the same disclosure identity may not be replayed', () => {
    expect(p().actions).not.toContain('try_again');
    expect(p().actions).toContain('start_new_focus_request');
  });
});

describe('S3 · a prior crossing is preserved, and nothing beyond it is inferred', () => {
  const p = () => presentBoundaryOutcome(priorCrossed);

  it('says the earlier send happened', () => {
    expect(p().state).toBe('prior_crossed');
    expect(p().message).toMatch(/already sent to MAIA in the earlier request/i);
    expect(claimsNothingSent(p())).toBe(false);
  });

  it('offers a new request rather than replaying the old identity', () => {
    expect(p().actions).toEqual(['start_new_focus_request', 'continue_without_focus']);
  });

  it('claims nothing about the earlier ANSWER — the receipt proves a crossing, not a response', () => {
    expect(p().message).not.toMatch(/answer|response|repl(y|ied)|said/i);
  });
});

describe('S4 · no failure branch automatically invokes ordinary cognition', () => {
  it.each([consentFail, receiptUnavailable, receiptMismatch, priorAttempted, priorCrossed])(
    'offers continue_without_focus as an action, never as an effect', outcome => {
      const p = presentBoundaryOutcome(outcome);
      expect(p.actions).toContain('continue_without_focus');
      expect(permitsCognition(outcome)).toBe(false);
    });

  it('the module performs nothing — no calls, no io, no model', () => {
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'lib/writers-studio/focusDisclosureSurface.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(src).not.toMatch(/await |fetch\(|query\(|getMaiaResponse|anthropic/i);
  });
});

describe('S5 · Continue without Focus requires a new member gesture', () => {
  it('authorizes ordinary scope only on the explicit act', () => {
    expect(authorizeOrdinaryScope('continue_without_focus')).toBe(true);
  });

  it.each(['try_again', 'start_new_focus_request', null] as const)(
    'refuses to authorize ordinary scope from %s', act => {
      expect(authorizeOrdinaryScope(act as never)).toBe(false);
    });
});

describe('S6 · a post-boundary confirmation failure may NEVER say nothing was sent', () => {
  it('names our integrity problem without denying the crossing', () => {
    const p = presentCrossing(false);
    expect(p.state).toBe('crossed_unaccounted');
    expect(claimsNothingSent(p)).toBe(false);
    expect(p.message).toMatch(/MAIA received this Focus/i);
    expect(p.message).toMatch(/couldn't complete the disclosure record/i);
    expect(p.severity).toBe('integrity_anomaly');
  });

  it('a confirmed crossing says nothing at all — an ordinary Focus conversation', () => {
    const p = presentCrossing(true);
    expect(p.state).toBe('crossed_accounted');
    expect(p.message).toBeNull();
  });

  it('⛔ no post-boundary state offers Continue without Focus — the Focus already crossed', () => {
    expect(presentCrossing(false).actions).toEqual([]);
    expect(presentCrossing(true).actions).toEqual([]);
  });
});

describe('S7 · only may_cross permits the eventual cognition call', () => {
  it('permits exactly one outcome', () => {
    expect(permitsCognition(mayCross)).toBe(true);
    for (const o of [consentFail, receiptUnavailable, receiptMismatch, priorAttempted, priorCrossed]) {
      expect(permitsCognition(o)).toBe(false);
    }
  });

  it('may_cross says nothing yet — the surface speaks after confirmation', () => {
    expect(presentBoundaryOutcome(mayCross).message).toBeNull();
  });
});

describe('S8 · copy never exposes internal vocabulary', () => {
  const BANNED = [
    'receipt_refused', 'identity_mismatch', 'existing_exact', 'consent_unavailable',
    'may_cross', 'attempted', 'crossed', 'disclosure_id', 'request_ref', 'source_ref',
    'request id', 'receipt id', 'foreign key', 'null', 'undefined', 'd-1', 'r1', 'req-',
  ];
  it.each(WRITER_FACING_COPY)('%s exposes nothing internal', copy => {
    for (const b of BANNED) expect(copy.toLowerCase()).not.toContain(b.toLowerCase());
  });

  it('every presentation carries only closed-vocabulary actions', () => {
    const allowed = ['try_again', 'start_new_focus_request', 'continue_without_focus'];
    for (const o of [consentFail, receiptUnavailable, receiptMismatch, priorAttempted, priorCrossed]) {
      for (const a of presentBoundaryOutcome(o).actions) expect(allowed).toContain(a);
    }
  });
});

describe('MUTATION · the instrument actually catches the drift it exists for', () => {
  /**
   * ⭐ The founder's test of the test: map `existing · attempted` to the simple
   * "Nothing was sent" copy and prove S2 goes RED. Without this, S2 could be
   * passing because the states differ, not because the claim is checked.
   */
  it('S2 fails when the unresolved state is given the simple non-crossing copy', () => {
    const mutated: FocusDisclosurePresentation = {
      ...presentBoundaryOutcome(priorAttempted),
      message: "I couldn't bring this Focus into MAIA just now. Nothing from this Focus was sent.",
    };
    // The real assertion S2 makes:
    const s2 = () => expect(claimsNothingSent(mutated)).toBe(false);
    expect(s2).toThrow();
  });

  it('S6 fails when a confirmation failure is given non-crossing copy', () => {
    const mutated: FocusDisclosurePresentation = {
      ...presentCrossing(false),
      message: 'Nothing was sent.',
    };
    expect(() => expect(claimsNothingSent(mutated)).toBe(false)).toThrow();
  });

  it('S5 fails when a failure action is allowed to authorize ordinary scope', () => {
    const badAuthorize = (act: string | null) => act !== null;
    expect(() => expect(badAuthorize('try_again')).toBe(false)).toThrow();
  });
});
