/** Hermetic checks for the pilot harness on a SYNTHETIC home. No real unit is read. */
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, statSync, symlinkSync, writeFileSync, chmodSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BANNER } from './config';
import { assertOutsideHome, blankSheet, derivePacket, DEPTH_ANCHORS, extractAnnotations, PilotRefused, report, seal, sealDigest, snapshot, verifySources, writeOutside, type Sheet } from './pilot';

let fail = 0;
let total = 0;
const ok = (name: string, c: boolean): void => { total += 1; console.log(`${c ? 'PASS' : 'FAIL'}  ${name}`); if (!c) fail += 1; };
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
ok('unparseable unit is recorded underivable, not imputed', derivePacket(null) === null && derivePacket({ identity: { task_shape: 'NOPE' } }) === null);
ok('packet fields carry derivation provenance', manifest.units.every((u) => u.packet === null || u.packet.derivation.migration === 'PATH_PATTERN'));

// ── output boundary, physical not lexical (the macOS /var → /private/var trap) ──
const link = join(mkdtempSync(join(tmpdir(), 'pilot-link-')), 'home-link');
symlinkSync(home, link);
const real = realpathSync(home);
ok('output inside home refused (lexical)', refuses(() => assertOutsideHome(home, join(home, 'out'))) === 'OUTPUT_INSIDE_HOME');
ok('output inside home refused when HOME is a symlink path', refuses(() => assertOutsideHome(link, join(real, 'out'))) === 'OUTPUT_INSIDE_HOME');
ok('output inside home refused when OUTPUT is the symlink path', refuses(() => assertOutsideHome(real, join(link, 'work-units-v2', 'x.json'))) === 'OUTPUT_INSIDE_HOME');
ok('output inside home refused through not-yet-existing subdirectories', refuses(() => assertOutsideHome(home, join(link, 'a', 'b', 'c.json'))) === 'OUTPUT_INSIDE_HOME');
ok('home itself refused as an output', refuses(() => assertOutsideHome(home, link)) === 'OUTPUT_INSIDE_HOME');
ok('output outside home allowed', refuses(() => assertOutsideHome(home, join(tmpdir(), 'elsewhere', 'x.json'))) === null);
ok('sibling with a shared name prefix is outside', refuses(() => assertOutsideHome(home, home + '-sibling/x.json')) === null);
ok('writeOutside refuses inside the home and writes nothing', refuses(() => writeOutside(home, join(dir, 'leak.json'), 'x')) === 'OUTPUT_INSIDE_HOME' && !readdirSync(dir).includes('leak.json'));
const idxFile = join(mkdtempSync(join(tmpdir(), 'pilot-out-')), 'local-index.json');
writeFileSync(idxFile, 'old'); chmodSync(idxFile, 0o644);
writeOutside(home, idxFile, 'new', 0o600);
ok('local index mode is repaired even when the file already existed', (statSync(idxFile).mode & 0o777) === 0o600);

verifySources(home, manifest, index);
ok('sources verify against manifest', true);
const p001 = join(dir, `${index.pilot_id_to_unit_id.p001}.json`);
const original = readFileSync(p001, 'utf8');
writeFileSync(p001, '{"changed":true}');
ok('source drift after hashing is refused', refuses(() => verifySources(home, manifest, index)) === 'SOURCE_DRIFT');
writeFileSync(p001, original);
ok('tampered manifest refused', refuses(() => verifySources(home, { ...manifest, primaries_found: 1 }, index)) === 'MANIFEST_TAMPERED');

// ── P-before-F custody ──
const fill = (s: Sheet, d: number): Sheet => ({ ...s, entries: s.entries.map((e, i) => ({ ...e, value: e.target === 'Q_DEPTH' ? 1 + ((i + d) % 5) : (i + d) % 3 === 0 })) });
const pA = blankSheet(manifest, 'A', 'P');
ok('P sheet shows packets only and carries no unit ids or objectives', pA.packets !== undefined && !JSON.stringify(pA).includes(SECRET) && Object.keys(pA.packets).length === 25);
ok('every sheet is pre-marked hindsight and offers the candidate anchors', pA.entries.every((e) => e.hindsight_risk === true && e.ambiguous === false && e.note === null) && String(pA.depth_anchors?.status).includes('NOT FROZEN') && Object.keys(DEPTH_ANCHORS.bands).length === 5);
ok('a P sheet has 4 entries per unit, all domain P', pA.entries.length === 100 && pA.entries.every((e) => e.domain === 'P'));
ok('blank sheet cannot be sealed', refuses(() => seal(manifest, pA)) === 'INCOMPLETE_SHEET');
ok('F sheet cannot be cut before P is sealed', refuses(() => blankSheet(manifest, 'A', 'F')) === 'P_NOT_SEALED');

const filledP = fill(pA, 0);
ok('unmarked hindsight refused', refuses(() => seal(manifest, { ...filledP, entries: filledP.entries.map((e, i) => (i === 3 ? { ...e, hindsight_risk: false } : e)) })) === 'HINDSIGHT_RISK_NOT_MARKED');
ok('authority target refused', refuses(() => seal(manifest, { ...filledP, entries: [{ ...filledP.entries[0]!, target: 'merge' as never }] })) === 'AUTHORITY_TARGET');
ok('sheet from another manifest refused', refuses(() => seal(manifest, { ...filledP, manifest_sha256: 'x' })) === 'SHEET_FOR_OTHER_MANIFEST');
ok('a domain-mixed sheet is refused', refuses(() => seal(manifest, { ...filledP, entries: filledP.entries.map((e, i) => (i === 0 ? { ...e, domain: 'F' as const } : e)) })) === 'DOMAIN_MIXED');
const undetP = { ...filledP, entries: filledP.entries.map((e, i) => (i === 0 ? { ...e, value: 'UNDETERMINABLE' as const, ambiguous: true, note: 'packet silent' } : e)) };
const SA_P = seal(manifest, undetP);
ok('P allows UNDETERMINABLE and counts ambiguity outside the commitment', SA_P.labels[0]!.value === 'UNDETERMINABLE' && SA_P.ambiguity_counts.Q_DEPTH === 1 && SA_P.labels.every((l) => /^[0-9a-f]{64}$/.test(l.commitment)));
ok('a B seal is not accepted as A\'s P seal', refuses(() => blankSheet(manifest, 'A', 'F', seal(manifest, fill({ ...pA, labeller: 'B' }, 1)))) === 'P_SEAL_MISMATCH');
ok('the sealed artifact is content-free: no note text anywhere in it', !JSON.stringify(SA_P).includes('packet silent') && !('annotations' in SA_P));
const ann = extractAnnotations(undetP);
ok('the note survives only in the local annotations artifact', ann.entries.length === 1 && ann.entries[0]!.note === 'packet silent' && ann.warning.includes('LOCAL ONLY'));
const annFile = join(mkdtempSync(join(tmpdir(), 'pilot-ann-')), 'ann.json');
writeOutside(home, annFile, JSON.stringify(ann), 0o600);
ok('annotations are written 0600 and refused inside the home', (statSync(annFile).mode & 0o777) === 0o600 && refuses(() => writeOutside(home, join(dir, 'ann.json'), 'x', 0o600)) === 'OUTPUT_INSIDE_HOME');
const half = { ...SA_P, labels: SA_P.labels.slice(0, 10) };
ok('an incomplete P seal does not unlock F', refuses(() => blankSheet(manifest, 'A', 'F', half)) === 'P_SEAL_INCOMPLETE');

const fA = blankSheet(manifest, 'A', 'F', SA_P);
ok('F sheet is bound to the P seal digest', fA.after_p_seal_sha256 === sealDigest(SA_P) && fA.packets === undefined);
const filledF = fill(fA, 2);
ok('F cannot be UNDETERMINABLE', refuses(() => seal(manifest, { ...filledF, entries: filledF.entries.map((e, i) => (i === 0 ? { ...e, value: 'UNDETERMINABLE' as const } : e)) }, 1, SA_P)) === 'F_UNDETERMINABLE');
ok('F cannot be sealed without the P seal', refuses(() => seal(manifest, filledF)) === 'P_NOT_SEALED');
ok('F sheet for a different P seal is refused', refuses(() => seal(manifest, { ...filledF, after_p_seal_sha256: 'x' }, 1, SA_P)) === 'F_NOT_CUT_AFTER_P_SEAL');
const SA_F = seal(manifest, filledF, 1, SA_P);
ok('F sequence numbers follow every P sequence number', Math.min(...SA_F.labels.map((l) => l.committed_seq)) > Math.max(...SA_P.labels.map((l) => l.committed_seq)));

const SB_P = seal(manifest, fill({ ...pA, labeller: 'B' }, 1));
const SB_F = seal(manifest, fill({ ...blankSheet(manifest, 'B', 'F', SB_P) }, 3), 1, SB_P);
const rep = report(manifest, [SA_P, SA_F, SB_P, SB_F]);
ok('report carries the mandatory banner and no verdict', rep.startsWith(BANNER) && rep.includes('licenses: NOTHING') && rep.includes('verdict: NOT PRODUCED'));
ok('report states agreement unfrozen, hindsight and candidate anchors', rep.includes('Agreement rule NOT frozen') && rep.includes('HINDSIGHT_RISK') && rep.includes('PILOT_CANDIDATE'));
ok('report counts anchor ambiguity', rep.includes('flagged ambiguous: P=1 F=0'));
ok('report leaks no authored text', !rep.includes(SECRET));
ok('report carries no note text', !rep.includes('packet silent'));
ok('report refuses an F seal whose P seal is absent', refuses(() => report(manifest, [SA_F])) === 'F_WITHOUT_PRIOR_P_SEAL');
ok('report refuses F that does not follow P', refuses(() => report(manifest, [SA_P, { ...SA_F, labels: SA_F.labels.map((l) => ({ ...l, committed_seq: 1 })) }])) === 'F_NOT_AFTER_P');
ok('report refuses a seal for another manifest', refuses(() => report(manifest, [{ ...SA_P, manifest_sha256: 'x' }])) === 'SEAL_FOR_OTHER_MANIFEST');

console.log(`\n${total} checks · ${fail} failed`);
console.log(fail === 0 ? 'pilot harness: ALL PASS' : `pilot harness: ${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
