import { parseMessageSegments, safeHref } from '../linkify';

describe('parseMessageSegments', () => {
  it('auto-linkifies a bare https URL', () => {
    expect(parseMessageSegments('see https://example.com now')).toEqual([
      { type: 'text', value: 'see ' },
      { type: 'link', value: 'https://example.com', href: 'https://example.com' },
      { type: 'text', value: ' now' },
    ]);
  });

  it('renders a named markdown link with its label, not the url', () => {
    expect(parseMessageSegments('[planning doc](https://docs.google.com/d/1)')).toEqual([
      { type: 'link', value: 'planning doc', href: 'https://docs.google.com/d/1' },
    ]);
  });

  it('does not swallow trailing sentence punctuation', () => {
    const segs = parseMessageSegments('go to https://example.com.');
    expect(segs[1]).toEqual({ type: 'link', value: 'https://example.com', href: 'https://example.com' });
    expect(segs[2]).toEqual({ type: 'text', value: '.' });
  });

  it('prefixes www. links with https://', () => {
    expect(parseMessageSegments('www.soullab.life')[0]).toEqual({
      type: 'link', value: 'www.soullab.life', href: 'https://www.soullab.life',
    });
  });

  it('refuses javascript: scheme (renders as plain text, never a link)', () => {
    const body = '[click me](javascript:alert(1))';
    const segs = parseMessageSegments(body);
    expect(segs.every(s => s.type === 'text')).toBe(true);
    expect(segs.map(s => s.value).join('')).toBe(body);
  });

  it('returns a single text segment when there are no links', () => {
    expect(parseMessageSegments('just words')).toEqual([{ type: 'text', value: 'just words' }]);
  });

  it('handles multiple links in one message', () => {
    const links = parseMessageSegments('a https://one.com b [two](https://two.com)').filter(s => s.type === 'link');
    expect(links).toHaveLength(2);
    expect(links[0].href).toBe('https://one.com');
    expect(links[1]).toEqual({ type: 'link', value: 'two', href: 'https://two.com' });
  });

  it('preserves newlines in surrounding text', () => {
    const segs = parseMessageSegments('line one\nhttps://x.com\nline two');
    expect(segs[0]).toEqual({ type: 'text', value: 'line one\n' });
    expect(segs[2]).toEqual({ type: 'text', value: '\nline two' });
  });
});

describe('safeHref', () => {
  it('passes http and https through unchanged', () => {
    expect(safeHref('https://x.com')).toBe('https://x.com');
    expect(safeHref('http://x.com')).toBe('http://x.com');
  });
  it('upgrades a www. host to https', () => {
    expect(safeHref('www.x.com')).toBe('https://www.x.com');
  });
  it('rejects javascript: and data: schemes', () => {
    expect(safeHref('javascript:alert(1)')).toBeNull();
    expect(safeHref('data:text/html,x')).toBeNull();
  });
});
