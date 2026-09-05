import * as fs from 'fs';
import * as path from 'path';

/**
 * WS2-07 · BUILD-07D — what the Develop room says when a reading is refused.
 *
 * The founder walk of 2026-09-05 hit `classifier_foreign_field` once. That
 * refusal fires when the classifier's TOOL PAYLOAD carries a key the contract
 * does not define (classify.ts:161,170) — a protocol conformance failure. The
 * room answered it, and every other classify-stage refusal, with a sentence
 * saying what MAIA noticed could not be named within her vocabulary.
 *
 * That sentence describes `unclassifiable`, which under reading contract v2 is
 * not a refusal at all: the observation is KEPT with its phenomenon absent, as
 * o7 of the Structure reading demonstrates. So the room was telling the member
 * something untrue about what had happened to their work.
 *
 * Founder ruling (2026-09-05): hard refusal remains, no retry policy, no
 * reinterpretation as an absent phenomenon — correct the presentation only,
 * keyed on refusal identity rather than on stage, and delete the vocabulary
 * explanation outright.
 */

const read = (...p: string[]) => fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8');
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

const roomSource = read('develop', 'DevelopRoom.tsx');
const room = strip(roomSource);
const sentences = room.slice(room.indexOf('function refusalSentence'), room.indexOf('export default'));

const SAFELY = 'MAIA’s classification response could not be read safely, so this reading was not kept. Your work has not changed.';
const UNAVAILABLE = 'MAIA cannot read just now. Nothing has changed.';
const NEUTRAL = 'MAIA could not complete the reading. Your work has not changed.';

/** The branch a refusal falls into, read from the source rather than guessed. */
function branchFor(refusal: string): string {
  const idx = sentences.indexOf(`'${refusal}'`);
  if (idx < 0) return NEUTRAL;
  const after = sentences.slice(idx);
  const m = after.match(/return '([^']*(?:’[^']*)*)'/);
  return m ? m[1] : NEUTRAL;
}

describe('the vocabulary explanation is gone', () => {
  it('appears nowhere in the room', () => {
    expect(room).not.toMatch(/vocabulary/i);
  });

  it('no longer answers the whole classify stage with one sentence', () => {
    expect(sentences).not.toMatch(/case 'classify'/);
  });
});

describe('a classifier that answered unreadably', () => {
  for (const refusal of ['classifier_foreign_field', 'classifier_malformed', 'classifier_index_mismatch']) {
    it(`${refusal} says the response could not be read safely`, () => {
      expect(branchFor(refusal)).toBe(SAFELY);
    });
  }

  it('says nothing was kept and the work is untouched', () => {
    expect(SAFELY).toContain('was not kept');
    expect(SAFELY).toContain('Your work has not changed');
  });
});

describe('a classifier that never ran', () => {
  for (const refusal of [
    'structured_inference_unavailable', 'provider_unavailable', 'not_configured', 'invalid_inference_mode',
  ]) {
    it(`${refusal} says MAIA cannot read just now`, () => {
      expect(branchFor(refusal)).toBe(UNAVAILABLE);
    });
  }
});

describe('the legacy decline refusal inherits no explanation', () => {
  it('classifier_unclassifiable is not named in the room at all', () => {
    expect(sentences).not.toContain('classifier_unclassifiable');
  });
});

describe('what the repair did not touch', () => {
  it('the technical refusal code is still shown beneath the sentence', () => {
    expect(roomSource).toMatch(/refused\{commission\.outcome\.stage[\s\S]*?commission\.outcome\.refusal\}/);
  });

  it('revision_not_current keeps its own sentence and its Keep a version link', () => {
    expect(branchFor('revision_not_current')).toContain('Keep a version in the Writer Canvas');
    expect(roomSource).toContain('data-develop-keep-a-version');
  });

  it('no retry policy was introduced', () => {
    expect(room).not.toMatch(/retry|retries|attempt\s*\+\+/i);
  });
});
