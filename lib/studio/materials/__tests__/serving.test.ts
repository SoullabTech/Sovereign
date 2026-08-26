import { decideServing, headerFilename } from '../serving';

describe('decideServing — inline is an allowlist, never a denylist', () => {
  it('renders ordinary images inline', () => {
    for (const type of ['image/png', 'image/jpeg', 'image/gif', 'image/webp']) {
      const d = decideServing(type, 'photo.png');
      expect(d.disposition).toBe('inline');
      expect(d.contentType).toBe(type);
    }
  });

  it('plays audio inline', () => {
    expect(decideServing('audio/mpeg', 'voice.mp3').disposition).toBe('inline');
    expect(decideServing('audio/mp4', 'voice.m4a').disposition).toBe('inline');
  });

  it('NEVER serves HTML inline', () => {
    const d = decideServing('text/html', 'notes.html');
    expect(d.disposition).toBe('attachment');
    expect(d.contentType).toBe('application/octet-stream');
  });

  it('NEVER serves SVG inline — it looks like an image and hosts script', () => {
    const d = decideServing('image/svg+xml', 'diagram.svg');
    expect(d.disposition).toBe('attachment');
    expect(d.contentType).toBe('application/octet-stream');
  });

  it('neutralises the other script-carrying markup types', () => {
    for (const type of ['application/xhtml+xml', 'text/xml', 'application/xml']) {
      expect(decideServing(type, 'a.xml').disposition).toBe('attachment');
      expect(decideServing(type, 'a.xml').contentType).toBe('application/octet-stream');
    }
  });

  it('trusts the extension over a declared type that disagrees', () => {
    // An upload can declare image/png for a file named payload.svg.
    const d = decideServing('image/png', 'payload.svg');
    expect(d.disposition).toBe('attachment');
    expect(d.reason).toBe('never_echoed');
  });

  it('hands over a PDF rather than rendering it as a first-party page', () => {
    const d = decideServing('application/pdf', 'book.pdf');
    expect(d.disposition).toBe('attachment');
    // Preserved faithfully — the type is kept, only the rendering changes.
    expect(d.contentType).toBe('application/pdf');
  });

  it('hands over a DOCX unchanged', () => {
    const type =
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    expect(decideServing(type, 'chapter.docx')).toEqual({
      contentType: type,
      disposition: 'attachment',
      reason: 'not_inline_safe',
    });
  });

  it('does not render an unknown type inline just because it is unknown', () => {
    expect(decideServing(null, 'mystery').disposition).toBe('attachment');
    expect(decideServing('', 'mystery').contentType).toBe('application/octet-stream');
  });

  it('ignores parameters on the declared type', () => {
    expect(decideServing('image/png; charset=binary', 'a.png').disposition).toBe('inline');
    expect(decideServing('text/html; charset=utf-8', 'a.html').disposition).toBe('attachment');
  });

  it('is case-insensitive about the declared type', () => {
    expect(decideServing('IMAGE/PNG', 'a.png').disposition).toBe('inline');
    expect(decideServing('Image/SVG+XML', 'a.svg').disposition).toBe('attachment');
  });
});

describe('headerFilename', () => {
  it('keeps an ordinary name', () => {
    expect(headerFilename('Larry interview.m4a')).toBe('Larry interview.m4a');
  });

  it('strips quotes that would break out of the quoted header value', () => {
    expect(headerFilename('a"b".png')).toBe('ab.png');
  });

  it('treats a backslash as the path separator it is on Windows uploads', () => {
    expect(headerFilename('C:\\Users\\kelly\\chapter.docx')).toBe('chapter.docx');
  });

  it('strips newlines, which are the ones that inject a header', () => {
    expect(headerFilename('a\r\nX-Evil: 1.png')).toBe('aX-Evil: 1.png');
  });

  it('drops any path and keeps the name', () => {
    expect(headerFilename('../../etc/passwd')).toBe('passwd');
  });

  it('never returns empty', () => {
    expect(headerFilename('')).toBe('material');
    expect(headerFilename('"""')).toBe('material');
    expect(headerFilename(null)).toBe('material');
  });
});
