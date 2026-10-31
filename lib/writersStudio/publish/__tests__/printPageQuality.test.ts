import { assessPrintPageFlow } from '../printPageQuality';

describe('Author-owned book print proof quality — content-free refusal and warnings', () => {
  it('flags the existing one-line chapter tail as review, never including authored prose', () => {
    const content = 'A sensitive invented chapter tail with private words';
    const result = assessPrintPageFlow([
      { num: 1, text: '1\nTitle page' },
      { num: 2, text: '2\nCopyright notice' },
      { num: 7, text: '7\n' + content },
      { num: 12, text: '12\n' + content },
    ], { exemptPages: [1, 2] });

    expect(result).toEqual({
      status: 'review',
      pageCount: 4,
      pagesExamined: 2,
      issues: [
        { code: 'sparse_page', page: 7, bodyLineCount: 1, severity: 'review' },
        { code: 'sparse_page', page: 12, bodyLineCount: 1, severity: 'review' },
      ],
    });
    expect(JSON.stringify(result)).not.toContain(content);
  });

  it('clears a sufficiently filled page and never reports full text', () => {
    const result = assessPrintPageFlow([
      { num: 3, text: '3\nChapter One\nOriginal sentence.\nFurther author prose.\nFinal line.' },
      { num: 4, text: 'Original first sentence\nAuthor second line\nThird line\nFourth line\n4' },
    ]);
    expect(result.status).toBe('no_sparse_pages_detected');
    expect(result.issues).toEqual([]);
    expect(JSON.stringify(result)).not.toContain('Original first sentence');
  });

  it('marks truly empty non-exempt pages for review, not automatic deletion', () => {
    const report = assessPrintPageFlow([{ num: 4, text: '4\n\n' }]);
    expect(report.issues).toEqual([
      { code: 'empty_page', page: 4, bodyLineCount: 0, severity: 'review' },
    ]);
  });

  it('exempts deliberately sparse front matter when the edition marks it as such', () => {
    const report = assessPrintPageFlow([
      { num: 1, text: 'Title' },
      { num: 2, text: '2\nRights statement' },
      { num: 3, text: '3\nChapter\nOne\nTwo\nThree' },
    ], { exemptPages: [1, 2] });
    expect(report.status).toBe('no_sparse_pages_detected');
    expect(report.pagesExamined).toBe(1);
  });

  it('refuses duplicated or impossible page numbering rather than certifying broken evidence', () => {
    expect(() => assessPrintPageFlow([{num: 4, text:'a'}, {num: 4, text:'b'}])).toThrow();
    expect(() => assessPrintPageFlow([{num: 0, text:'not a page'}])).toThrow();
    expect(() => assessPrintPageFlow([{num: -1, text:'negative'}])).toThrow();
  });
});
