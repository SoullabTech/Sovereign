import {
  ARTIFACT_EXTRACTION,
  MEMBER_SUPPLIED_TEXT,
  buildArrival,
  certifiesCustody,
  hashBytes,
  hashText,
} from '../custody';
import { detectOmission } from '../omission';
import { segment } from '../../ingest/segment';

/**
 * WS-01 exit evidence. Each control is written so that a WRONG implementation
 * fails it — a control that passes before and after the repair is decoration,
 * not evidence (master brief §28).
 *
 * The known-bad baseline these are written against is canonical `dde034483`,
 * where nothing was persisted, no hashes existed, and `segment()` dropped an
 * orphan heading via `if (body.trim().length === 0) continue;`.
 */

describe('Control 1 — file custody: bytes recover byte-for-byte', () => {
  it('hashes the exact bytes, so a recovered artifact can be proven identical', () => {
    const arrived = Buffer.from('%PDF-1.7\n%\xE2\xE3\xCF\xD3\nbinary\x00bytes', 'binary');
    const recovered = Buffer.from(arrived);
    expect(hashBytes(recovered)).toBe(hashBytes(arrived));
  });

  it('detects a single flipped byte — a hash that cannot fail is not evidence', () => {
    const arrived = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x00, 0xff]);
    const corrupted = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x00, 0xfe]);
    expect(hashBytes(corrupted)).not.toBe(hashBytes(arrived));
  });

  it('hashes source text over exact UTF-8 bytes, without normalizing anything', () => {
    // A1.3: no silent Unicode normalization after source-text creation. These two
    // strings render identically and MUST NOT hash the same.
    const composed = 'café';           // U+00E9
    const decomposed = 'café';   // e + combining acute
    expect(composed.normalize('NFC')).toBe(decomposed.normalize('NFC'));
    expect(hashText(composed)).not.toBe(hashText(decomposed));
  });

  it('distinguishes CRLF from LF — newline policy is not applied behind the hash', () => {
    expect(hashText('a\r\nb')).not.toBe(hashText('a\nb'));
  });
});

describe('Control 2 — extraction independence', () => {
  it('records the extractor separately from the artifact', () => {
    const a = buildArrival({
      kind: ARTIFACT_EXTRACTION,
      artifactRef: 'manuscripts/abc.pdf',
      artifactHash: 'h'.repeat(64),
      artifactSize: 1024,
      originalFilename: 'book-print-kdp-final.pdf',
      mimeType: 'application/pdf',
      sourceText: 'extracted words',
      extractor: 'pdf',
    });
    /* Unsuffixed: the PDF reader transforms nothing, so its extraction is
       byte-for-byte what it always was. */
    expect(a.extractionMethod).toBe('pdf-parse-getText');
    expect(a.extractorVersion).toBe('pdf-parse@2.4.5');
    // The two identities are distinct, so a changed extraction stays
    // distinguishable from a changed artifact (Amendment A1.1).
    expect(a.artifactHash).not.toBe(a.sourceTextHash);
  });

  it('gives a docx and a pdf of the same text different extractor identities', () => {
    const base = {
      kind: ARTIFACT_EXTRACTION as const,
      artifactRef: 'manuscripts/x',
      artifactHash: 'h'.repeat(64),
      artifactSize: 1,
      originalFilename: 'x',
      mimeType: null,
      sourceText: 'same words',
    };
    const docx = buildArrival({ ...base, extractor: 'docx' });
    const pdf = buildArrival({ ...base, extractor: 'pdf' });
    expect(docx.sourceTextHash).toBe(pdf.sourceTextHash);
    expect(docx.extractorVersion).not.toBe(pdf.extractorVersion);
  });
});

describe('Control 5 — provenance truth: files have artifacts, pasted words do not', () => {
  it('a member-supplied arrival carries NO artifact fields', () => {
    const a = buildArrival({ kind: MEMBER_SUPPLIED_TEXT, sourceText: 'I pasted this.' });
    expect(a.sourceKind).toBe(MEMBER_SUPPLIED_TEXT);
    expect(a.artifactRef).toBeNull();
    expect(a.artifactHash).toBeNull();
    expect(a.artifactSize).toBeNull();
    expect(a.originalFilename).toBeNull();
    expect(a.mimeType).toBeNull();
  });

  it('refuses to let artifact provenance be smuggled onto a paste', () => {
    // A caller spreading extra keys must not be able to manufacture an artifact.
    const smuggled = {
      kind: MEMBER_SUPPLIED_TEXT,
      sourceText: 'pasted',
      artifactRef: 'manuscripts/not-real.pdf',
      artifactHash: 'f'.repeat(64),
      originalFilename: 'invented.pdf',
    } as unknown as Parameters<typeof buildArrival>[0];
    const a = buildArrival(smuggled);
    expect(a.artifactRef).toBeNull();
    expect(a.artifactHash).toBeNull();
    expect(a.originalFilename).toBeNull();
  });

  it('a file-backed arrival is classed artifact_extraction and keeps its filename as provenance', () => {
    const a = buildArrival({
      kind: ARTIFACT_EXTRACTION,
      artifactRef: 'manuscripts/abc.docx',
      artifactHash: 'h'.repeat(64),
      artifactSize: 99,
      originalFilename: 'book-print-kdp-final.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      sourceText: 'words',
      extractor: 'docx',
    });
    expect(a.sourceKind).toBe(ARTIFACT_EXTRACTION);
    expect(a.originalFilename).toBe('book-print-kdp-final.docx');
  });
});

describe('Negative control — a hash without recoverable bytes is not custody', () => {
  const artifactRow = {
    sourceKind: ARTIFACT_EXTRACTION as const,
    artifactRef: 'manuscripts/abc.pdf',
    artifactHash: 'h'.repeat(64),
  };

  it('certifies custody when the bytes are recoverable', () => {
    expect(certifiesCustody(artifactRow, true)).toBe(true);
  });

  it('REFUSES custody when the reference is intact but the bytes are gone', () => {
    // The founder's control that makes the store-the-bytes ruling load-bearing:
    // delete the artifact while retaining its hash → P0 must FAIL.
    expect(certifiesCustody(artifactRow, false)).toBe(false);
  });

  it('refuses an artifact row missing its reference or hash', () => {
    expect(certifiesCustody({ ...artifactRow, artifactRef: null }, true)).toBe(false);
    expect(certifiesCustody({ ...artifactRow, artifactHash: null }, true)).toBe(false);
  });

  it('certifies a member-supplied arrival, which never claimed bytes to recover', () => {
    expect(
      certifiesCustody(
        { sourceKind: MEMBER_SUPPLIED_TEXT, artifactRef: null, artifactHash: null },
        false,
      ),
    ).toBe(true);
  });
});

describe('Control 3 — loss detection: the check must be able to fail', () => {
  const text = 'Chapter One\n\nIt began.\n\nChapter Two\n\nIt continued.\n';

  it('reports lossless for a clean segmentation', () => {
    expect(detectOmission(text, segment(text)).lossless).toBe(true);
  });

  it('DETECTS a deliberately omitted section', () => {
    const damaged = segment(text).slice(0, 1);
    const report = detectOmission(text, damaged);
    expect(report.lossless).toBe(false);
    expect(report.missing).toContain('Chapter Two');
    expect(report.missing).toContain('It continued.');
  });

  it('DETECTS a single dropped line inside an otherwise intact section', () => {
    const sections = segment(text).map((s) => ({ ...s, body: s.body.replace('It began.', '') }));
    const report = detectOmission(text, sections);
    expect(report.lossless).toBe(false);
    expect(report.missing).toEqual(['It began.']);
  });

  it('does not report formatting as loss', () => {
    // Markdown prefixes and surrounding whitespace are normalized on BOTH sides,
    // so the control cannot be defeated by, or spuriously fire on, formatting.
    const md = '## Chapter One\n\n  It began.  \n';
    expect(detectOmission(md, [{ position: 0, heading: 'Chapter One', body: 'It began.' }]).lossless).toBe(true);
  });

  it('counts what it saw, so a silent no-op cannot masquerade as a pass', () => {
    const report = detectOmission(text, segment(text));
    expect(report.arrivedLineCount).toBe(4);
    expect(report.accountedLineCount).toBeGreaterThanOrEqual(4);
  });
});

describe('Control 4 — consecutive headings: the live defect, reproduced', () => {
  /* The shape of the founder's production manuscript: a print-ready export whose
     front matter is a stack of capitalised lines. On the known-bad baseline every
     capitalised line except the last was dropped, heading and all, before the
     member opened the Work. */
  const frontMatter = [
    'ELEMENTAL ALCHEMY',
    'THE ART OF LIVING A PHENOMENAL LIFE',
    'KELLY NEZAT',
    'SOULLAB PRESS',
    'PERMISSIONS',
    'Copyright 2026 Kelly W. Nezat. All rights reserved.',
    '',
    'CHAPTER ONE',
    'It began on a Tuesday.',
    '',
  ].join('\n');

  it('loses no arriving line', () => {
    const report = detectOmission(frontMatter, segment(frontMatter));
    expect(report.missing).toEqual([]);
    expect(report.lossless).toBe(true);
  });

  it('keeps every one of the stacked headings somewhere reachable', () => {
    const sections = segment(frontMatter);
    const everything = sections.map((s) => `${s.heading ?? ''}\n${s.body}`).join('\n');
    for (const line of ['ELEMENTAL ALCHEMY', 'THE ART OF LIVING A PHENOMENAL LIFE', 'KELLY NEZAT', 'SOULLAB PRESS', 'PERMISSIONS']) {
      expect(everything).toContain(line);
    }
  });

  it('still produces no empty body — the CHECK constraint was never the problem', () => {
    for (const s of segment(frontMatter)) {
      expect(s.body.trim().length).toBeGreaterThan(0);
    }
  });

  it('handles a document that is nothing but stacked headings', () => {
    const only = 'TITLE PAGE\nHALF TITLE\nCOLOPHON\n';
    const sections = segment(only);
    expect(detectOmission(only, sections).lossless).toBe(true);
    for (const s of sections) expect(s.body.trim().length).toBeGreaterThan(0);
  });

  it('handles headings trailing the end of the document', () => {
    const trailing = 'CHAPTER ONE\nIt began.\n\nAPPENDIX\nCOLOPHON\n';
    const sections = segment(trailing);
    expect(detectOmission(trailing, sections).lossless).toBe(true);
    for (const s of sections) expect(s.body.trim().length).toBeGreaterThan(0);
  });
});
