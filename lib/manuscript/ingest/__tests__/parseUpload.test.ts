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
/** Params the last getText() call received — see the PDF-CLEAN guard below. */
const getTextCalls: unknown[] = [];
jest.mock('pdf-parse', () => ({
  PDFParse: class {
    constructor(_opts: unknown) {}
    async getText(params?: unknown) {
      getTextCalls.push(params);
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

describe('PDF-CLEAN · the synthetic page marker is never generated', () => {
  it("getText is called with an empty pageJoiner", async () => {
    // pdf-parse's default pageJoiner is '\n-- page_number of total_number --',
    // and the library documents an empty joiner as "no page boundary marker is
    // added". Suppressed at source rather than filtered afterwards: an author
    // may legitimately write `-- 1 of 2 --`, which is byte-identical to the
    // synthetic line, so no filter can remove ours without risking theirs.
    getTextCalls.length = 0;
    mockPdf.text = 'Chapter One\n\nSome real text with enough length to pass.';
    mockPdf.pages = [{}];

    await parseUpload(Buffer.from('%PDF-1.4'), 'typed.pdf');

    expect(getTextCalls).toHaveLength(1);
    expect(getTextCalls[0]).toEqual({ pageJoiner: '' });
  });

  it('and what the option DOES is proven elsewhere, not here', () => {
    // This suite mocks pdf-parse, so it cannot observe the library's real
    // output — a mock cannot falsify a defect that IS the default output.
    // scripts/witness/pdf-page-marker-witness.ts runs the real extractor.
    expect(
      fs.existsSync(
        path.join(__dirname, '../../../../scripts/witness/pdf-page-marker-witness.ts'),
      ),
    ).toBe(true);
  });
});
