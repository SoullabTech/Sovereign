/**
 * MAIA-NODE-04 — truthful continuity over Changes.
 *
 * Selection is a pure function over rows from the canonical read authority, so
 * these are behavioural tests over real fixtures rather than wire assertions.
 * The member-ownership boundary itself lives in SQL inside that authority and is
 * asserted separately, at the wire, in the last block.
 *
 * A discriminating negative control is included: with the guards removed the
 * same fixtures admit prohibited rows, so a pass here is not vacuous.
 */

import {
  OPEN_CHANGE_STATUSES,
  TRANSIENT_CHANGE_STATUSES,
  CLOSED_CHANGE_STATUSES,
  isOpenChange,
  selectOpenChanges,
  matchChangesByTitle,
  isChangesContinuityRequest,
  describeOpenChanges,
  describeChange,
  type ChangeRecord,
} from '../changesContinuity';
import { getCapability } from '@/lib/maia/capabilities';
import { isExecutable } from '@/lib/maia/capabilityResolution';

const ME = 'member-aaaa';
const OTHER = 'member-bbbb';

const row = (over: Partial<ChangeRecord> & { status: string; title: string }): ChangeRecord => ({
  id: `c-${over.title}`,
  memberId: ME,
  createdAt: '2026-09-10T00:00:00Z',
  updatedAt: '2026-09-10T00:00:00Z',
  ...over,
});

/** One fixture set, used by every test AND by the negative control. */
const FIXTURES: ChangeRecord[] = [
  row({ title: 'Sharing MAIA with the first beta testers', status: 'active' }),
  row({ title: 'Moving into business development', status: 'active' }),
  row({ title: 'Rethinking how the platform is organized', status: 'integrating' }),
  row({ title: 'A change I have only named', status: 'naming' }),
  row({ title: 'Mid-cast', status: 'casting' }),
  row({ title: 'Mid-consult', status: 'consulting' }),
  row({ title: 'Finished thing', status: 'complete' }),
  row({ title: 'Put away', status: 'archived' }),
  row({ title: "Another member's change", status: 'active', memberId: OTHER }),
];

// ───────────────────────────────────────────────────────────────────────────
describe('MAIA-NODE-04 · the open set is ruled, not inferred', () => {
  it('naming, active and integrating are open', () => {
    expect([...OPEN_CHANGE_STATUSES]).toEqual(['naming', 'active', 'integrating']);
    for (const s of OPEN_CHANGE_STATUSES) expect(isOpenChange(s)).toBe(true);
  });

  it('casting and consulting are transient, never continuity', () => {
    expect([...TRANSIENT_CHANGE_STATUSES]).toEqual(['casting', 'consulting']);
    for (const s of TRANSIENT_CHANGE_STATUSES) expect(isOpenChange(s)).toBe(false);
  });

  it('complete and archived are closed', () => {
    for (const s of CLOSED_CHANGE_STATUSES) expect(isOpenChange(s)).toBe(false);
  });

  it('an unrecognised status is not open by default', () => {
    // A future lifecycle value must be ruled before it becomes continuity.
    expect(isOpenChange('percolating')).toBe(false);
    expect(isOpenChange('')).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('MAIA-NODE-04 · selection', () => {
  it('returns only the member’s own open Changes, in canonical order', () => {
    const open = selectOpenChanges(FIXTURES, ME);
    expect(open.map((c) => c.title)).toEqual([
      'Sharing MAIA with the first beta testers',
      'Moving into business development',
      'Rethinking how the platform is organized',
      'A change I have only named',
    ]);
  });

  it('another member’s Change cannot surface', () => {
    const open = selectOpenChanges(FIXTURES, ME);
    expect(open.some((c) => c.memberId !== ME)).toBe(false);
    expect(open.some((c) => c.title.includes("Another member's"))).toBe(false);
  });

  it('transient and closed states are excluded', () => {
    const titles = selectOpenChanges(FIXTURES, ME).map((c) => c.title);
    for (const excluded of ['Mid-cast', 'Mid-consult', 'Finished thing', 'Put away']) {
      expect(titles).not.toContain(excluded);
    }
  });

  it('zero open Changes is an honest zero, not an error', () => {
    const closedOnly = FIXTURES.filter((r) => !isOpenChange(r.status) && r.memberId === ME);
    expect(selectOpenChanges(closedOnly, ME)).toEqual([]);
    expect(describeOpenChanges([])).toBe(
      "You don't currently have any Changes in an open state.",
    );
  });

  it('refuses to select for an empty member identity', () => {
    expect(selectOpenChanges(FIXTURES, '')).toEqual([]);
  });

  it('preserves the canonical order rather than re-ranking', () => {
    const open = selectOpenChanges(FIXTURES, ME);
    const inputOrder = FIXTURES.filter((r) => r.memberId === ME && isOpenChange(r.status));
    expect(open).toEqual(inputOrder);
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('MAIA-NODE-04 · DISCRIMINATING NEGATIVE CONTROL', () => {
  it('removing the member and status guards admits prohibited fixtures', () => {
    // Same fixtures, guards dropped. If this did not admit prohibited rows the
    // fixtures would not be exercising the boundary and every pass above would
    // be vacuous.
    const unguarded = FIXTURES.filter(() => true);
    const guarded = selectOpenChanges(FIXTURES, ME);

    expect(guarded).toHaveLength(4);
    expect(unguarded).toHaveLength(9);

    const admitted = unguarded.filter((r) => !guarded.includes(r)).map((r) => r.title);
    expect(admitted).toEqual(
      expect.arrayContaining([
        'Mid-cast',
        'Mid-consult',
        'Finished thing',
        'Put away',
        "Another member's change",
      ]),
    );
    expect(admitted.length).toBe(5);
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('MAIA-NODE-04 · intent is bounded to Changes', () => {
  it.each([
    'What Changes do I still have open?',
    'Am I working with any Changes right now?',
    'Remind me which Changes are not complete yet',
    'What Changes have I named?',
    'do i have any open changes',
  ])('answers: %s', (utterance) => {
    expect(isChangesContinuityRequest(utterance)).toBe(true);
  });

  it.each([
    'What should I work on?',
    'What matters most right now?',
    "What haven't I dealt with?",
    'What am I avoiding?',
    'What is unresolved for me?',
  ])('refuses the judgment question: %s', (utterance) => {
    // The Change lifecycle does not authorize these.
    expect(isChangesContinuityRequest(utterance)).toBe(false);
  });

  it('does not silently reinterpret the broad yesterday question', () => {
    // MAIA-NODE-04 §XI — that question is broader than this slice.
    expect(isChangesContinuityRequest('remind me what we were working on yesterday')).toBe(false);
    expect(isChangesContinuityRequest('what did we do yesterday')).toBe(false);
  });

  it('leaves ordinary conversation alone', () => {
    for (const utterance of [
      "I'm worried about Sophie",
      'things are changing for me',
      'I want to change how I work',
      'nothing is exactly wrong, my life is just changing',
      'this changed everything',
    ]) {
      expect(isChangesContinuityRequest(utterance)).toBe(false);
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('MAIA-NODE-04 · what MAIA may say', () => {
  it('states title and status, and nothing further', () => {
    const line = describeOpenChanges(selectOpenChanges(FIXTURES, ME).slice(0, 3));
    expect(line).toContain('“Sharing MAIA with the first beta testers” is active');
    expect(line).toContain('“Rethinking how the platform is organized” is integrating');
  });

  it('reports a single named Change factually', () => {
    expect(describeChange(FIXTURES[0])).toBe(
      '“Sharing MAIA with the first beta testers” is currently active.',
    );
  });

  it('never turns a lifecycle status into a psychological reading', () => {
    const all = [
      describeOpenChanges(selectOpenChanges(FIXTURES, ME)),
      describeChange(FIXTURES[2]),
      describeOpenChanges([]),
    ].join(' ');
    for (const forbidden of [
      'most important', 'still processing', "haven't resolved", 'should return',
      'stuck', 'avoiding', 'unresolved', 'matters most', 'probably', 'seems to be',
    ]) {
      expect(all.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });

  it('matches a named Change on the member’s own words only', () => {
    const mine = FIXTURES.filter((r) => r.memberId === ME);
    expect(matchChangesByTitle(mine, 'beta').map((c) => c.title))
      .toEqual(['Sharing MAIA with the first beta testers']);
    // Too short to be a deliberate reference — refuses rather than guesses.
    expect(matchChangesByTitle(mine, 'a')).toEqual([]);
    // No semantic search: an unrelated synonym matches nothing.
    expect(matchChangesByTitle(mine, 'launch')).toEqual([]);
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('MAIA-NODE-04 · authority and containment', () => {
  const capability = getCapability('changes.continuity')!;

  it('is a READ capability that defers to the canonical authority', () => {
    expect(capability.operationClass).toBe('READ');
    expect(capability.authority).toEqual({ kind: 'route', method: 'GET', path: '/api/changes' });
    expect(isExecutable(capability)).toBe(true);
    expect(capability.allowedContexts).toEqual(['personal']);
  });

  it('adds no navigation — the Changes sheet/route mismatch is untouched', () => {
    // MAIA-NODE-04 §XIII: recorded as debt, not reconciled here.
    expect(capability.destinationId).toBeUndefined();
  });

  it('the canonical authority scopes by member under a verified credential', () => {
    const route = require('fs').readFileSync(
      require('path').join(process.cwd(), 'app/api/changes/route.ts'), 'utf8',
    );
    expect(route).toContain('getMemberIdFromRequest');
    expect(route).not.toContain('probeAuthPosture');
    expect(route).toContain('WHERE c.member_id = $1');
    expect(route).toContain("{ error: 'Unauthorized' }, { status: 401 }");
  });

  it('reads no generic memory, affinity or inferred source', () => {
    // Comments stripped first: the module DOCUMENTS that it is not a semantic
    // search, and a raw scan would fail it for saying so. Same discipline as
    // the C21 verifier repair.
    const src = require('fs')
      .readFileSync(require('path').join(process.cwd(), 'lib/maia/continuity/changesContinuity.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/[^\n]*$/gm, '');
    for (const forbidden of [
      'living_field_affinities', 'member_memory_atoms', 'episodic_memories',
      'embedding', 'semantic', 'conversation_turns',
    ]) {
      expect(src).not.toContain(forbidden);
    }
  });

  it('reading continuity does not alter continuity', () => {
    const snapshot = JSON.stringify(FIXTURES);
    selectOpenChanges(FIXTURES, ME);
    matchChangesByTitle(FIXTURES, 'beta');
    describeOpenChanges(selectOpenChanges(FIXTURES, ME));
    expect(JSON.stringify(FIXTURES)).toBe(snapshot);
  });
});
