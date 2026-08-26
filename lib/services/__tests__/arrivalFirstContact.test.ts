/**
 * First contact after Arrival — the opening MAIA makes to someone it has never
 * spoken to, who has just told it what is asking for their attention.
 *
 * The risk this pins is not a crash. It is TONE INFLATION: an opening that
 * summarizes the member like an intake form, invents a feeling they never
 * named, or implies MAIA remembers something it has only just been handed.
 */

import { generateGreeting } from '../greetingService';

const opening = async (attention: string, doorway: string, userName = 'Ada') =>
  (await generateGreeting({ userName, isFirstVisit: true, arrivalContext: { attention, doorway } })).greeting;

const BROUGHT = 'The same argument with my brother, three times this month.';

describe('the opening makes contact', () => {
  it('greets the member by their own name and says it is here', async () => {
    expect(await opening(BROUGHT, 'relation')).toMatch(/^Ada, I’m here\./);
  });

  it('is short — a greeting, not a summary', async () => {
    const g = await opening(BROUGHT, 'relation');
    expect(g.length).toBeLessThan(200);
    expect(g.split(/[.?]/).filter((s) => s.trim()).length).toBeLessThanOrEqual(4);
  });

  it('ends with one invitation, not a list of options', async () => {
    const g = await opening(BROUGHT, 'relation');
    expect((g.match(/\?/g) || []).length).toBe(1);
    expect(g.trim().endsWith('?')).toBe(true);
  });
});

describe('the doorway shapes the opening', () => {
  const cases: [string, RegExp][] = [
    ['relation', /between you and someone else.*Where does it seem to begin\?/s],
    ['decision', /trying to decide.*What are you deciding between\?/s],
    ['making', /making.*What are you working on\?/s],
    ['change', /changing.*What is different now\?/s],
    ['self', /about yourself.*keep circling\?/s],
    ['mind', /sitting with you.*Start wherever it is/s],
  ];
  it.each(cases)('door %s produces its own contact and invitation', async (door, shape) => {
    expect(await opening(BROUGHT, door)).toMatch(shape);
  });

  it('gives distinct openings for distinct doors', async () => {
    const all = await Promise.all(['relation', 'decision', 'making', 'change', 'self', 'mind', 'dunno']
      .map((d) => opening(BROUGHT, d)));
    expect(new Set(all).size).toBe(all.length);
  });

  it('falls back gracefully on an unknown door rather than throwing', async () => {
    expect(await opening(BROUGHT, 'not-a-door')).toMatch(/I’m here\./);
  });
});

describe('what the opening must never do', () => {
  const FORBIDDEN = [
    /I sense/i, /I hear that/i, /it sounds like/i, /you seem/i, /you're struggling/i,
    /I remember/i, /I recall/i, /last time/i,
    /pattern of/i, /deeper insight/i, /journey/i, /unpack/i, /hold space/i,
  ];

  it('does not diagnose, sense, or claim to remember', async () => {
    for (const door of ['relation', 'decision', 'making', 'change', 'self', 'mind', 'dunno']) {
      const g = await opening(BROUGHT, door);
      for (const bad of FORBIDDEN) expect(g).not.toMatch(bad);
    }
  });

  it('does not parrot the member’s own sentence back at them', async () => {
    const g = await opening(BROUGHT, 'relation');
    expect(g).not.toContain('brother');
    expect(g).not.toContain(BROUGHT);
  });

  it('does not invent a feeling the member never named', async () => {
    const g = await opening(BROUGHT, 'relation');
    expect(g).not.toMatch(/frustrat|anxious|angry|sad|overwhelmed|hurt/i);
  });
});

describe('when the member brought no words', () => {
  it('claims no more contact than it was actually given', async () => {
    const g = await opening('', 'dunno');
    expect(g).toMatch(/You are here\./);
    expect(g).toMatch(/What has been taking up room lately\?/);
  });

  it('still opens for someone with no name', async () => {
    expect(await opening('', 'mind', 'friend')).toMatch(/^I’m here\./);
  });
});

describe('arrival context outranks conversational mode', () => {
  /**
   * REGRESSION. This branch was first placed AFTER the mode check, which made it
   * unreachable: mode defaults to 'dialogue', so Talk-mode always answered and
   * the member's own words never reached the opening. Caught only at runtime,
   * because the earlier tests did not pass a mode. They do now.
   */
  it.each(['dialogue', 'counsel', 'scribe'] as const)(
    'still makes arrival contact in %s mode',
    async (mode) => {
      const g = (await generateGreeting({
        userName: 'Ada', isFirstVisit: true, mode,
        arrivalContext: { attention: BROUGHT, doorway: 'relation' },
      })).greeting;
      expect(g).toMatch(/^Ada, I’m here\./);
      expect(g).toMatch(/Where does it seem to begin\?/);
    },
  );
});

describe('without arrival context nothing changes', () => {
  it('falls through to the existing greeting path', async () => {
    const g = (await generateGreeting({ userName: 'Kelly', isFirstVisit: false, daysSinceLastVisit: 3 })).greeting;
    expect(g).toBeTruthy();
    expect(g).not.toMatch(/You brought something/);
  });

  it('leaves Talk mode in charge when no arrival context exists', async () => {
    const g = (await generateGreeting({ userName: 'Kelly', isFirstVisit: false, mode: 'dialogue' })).greeting;
    expect(g).not.toMatch(/You brought something/);
    expect(g).toBeTruthy();
  });
});
