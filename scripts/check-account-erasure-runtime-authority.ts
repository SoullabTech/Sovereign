/**
 * P5-D-R3 runtime schema authority gate.
 *
 * v3 remains source/migration provenance. The R3 authority object is a frozen
 * attestation of the fully migrated PostgreSQL execution graph. This static gate
 * proves the two planes remain linked without pretending they are identical.
 */
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import v3Json from '../config/governance/account-erasure-registry.v3.json';
import runtimeJson from '../config/governance/account-erasure-runtime-authority.v1.json';
import { runtimeSchemaFingerprint } from '../lib/erasure/accountErasureRuntimeAuthority';

const ROOT = process.cwd();
const failures: string[] = [];
const v3: any = v3Json;
const runtime: any = runtimeJson;

function sha256(value: Buffer | string): string { return createHash('sha256').update(value).digest('hex'); }
function fileSha(rel: string): string { return sha256(fs.readFileSync(path.join(ROOT, rel))); }
function corpusDigest(): string {
  const inputs = [
    'database/baseline/0001_baseline_2026-09-01.sql',
    'database/baseline/0001_baseline_2026-09-01.manifest',
    ...fs.readdirSync(path.join(ROOT, 'database/migrations')).filter(x => x.endsWith('.sql')).sort().map(x => `database/migrations/${x}`),
  ];
  return sha256(inputs.map(rel => `${rel}\0${fileSha(rel)}`).join('\n'));
}

if (runtime.version !== 'account-erasure-runtime-authority-v1-r3') failures.push(`unexpected runtime authority version ${runtime.version}`);
if (runtime.sourceRegistryVersion !== v3.version) failures.push('runtime authority sourceRegistryVersion does not bind current v3');
if (runtime.sourceRegistrySha256 !== fileSha('config/governance/account-erasure-registry.v3.json')) failures.push('v3 source registry digest drift');
if (runtime.migrationCorpusSha256 !== corpusDigest()) failures.push('baseline/migration corpus drift invalidates runtime authority');
if (runtime.postgresMajor !== 17) failures.push(`runtime authority witness must be PostgreSQL 17, got ${runtime.postgresMajor}`);
if (runtime.activationProhibited !== false || !String(runtime.activationAuthority).includes('P5-D-R3')) failures.push('R3 activation authority not explicit');

const runtimeLoci = new Map(runtime.memberBoundLoci.map((x:any) => [x.table, x]));
const staleLoci = new Map(runtime.staleSourceLoci.map((x:any) => [x.table, x]));
const sourceLoci = new Map(v3.memberBoundLoci.map((x:any) => [x.table, x]));
if (runtimeLoci.size !== 318) failures.push(`anti-vacuity direct runtime loci expected 318, got ${runtimeLoci.size}`);
if (staleLoci.size !== 1 || !staleLoci.has('dream_entries')) failures.push(`stale source locus set must be exactly dream_entries`);
for (const [table, source] of sourceLoci) {
  const current:any = runtimeLoci.get(table) ?? staleLoci.get(table);
  if (!current) { failures.push(`source locus unaccounted by runtime authority: ${table}`); continue; }
  if (JSON.stringify(current) !== JSON.stringify(source)) failures.push(`source locus classification changed during R3: ${table}`);
}
for (const table of runtimeLoci.keys()) if (!sourceLoci.has(table)) failures.push(`runtime-only direct locus lacks prior classification: ${table}`);

const sourceDeclByKey = new Map(v3.memberForeignKeyDeclarations.map((x:any) => [x.declarationKey, x]));
const sourceGroups = new Map<string, any[]>();
for (const d of v3.memberForeignKeyDeclarations) { const k=`${d.table}|${d.onDelete}`; const a=sourceGroups.get(k)??[]; a.push(d); sourceGroups.set(k,a); }
const runtimeGroups = new Map<string, any[]>();
for (const fk of runtime.runtimeMemberForeignKeys) { const k=`${fk.table}|${fk.onDelete}`; const a=runtimeGroups.get(k)??[]; a.push(fk); runtimeGroups.set(k,a); }

if (runtime.runtimeMemberForeignKeys.length !== 316) failures.push(`anti-vacuity runtime FK constraints expected 316, got ${runtime.runtimeMemberForeignKeys.length}`);
if (runtimeGroups.size !== 294) failures.push(`anti-vacuity runtime FK groups expected 294, got ${runtimeGroups.size}`);
const runtimeOnlyGroups = [...runtimeGroups.entries()].filter(([,xs]) => xs.every(x => x.sourceStanding === 'runtime_only'));
const countDriftGroups = [...runtimeGroups.entries()].filter(([,xs]) => xs.some(x => x.sourceStanding === 'count_drift'));
if (runtimeOnlyGroups.length !== 36) failures.push(`runtime-only FK group count expected 36, got ${runtimeOnlyGroups.length}`);
if (countDriftGroups.length !== 2) failures.push(`count-drift FK group count expected 2, got ${countDriftGroups.length}`);
if (runtime.sourceOnlyFkGroups.length !== 6) failures.push(`source-only FK group count expected 6, got ${runtime.sourceOnlyFkGroups.length}`);

for (const [key, xs] of runtimeGroups) {
  const source = sourceGroups.get(key) ?? [];
  const sourceKeys = source.map(x => x.declarationKey).sort();
  for (const fk of xs) {
    if (!Array.isArray(fk.localColumns) || fk.localColumns.length === 0 || fk.localColumns.some((c:any) => typeof c !== 'string' || /[{}]/.test(c))) failures.push(`invalid runtime FK localColumns: ${fk.constraintName}`);
    if (JSON.stringify([...fk.sourceDeclarationKeys].sort()) !== JSON.stringify(sourceKeys)) failures.push(`source declaration binding drift: ${fk.constraintName}`);
    if (!source.length) {
      if (fk.sourceStanding !== 'runtime_only' || fk.disposition !== 'refuse') failures.push(`runtime-only FK must be explicit refuse: ${key}`);
    } else {
      const dispositions = new Set(source.map(x => x.disposition));
      if (dispositions.size !== 1 || fk.disposition !== source[0].disposition) failures.push(`runtime FK disposition does not inherit unanimous source group: ${key}`);
      const expectedStanding = source.length === xs.length ? 'matched' : 'count_drift';
      if (fk.sourceStanding !== expectedStanding) failures.push(`runtime FK standing mismatch ${key}: ${fk.sourceStanding} != ${expectedStanding}`);
    }
  }
}

for (const group of runtime.sourceOnlyFkGroups) {
  if (runtimeGroups.has(group.key)) failures.push(`source-only FK group is present at runtime: ${group.key}`);
  const source = sourceGroups.get(group.key) ?? [];
  if (!source.length) failures.push(`source-only FK group has no v3 provenance: ${group.key}`);
  if (JSON.stringify([...group.sourceDeclarationKeys].sort()) !== JSON.stringify(source.map(x=>x.declarationKey).sort())) failures.push(`source-only provenance mismatch: ${group.key}`);
}

const fingerprint = runtimeSchemaFingerprint(runtime.memberBoundLoci, runtime.runtimeMemberForeignKeys);
if (fingerprint !== runtime.schemaFingerprintSha256) failures.push('runtime schema fingerprint does not match authority payload');

console.log('\n🧭 Account-erasure R3 runtime authority gate\n');
console.log(`   source registry       ${v3.version}`);
console.log(`   runtime authority     ${runtime.version}`);
console.log(`   direct loci           ${runtime.memberBoundLoci.length} current · ${runtime.staleSourceLoci.length} stale source`);
console.log(`   runtime FKs           ${runtime.runtimeMemberForeignKeys.length} constraints · ${runtimeGroups.size} effect groups`);
console.log(`   provenance deltas     ${runtimeOnlyGroups.length} runtime-only · ${runtime.sourceOnlyFkGroups.length} source-only · ${countDriftGroups.length} count-drift`);
if (failures.length) {
  console.error('\n🚨 R3 RUNTIME AUTHORITY REFUSED\n');
  failures.forEach(f => console.error(`   ${f}`));
  process.exit(1);
}
console.log('\n✅ Runtime execution authority is explicit, fail-closed, and provenance-linked.\n');
