import { sanitizeForTts } from '../sanitizeForTts';

/**
 * The production defect, 2026-08-27: MAIA read shell commands aloud.
 *
 * These are not style assertions. Each one names a thing that was actually
 * spoken to a member, or would have been.
 */
describe('sanitizeForTts — code is never spoken', () => {
  it('⭐ THE DEFECT: a fenced code block is not read aloud', () => {
    const out = sanitizeForTts(
      'Try this:\n```bash\ndocker compose up -d --build\n```\nThen tell me.',
    );
    expect(out).not.toMatch(/```/);
    expect(out).not.toMatch(/docker compose/);
    expect(out).toContain('Try this');
    expect(out).toContain('Then tell me');
  });

  it('an unterminated fence — streaming splits one mid-chunk — is dropped, not spoken', () => {
    // The chunk arrives with an opening fence and no closing one. Speaking the
    // tail would read the code body as prose.
    const out = sanitizeForTts('Here it is: ```js\nconst secret = 1;');
    expect(out).not.toMatch(/```/);
    expect(out).not.toMatch(/const secret/);
    expect(out).toContain('Here it is');
  });

  it('inline code keeps the word and loses the backticks', () => {
    // "backtick af underscore kore backtick" is unspeakable; af_kore is fine.
    const out = sanitizeForTts('The voice is `af_kore` today.');
    expect(out).toBe('The voice is af_kore today.');
  });

  it('no stray backtick survives', () => {
    expect(sanitizeForTts('an odd ` one')).not.toMatch(/`/);
  });

  it('markdown emphasis is not spoken as asterisks', () => {
    expect(sanitizeForTts('**Important**: __really__ and *this*'))
      .toBe('Important: really and this');
  });

  it('headers keep their words and lose their hashes', () => {
    expect(sanitizeForTts('## Results\nIt worked.')).toBe('Results It worked.');
  });

  it('a link speaks its label, never its URL', () => {
    const out = sanitizeForTts('See the [docs](https://soullab.life/x) for more.');
    expect(out).toContain('docs');
    expect(out).not.toMatch(/https|soullab\.life/);
  });

  it('an indented code block is not spoken', () => {
    const out = sanitizeForTts('Run it:\n\n    rm -rf /tmp/cache\n\nDone.');
    expect(out).not.toMatch(/rm -rf/);
    expect(out).toContain('Done');
  });

  it('⭐ ordinary speech is untouched', () => {
    // The guard must not cost MAIA her ordinary voice. Over-stripping would be
    // a worse defect than the one being fixed — silence read as composure.
    const plain = "I hear you. That sounds heavy, and I don't think you're wrong.";
    expect(sanitizeForTts(plain)).toBe(plain);
  });

  it('em-dashes, apostrophes and ellipses survive', () => {
    const plain = "It's fine — really… I'm here.";
    expect(sanitizeForTts(plain)).toBe(plain);
  });

  it('empty input stays empty rather than throwing', () => {
    expect(sanitizeForTts('')).toBe('');
    expect(sanitizeForTts(undefined as unknown as string)).toBe('');
  });
});
