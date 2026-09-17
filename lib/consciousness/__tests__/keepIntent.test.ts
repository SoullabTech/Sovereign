/**
 * T1A-J5 speech-act recognition falsification.
 *
 * The recognizer may understand KEEP, CONTINUE, and OPEN_KEEP. Recognition is
 * pure and non-authoritative: it may not persist or resume anything itself.
 */

import { detectKeepIntent } from '../keepIntent';

const acts = (utterance: string) => detectKeepIntent(utterance).acts.map((m) => m.act);

describe('KEEP — member asks to persist present material', () => {
  const yes = [
    'keep this',
    'can we keep this',
    'can we keep this?',
    'Can we keep this?',
    'mark this moment',
    'I want to keep this',
    "I'd like to keep this part of the conversation",
    'remember this moment',
    'save this moment',
    'hold onto this',
    'hold on to this',
    'bookmark this',
    'could we keep this, it mattered',
  ];

  it.each(yes)('"%s" is KEEP', (utterance) => {
    expect(acts(utterance)).toEqual(['keep']);
    expect(detectKeepIntent(utterance).resolution).toBe('resolved');
  });

  it('reports the supporting phrase, longest first', () => {
    expect(detectKeepIntent('can we keep this moment').acts[0]?.matched).toBe('keep this moment');
  });
});

describe('OPEN_KEEP — explicit House command', () => {
  const yes = [
    'MAIA, open Keep.',
    'open Keep',
    'Open the Keep function.',
    'Can you open Keep for me?',
    'I want to keep something',
    'show me Keep',
    'bring up Keep',
  ];

  it.each(yes)('"%s" opens Keep', (utterance) => {
    expect(acts(utterance)).toEqual(['open_keep']);
  });

  it('the explicit open command remains the operational reading of its subordinate purpose clause', () => {
    expect(acts('open Keep so I can keep this')).toEqual(['open_keep']);
  });
});

describe('CONTINUE — leave or return to a thread, never KEEP', () => {
  const yes = [
    'keep this open',
    'Keep this open.',
    'keep this question open',
    'can we keep this question open?',
    'keep that open',
    'leave this open',
    'leave that question open',
    'come back to this',
    'come back to this question',
    'return to that topic',
  ];

  it.each(yes)('"%s" is CONTINUE and not KEEP', (utterance) => {
    expect(acts(utterance)).toEqual(['continue']);
  });

  it('does not let the embedded bytes "keep this" acquire KEEP authority', () => {
    const result = detectKeepIntent('can we keep this question open?');
    expect(result.acts).toEqual([{ act: 'continue', matched: 'keep this question open' }]);
  });
});

describe('multi-act language preserves every authored act', () => {
  it('"Keep this and leave it open" is KEEP + CONTINUE, in utterance order', () => {
    expect(acts('Keep this and leave it open')).toEqual(['keep', 'continue']);
  });

  it('does not collapse a later explicit Keep into an earlier CONTINUE', () => {
    expect(acts('leave this open, but keep this moment')).toEqual(['continue', 'keep']);
  });
});

describe('ordinary language remains ordinary', () => {
  const no = [
    'keep going',
    'keep talking',
    'keep the door open',
    'keep this door open',
    'what keeps happening?',
    'I keep doing this to myself',
    'keep it up',
    'I want to keep working on this feeling',
    'keep this up, you are doing well',
    'keep this in mind',
    "I'll keep that in mind",
    'keep this between us',
    'keep this brief',
    'leave it open',
    'housekeeping',
    'the keeper of the flame',
    '',
  ];

  it.each(no)('"%s" is ordinary, not a governed act', (utterance) => {
    const result = detectKeepIntent(utterance);
    expect(result.resolution).toBe('ordinary');
    expect(result.acts).toEqual([]);
  });
});

describe('guarded ordinary language does not erase a separate real request', () => {
  it('reads the real KEEP after "keep going"', () => {
    expect(acts('keep going — actually, can we keep this?')).toEqual(['keep']);
  });

  it('"keep this in mind, but also keep this" still recognizes KEEP', () => {
    expect(acts('keep this in mind, but also keep this')).toEqual(['keep']);
  });
});

describe('the recognizer has no authority beyond recognizing', () => {
  it('is pure — same input, same answer, no state carried between calls', () => {
    const a = detectKeepIntent('keep this');
    const b = detectKeepIntent('keep this');
    expect(a).toEqual(b);
    expect(detectKeepIntent('keep going').resolution).toBe('ordinary');
    expect(acts('keep this')).toEqual(['keep']);
  });

  it('represents ambiguity as a possible resolution without guessing one in current grammar', () => {
    type Resolution = ReturnType<typeof detectKeepIntent>['resolution'];
    const compileTimeWitness: Resolution = 'ambiguous';
    expect(compileTimeWitness).toBe('ambiguous');
  });

  it('performs no I/O and imports nothing that could persist', () => {
    const src = require('fs').readFileSync(
      require('path').join(__dirname, '..', 'keepIntent.ts'),
      'utf8',
    );
    expect(src).not.toMatch(/^import /m);
    expect(src).not.toMatch(/fetch\(|apiFetch|createCapsule|INSERT/);
  });

  it('does not overlap detectJournalCommand triggers, which consume the turn', () => {
    const swallowed = ['capture this', 'record this', 'journal this', 'save this conversation'];
    for (const phrase of swallowed) {
      expect(detectKeepIntent(phrase).resolution).toBe('ordinary');
    }
  });
});
