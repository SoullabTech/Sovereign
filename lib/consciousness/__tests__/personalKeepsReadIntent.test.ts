/**
 * MAIA-MAVEN-T1A · J5-0 — Personal Keeps READ invocation falsifiers.
 *
 * This recognizer classifies ONE member act only. It has no authority to read,
 * navigate, persist, disclose, or mutate anything by itself.
 */

import { detectPersonalKeepsReadIntent } from '../personalKeepsReadIntent';

describe('Personal Keeps READ — explicit inventory invocation', () => {
  const reads = [
    'What have I kept?',
    'what did I keep?',
    'Show me my Keeps.',
    'list my keeps',
    'What are my Keeps?',
    'Do I have any Keeps?',
  ];

  it.each(reads)('classifies "%s" as one inventory read', (utterance) => {
    expect(detectPersonalKeepsReadIntent(utterance)).toMatchObject({
      kind: 'read_keeps',
      filterText: null,
    });
  });
});

describe('Personal Keeps READ — filtered inventory invocation', () => {
  const cases: Array<[string, string]> = [
    ['Which of my Keeps mention grief?', 'grief'],
    ['which keeps mention the move', 'the move'],
    ['Do I have a Keep about my father?', 'my father'],
    ['Do I have any Keeps about work?', 'work'],
    ['What did I keep about the house?', 'the house'],
    ['Show me my Keeps about writing.', 'writing'],
  ];

  it.each(cases)('extracts the member-authored filter from "%s"', (utterance, filterText) => {
    expect(detectPersonalKeepsReadIntent(utterance)).toEqual({
      kind: 'read_keeps_filtered',
      filterText,
    });
  });
});

describe('Personal Keeps READ — navigation stays navigation', () => {
  const navigation = [
    'Open Keeps.',
    'open my keeps',
    'Go to Keeps.',
    'Take me to my Keeps.',
    'Show me the Keeps room.',
  ];

  it.each(navigation)('classifies "%s" as navigation only', (utterance) => {
    expect(detectPersonalKeepsReadIntent(utterance)).toEqual({
      kind: 'navigate_keeps',
      filterText: null,
    });
  });
});

describe('Personal Keeps READ — domain mention is not permission', () => {
  const ambiguous = [
    'Something in my Keeps might be relevant.',
    'Maybe something in my Keeps is relevant here.',
    'There could be something in my Keeps about this.',
  ];

  it.each(ambiguous)('requires an offer before reading: "%s"', (utterance) => {
    expect(detectPersonalKeepsReadIntent(utterance)).toEqual({
      kind: 'ambiguous_keeps_reference',
      filterText: null,
    });
  });

  const none = [
    'This reminds me of something.',
    'Something from before feels relevant.',
    "I've been thinking about grief again.",
    'I know I saved things about this.',
  ];

  it.each(none)('does not manufacture Keep authority from "%s"', (utterance) => {
    expect(detectPersonalKeepsReadIntent(utterance)).toEqual({ kind: 'none', filterText: null });
  });
});

describe('Personal Keeps READ — creation/opening and ordinary keep language stay separate', () => {
  const notReads = [
    'keep this',
    'can we keep this?',
    'I want to keep something',
    'keep going',
    'keep talking',
    'keep this in mind',
    'keep this between us',
    'what keeps happening?',
    'remember this moment',
    'save this moment',
    '',
  ];

  it.each(notReads)('does not reinterpret "%s" as Personal Keeps READ', (utterance) => {
    expect(detectPersonalKeepsReadIntent(utterance)).toEqual({ kind: 'none', filterText: null });
  });
});

describe('Personal Keeps READ — continuation does not self-authorize', () => {
  it.each(['show me more', 'more', 'next five', 'keep going']) (
    '"%s" is not a fresh Personal Keeps read without server-owned continuation context',
    (utterance) => {
      expect(detectPersonalKeepsReadIntent(utterance)).toEqual({ kind: 'none', filterText: null });
    },
  );
});

describe('Personal Keeps READ — recognizer carries no execution authority', () => {
  it('is deterministic and stateless', () => {
    const a = detectPersonalKeepsReadIntent('Which of my Keeps mention grief?');
    const b = detectPersonalKeepsReadIntent('Which of my Keeps mention grief?');
    expect(a).toEqual(b);
    expect(detectPersonalKeepsReadIntent('keep this').kind).toBe('none');
    expect(detectPersonalKeepsReadIntent('What have I kept?').kind).toBe('read_keeps');
  });

  it('imports nothing and contains no I/O, persistence, navigation, or disclosure calls', () => {
    const src = require('fs').readFileSync(
      require('path').join(__dirname, '..', 'personalKeepsReadIntent.ts'),
      'utf8',
    );
    expect(src).not.toMatch(/^import /m);
    expect(src).not.toMatch(/fetch\(|apiFetch|router\.|query\(|INSERT|UPDATE|DELETE|keepSource|establishDisclosureBoundary/);
  });

  it('does not call or import the create/open Keep recognizer', () => {
    const src = require('fs').readFileSync(
      require('path').join(__dirname, '..', 'personalKeepsReadIntent.ts'),
      'utf8',
    );
    expect(src).not.toMatch(/detectKeepIntent|from ['"].*keepIntent/);
  });
});
