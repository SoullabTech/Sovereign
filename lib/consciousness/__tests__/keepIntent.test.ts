/**
 * KEEP-INTENT-01 falsification.
 *
 * Recognition must never silently collapse into commitment, and it must not
 * fire on ordinary uses of the word "keep." These are the cases Kelly named,
 * plus the ones that would make the affordance annoying rather than helpful.
 */

import { detectKeepIntent } from '../keepIntent';

describe('recognizes the member wanting to keep material', () => {
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

  it.each(yes)('"%s" is Keep intent', (utterance) => {
    expect(detectKeepIntent(utterance).kind).toBe('keep_material');
  });

  it('reports the phrase it matched, longest first', () => {
    expect(detectKeepIntent('can we keep this moment').matched).toBe('keep this moment');
  });
});

describe('recognizes an explicit command to open Keep', () => {
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
    expect(detectKeepIntent(utterance).kind).toBe('open_keep');
  });

  it('an explicit open command outranks a material reading', () => {
    // Contains "keep this" too, but the member asked for the surface.
    expect(detectKeepIntent('open Keep so I can keep this').kind).toBe('open_keep');
  });
});

describe('ordinary uses of "keep" do not trigger the affordance', () => {
  const no = [
    'keep going',
    'keep talking',
    'keep the door open',
    'what keeps happening?',
    'I keep doing this to myself',
    'keep it up',
    'I want to keep working on this feeling',
    'keep this up, you are doing well',
    'keep this in mind',
    "I'll keep that in mind",
    'keep this between us',
    'keep this brief',
    'housekeeping',
    'the keeper of the flame',
    '',
  ];

  it.each(no)('"%s" is not Keep intent', (utterance) => {
    expect(detectKeepIntent(utterance).kind).toBeNull();
  });
});

describe('a guarded occurrence does not disqualify a real request', () => {
  it('reads both halves of "keep going — actually, can we keep this?"', () => {
    expect(
      detectKeepIntent('keep going — actually, can we keep this?').kind,
    ).toBe('keep_material');
  });

  it('"keep this in mind, but also keep this" still recognizes the request', () => {
    expect(detectKeepIntent('keep this in mind, but also keep this').kind).toBe(
      'keep_material',
    );
  });
});

describe('the recognizer has no authority beyond recognizing', () => {
  it('is pure — same input, same answer, no state carried between calls', () => {
    const a = detectKeepIntent('keep this');
    const b = detectKeepIntent('keep this');
    expect(a).toEqual(b);
    expect(detectKeepIntent('keep going').kind).toBeNull();
    expect(detectKeepIntent('keep this').kind).toBe('keep_material');
  });

  it('the module performs no I/O and imports nothing that could persist', () => {
    const src = require('fs').readFileSync(
      require('path').join(__dirname, '..', 'keepIntent.ts'),
      'utf8',
    );
    expect(src).not.toMatch(/^import /m);
    expect(src).not.toMatch(/fetch\(|apiFetch|createCapsule|INSERT/);
  });

  it('does not overlap detectJournalCommand triggers, which consume the turn', () => {
    // Those phrases return before MAIA responds, so this recognizer never runs
    // for them. Claiming to handle them would be a lie.
    const swallowed = ['capture this', 'record this', 'journal this', 'save this conversation'];
    for (const phrase of swallowed) {
      expect(detectKeepIntent(phrase).kind).toBeNull();
    }
  });
});
