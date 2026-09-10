/**
 * RC-GEN-01 falsifiers for the typed revision outcome.
 *
 * The load-bearing obligation is RC-07a: `no_change` is a SUCCESSFUL outcome and
 * must never be reachable as, or confusable with, a failure.
 */
import {
  admitRevisionOutcome,
  revisionToolSchema,
  REVISION_TOOL_NAME,
} from '../lib/manuscript/revision/outcome';

const S1 = '11111111-1111-1111-1111-111111111111';
const S2 = '22222222-2222-2222-2222-222222222222';
const AUTHORIZED = [S1, S2];

describe('RC-07a — restraint is a successful outcome', () => {
  it('admits no_change with a reason', () => {
    const r = admitRevisionOutcome({ kind: 'no_change', reason: "the recurrence is doing what you want" }, AUTHORIZED);
    expect(r).toEqual({ ok: true, outcome: { kind: 'no_change', reason: "the recurrence is doing what you want" } });
  });

  it('⭐ no_change is ok:true — never a refusal', () => {
    const r = admitRevisionOutcome({ kind: 'no_change', reason: 'leave it' }, AUTHORIZED);
    expect(r.ok).toBe(true);
    expect('refusal' in r).toBe(false);
  });

  it('refuses no_change without a reason — restraint must be explained', () => {
    expect(admitRevisionOutcome({ kind: 'no_change' }, AUTHORIZED))
      .toMatchObject({ ok: false, refusal: 'malformed' });
  });

  it('⭐ refuses a no_change that also proposes — that is two answers, not a judgement', () => {
    const r = admitRevisionOutcome(
      { kind: 'no_change', reason: 'leave it', proposals: [{ sectionId: S1, proposedText: 'x', reason: 'y' }] },
      AUTHORIZED,
    );
    expect(r).toMatchObject({ ok: false, refusal: 'malformed' });
  });
});

describe('proposals', () => {
  it('admits one concrete proposal against an authorized section', () => {
    const r = admitRevisionOutcome(
      { kind: 'proposals', proposals: [{ sectionId: S1, proposedText: 'The knowledge arrived already complete.', reason: 'less abstract' }] },
      AUTHORIZED,
    );
    expect(r.ok).toBe(true);
    if (r.ok && r.outcome.kind === 'proposals') {
      expect(r.outcome.proposals).toHaveLength(1);
      expect(r.outcome.proposals[0].sectionId).toBe(S1);
    }
  });

  it('refuses an empty proposals array — that is not restraint, it is nothing', () => {
    expect(admitRevisionOutcome({ kind: 'proposals', proposals: [] }, AUTHORIZED))
      .toMatchObject({ ok: false, refusal: 'malformed' });
  });

  it.each(['sectionId', 'proposedText', 'reason'])('refuses a proposal missing %s', (field) => {
    const p: Record<string, string> = { sectionId: S1, proposedText: 'x', reason: 'y' };
    delete p[field];
    expect(admitRevisionOutcome({ kind: 'proposals', proposals: [p] }, AUTHORIZED))
      .toMatchObject({ ok: false, refusal: 'malformed' });
  });

  it('refuses whitespace-only text as a proposal', () => {
    expect(admitRevisionOutcome({ kind: 'proposals', proposals: [{ sectionId: S1, proposedText: '   ', reason: 'y' }] }, AUTHORIZED))
      .toMatchObject({ ok: false, refusal: 'malformed' });
  });
});

describe('⭐ authorization is checked here, never trusted from the model', () => {
  it('refuses a proposal naming an unauthorized section', () => {
    expect(admitRevisionOutcome(
      { kind: 'proposals', proposals: [{ sectionId: 'ffffffff-ffff-ffff-ffff-ffffffffffff', proposedText: 'x', reason: 'y' }] },
      AUTHORIZED,
    )).toMatchObject({ ok: false, refusal: 'unknown_section' });
  });

  it('⭐ refuses the WHOLE answer when one of several proposals is unauthorized — never silently filters', () => {
    const r = admitRevisionOutcome(
      { kind: 'proposals', proposals: [
        { sectionId: S1, proposedText: 'ok', reason: 'r' },
        { sectionId: 'ffffffff-ffff-ffff-ffff-ffffffffffff', proposedText: 'x', reason: 'y' },
      ] },
      AUTHORIZED,
    );
    expect(r).toMatchObject({ ok: false, refusal: 'unknown_section' });
  });

  it('admits nothing when the authorized set is empty', () => {
    expect(admitRevisionOutcome({ kind: 'proposals', proposals: [{ sectionId: S1, proposedText: 'x', reason: 'y' }] }, []))
      .toMatchObject({ ok: false, refusal: 'unknown_section' });
  });
});

describe('malformed shapes are refused, never coerced', () => {
  it.each([[null], [undefined], ['a string'], [42], [[]]])('refuses %p', (input) => {
    expect(admitRevisionOutcome(input, AUTHORIZED)).toMatchObject({ ok: false, refusal: 'malformed' });
  });

  it('refuses an unknown kind', () => {
    expect(admitRevisionOutcome({ kind: 'maybe' }, AUTHORIZED))
      .toMatchObject({ ok: false, refusal: 'malformed' });
  });
});

describe('⛔ the F boundary is enforced by absence', () => {
  it('the tool schema admits no preference, tendency, style or trait field', () => {
    const json = JSON.stringify(revisionToolSchema);
    for (const banned of ['preference', 'tendency', 'style', 'trait', 'profile', 'voice', 'score']) {
      expect(json.toLowerCase()).not.toContain(banned);
    }
  });

  it('additionalProperties is false at every level, so no extra field can arrive', () => {
    expect(revisionToolSchema.additionalProperties).toBe(false);
    const props = revisionToolSchema.properties as Record<string, any>;
    expect(props.proposals.items.additionalProperties).toBe(false);
  });

  it('names the tool MAIA must answer through', () => {
    expect(REVISION_TOOL_NAME).toBe('revision_outcome');
  });
});
