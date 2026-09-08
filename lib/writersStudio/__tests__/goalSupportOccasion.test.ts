import { readFileSync } from 'fs';
import { join } from 'path';
import { occasionFor, type SupportOccasionKind } from '../goalSupportOccasion';

/**
 * FR-15 — support may come from an EVENT; it may never be reconstructed from
 * STATE.
 *
 * The danger is not a pushy model. It is a render path that can produce support
 * AT ALL: once a GET can mint an occasion, every page load and every return to
 * the room becomes a lawful-looking moment to speak, each instance passes
 * review, and the accumulation is the harm. So these assert the architecture,
 * not the wording.
 */

const read = (...p: string[]) => readFileSync(join(process.cwd(), ...p), 'utf8');

/**
 * Comments stripped, for ABSENCE scans only.
 *
 * The same discipline C6 and C21 have used in the Circles verifier since R4,
 * and for the same reason: a file that documents its own compliance —
 * "there is no lastSupportedAt here" — will otherwise fail a scan looking for
 * `lastSupportedAt`, and a prose BAN reads as the banned thing returning. The
 * assertions below are about what the code DOES, so they read the code.
 */
const code = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const COLLECTION = read('app', 'api', 'sovereign', 'manuscripts', '[id]', 'goals', 'route.ts');
const SINGLE = read('app', 'api', 'sovereign', 'manuscripts', '[id]', 'goals', '[goalId]', 'route.ts');
const CLIENT = read('lib', 'writersStudio', 'goalsClient.ts');
const PANEL = read('app', 'writers-studio', 'canvas', 'GoalsDrawer.tsx');
const BAND = read('app', 'writers-studio', 'canvas', 'StudioLowerBand.tsx');
const MODULE = read('lib', 'writersStudio', 'goalSupportOccasion.ts');

/** The body of one exported handler, so a per-function claim can be made. */
function handlerBody(src: string, name: string): string {
  const start = src.indexOf(`export async function ${name}(`);
  expect(start).toBeGreaterThan(-1);
  const rest = src.slice(start);
  const next = rest.slice(1).search(/\nexport (async )?function /);
  return next === -1 ? rest : rest.slice(0, next + 1);
}

describe('FR-15 · a member act may occasion support', () => {
  const goal = { id: 'g1', support: 'encourage' as const };

  it('mints one occasion for each occasioning act', () => {
    for (const act of ['declared', 'met', 'set_aside', 'released', 'asked'] as SupportOccasionKind[]) {
      const expected = act === 'asked'
        ? { goalId: 'g1', kind: act, authority: { kind: 'turn_local', scope: 'encourage' } }
        : { goalId: 'g1', kind: act, authority: { kind: 'standing', grant: 'encourage' } };
      expect(occasionFor(act, goal, 'encourage')).toEqual(expected);
    }
  });

  it('mints nothing when the writer asked for quiet', () => {
    /* Unsolicited acts only. An explicit ask is FR-17 territory, tested below:
       a stored preference is not a gag order against the writer's own request. */
    for (const act of ['declared', 'met', 'set_aside', 'released'] as SupportOccasionKind[]) {
      expect(occasionFor(act, { id: 'g1', support: 'track_only' })).toBeNull();
    }
  });

  it('requires BOTH a grant and an act — neither alone is enough', () => {
    /* FR-14's grant ≠ occasion, made into a signature. */
    expect(occasionFor('met', { id: 'g', support: 'track_only' })).toBeNull();
    expect(occasionFor('opened' as SupportOccasionKind, { id: 'g', support: 'encourage' })).toBeNull();
  });

  it('carries no time, so it can never be re-evaluated as still-recent', () => {
    /* "Is this occasion still fresh enough to use?" is the first question of a
       cadence. An occasion has no answer to it. */
    const o = occasionFor('met', goal)!;
    expect(Object.keys(o).sort()).toEqual(['authority', 'goalId', 'kind']);
    expect(code(MODULE)).not.toMatch(/Date\.now\(\)|new Date\(|timestamp|lastSupported|cadence|interval/i);
  });

  it('carries no manuscript — a support grant is not a reading grant', () => {
    const o = occasionFor('met', goal)!;
    expect(o).not.toHaveProperty('prose');
    expect(o).not.toHaveProperty('excerpt');
    expect(code(MODULE)).not.toMatch(/recovered|draftExcerpt|manuscriptText|body:/);
  });
});

describe('FR-15 · the render path is INCAPABLE of generating support', () => {
  it('the goals GET handler mints nothing', () => {
    /* The load-bearing assertion of this whole file. */
    const get = handlerBody(COLLECTION, 'GET');
    expect(code(get)).not.toMatch(/occasion/i);
  });

  it('only member-act handlers mint', () => {
    expect(handlerBody(COLLECTION, 'POST')).toMatch(/occasionFor\('declared'/);
    expect(handlerBody(SINGLE, 'PATCH')).toMatch(/occasionFor\(/);
    expect(handlerBody(SINGLE, 'DELETE')).toMatch(/occasionFor\('released'/);
  });

  it('changing the GRANT is not itself an occasion', () => {
    /* Otherwise choosing "encourage me" would answer its own invitation. */
    const patch = handlerBody(SINGLE, 'PATCH');
    expect(patch).toMatch(/editsStanding && standing === 'met'/);
    expect(patch).not.toMatch(/editsSupport \?[^\n]*occasionFor/);
  });

  it('the client read path cannot produce one', () => {
    /* listGoals and progressFor are the state-reconstruction route: if support
       could arise there, "the goal is still met" would speak on every load. */
    expect(code(CLIENT)).not.toMatch(/occasionFor|SupportOccasion/);
  });

  it('neither surface renders support from state', () => {
    for (const src of [PANEL, BAND]) {
      expect(code(src)).not.toMatch(/occasionFor|SupportOccasion/);
    }
  });

  it('the lower band — an ambient door — has no support machinery at all', () => {
    /* A door is not an invitation to speak through it. The band shows goals to
       a writer who never entered Goals. */
    expect(code(BAND)).not.toMatch(/encourag|celebrat|well done|keep going/i);
  });
});

describe('FR-15 · no surveillance was built to prevent repetition', () => {
  it('there is no counter, history, score or cadence anywhere in the seam', () => {
    for (const banned of [
      'lastSupportedAt', 'supportCount', 'timesEncouraged', 'dependencyScore',
      'motivationHistory', 'reassuranceCount', 'streak', 'cadence',
    ]) {
      expect(code(MODULE + COLLECTION + SINGLE + CLIENT)).not.toMatch(new RegExp(banned, 'i'));
    }
  });

  it('repetition is prevented by minting, not by throttling', () => {
    /* An occasion comes from an event that happens once. Nothing counts, and
       nothing needs to — which is how Invariant 3 operates without
       surveillance. */
    expect(MODULE).toContain('EXPLICIT MAIA ASK         is itself a new member act');
  });
});


describe('FR-17 · standing grant vs turn-local authority', () => {
  it('an explicit ask is honored even when the standing grant is quiet', () => {
    /* Otherwise: "Could you encourage me about this right now?" — "No, three
       weeks ago you selected Track only." A stored preference is a standing
       permission, not a gag order against the writer's own present request. */
    const o = occasionFor('asked', { id: 'g', support: 'track_only' }, 'encourage');
    expect(o).toEqual({ goalId: 'g', kind: 'asked', authority: { kind: 'turn_local', scope: 'encourage' } });
  });

  it('the ask bounds the response in BOTH directions', () => {
    /* encourage + an explicit ask yields encouragement, never the broader
       reflective powers of work_with. */
    const o = occasionFor('asked', { id: 'g', support: 'encourage' }, 'encourage')!;
    expect(o.authority).toEqual({ kind: 'turn_local', scope: 'encourage' });
    const w = occasionFor('asked', { id: 'g', support: 'track_only' }, 'work_with')!;
    expect(w.authority).toEqual({ kind: 'turn_local', scope: 'work_with' });
  });

  it('a bare ask with no scope is not a request', () => {
    /* Inventing a scope would be the system deciding what the writer asked
       for. */
    expect(occasionFor('asked', { id: 'g', support: 'encourage' })).toBeNull();
  });

  it('unsolicited acts still require the standing grant', () => {
    expect(occasionFor('met', { id: 'g', support: 'track_only' }, 'encourage')).toBeNull();
  });

  it('turn-local authority cannot mutate the stored grant', () => {
    /* Asking to be encouraged today is not choosing to be encouraged from now
       on. This function returns an occasion and writes nothing at all, which is
       why the promotion path does not exist to be taken. */
    const goal = { id: 'g', support: 'track_only' as const };
    occasionFor('asked', goal, 'work_with');
    expect(goal.support).toBe('track_only');
    expect(code(MODULE)).not.toMatch(/UPDATE|INSERT|apiFetch|fetch\(|query\(/);
  });
});

describe('FR-16 · silence is a first-class result', () => {
  it('the form contract admits null, so "response required" is unrepresentable', () => {
    const src = code(MODULE);
    expect(src).toContain('SupportResponse<T> = T | null');
  });

  it('nothing in the seam treats an absent response as a failure', () => {
    for (const banned of ['retry', 'fallback', 'ensureResponse', 'mustRespond', 'defaultResponse']) {
      expect(code(MODULE)).not.toMatch(new RegExp(banned, 'i'));
    }
  });
});
