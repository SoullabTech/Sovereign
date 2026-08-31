import path from 'node:path';
import fs from 'node:fs';
import {
  parseUpload,
  detectFormat,
  UnsupportedUploadError,
} from '@/lib/manuscript/ingest/parseUpload';
import { segment } from '@/lib/manuscript/ingest/segment';

// Mock pdf-parse so the scanned-vs-typed logic is deterministic (the real
// text-layer extraction is exercised in the container/local render smoke).
const mockPdf: { text: string; pages: unknown[] } = { text: '', pages: [] };
jest.mock('pdf-parse', () => ({
  PDFParse: class {
    constructor(_opts: unknown) {}
    async getText() {
      return { text: mockPdf.text, pages: mockPdf.pages };
    }
    async destroy() {}
  },
}));

describe('detectFormat', () => {
  it('maps known extensions', () => {
    expect(detectFormat('a.docx')).toBe('docx');
    expect(detectFormat('a.pdf')).toBe('pdf');
    expect(detectFormat('a.txt')).toBe('text');
    expect(detectFormat('a.md')).toBe('text');
    expect(detectFormat('a.markdown')).toBe('text');
    expect(detectFormat('a.zip')).toBeNull();
  });
  it('falls back to MIME when the extension is unknown', () => {
    expect(detectFormat('noext', 'application/pdf')).toBe('pdf');
    expect(detectFormat('noext', 'text/plain')).toBe('text');
    expect(
      detectFormat('noext', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
    ).toBe('docx');
  });
});

describe('parseUpload', () => {
  it('passes plain text through unchanged', async () => {
    const r = await parseUpload(Buffer.from('hello world'), 'note.txt');
    expect(r.format).toBe('text');
    expect(r.text).toBe('hello world');
    expect(r.warnings).toEqual([]);
  });

  it('extracts a real .docx to markdown: author words + heading structure, no artifacts', async () => {
    const buf = fs.readFileSync(path.join(__dirname, 'fixtures', 'sample.docx'));
    const r = await parseUpload(buf, 'sample.docx');
    expect(r.format).toBe('docx');
    // the author's words, unchanged
    expect(r.text).toContain('The morning came slowly over the hills');
    // Word heading styles carried through as markdown headings
    expect(r.text).toContain('# Chapter One');
    expect(r.text).toContain('## A Quieter Passage');
    // mammoth artifacts stripped (nav anchors, backslash-escaped punctuation)
    expect(r.text).not.toContain('<a id=');
    expect(r.text).not.toMatch(/\\\./);
    // and it feeds the sectioner into real chapters
    const sections = segment(r.text);
    expect(sections.length).toBeGreaterThanOrEqual(3);
    expect(sections.some((s) => s.heading === 'Chapter One')).toBe(true);
  });

  /**
   * A Word file carrying the spacing a real manuscript arrives with. Its
   * document.xml sits beside it as `word-spacing.document.xml` so the fixture
   * is readable rather than an opaque binary; it holds a tab-indented first
   * line, a doubly-indented line, a tab BETWEEN two words, non-breaking
   * spaces, stray trailing spaces, a shift+enter line break, and a run split
   * mid-word.
   *
   * The pair of tests below is the boundary itself: the first is what the DOCX
   * structure PROVES is presentation, the second is everything the format does
   * not prove and which therefore survives untouched.
   */
  it("drops Word's first-line indent tab, which is presentation, not a character", async () => {
    const buf = fs.readFileSync(path.join(__dirname, 'fixtures', 'word-spacing.docx'));
    const r = await parseUpload(buf, 'word-spacing.docx');

    // The author's words, all of them, including the run Word split mid-word.
    expect(r.text).toContain('The morning came slowly over the hills.');
    expect(r.text).toContain('margins of other people.');
    expect(r.text).toContain('# Chapter One');

    /* The indent is gone — and with it the markdown code block a leading tab
       would otherwise have made of the paragraph. */
    expect(r.text).toMatch(/^The morning came slowly over the hills\.$/m);
    // a deeper indent is the same mechanic, however many tabs deep
    expect(r.text).toMatch(/^A deeply indented paragraph\.$/m);

    /* But a tab BETWEEN words is a column the author built, and the format
       gives no reason to call it furniture. */
    expect(r.text).toContain('Fire\tthe first element.');
  });

  it('leaves every other spacing artifact alone — the format does not prove them', async () => {
    /* Each of these was normalized in an earlier draft and withdrawn: a
       non-breaking space is a character the author can type, a blank-line run
       may be a scene break, and a trailing space is invisible but authored.
       Nothing in the file distinguishes them from furniture, so they stand. */
    const buf = fs.readFileSync(path.join(__dirname, 'fixtures', 'word-spacing.docx'));
    const r = await parseUpload(buf, 'word-spacing.docx');

    expect(r.text).toMatch(/[\u00A0]/); // non-breaking spaces survive
    expect(r.text).toMatch(/[ ]\n/); // trailing spaces survive
    expect(r.text).toContain('She waited.  Then she wrote.'); // the author's two spaces
    expect(r.text).toContain('First line  \nsecond line'); // shift+enter hard break
  });

  it('passes a .txt manuscript through byte-for-byte — the whitespace IS the source', async () => {
    /* A blank-line run may be a deliberate scene break and a leading tab may be
       the author's own indent. In plain text there is no structure to consult,
       so nothing here may be reinterpreted. */
    const source = '\tScene one.\n\n\n\nScene two.   \n';
    const r = await parseUpload(Buffer.from(source), 'book.txt');
    expect(r.text).toBe(source);
  });

  it('passes a PDF text layer through unchanged — no evidence to clean on', async () => {
    mockPdf.text = 'A  page\u00A0with\ttypesetter spacing.\n\n\n\nAnd more.';
    mockPdf.pages = [{}];
    const r = await parseUpload(Buffer.from('%PDF-1.4'), 'typeset.pdf');
    expect(r.text).toBe(mockPdf.text);
  });

  it('warns (never fabricates) when a PDF has no text layer (scanned)', async () => {
    mockPdf.text = '';
    mockPdf.pages = [{}, {}, {}];
    const r = await parseUpload(Buffer.from('%PDF-1.4'), 'scan.pdf');
    expect(r.format).toBe('pdf');
    expect(r.text).toBe('');
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(r.warnings[0]).toMatch(/scan/i);
  });

  it('extracts a typed PDF text layer without warnings', async () => {
    mockPdf.text = 'A'.repeat(600);
    mockPdf.pages = [{}];
    const r = await parseUpload(Buffer.from('%PDF-1.4'), 'typed.pdf');
    expect(r.format).toBe('pdf');
    expect(r.text.length).toBeGreaterThan(0);
    expect(r.warnings).toEqual([]);
  });

  it('throws UnsupportedUploadError for a type we cannot read', async () => {
    await expect(parseUpload(Buffer.from('x'), 'archive.zip')).rejects.toBeInstanceOf(
      UnsupportedUploadError,
    );
  });
});
