/**
 * PDF-CLEAN witness — P1..P5 against the REAL pdf-parse.
 *
 *   npx tsx scripts/witness/pdf-page-marker-witness.ts
 *
 * WHY A SCRIPT AND NOT A JEST SUITE. pdf-parse loads pdfjs as an ESM worker,
 * which jest refuses without --experimental-vm-modules; this repo sets that
 * flag nowhere, and lib/manuscript/ingest/__tests__/parseUpload.test.ts mocks
 * the library for exactly that reason. A mock cannot falsify this repair,
 * because the defect IS the library's default output. So the CI-runnable guard
 * asserts the OPTION is passed and this witness proves what the option DOES.
 * Neither substitutes for the other. This is proof infrastructure only — no
 * production code path reads anything here.
 *
 * THE INVARIANT THIS EXISTS TO DEFEND:
 *
 *     Never remove page-marker-looking text AFTER extraction. By then author
 *     text and parser text may be indistinguishable.
 *
 * The subject proves that literally: page 2 carries an AUTHOR-written
 * `-- 2 of 3 --`, byte-identical to what pdf-parse synthesises. In the default
 * aggregate the two land two lines apart. Any regex that removes one removes
 * the other, which is why the repair suppresses the marker at the source
 * instead of filtering afterwards.
 */

const AUTHOR_LITERAL = '-- 2 of 3 --';
const MARKER_SHAPE = /^--\s*\d+\s+of\s+\d+\s*--$/;

/** Build a minimal, valid multi-page PDF, byte by byte. Empty lines → no text layer. */
function buildPdf(pages: string[][]): Buffer {
  const objs: Buffer[] = [];
  const add = (b: string) => {
    objs.push(Buffer.from(b, 'latin1'));
    return objs.length;
  };

  const font = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const contents = pages.map((lines) => {
    const body = lines.length
      ? 'BT /F1 12 Tf 72 720 Td 14 TL\n' + lines.map((l) => `(${l}) Tj T*\n`).join('') + 'ET'
      : '';
    return add(`<< /Length ${body.length} >>\nstream\n${body}\nendstream`);
  });
  const pagesId = objs.length + pages.length + 1;
  const pageObjs = contents.map((c) =>
    add(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] ` +
        `/Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${c} 0 R >>`,
    ),
  );
  const pagesObj = add(
    `<< /Type /Pages /Kids [${pageObjs.map((p) => `${p} 0 R`).join(' ')}] /Count ${pageObjs.length} >>`,
  );
  const cat = add(`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`);

  const parts: Buffer[] = [Buffer.from('%PDF-1.4\n', 'latin1')];
  const offsets: number[] = [];
  let len = parts[0].length;
  objs.forEach((o, i) => {
    offsets.push(len);
    const chunk = Buffer.concat([
      Buffer.from(`${i + 1} 0 obj\n`, 'latin1'),
      o,
      Buffer.from('\nendobj\n', 'latin1'),
    ]);
    parts.push(chunk);
    len += chunk.length;
  });
  const pad = (n: number) => String(n).padStart(10, '0');
  parts.push(
    Buffer.from(
      `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` +
        offsets.map((o) => `${pad(o)} 00000 n \n`).join('') +
        `trailer\n<< /Size ${objs.length + 1} /Root ${cat} 0 R >>\nstartxref\n${len}\n%%EOF\n`,
      'latin1',
    ),
  );
  return Buffer.concat(parts);
}

const PAGE_TEXT = [
  'Page one ordinary unmistakable text.',
  'Page two ordinary text.',
  'Page three ordinary unmistakable text.',
];

/** Three pages; page 2 carries the author's own marker-shaped line. */
const TYPED = buildPdf([[PAGE_TEXT[0]], [PAGE_TEXT[1], AUTHOR_LITERAL], [PAGE_TEXT[2]]]);

/** Three pages, no text layer at all — the scanned/image case. */
const SCANNED = buildPdf([[], [], []]);

let checks = 0;
let failures = 0;
function check(name: string, pass: boolean, detail = '') {
  checks += 1;
  if (!pass) failures += 1;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}
const markerLines = (t: string) => t.split('\n').filter((l) => MARKER_SHAPE.test(l.trim()));

async function main() {
  const { parseUpload } = await import('../../lib/manuscript/ingest/parseUpload');

  // ── CONTROL ────────────────────────────────────────────────────────────────
  // Without this the witness cannot tell "the marker was suppressed" from "the
  // marker never existed", and every P below would be vacuous.
  const { PDFParse } = await import('pdf-parse');
  const control = new PDFParse({ data: new Uint8Array(TYPED) });
  let baseline = '';
  try {
    baseline = (await control.getText()).text ?? '';
  } finally {
    await control.destroy().catch(() => undefined);
  }
  const baseMarkers = markerLines(baseline);
  check(
    'CONTROL · unconfigured pdf-parse really does inject markers',
    baseMarkers.length === 4 && baseline.includes('-- 1 of 3 --'),
    `${baseMarkers.length} marker-shaped lines: 3 synthetic + the author's`,
  );
  check(
    "CONTROL · and the author's line is byte-identical to a synthetic one",
    baseMarkers.filter((l) => l === AUTHOR_LITERAL).length === 2,
    'two occurrences, one authored by each party — no filter can tell them apart',
  );

  // ── P1..P4 · the typed subject through the live path ───────────────────────
  const typed = await parseUpload(TYPED, 'subject.pdf', 'application/pdf');
  const lines = typed.text.split('\n');

  check(
    'P1 · no synthetic page marker survives',
    !typed.text.includes('-- 1 of 3 --') && !typed.text.includes('-- 3 of 3 --'),
    "pages 1 and 3 have no author twin, so their absence is unambiguous",
  );
  check(
    'P2 · the author\'s own "-- 2 of 3 --" survives exactly once',
    lines.filter((l) => l === AUTHOR_LITERAL).length === 1,
    `${lines.filter((l) => l === AUTHOR_LITERAL).length} occurrence(s)`,
  );
  check(
    'P2b · and it is the ONLY marker-shaped line left',
    markerLines(typed.text).length === 1,
    `${markerLines(typed.text).length} remain`,
  );
  check(
    'P3 · ordinary page text survives exactly',
    PAGE_TEXT.every((t) => typed.text.split('\n').includes(t)),
  );
  check(
    'P3b · nothing Soullab authored was inserted between pages',
    // Every non-empty line came from the PDF: author lines plus the decoy.
    typed.text
      .split('\n')
      .filter((l) => l.trim().length > 0)
      .every((l) => PAGE_TEXT.includes(l) || l === AUTHOR_LITERAL),
    'no replacement separator of ours',
  );
  check(
    'P4 · parseUpload reports an unchanged shape',
    typed.format === 'pdf' && typed.warnings.length === 0,
    `format=${typed.format} warnings=${JSON.stringify(typed.warnings)}`,
  );

  const direct = new PDFParse({ data: new Uint8Array(TYPED) });
  let cleaned = '';
  try {
    cleaned = (await direct.getText({ pageJoiner: '' })).text ?? '';
  } finally {
    await direct.destroy().catch(() => undefined);
  }
  check(
    'P4b · and its text is identical to direct cleaned extraction',
    typed.text === cleaned,
    'parseUpload adds no processing of its own',
  );

  // ── P5 · the scanned case is untouched by this repair ──────────────────────
  const scanned = await parseUpload(SCANNED, 'scan.pdf', 'application/pdf');
  check(
    'P5 · a PDF with no text layer still warns',
    scanned.format === 'pdf' &&
      scanned.warnings.length === 1 &&
      /scanned images/.test(scanned.warnings[0]),
    `warnings=${scanned.warnings.length}`,
  );
  check(
    'P5b · a PDF with no text layer remains text-empty after extraction',
    // The behavioural form, and the only one that proves what matters: a PDF
    // with nothing to extract must not ACQUIRE parser-authored text.
    //
    // Stated carefully, because the weaker version was tempting and wrong:
    // the default markers did not push this subject ACROSS the scanned
    // threshold — 44 chars over 3 pages is ~14.7/page, still under the 20
    // required to warn. What they did was pollute and bias the heuristic with
    // text no author wrote. Emptiness is the claim that holds.
    scanned.text.trim().length === 0,
    `${scanned.text.trim().length} chars after extraction (default emits 44)`,
  );

  console.log(`\n${checks} checks · ${failures} failures`);
  if (failures > 0) process.exit(1);
}

main().catch((err) => {
  console.error('WITNESS ERROR — the instrument failed; that is not a subject result:', err);
  process.exit(2);
});
