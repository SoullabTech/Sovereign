/**
 * RC-GEN-01 step 2 falsifiers — result geometry under a forced tool contract.
 *
 * The load-bearing one is TWO CALLS -> malformed. A known-bad that takes the
 * first passes every other test here and fails only that one.
 */
import { admitToolEnvelope } from '../lib/manuscript/revision/envelope';
import type { StructuredBlock } from '../lib/ai/structured/types';

const S1 = '11111111-1111-1111-1111-111111111111';
const AUTH = [S1];
const text = (t: string): StructuredBlock => ({ type: 'text', text: t });
const call = (input: unknown, name = 'revision_outcome', id = 'tu_1'): StructuredBlock =>
  ({ type: 'tool_use', id, name, input });

const LAWFUL = { kind: 'proposals', proposals: [{ sectionId: S1, proposedText: 'tighter wording', reason: 'less abstract' }] };
const RESTRAINT = { kind: 'no_change', reason: "it's doing what you want" };

describe('exactly one call is the only admissible geometry', () => {
  it('admits exactly one lawful call', () => {
    const r = admitToolEnvelope([call(LAWFUL)], AUTH);
    expect(r.ok).toBe(true);
  });

  it('admits one lawful no_change call', () => {
    const r = admitToolEnvelope([call(RESTRAINT)], AUTH);
    expect(r).toMatchObject({ ok: true, outcome: { kind: 'no_change' } });
  });

  it('⭐⭐ refuses TWO revision_outcome calls — never takes the first', () => {
    const r = admitToolEnvelope([call(LAWFUL, 'revision_outcome', 'tu_1'), call(RESTRAINT, 'revision_outcome', 'tu_2')], AUTH);
    expect(r).toMatchObject({ ok: false, refusal: 'malformed' });
    expect((r as any).detail).toContain('two answers are not an answer');
  });

  it('refuses an unexpected tool called alongside the revision outcome', () => {
    const r = admitToolEnvelope([call(LAWFUL), call({}, 'some_other_tool', 'tu_2')], AUTH);
    expect(r).toMatchObject({ ok: false, refusal: 'malformed' });
  });

  it('refuses a call under the wrong tool name', () => {
    expect(admitToolEnvelope([call(LAWFUL, 'edit_document')], AUTH))
      .toMatchObject({ ok: false, refusal: 'malformed' });
  });
});

describe('⛔ text blocks carry zero evidentiary weight', () => {
  it('text only -> no_answer, never promoted to an answer', () => {
    expect(admitToolEnvelope([text('I would tighten the middle sentence.')], AUTH))
      .toMatchObject({ ok: false, refusal: 'no_answer' });
  });

  it('an empty completion -> no_answer', () => {
    expect(admitToolEnvelope([], AUTH)).toMatchObject({ ok: false, refusal: 'no_answer' });
  });

  it('text + malformed tool -> malformed; the prose does not repair it', () => {
    expect(admitToolEnvelope([text('here is what I suggest'), call({ kind: 'maybe' })], AUTH))
      .toMatchObject({ ok: false, refusal: 'malformed' });
  });

  it('text + one lawful tool -> the tool input is the answer', () => {
    const r = admitToolEnvelope([text('thinking out loud'), call(LAWFUL)], AUTH);
    expect(r.ok).toBe(true);
  });

  it('⭐ text that CONTRADICTS the tool call does not change the answer', () => {
    const r = admitToolEnvelope([text('actually, leave it alone'), call(LAWFUL)], AUTH);
    expect(r).toMatchObject({ ok: true, outcome: { kind: 'proposals' } });
  });
});

describe('the envelope defers section authority to the admitter', () => {
  it('an unauthorized section still refuses through the envelope', () => {
    const bad = { kind: 'proposals', proposals: [{ sectionId: 'ffffffff-ffff-ffff-ffff-ffffffffffff', proposedText: 'x', reason: 'y' }] };
    expect(admitToolEnvelope([call(bad)], AUTH))
      .toMatchObject({ ok: false, refusal: 'unknown_section' });
  });
});
