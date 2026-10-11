import { readMarkdownFrontMatter } from '../frontMatterSafe';

describe('Writer-facing Markdown front matter remains faithful with safe js-yaml 4', () => {
  it('preserves a rich YAML header and exact manuscript body', () => {
    const body = '\nChapter One\n\nAn imaginal experience begins here.\n';
    const result = readMarkdownFrontMatter(
      '---\ntitle: "The World: Imaginal and Ordinary"\nauthors:\n  - Jung\n  - Eliade\n  - Corbin\nmetadata:\n  edition: 2\n  draft: true\n---\n' + body,
    );
    expect(result.data.title).toBe('The World: Imaginal and Ordinary');
    expect(result.data.authors).toEqual(['Jung', 'Eliade', 'Corbin']);
    expect(result.data.metadata).toEqual({ edition: 2, draft: true });
    expect(result.content).toBe(body);
  });

  it('does not fabricate metadata when no YAML frontmatter is present', () => {
    const prose = 'A heading\n\nWords remain in the same order.';
    const result = readMarkdownFrontMatter(prose);
    expect(result.data).toEqual({});
    expect(result.content).toBe(prose);
  });

  it('rejects unknown executable YAML tags instead of evaluating them', () => {
    expect(() =>
      readMarkdownFrontMatter('---\nname: !!js/function "function(){ return 1 }"\n---\nBody'),
    ).toThrow();
  });

  it('supports a UTF-8 BOM, tagged YAML opener, and CRLF without rewriting the body', () => {
    const content = '\ufeff---yaml\r\ntitle: Test\r\n---\r\n\r\nThe unchanged body.\r\n';
    const parsed = readMarkdownFrontMatter(content);
    expect(parsed.data.title).toBe('Test');
    expect(parsed.content).toBe('\r\nThe unchanged body.\r\n');
  });

  it('preserves an incomplete front-matter block rather than eating prose', () => {
    const content = '---\ntitle: Unfinished\nChapter One begins here.';
    expect(readMarkdownFrontMatter(content)).toEqual({ data: {}, content });
  });

  it('keeps fenced Markdown without inventing front matter', () => {
    const text = '# Scene\n\n---\n\nThe next movement.';
    const result = readMarkdownFrontMatter(text);
    expect(result.content).toBe(text);
  });
});
