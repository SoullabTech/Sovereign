import {
  assembleManuscriptMarkdown,
  computeSourceHash,
  stripCssComments, publicationRoleFor, inspectBookProduction, buildHallmarkPrintStyles, HALLMARK_PRODUCTION_PROFILE,
} from '@/lib/manuscript/render/renderMemberBook';

describe('assembleManuscriptMarkdown', () => {
  it('preserves confirmed heading depth instead of promoting every section to a chapter', () => {
    const md = assembleManuscriptMarkdown([
      { heading: 'Chapter One', body: 'Opening.', headingDepth: 1, headingSignal: 'markdown' },
      { heading: 'Movement', body: 'Middle.', headingDepth: 2, headingSignal: 'markdown' },
      { heading: 'Subsection', body: 'Detail.', headingDepth: 3, headingSignal: 'markdown' },
    ]);
    expect(md).toContain('# Chapter One');
    expect(md).toContain('## Movement');
    expect(md).toContain('### Subsection');
  });

  it('keeps an unconfirmed heading visible without manufacturing a chapter', () => {
    const md = assembleManuscriptMarkdown([{ heading: 'LOUD IMPORT HEADING', body: 'Body.', headingDepth: null }]);
    expect(md).toContain('#### LOUD IMPORT HEADING');
    expect(md).not.toContain('\n# LOUD IMPORT HEADING');
  });

  it('omits the heading line for an untitled section', () => {
    const md = assembleManuscriptMarkdown([{ heading: null, body: 'Front matter.' }]);
    expect(md).not.toContain('#');
    expect(md).toContain('Front matter.');
  });

  it('injects nothing beyond the author heading + body', () => {
    const md = assembleManuscriptMarkdown([{ heading: 'H', body: 'B' }]);
    expect(md).toContain('#### H');
    expect(md).toContain('B');
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

  it('changes when structural depth changes even if every word is identical', () => {
    expect(computeSourceHash([{ heading: 'H', body: 'B', headingDepth: 1 }])).not.toBe(
      computeSourceHash([{ heading: 'H', body: 'B', headingDepth: 3 }]),
    );
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


describe('publicationRoleFor', () => {
  it('recognizes explicit publication headings without reading body prose for identity', () => {
    expect(publicationRoleFor({ heading: 'Permissions', body: 'Copyright © 2026', headingDepth: 2 })).toBe('permissions');
    expect(publicationRoleFor({ heading: 'Dedication', body: 'For my family', headingDepth: 2 })).toBe('dedication');
    expect(publicationRoleFor({ heading: 'Contents', body: 'Chapter 1', headingDepth: 1 })).toBe('contents');
  });

  it('does not turn body copyright language into a copyright/publication role', () => {
    expect(publicationRoleFor({ heading: 'Elemental Alchemy', body: 'Copyright © 2026 Kelly', headingDepth: 1 })).toBe('unclassified');
  });

  it('requires confirmed depth-1 evidence before a Chapter label becomes a chapter role', () => {
    expect(publicationRoleFor({ heading: 'Chapter 10: The Living Spiral', body: '...', headingDepth: 1 })).toBe('chapter');
    expect(publicationRoleFor({ heading: 'Chapter 10: The Living Spiral', body: 'bibliography', headingDepth: 3 })).toBe('subsection');
  });

  it('does not promote TOC-like Part/Chapter wording into real book architecture', () => {
    expect(publicationRoleFor({ heading: 'Part One — The Ground', body: '', headingDepth: 3 })).toBe('subsection');
    expect(publicationRoleFor({ heading: 'Chapter Summaries by Elemental Type', body: '', headingDepth: 1 })).toBe('unclassified');
  });
});


describe('Hallmark production preflight', () => {
  it('flags duplicate copyright statements instead of choosing one for the author', () => {
    const issues = inspectBookProduction([
      { heading: 'Elemental Alchemy', body: 'Copyright © 2026 Kelly Nezat', headingDepth: 1 },
      { heading: 'Permissions', body: 'Copyright © 2026 Kelly W. Nezat', headingDepth: 2 },
    ]);
    expect(issues.map((issue) => issue.code)).toEqual([
      'copyright_not_governed', 'duplicate_copyright_statements',
    ]);
    expect(issues[1]?.sectionIndexes).toEqual([0, 1]);
  });

  it('accepts exactly one explicitly governed Copyright object', () => {
    expect(inspectBookProduction([
      { heading: 'Copyright', body: 'Copyright © 2026 Kelly W. Nezat', headingDepth: 2 },
      { heading: 'Dedication', body: 'For my family', headingDepth: 2 },
    ])).toEqual([]);
  });

  it('does not treat legal-looking body prose as a governed copyright object', () => {
    const issues = inspectBookProduction([
      { heading: 'Opening Note', body: 'Copyright © 2026 Kelly W. Nezat', headingDepth: 2 },
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0]?.code).toBe('copyright_not_governed');
  });
});


describe('Hallmark deterministic PDF typography', () => {
  it('removes remote font imports and embeds pinned local Spectral bytes', () => {
    const styles = buildHallmarkPrintStyles("@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,500&display=swap'); body { font-family: 'EB Garamond', Garamond, serif; font-weight: 500; }");
    expect(styles.bookCss).not.toMatch(/https?:\/\//);
    expect(styles.bookCss).not.toContain('fonts.googleapis.com');
    expect(styles.bookCss.trimStart()).toMatch(/^body\s*\{/);
    expect(styles.bookCss).toContain("font-family: 'Hallmark Spectral'");
    expect(styles.fontCss).toContain('data:font/woff2;base64,');
    expect(styles.fontCss).toContain('font-weight: 400');
    expect(styles.fontCss).toContain('font-weight: 600');
    expect(styles.bookCss).not.toContain('font-weight: 500');
    expect(styles.bookCss).not.toContain('font-weight: 700');
  });

  it('keeps embedded font assets separate from page architecture', () => {
    const styles = buildHallmarkPrintStyles('@page { size: 6in 9in; }');
    expect(styles.fontCss).toContain('@font-face');
    expect(styles.fontCss).not.toContain('@page');
    expect(styles.bookCss).toContain('@page { size: 6in 9in; }');
    expect(styles.bookCss).not.toContain('@font-face');
  });

  it('names the physical production profile independently of source identity', () => {
    expect(HALLMARK_PRODUCTION_PROFILE).toBe('hallmark-6x9-v1');
  });
});
