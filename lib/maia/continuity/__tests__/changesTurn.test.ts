/**
 * MAIA-NODE-05 — conversational invocation, end to end at the seam.
 *
 * The canonical read is mocked to RECORD its arguments and return canned rows
 * UNFILTERED. It never simulates a guard, so every claim below passes only
 * because the capability's own predicate did the work — not because a fake row
 * set was pre-filtered.
 */

jest.mock('@/lib/changes/readMemberChanges', () => ({
  readMemberChanges: jest.fn(),
}));

import { readMemberChanges } from '@/lib/changes/readMemberChanges';
import { tryChangesContinuityTurn } from '../changesTurn';
import { isChangesContinuityRequest } from '../changesContinuity';

const mockRead = readMemberChanges as jest.MockedFunction<typeof readMemberChanges>;
const ME = 'member-aaaa';
const OTHER = 'member-bbbb';

const row = (title: string, status: string, memberId = ME) =>
  ({
    id: `c-${title}`, memberId, title, status,
    description: null, changeType: null, emotionalState: null, urgency: null,
    hexagramNumber: null, hexagramName: null, relatingHexagramNumber: null,
    changingLines: [], castingMethod: null, castAt: null, councilResult: null,
    hexagramInterpretation: null, notes: null, questions: [], followUpIntention: null,
    iterationCount: 0, consultedAt: null,
    createdAt: '2026-09-10T00:00:00Z', updatedAt: '2026-09-10T00:00:00Z',
    parentChangeId: null, rootChangeId: null, experienceCount: 0,
  }) as never;

const THREE = [
  row('Sharing MAIA with the first beta testers', 'active'),
  row('Moving into business development', 'active'),
  row('Reorganizing the platform', 'integrating'),
];

beforeEach(() => {
  jest.clearAllMocks();
  mockRead.mockResolvedValue(THREE as never);
});

// ───────────────────────────────────────────────────────────────────────────
describe('MAIA-NODE-05 · explicit intent invokes the capability', () => {
  it.each([
    'What Changes do I still have open?',
    'Which Changes am I working with?',
    'Show me my open Changes',
    'Are any of my Changes still open?',
    'do i have any open changes',
  ])('invokes for: %s', async (utterance) => {
    const out = await tryChangesContinuityTurn(ME, utterance);
    expect(out.handled).toBe(true);
    expect(mockRead).toHaveBeenCalledWith(ME);
  });

  it('passes the credential-verified member to the canonical read', async () => {
    await tryChangesContinuityTurn(ME, 'what changes do i still have open');
    expect(mockRead).toHaveBeenCalledTimes(1);
    expect(mockRead.mock.calls[0][0]).toBe(ME);
  });

  it('does nothing without a member identity', async () => {
    expect(await tryChangesContinuityTurn(null, 'what changes do i still have open'))
      .toEqual({ handled: false });
    expect(mockRead).not.toHaveBeenCalled();
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('MAIA-NODE-05 · MAIA stays rather than querying', () => {
  it.each([
    'A lot is changing.',
    "I'm going through a transition.",
    'Things feel unsettled.',
    "I'm still working through this.",
    'everything is changing right now',
    "I'm worried about Sophie",
  ])('does not invoke for: %s', async (utterance) => {
    const out = await tryChangesContinuityTurn(ME, utterance);
    expect(out).toEqual({ handled: false });
    expect(mockRead).not.toHaveBeenCalled();
  });

  it.each([
    'What were we working on yesterday?',
    'What should I return to?',
    'What was I doing last time?',
    "What have I left unfinished?",
    'What matters most right now?',
  ])('does not substitute Changes for the broader question: %s', async (utterance) => {
    const out = await tryChangesContinuityTurn(ME, utterance);
    expect(out).toEqual({ handled: false });
    expect(mockRead).not.toHaveBeenCalled();
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('MAIA-NODE-05 · ⭐ DISCRIMINATING NEGATIVE CONTROL', () => {
  it('loosening the intent boundary makes a reflective sentence fire the capability', () => {
    const reflective = 'A lot is changing.';

    // The governed boundary: an authored Changes question.
    expect(isChangesContinuityRequest(reflective)).toBe(false);

    // A plausible loosening — "mentions change, and sounds continuity-ish".
    const loosened = (u: string) => /\bchang/i.test(u);
    expect(loosened(reflective)).toBe(true);

    // If the boundary were that, ordinary reflection would query the database.
    // The gap between these two lines is the protection, and it is real.
    expect(loosened(reflective)).not.toBe(isChangesContinuityRequest(reflective));
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('MAIA-NODE-05 · response contract', () => {
  it('zero open Changes answers truthfully', async () => {
    mockRead.mockResolvedValue([row('Done', 'complete'), row('Gone', 'archived')] as never);
    const out = await tryChangesContinuityTurn(ME, 'what changes do i still have open');
    expect(out).toMatchObject({ handled: true, count: 0 });
    expect((out as { message: string }).message)
      .toBe("You don't currently have any Changes in an open state.");
  });

  it('one open Change', async () => {
    mockRead.mockResolvedValue([THREE[0]] as never);
    const out = await tryChangesContinuityTurn(ME, 'show me my open changes');
    expect((out as { message: string }).message).toBe(
      'You have one open Change: “Sharing MAIA with the first beta testers.” Its status is active.',
    );
  });

  it('several, in canonical order, with an offer and not a choice', async () => {
    const out = await tryChangesContinuityTurn(ME, 'what changes do i still have open');
    const message = (out as { message: string }).message;
    expect(message).toContain('You have three open Changes:');
    // Canonical order preserved exactly as the read returned it.
    expect(message.indexOf('first beta testers'))
      .toBeLessThan(message.indexOf('business development'));
    expect(message.indexOf('business development'))
      .toBeLessThan(message.indexOf('Reorganizing the platform'));
    expect(message).toContain('Want to look at one of them?');
    // An offer, never a selection.
    expect(message).not.toMatch(/I'd start with|you should|the most important|I suggest/i);
  });

  it('keeps statuses literal', async () => {
    const message = (await tryChangesContinuityTurn(ME, 'show me my open changes') as { message: string }).message;
    expect(message).toContain('— integrating');
    for (const forbidden of [
      'still processing', 'unresolved', 'priority', 'stuck', 'avoiding', 'most important',
    ]) {
      expect(message.toLowerCase()).not.toContain(forbidden);
    }
  });

  it('another member’s Change cannot appear', async () => {
    mockRead.mockResolvedValue([
      row('Mine', 'active'),
      row('Theirs', 'active', OTHER),
    ] as never);
    const message = (await tryChangesContinuityTurn(ME, 'show me my open changes') as { message: string }).message;
    expect(message).toContain('Mine');
    expect(message).not.toContain('Theirs');
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('MAIA-NODE-05 · follow-up', () => {
  it('resolves an unambiguous reference against the current result set', async () => {
    const out = await tryChangesContinuityTurn(ME, 'The beta one.');
    expect((out as { message: string }).message)
      .toBe('“Sharing MAIA with the first beta testers” is currently active.');
  });

  it('asks when the reference is ambiguous', async () => {
    mockRead.mockResolvedValue([
      row('Beta testers wave one', 'active'),
      row('Beta testers wave two', 'integrating'),
    ] as never);
    const message = (await tryChangesContinuityTurn(ME, 'the beta one') as { message: string }).message;
    expect(message).toContain('Which one do you mean?');
    expect(message).toContain('Beta testers wave one');
    expect(message).toContain('Beta testers wave two');
  });

  it('does not hijack a phrase that matches no open Change', async () => {
    const out = await tryChangesContinuityTurn(ME, 'the difficult one');
    expect(out).toEqual({ handled: false });
  });

  it('refuses an ordinal — position in a list is not a name', async () => {
    // Honouring "the first one" would make the canonical ordering meaningful in
    // a way MAIA-NODE-05 §13 says it is not.
    expect(await tryChangesContinuityTurn(ME, 'the first one')).toEqual({ handled: false });
    expect(await tryChangesContinuityTurn(ME, 'the second one')).toEqual({ handled: false });
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('MAIA-NODE-05 · failure and containment', () => {
  it('does not fabricate continuity when the canonical read fails', async () => {
    mockRead.mockRejectedValue(new Error('db down'));
    const out = await tryChangesContinuityTurn(ME, 'what changes do i still have open');
    expect(out).toMatchObject({ handled: true, failed: true });
    expect((out as { message: string }).message)
      .toBe("I couldn't retrieve your Changes just now.");
  });

  it('a failed read on a bare follow-up simply yields to conversation', async () => {
    mockRead.mockRejectedValue(new Error('db down'));
    expect(await tryChangesContinuityTurn(ME, 'the beta one')).toEqual({ handled: false });
  });

  it('performs no write and calls nothing but the canonical read', () => {
    const code = require('fs')
      .readFileSync(require('path').join(process.cwd(), 'lib/maia/continuity/changesTurn.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/[^\n]*$/gm, '');
    for (const call of ['fetch(', 'apiFetch(', 'query(', 'db.', 'INSERT INTO', 'UPDATE ', 'DELETE FROM']) {
      expect({ call, present: code.includes(call) }).toEqual({ call, present: false });
    }
    expect(code).toContain('readMemberChanges');
  });

  it('returns before the turn-acceptance boundary, so no turn is minted', () => {
    const route = require('fs').readFileSync(
      require('path').join(process.cwd(), 'app/api/sovereign/app/maia/list/route.ts'), 'utf8',
    );
    const capabilityAt = route.indexOf('tryChangesContinuityTurn(userId, message)');
    const acceptanceAt = route.indexOf('TURN ACCEPTANCE BOUNDARY');
    const cognitionAt = route.indexOf('getMaiaResponse({');
    expect(capabilityAt).toBeGreaterThan(0);
    expect(capabilityAt).toBeLessThan(acceptanceAt);
    expect(capabilityAt).toBeLessThan(cognitionAt);
  });

  it('is invoked with the route’s credential-verified identity', () => {
    const route = require('fs').readFileSync(
      require('path').join(process.cwd(), 'app/api/sovereign/app/maia/list/route.ts'), 'utf8',
    );
    expect(route).toContain('const userId = await resolveMemberIdentity(req)');
    expect(route).toContain('tryChangesContinuityTurn(userId, message)');
  });

  it('ordinary conversation still reaches cognition', async () => {
    // The capability yields, so the route falls through to getMaiaResponse.
    expect(await tryChangesContinuityTurn(ME, 'I had a strange dream last night'))
      .toEqual({ handled: false });
  });
});
