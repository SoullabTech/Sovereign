import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { parseUpload } from '@/lib/manuscript/ingest/parseUpload';
import {
  preserveDocxStructure,
  UnsupportedDocxStructureError,
} from '@/lib/manuscript/ingest/docxFidelity';
import { segment } from '@/lib/manuscript/ingest/segment';
import { detectOmission } from '@/lib/manuscript/source/omission';

const source = path.join(__dirname, 'fixtures', 'scholarly-dissertation.docx');
const expectedHash = '475bc09a3f5df1a7115802f531693b206ac13ca75a257b9f64123f2a8aef79a2';
const quotations = [
  '“I felt less separate from the room, but I am not sure that tells me what the room is.”',
  '“The stillness was meaningful to me. I would not call it evidence that everyone has the same experience.”',
];
const sampleTable = '<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>X</td><td>Y</td></tr></tbody></table>';
const flatTable = 'A\n\nB\n\nX\n\nY';

describe('SP-02F: structural manuscript fidelity', () => {
  it('preserves the exact fictional dissertation source and its relationships', async () => {
    const bytes = fs.readFileSync(source);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(expectedHash);
    const result = await parseUpload(bytes, 'scholarly-dissertation.docx');
    expect(result.format).toBe('docx');
    expect(result.fidelity).toMatchObject({
      tables: 1,
      tableRows: 5,
      footnotes: 1,
      standaloneQuotationsChecked: 2,
      requiresReview: true,
    });
    expect(result.text).toContain('| Synthetic case | Reduced separation mentioned | Uncertainty retained |');
    expect(result.text).toContain('| SYN-01 | Yes | Yes |');
    expect(result.text).toContain('| SYN-02 | Yes | Yes |');
    expect(result.text).toContain('| SYN-03 | Yes | Not specified |');
    expect(result.text).toContain('| SYN-04 | No | Yes |');
    expect(result.text).toContain('cards.[^1]');
    expect(result.text).toContain('[^1]: Pilot-only note: bibliography pages');
    quotations.forEach((q) => expect(result.text).toContain(q));
    for (const doi of [
      '10.1073/pnas.032658199',
      '10.3390/brainsci11060819',
      '10.1038/s41586-025-08888-1',
    ]) expect(result.text).toContain(doi);

    const confirmedCuts = segment(result.text);
    expect(detectOmission(result.text, confirmedCuts).lossless).toBe(true);
    const bodies = confirmedCuts.map((s) => s.body);
    expect(bodies.some((body) => body.includes('| SYN-04 | No | Yes |'))).toBe(true);
    expect(bodies.some((body) => body.includes('[^1]: Pilot-only note:'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('Unrecognised paragraph style: \'Title\''))).toBe(true);
    expect(result.warnings.some((w) => w.includes('Subtitle'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('caption'))).toBe(true);
    expect(result.warnings.some((w) => w.toLowerCase().includes('native word footnote'))).toBe(true);
  });

  it('refuses a table whose header semantics would be invented', () => {
    const html = '<table><tr><td>A</td><td>B</td></tr><tr><td>X</td><td>Y</td></tr></table>';
    expect(() => preserveDocxStructure(flatTable, html, [])).toThrow(UnsupportedDocxStructureError);
  });

  it('refuses merged cells rather than forging Markdown row relationships', () => {
    const html = sampleTable.replace('<th>A</th>', '<th colspan="2">A</th>');
    expect(() => preserveDocxStructure(flatTable, html, [])).toThrow(/merged table cells/);
  });

  it('refuses ambiguous source matches rather than choosing a table location', () => {
    expect(() => preserveDocxStructure(flatTable + '\n\n' + flatTable, sampleTable, []))
      .toThrow(/ambiguous or missing table cell sequence/);
  });

  it('refuses changed quotation punctuation', () => {
    expect(() => preserveDocxStructure(
      '"I am uncertain."',
      '<p><em>“I am uncertain.”</em></p>',
      [],
    )).toThrow(/quotation whose exact wording or punctuation changed/);
  });

  it('refuses an orphaned footnote reference', () => {
    expect(() => preserveDocxStructure(
      'Text [[1]](#footnote-1)',
      '<p>Text<sup><a id="footnote-ref-1" href="#footnote-1">[1]</a></sup></p>',
      [],
    )).toThrow(/missing, duplicate, or unlinked Word footnote/);
  });

  it('refuses embedded pictures until a rich document model exists', () => {
    expect(() => preserveDocxStructure('Description', '<p>Description</p><img src="pic.png">', []))
      .toThrow(/embedded pictures or objects/);
  });

  it('surfaces style degradation and explicit author review for a simple Word draft', () => {
    const result = preserveDocxStructure('Hello', '<p>Hello</p>', ["Unrecognised paragraph style: 'Subtitle'"]);
    expect(result.text).toBe('Hello');
    expect(result.fidelity.requiresReview).toBe(true);
    expect(result.warnings.join(' ')).toContain('Subtitle');
    expect(result.warnings.join(' ')).toContain('Word-formatting roundtrip');
  });
});
