/** Falsifiers for lib/media/pathContainment.ts. Pure; touches no filesystem. */
import { join, resolve, sep } from 'node:path';
import { safeId, safeSubdir, safeFilename, containedPath, MediaPathRefused } from '../../../lib/media/pathContainment.ts';
const BASE = '/app/data/media';
let P = 0, F = 0;
const ok = (id, d, n) => { console.log(`PASS  ${id.padEnd(5)} ${d}${n ? `\n        ${n}` : ''}`); P++; };
const no = (id, d, n) => { console.log(`FAIL  ${id.padEnd(5)} ${d}${n ? `\n        ${n}` : ''}`); F++; };
const refuses = (id, d, fn, code) => {
  try { const r = fn(); no(id, d, `no refusal; returned ${JSON.stringify(r)}`); }
  catch (e) { e instanceof MediaPathRefused && e.code === code ? ok(id, d, e.code) : no(id, d, `wrong failure: ${e.message}`); }
};
// ── the write path: a hostile filename cannot escape ────────────────────────
for (const [id, name] of [['C1', '../../proj-B/original/victim.txt'], ['C2', '../../../escaped.txt'],
  ['C3', '..'], ['C4', '../..'], ['C5', '.'], ['C6', ''], ['C7', '..\\..\\win.txt'], ['C8', '.hidden']]) {
  const safe = safeFilename(name);
  const abs = containedPath(BASE, join('proj-A', 'original', safe));
  const contained = abs.startsWith(resolve(BASE) + sep);
  const flat = !safe.includes('/') && !safe.includes('\\') && safe !== '.' && safe !== '..' && safe !== '';
  contained && flat ? ok(id, `filename ${JSON.stringify(name)} is neutralised`, `→ ${JSON.stringify(safe)}`)
                    : no(id, `filename ${JSON.stringify(name)} is neutralised`, `safe=${JSON.stringify(safe)} abs=${abs}`);
}
// ── ⭐ ordinary names must survive: a reject-based filter would break uploads ──
for (const [id, name, want] of [['C9', 'My Video (final).mp4', 'My_Video_final_.mp4'], ['C10', 'notes-v2.txt', 'notes-v2.txt']]) {
  const g = safeFilename(name);
  g === want ? ok(id, `ordinary name survives: ${JSON.stringify(name)}`, `→ ${JSON.stringify(g)}`)
             : no(id, `ordinary name survives: ${JSON.stringify(name)}`, `got ${JSON.stringify(g)} want ${JSON.stringify(want)}`);
}
// ── identifiers are REFUSED, not repaired ──────────────────────────────────
refuses('C11', 'traversing uploadId is refused', () => safeId('uploadId', '../../../../etc'), 'MEDIA_ID_REFUSED');
refuses('C12', 'empty projectId is refused', () => safeId('projectId', ''), 'MEDIA_ID_REFUSED');
refuses('C13', '".." as an id is refused', () => safeId('projectId', '..'), 'MEDIA_ID_REFUSED');
refuses('C14', 'unknown subdir is refused', () => safeSubdir('../../etc'), 'MEDIA_SUBDIR_REFUSED');
const uuid = '0a93962d-55a2-4deb-ad46-5268ee19be54';
safeId('projectId', uuid) === uuid ? ok('C15', 'a real uuid id is admitted') : no('C15', 'a real uuid id is admitted');
// ── the READ path: containment only, so existing names keep working ─────────
refuses('C16', 'stored traversed path is refused on READ', () => containedPath(BASE, '../../../etc/passwd'), 'MEDIA_PATH_ESCAPES_BASE');
const legacy = 'proj-A/original/My Vidéo (final).mp4';
containedPath(BASE, legacy).endsWith(legacy) ? ok('C17', '⭐ existing name with spaces/unicode still serves', 'charset rules are write-path only')
  : no('C17', 'existing name with spaces/unicode still serves');
// ── refusals must not echo the hostile value ────────────────────────────────
try { safeId('uploadId', '../../../../etc/shadow'); } catch (e) {
  /\.\.|etc|shadow/.test(e.message) ? no('C18', 'refusal does not echo the hostile value', e.message)
    : ok('C18', 'refusal does not echo the hostile value', e.message);
}
console.log(`\n${P}/${P + F} containment falsifiers passed`);
process.exit(F === 0 ? 0 : 1);
