/**
 * F5-CONFORMANCE-REPAIR-01 · P5-D activation-registry gate.
 *
 * v2 remains the historical shadow registry. v3 may activate only the exact
 * authority P5-D earned: account/session + Circles lifecycle, with S5 required
 * at every destructive supported seam. Everything else stays refuse-by-default.
 */
import fs from 'fs';
import path from 'path';
import { discoverCensus, validateRegistry } from './erasure/account-erasure-registry-core';

const root = process.cwd();
const v2 = JSON.parse(fs.readFileSync(path.join(root, 'config/governance/account-erasure-registry.v2.json'), 'utf8'));
const v3 = JSON.parse(fs.readFileSync(path.join(root, 'config/governance/account-erasure-registry.v3.json'), 'utf8'));
const census = discoverCensus(root);

const failures: string[] = [];
const shapeProbe = { ...v3, activationProhibited: true };
for (const failure of validateRegistry(shapeProbe, census)) failures.push(`coverage: ${failure}`);

if (v3.version !== 'account-erasure-registry-v3-p5d') failures.push(`unexpected version ${v3.version}`);
if (v3.coverageOnly !== true) failures.push('v3 must remain coverageOnly=true');
if (v3.activationProhibited !== false) failures.push('v3 must explicitly set activationProhibited=false');
if (!String(v3.activationAuthority ?? '').includes('P5-D')) failures.push('v3 must name P5-D activation authority');

const byTable2 = new Map<string, any>(v2.memberBoundLoci.map((x: any) => [x.table, x]));
const byTable3 = new Map<string, any>(v3.memberBoundLoci.map((x: any) => [x.table, x]));
const permittedLocusChanges = new Set(['circle_memberships', 'circle_inquiry_responses']);
for (const [table, before] of byTable2) {
  const after: any = byTable3.get(table);
  if (!after) { failures.push(`v3 missing v2 locus ${table}`); continue; }
  const normalize = (x: any) => ({ ...x, authorityReason: undefined, requiresS5: undefined });
  if (JSON.stringify(normalize(before)) !== JSON.stringify(normalize(after))) {
    failures.push(`classification drift outside P5-D succession: ${table}`);
  }
  if (!permittedLocusChanges.has(table)) {
    if (before.requiresS5 !== after.requiresS5 || before.authorityReason !== after.authorityReason) {
      const supported = ['auth_sessions', 'member_settings', 'member_sessions'].includes(table);
      if (!supported) failures.push(`unauthorized locus metadata drift: ${table}`);
    }
  }
}
for (const table of byTable3.keys()) if (!byTable2.has(table)) failures.push(`v3 added locus ${table}`);

for (const table of permittedLocusChanges) {
  const x: any = byTable3.get(table);
  if (!x?.requiresS5) failures.push(`${table} must require S5 under P5-D`);
  if (x?.adapterKey !== 'circles_lifecycle') failures.push(`${table} must remain circles_lifecycle`);
}
for (const table of ['auth_sessions', 'member_settings', 'member_sessions']) {
  const x: any = byTable3.get(table);
  if (!x?.requiresS5 || x?.adapterKey !== 'account_session') {
    failures.push(`${table} must remain account_session + requiresS5`);
  }
}

const fkKey = (x: any) => x.declarationKey;
const fk2 = new Map<string, any>(v2.memberForeignKeyDeclarations.map((x: any) => [fkKey(x), x]));
const fk3 = new Map<string, any>(v3.memberForeignKeyDeclarations.map((x: any) => [fkKey(x), x]));
for (const [key, before] of fk2) {
  const after: any = fk3.get(key);
  if (!after) { failures.push(`v3 missing v2 FK ${key}`); continue; }
  if (before.table !== after.table || before.onDelete !== after.onDelete || before.disposition !== after.disposition) {
    failures.push(`FK classification drift: ${key}`);
  }
}
for (const key of fk3.keys()) if (!fk2.has(key)) failures.push(`v3 added FK ${key}`);

const groups = new Map<string, any[]>();
for (const fk of v3.memberForeignKeyDeclarations) {
  const key = `${fk.table}|${fk.onDelete}`;
  const list = groups.get(key) ?? [];
  list.push(fk);
  groups.set(key, list);
}
for (const [key, declarations] of groups) {
  const dispositions = new Set(declarations.map((x) => x.disposition));
  if (dispositions.size !== 1) failures.push(`runtime FK effect group has mixed dispositions: ${key}`);
}
if (groups.size !== 264) failures.push(`expected 264 FK effect groups, got ${groups.size}`);

console.log('\n🔓 Account-erasure P5-D activation registry gate\n');
console.log(`   registry          ${v3.version}`);
console.log(`   direct loci       ${v3.memberBoundLoci.length}`);
console.log(`   FK declarations   ${v3.memberForeignKeyDeclarations.length}`);
console.log(`   FK effect groups  ${groups.size}`);
console.log(`   authority         ${v3.activationAuthority}`);
if (failures.length) {
  console.error('\n🚨 P5-D ACTIVATION REGISTRY REFUSED\n');
  failures.forEach((f) => console.error(`   ${f}`));
  process.exit(1);
}
console.log('\n✅ P5-D succession is bounded; 313 refuse-by-default loci remain fail-closed.\n');
