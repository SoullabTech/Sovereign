// PDF parsing cannot run inside jest's sandbox (pdfjs needs ESM dynamic import), so the PDF fixtures are checked here with
// tsx, against the SAME manifest expectations as probe P1. Fictional fixtures only; output is counts, never content.
// Usage: NODE_ENV=test tsx parse-pdf-fixtures.mts <fixtureDir> <outJson>
import fs from 'node:fs';
import path from 'node:path';
import { parseUpload } from '../../../../lib/manuscript/ingest/parseUpload';

const [dir, out] = process.argv.slice(2);
if (!dir || !out) { console.error('usage: parse-pdf-fixtures.mts <fixtureDir> <outJson>'); process.exit(64); }
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8')) as Array<{ name: string; path: string; mime: string | null; expectedStatus: number }>;
const rows: Array<{ name: string; expectedStatus: number; chars: number | null; warnings: number | null; outcome: string; agrees: boolean }> = [];
for (const f of manifest.filter((m) => m.name.endsWith('.pdf'))) {
  let chars: number | null = null; let warnings: number | null = null; let outcome: string;
  try {
    const r: any = await parseUpload(fs.readFileSync(f.path), f.name, f.mime);
    chars = String(r.text ?? '').trim().length; warnings = r.warnings?.length ?? null;
    outcome = chars === 0 ? 'ok:empty' : 'ok:text';
  } catch (e: any) { outcome = `throws:${e?.name ?? 'Error'}`; }
  const agrees = f.expectedStatus === 200 ? outcome === 'ok:text' : f.expectedStatus === 503 ? outcome === 'ok:empty' : f.expectedStatus === 415 ? outcome === 'throws:UnsupportedUploadError' : outcome.startsWith('throws:');
  rows.push({ name: f.name, expectedStatus: f.expectedStatus, chars, warnings, outcome, agrees });
}
fs.writeFileSync(out, JSON.stringify({ protocol: 'writer-source-intake-pdf-parse/1', rows }, null, 1));
console.log(`pdf fixtures checked: ${rows.length}, disagreements: ${rows.filter((r) => !r.agrees).length}`);
process.exit(rows.length > 0 && rows.every((r) => r.agrees) ? 0 : 1); // zero PDFs would be a vacuous pass
