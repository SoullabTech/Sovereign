import fs from 'fs';
import path from 'path';
import { parseMarkdownFrontmatter } from '../parseMarkdownFrontmatter';

describe('patched YAML 4 front matter behavior', () => {
  it('parses real AIN framing front matter while keeping the complete body', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'lib/ain/framings/foundational/first-principles.md'),
      'utf8',
    );
    const parsed = parseMarkdownFrontmatter(source);
    expect(parsed.data.name).toBe('First Principles');
    expect(parsed.data.domain).toBe('foundational');
    expect(parsed.data.tension_pairs).toEqual(['systems-thinking', 'practical-engineering']);
    expect(parsed.content).toContain('# First Principles Framing');
    expect(parsed.content).toContain('## How to Respond');
  });

  it('preserves BOM, body and YAML sequence metadata', () => {
    const source = '\uFEFF---\r\ntitle: "A Note"\r\ntags: [fire, water]\r\n---\r\n\r\n# Body\r\n';
    const parsed = parseMarkdownFrontmatter(source);
    expect(parsed.data.title).toBe('A Note');
    expect(parsed.data.tags).toEqual(['fire', 'water']);
    expect(parsed.content).toContain('# Body');
  });

  it('leaves ordinary markdown unchanged without front matter', () => {
    const parsed = parseMarkdownFrontmatter('# Ordinary\n\nText here.\n');
    expect(parsed.data).toEqual({});
    expect(parsed.content).toBe('# Ordinary\n\nText here.\n');
  });

  it('resolves supported YAML anchors without executing code', () => {
    const parsed = parseMarkdownFrontmatter('---\ndefaults: &d\n  name: Example\nsection: *d\n---\nBody\n');
    expect(parsed.data.section).toEqual({ name: 'Example' });
    expect(parsed.content).toContain('Body');
  });

  it('refuses scalar YAML front matter instead of returning unstructured data', () => {
    expect(() => parseMarkdownFrontmatter('---\nplain scalar\n---\nBody\n')).toThrow('must be a mapping');
  });

  it('supports empty YAML metadata as an empty mapping', () => {
    const parsed = parseMarkdownFrontmatter('---\n\n---\nBody\n');
    expect(parsed.data).toEqual({});
    expect(parsed.content).toContain('Body');
  });

  it('refuses invalid YAML instead of silently dropping metadata', () => {
    expect(() => parseMarkdownFrontmatter('---\na: [unclosed\n---\nBody\n')).toThrow();
  });
});
