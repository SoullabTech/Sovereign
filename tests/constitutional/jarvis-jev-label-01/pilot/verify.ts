/** Hermetic checks for the pilot harness on a SYNTHETIC home. No real unit is read. */
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BANNER } from './config';
import { assertOutsideHome, blankSheet, derivePacket, PilotRefused, report, seal, snapshot, verifySources } from './pilot';

let fail = 0;
const ok = (name: string, c: boolean): void => { console.log(`${c ? 'PASS' : 'FAIL'}  ${name}`); if (!c) fail += 1; };
const refuses = (f: () => unknown): string | null => { try { f(); return null; } catch (e) { return e instanceof PilotRefused ? e.code : 'OTHER'; } };

const home = mkdtempSync(join(tmpdir(), 'pilot-home-'));
const dir = join(home, 'work-units-v2');
mkdirSync(dir);
const SECRET = 'SECRET-OBJECTIVE-TEXT-do-not-leak';
const shapes = ['CODE_GROUNDED', 'ARCHITECTURE_REASONING', 'EVIDENCE_SYNTHESIS'];
for (let i = 0; i < 30; i += 1) {
  const id = `v2-${SECRET}-${i}`;
  const wu = {
    identity: { id, objective: SECRET, task_shape: shapes[i % 3] },
    custody: { evidence_class: i % 5 === 0 ? 'E4_SENSITIVE_OR_PRODUCTION' : 'E1_REPOSITORY_LOCAL' },
    scope: { allowed_paths: i % 4 === 0 ? ['database/migrations/x.sql', 'lib/auth/y.ts'] : ['lib/z.ts'] },
    authority: { network_external: false, external_disclosure: 'none', production_read: false, production_write: false, deploy: false },
  };
  writeFileSync(join(dir, `${id}.json`), JSON.stringify({ work_unit: wu }));
  writeFileSync(join(dir, `${id}.desktop.json`), '{}');
}
writeFileSync(join(dir, 'broken.json'), '{not json');
const tree = (): string => createHash('sha256').update(readdirSync(dir).sort().map((n) => n + readFileSync(join(dir, n), 'utf8')).join('|')).digest('hex');

const before = tree();
const { manifest, index } = snapshot(home);
ok('read-only: home byte-identical after snapshot', tree() === before);
ok('selects exactly 25 primaries; sidecars excluded', manifest.units.length === 25 && manifest.primaries_found === 31);
ok('manifest is content-free (no objective, id slug or path)', !JSON.stringify(manifest).includes(SECRET) && !JSON.stringify(manifest).includes('migrations'));
ok('local index is where the ids live', JSON.stringify(index).includes(SECRET));
ok('every unit hindsight_risk and hashed', manifest.units.every((u) => u.hindsight_risk === true && /^[0-9a-f]{64}$/.test(u.source_sha256)));
ok('selection is deterministic', snapshot(home).manifest.manifest_sha256 === manifest.manifest_sha256);
ok('output inside home refused', refuses(() => assertOutsideHome(home, join(home, 'out'))) === 'OUTPUT_INSIDE_HOME' && refuses(() => assertOutsideHome(home, join(dir, 'x'))) === 'OUTPUT_INSIDE_HOME');
ok('output outside home allowed', refuses(() => assertOutsideHome(home, join(tmpdir(), 'elsewhere'))) === null);
ok('unparseable unit is recorded underivable, not imputed', derivePacket(null) === null && derivePacket({ identity: { task_shape: 'NOPE' } }) === null);
ok('packet fields carry derivation provenance', manifest.units.every((u) => u.packet === null || u.packet.derivation.migration === 'PATH_PATTERN'));

verifySources(home, manifest, index);
ok('sources verify against manifest', true);
writeFileSync(join(dir, `${index.pilot_id_to_unit_id.p001}.json`), '{"changed":true}');
ok('source drift after hashing is refused', refuses(() => verifySources(home, manifest, index)) === 'SOURCE_DRIFT');
ok('tampered manifest refused', refuses(() => verifySources(home, { ...manifest, primaries_found: 1 }, index)) === 'MANIFEST_TAMPERED');

const sheet = blankSheet(manifest, 'A');
ok('sheet is pre-marked hindsight on every entry', sheet.entries.every((e) => e.hindsight_risk === true));
ok('blank sheet cannot be sealed', refuses(() => seal(manifest, sheet)) === 'INCOMPLETE_SHEET');
const fill = (s: typeof sheet, d: number): typeof sheet => ({ ...s, entries: s.entries.map((e, i) => ({ ...e, value: e.target === 'Q_DEPTH' ? 1 + ((i + d) % 5) : (i + d) % 3 === 0 })) });
ok('unmarked hindsight refused', refuses(() => seal(manifest, { ...fill(sheet, 0), entries: fill(sheet, 0).entries.map((e, i) => (i === 3 ? { ...e, hindsight_risk: false } : e)) })) === 'HINDSIGHT_RISK_NOT_MARKED');
ok('authority target refused', refuses(() => seal(manifest, { ...fill(sheet, 0), entries: [{ ...fill(sheet, 0).entries[0]!, target: 'merge' as never }] })) === 'AUTHORITY_TARGET');
ok('sheet from another manifest refused', refuses(() => seal(manifest, { ...fill(sheet, 0), manifest_sha256: 'x' })) === 'SHEET_FOR_OTHER_MANIFEST');

const A = seal(manifest, fill(sheet, 0));
const B = seal(manifest, fill({ ...sheet, labeller: 'B' }, 1));
ok('sealed labels carry commitments', A.labels.every((l) => /^[0-9a-f]{64}$/.test(l.commitment)));
const rep = report(manifest, [A, B]);
ok('report carries the mandatory banner and no verdict', rep.startsWith(BANNER) && rep.includes('licenses: NOTHING') && rep.includes('verdict: NOT PRODUCED'));
ok('report states agreement unfrozen and hindsight', rep.includes('Agreement rule NOT frozen') && rep.includes('HINDSIGHT_RISK'));
ok('report leaks no authored text', !rep.includes(SECRET));
ok('report refuses a seal for another manifest', refuses(() => report(manifest, [{ ...A, manifest_sha256: 'x' }])) === 'SEAL_FOR_OTHER_MANIFEST');

console.log(fail === 0 ? '\npilot harness: ALL PASS' : `\npilot harness: ${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
