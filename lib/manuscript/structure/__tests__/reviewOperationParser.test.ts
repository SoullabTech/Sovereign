/**
 * WS2-05B - the boundary parser.
 *
 * These tests exist because the type system said this was already safe. It was
 * not: `await req.json() as ReviewRequest` asserts a shape rather than checking
 * one, and `{"op":"whatever"}` satisfied the assertion completely.
 */

import { parseReviewOperation } from '../reviewOperationParser';

const ok = (input: unknown) => {
  const r = parseReviewOperation(input);
  if (!r.ok) throw new Error(`expected ok, got: ${r.reason}`);
  return r.operation;
};
const refused = (input: unknown) => {
  const r = parseReviewOperation(input);
  if (r.ok) throw new Error(`expected a refusal, got ${JSON.stringify(r.operation)}`);
  return r.reason;
};

describe('the discriminant is closed', () => {
  it('refuses an operation nobody implements', () => {
    expect(refused({ op: 'obliterate', unitId: 'u1' })).toMatch(/unknown operation/);
  });

  it('refuses an absent discriminant', () => {
    expect(refused({ unitId: 'u1' })).toMatch(/unknown operation/);
  });

  it('refuses a non-object body', () => {
    expect(refused('rename')).toBe('not an object');
    expect(refused(null)).toBe('not an object');
    expect(refused(42)).toBe('not an object');
  });

  /* An array IS an object to `typeof`. It carries no `op`, so it must fall to
     the unknown arm rather than through it. */
  it('refuses an array', () => {
    expect(refused([{ op: 'rename', unitId: 'u1' }])).toMatch(/unknown operation/);
  });
});

describe('every operation is checked for the fields it needs', () => {
  it('rename requires a unit and accepts null names', () => {
    expect(ok({ op: 'rename', unitId: 'u1', title: null, kind: null }))
      .toEqual({ op: 'rename', unitId: 'u1', title: null, kind: null });
    expect(refused({ op: 'rename', title: 'x', kind: null })).toMatch(/unitId/);
    expect(refused({ op: 'rename', unitId: 'u1', title: 7, kind: null })).toMatch(/title/);
  });

  it('set-boundary accepts one end or both, but not neither', () => {
    expect(ok({ op: 'set-boundary', unitId: 'u1', fromSectionId: 's1' }))
      .toEqual({ op: 'set-boundary', unitId: 'u1', fromSectionId: 's1' });
    expect(refused({ op: 'set-boundary', unitId: 'u1' })).toMatch(/changes nothing/);
    expect(refused({ op: 'set-boundary', unitId: 'u1', toSectionId: 3 })).toMatch(/toSectionId/);
  });

  it('reparent needs an integer index, not a numeric string or a float', () => {
    expect(ok({ op: 'reparent', unitId: 'u1', parentId: null, index: 0 }))
      .toEqual({ op: 'reparent', unitId: 'u1', parentId: null, index: 0 });
    expect(refused({ op: 'reparent', unitId: 'u1', parentId: null, index: '0' }))
      .toMatch(/integer index/);
    expect(refused({ op: 'reparent', unitId: 'u1', parentId: null, index: 1.5 }))
      .toMatch(/integer index/);
  });

  it('promote and remove need only a unit', () => {
    expect(ok({ op: 'promote', unitId: 'u1' })).toEqual({ op: 'promote', unitId: 'u1' });
    expect(refused({ op: 'remove', unitId: '' })).toMatch(/unitId/);
  });

  it('add needs a complete division, range included', () => {
    expect(ok({ op: 'add', parentId: null, index: 0, title: 'New', kind: null,
      fromSectionId: 's1', toSectionId: 's2' }))
      .toEqual({ op: 'add', parentId: null, index: 0, title: 'New', kind: null,
        fromSectionId: 's1', toSectionId: 's2' });
    expect(refused({ op: 'add', parentId: null, index: 0, title: 'New', kind: null }))
      .toMatch(/section range/);
  });

  it('transfer needs both ends of the move', () => {
    expect(ok({ op: 'transfer', unitId: 'u1', toParentId: 'u2' }))
      .toEqual({ op: 'transfer', unitId: 'u1', toParentId: 'u2' });
    expect(refused({ op: 'transfer', unitId: 'u1' })).toMatch(/toParentId/);
  });
});

describe('choose-alternative carries an identity and nothing else', () => {
  it('takes the id', () => {
    expect(ok({ op: 'choose-alternative', alternativeId: 'a1' }))
      .toEqual({ op: 'choose-alternative', alternativeId: 'a1' });
  });

  it('refuses a missing id', () => {
    expect(refused({ op: 'choose-alternative' })).toMatch(/alternativeId/);
  });

  /* THE AUTHORITY RULE, ENFORCED BY CONSTRUCTION. A client may attach a whole
     structure to this call; the parser builds the operation from the id alone,
     so the tree never reaches the engine to be considered and rejected - it
     simply is not there. */
  it('discards a smuggled structure rather than passing it on', () => {
    const op = ok({
      op: 'choose-alternative', alternativeId: 'a1',
      units: [{ id: 'x', title: 'INVENTED', fromSectionId: 's1', toSectionId: 's9' }],
      label: 'mine now',
    });
    expect(op).toEqual({ op: 'choose-alternative', alternativeId: 'a1' });
    expect(JSON.stringify(op)).not.toMatch(/INVENTED/);
  });
});
