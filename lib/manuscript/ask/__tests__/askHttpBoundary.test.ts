/**
 * WS2-05B-8B-02c-2P · what the Ask HTTP boundary will accept.
 *
 * THE CONTRACT UNION AND THE RUNTIME BOUNDARY ARE DIFFERENT LISTS, deliberately.
 * `AskAnchor` names every anchor 02c-1 ruled; this route accepts only the three
 * 02c-2 actually built. A shape the boundary accepts before its surface exists
 * is a shape nobody has proved — and for `work` in particular the cost was
 * concrete: it loads no proposal, so a raw POST could open and PERSIST a thread
 * and only then answer `no_reading`, admitting an author-originated Work thread
 * over HTTP before the slice that defines one.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  __parseAnchorForTest as parseAnchor,
  __supportedAnchorsForTest as SUPPORTED,
  __parseDevelopmentalAnchorForTest as parseDevelopmentalAnchor,
} from '../../../../app/api/sovereign/manuscripts/[id]/ask/route';

describe('the boundary accepts only what 02c-2 proved', () => {
  it('accepts exactly question, uncertainty and division', () => {
    expect([...SUPPORTED].sort()).toEqual(['division', 'question', 'uncertainty']);
  });

  it('accepts a well-formed question anchor', () => {
    expect(parseAnchor({ on: 'question', proposalId: 'P1', questionIndex: 0 }))
      .toEqual({ on: 'question', proposalId: 'P1', questionIndex: 0 });
  });

  it('accepts a well-formed uncertainty anchor', () => {
    expect(parseAnchor({ on: 'uncertainty', proposalId: 'P1', regionIndex: 2 }))
      .toEqual({ on: 'uncertainty', proposalId: 'P1', regionIndex: 2 });
  });

  it('accepts a well-formed division anchor', () => {
    expect(parseAnchor({ on: 'division', proposalId: 'P1', unitId: 'u1' }))
      .toEqual({ on: 'division', proposalId: 'P1', unitId: 'u1' });
  });
});

describe('unproved anchor kinds are refused at the boundary', () => {
  it.each([
    ['work', { on: 'work' }],
    ['proposal', { on: 'proposal', proposalId: 'P1' }],
    ['section', { on: 'section', sectionId: 's1' }],
    ['concern', { on: 'concern', sectionIds: ['s1'] }],
  ])('refuses %s', (_name, anchor) => {
    expect(parseAnchor(anchor)).toBeNull();
  });

  it('refuses an unknown kind outright', () => {
    expect(parseAnchor({ on: 'anything-else', proposalId: 'P1' })).toBeNull();
  });
});

describe('the parse stays closed on the shapes it does accept', () => {
  it('refuses a smuggled extra key', () => {
    expect(parseAnchor({ on: 'question', proposalId: 'P1', questionIndex: 0, extra: 1 }))
      .toBeNull();
  });

  it('refuses a missing or empty proposalId', () => {
    expect(parseAnchor({ on: 'question', questionIndex: 0 })).toBeNull();
    expect(parseAnchor({ on: 'question', proposalId: '', questionIndex: 0 })).toBeNull();
  });

  it('refuses a non-integer or negative index', () => {
    expect(parseAnchor({ on: 'question', proposalId: 'P1', questionIndex: 1.5 })).toBeNull();
    expect(parseAnchor({ on: 'uncertainty', proposalId: 'P1', regionIndex: -1 })).toBeNull();
  });

  it('refuses a non-object', () => {
    expect(parseAnchor(null)).toBeNull();
    expect(parseAnchor('question')).toBeNull();
  });
});

describe('refusal happens before any thread is written', () => {
  const ROUTE = readFileSync(join(__dirname, '..', '..', '..', '..',
    'app', 'api', 'sovereign', 'manuscripts', '[id]', 'ask', 'route.ts'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  it('an unparseable anchor returns before openThread is reached', () => {
    const refusal = ROUTE.indexOf("refusal: 'anchor_unknown'");
    expect(refusal).toBeGreaterThan(-1);
    expect(refusal).toBeLessThan(ROUTE.indexOf('await openThread('));
  });

  it('ownership is proved before the anchor is even parsed', () => {
    /* BUILD-07E: the POST parses through `parseAnyAnchor`, which tries the
       structure boundary and then the developmental one. The property is
       unchanged — ownership first, for every anchor of either lane — and the
       assertion names the call the route actually makes so it cannot pass by
       matching a symbol the route no longer reaches. */
    expect(ROUTE.indexOf('memberOwnsWork'))
      .toBeLessThan(ROUTE.indexOf('parseAnyAnchor(body.anchor)'));
  });

  it('a developmental anchor is never admitted by the structure boundary', () => {
    /* The two parsers are separate on purpose. `observation` must not appear in
       SUPPORTED_ANCHORS, or a developmental anchor could be approved by the
       structure path and then resolved against a proposal. */
    expect([...SUPPORTED] as string[]).not.toContain('observation');
    expect(parseAnchor({ on: 'observation', readingId: 'r', observationKey: 'o1' }))
      .toBeNull();
  });

  it('the developmental boundary is closed: unknown keys and empty ids refuse', () => {
    const ok = { on: 'observation', readingId: 'r1', observationKey: 'o1' };
    expect(parseDevelopmentalAnchor(ok)).toEqual(ok);
    expect(parseDevelopmentalAnchor({ ...ok, extra: 1 })).toBeNull();
    expect(parseDevelopmentalAnchor({ ...ok, readingId: '' })).toBeNull();
    expect(parseDevelopmentalAnchor({ ...ok, observationKey: '' })).toBeNull();
    expect(parseDevelopmentalAnchor({ on: 'reading', readingId: 'r1' })).toBeNull();
    expect(parseDevelopmentalAnchor(null)).toBeNull();
  });
});
