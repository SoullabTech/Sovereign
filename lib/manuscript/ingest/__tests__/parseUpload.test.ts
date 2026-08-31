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
   * ALL OF IT SURVIVES, and that is the assertion. Two normalizations were
   * written against this fixture and both were withdrawn: a global whitespace
   * pass, then a narrow "drop Word's indent tab" transform. The second failed
   * on provenance — see the second test below, which pins the reason so the
   * transform is not rediscovered as a good idea.
   */
  it('carries a Word manuscript through with its spacing intact', async () => {
    const buf = fs.readFileSync(path.join(__dirname, 'fixtures', 'word-spacing.docx'));
    const r = await parseUpload(buf, 'word-spacing.docx');

    // The author's words, including the run Word split mid-word.
    expect(r.text).toContain('The morning came slowly over the hills.');
    expect(r.text).toContain('margins of other people.');
    expect(r.text).toContain('# Chapter One');

    /* And the author's spacing. A non-breaking space is a character they can
       type; a blank-line run may be a scene break; a trailing space is
       invisible but authored; a leading tab is a tab someone put there. */
    expect(r.text).toMatch(/^\tThe morning came slowly over the hills\.$/m);
    expect(r.text).toMatch(/^\t\tA deeply indented paragraph\.$/m);
    expect(r.text).toContain('Fire\tthe first element.');
    expect(r.text).toMatch(/[\u00A0]/);
    expect(r.text).toMatch(/[ ]\n/);
    expect(r.text).toContain('She waited.  Then she wrote.');
    expect(r.text).toContain('First line  \nsecond line');
  });

  /**
   * WHY THE INDENT-TAB TRANSFORM CANNOT BE REBUILT (founder ruling, 2026-08-31).
   *
   * The argument for it was that Word writes a `<w:tab/>` for a first-line
   * indent, so a tab before a paragraph's first word is presentation. It is
   * not. A TRUE paragraph-format indent — `w:ind`, or a paragraph style
   * carrying one — produces no text through mammoth whatsoever. So there is no
   * seam where a formatting property is being wrongly materialized as a
   * character, and a tab that DOES reach the text is one a person typed.
   *
   * Deleting it would have been an authorship inference wearing a provenance
   * argument. This test is the evidence, so the next reader does not have to
   * take the claim on trust.
   */
  it('mammoth emits no text for a true paragraph indent — so a tab in the text was typed', async () => {
    const buf = fs.readFileSync(path.join(__dirname, 'fixtures', 'indent-kinds.docx'));
    const r = await parseUpload(buf, 'indent-kinds.docx');

    // w:ind firstLine, and a style carrying an indent: nothing in the text.
    expect(r.text).toMatch(/^Indented by paragraph FORMAT\.$/m);
    expect(r.text).toMatch(/^Indented by STYLE\.$/m);
    // A typed tab: present, because it is a character in the document.
    expect(r.text).toMatch(/^\tIndented by a TYPED TAB\.$/m);
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
