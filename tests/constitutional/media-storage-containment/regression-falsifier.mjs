/**
 * Regression falsifiers for the media path-containment repair.
 * Drives the REAL patched storeFile/storeChunk. Temp dir only — no app server,
 * no production, no network. Run via run-regression.sh, which supplies the roots.
 */
const LIB = process.env.MEDIA_HARNESS_LIB;
const ROOT = process.env.MEDIA_HARNESS_ROOT;
if (!LIB || !ROOT) {
  console.error('run via tests/constitutional/media-storage-containment/run-regression.sh');
  process.exit(2);
}
process.env.MEDIA_STORAGE_PATH = `${ROOT}/media`;

const { readFile } = await import('node:fs/promises');
const { existsSync } = await import('node:fs');
const { storeFile, storeChunk } = await import(`${LIB}/storage.ts`);
const { MediaPathRefused } = await import(`${LIB}/pathContainment.ts`);

let P = 0, F = 0;
const ok = (i, d, n) => { console.log(`PASS  ${i.padEnd(4)} ${d}\n        ${n}`); P++; };
const no = (i, d, n) => { console.log(`FAIL  ${i.padEnd(4)} ${d}\n        ${n}`); F++; };
const victim = `${ROOT}/media/proj-B/original/victim.txt`;

// R1 — the exact payload that overwrote another project before the repair
const before = (await readFile(victim, 'utf8')).trim();
const r1 = await storeFile('proj-A', 'original', '../../proj-B/original/victim.txt', Buffer.from('OVERWRITTEN\n'));
const after = (await readFile(victim, 'utf8')).trim();
after === before
  ? ok('R1', 'cross-project overwrite is dead', `victim intact; write landed at ${r1.relativePath}`)
  : no('R1', 'cross-project overwrite is dead', `victim is now ${JSON.stringify(after)}`);

// R2 — base escape dead, AND the persisted relativePath is contained
const r2 = await storeFile('proj-A', 'original', '../../../escaped.txt', Buffer.from('x'));
const escaped = existsSync(`${ROOT}/escaped.txt`);
!escaped && !r2.relativePath.includes('..') && r2.absolutePath.startsWith(`${ROOT}/media/`)
  ? ok('R2', 'base escape is dead AND the persisted path is contained', `relativePath=${r2.relativePath}`)
  : no('R2', 'base escape is dead AND the persisted path is contained', `escaped=${escaped} relativePath=${r2.relativePath}`);

// R3 — a hostile uploadId is REFUSED, not repaired
try {
  await storeChunk('proj-A', '../../../../etc', 0, Buffer.from('x'));
  no('R3', 'hostile uploadId is refused', 'no refusal raised');
} catch (e) {
  e instanceof MediaPathRefused ? ok('R3', 'hostile uploadId is refused', e.code)
                                : no('R3', 'hostile uploadId is refused', e.message);
}

// R4 — ⭐ an ordinary upload still succeeds: a reject-based filter would break uploads
const r4 = await storeFile('proj-A', 'original', 'My Video (final).mp4', Buffer.from('ok'));
existsSync(r4.absolutePath)
  ? ok('R4', 'an ordinary upload still succeeds', `→ ${r4.relativePath}`)
  : no('R4', 'an ordinary upload still succeeds', r4.absolutePath);

console.log(`\n${P}/${P + F} regression falsifiers passed`);
process.exit(F === 0 ? 0 : 1);
