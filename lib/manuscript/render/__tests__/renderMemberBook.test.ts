import {
  assembleManuscriptMarkdown,
  computeSourceHash,
  stripCssComments,
} from '@/lib/manuscript/render/renderMemberBook';

describe('assembleManuscriptMarkdown', () => {
  it('renders a section heading as a level-1 chapter, body verbatim after it', () => {
    const md = assembleManuscriptMarkdown([{ heading: 'Chapter One', body: 'The morning came.' }]);
    expect(md).toContain('# Chapter One');
    expect(md).toContain('The morning came.');
    expect(md.indexOf('# Chapter One')).toBeLessThan(md.indexOf('The morning came.'));
  });

  it('omits the heading line for an untitled section', () => {
    const md = assembleManuscriptMarkdown([{ heading: null, body: 'Front matter.' }]);
    expect(md).not.toContain('#');
    expect(md).toContain('Front matter.');
  });

  it('injects nothing beyond the author heading + body', () => {
    const md = assembleManuscriptMarkdown([{ heading: 'H', body: 'B' }]);
    expect(md.replace(/\s/g, '')).toBe('#HB');
  });

  it('preserves the author order across multiple sections', () => {
    const md = assembleManuscriptMarkdown([
      { heading: 'One', body: 'a' },
      { heading: 'Two', body: 'b' },
    ]);
    expect(md.indexOf('# One')).toBeLessThan(md.indexOf('# Two'));
  });
});

describe('computeSourceHash', () => {
  const secs = [{ heading: 'H', body: 'B' }];

  it('is deterministic for identical sections', () => {
    expect(computeSourceHash(secs)).toBe(computeSourceHash([{ heading: 'H', body: 'B' }]));
  });

  it('changes when any word changes', () => {
    expect(computeSourceHash(secs)).not.toBe(computeSourceHash([{ heading: 'H', body: 'B!' }]));
  });

  it('distinguishes a heading/body boundary shift (separator sensitivity)', () => {
    expect(computeSourceHash([{ heading: 'AB', body: '' }])).not.toBe(
      computeSourceHash([{ heading: 'A', body: 'B' }]),
    );
  });

  it('produces a 64-char hex sha256 digest', () => {
    expect(computeSourceHash(secs)).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('stripCssComments (member book carries no founder identity)', () => {
  it('removes CSS comment blocks — where the founder book name lives', () => {
    const css = '/*\n * Elemental Alchemy — Soullab Press editorial canon\n */\n.body { color: #111; }';
    const out = stripCssComments(css);
    expect(out).not.toMatch(/Elemental Alchemy/);
    expect(out).not.toMatch(/Soullab/);
    expect(out).toContain('.body');
  });

  it('leaves actual style rules intact', () => {
    expect(stripCssComments('a { color: red }')).toBe('a { color: red }');
  });
});
