import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { query, closePool } from '../../lib/db/postgres';
import v3Json from '../../config/governance/account-erasure-registry.v3.json';
import type { AccountErasureActivationRegistry, DeleteAction } from '../../lib/erasure/accountErasureActivationRegistry';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'config/governance/account-erasure-runtime-authority.v1.json');
const SOURCE_PATH = path.join(ROOT, 'config/governance/account-erasure-registry.v3.json');
const registry = v3Json as unknown as AccountErasureActivationRegistry;
const IDENTITY = registry.identityColumns;

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
function action(code: string): DeleteAction {
  if (code === 'c') return 'CASCADE'; if (code === 'r') return 'RESTRICT';
  if (code === 'a') return 'NO ACTION'; if (code === 'n') return 'SET NULL';
  throw new Error(`unsupported confdeltype ${code}`);
}
function stableGraphFingerprint(loci: Array<{table:string;identityColumns:string[]}>, fks: Array<{constraintName:string;table:string;localColumns:string[];onDelete:DeleteAction}>): string {
  return sha256(JSON.stringify({
    loci: loci.map(x => ({table:x.table, identityColumns:[...x.identityColumns].sort()})).sort((a,b)=>a.table.localeCompare(b.table)),
    fks: fks.map(x => ({constraintName:x.constraintName,table:x.table,localColumns:[...x.localColumns].sort(),onDelete:x.onDelete})).sort((a,b)=>`${a.table}|${a.constraintName}`.localeCompare(`${b.table}|${b.constraintName}`)),
  }));
}
async function main() {
  const versionRow = await query<{server_version_num:string}>('SHOW server_version_num');
  const postgresMajor = Math.floor(Number(versionRow.rows[0].server_version_num) / 10000);
  if (postgresMajor !== 17) throw new Error(`R3 authority generation requires PostgreSQL 17 witness, got ${postgresMajor}`);

  const locusRows = await query<{table_name:string;column_name:string}>(`
    SELECT c.relname AS table_name, a.attname::text AS column_name
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
     WHERE n.nspname='public' AND c.relkind IN ('r','p')
       AND a.attname::text=ANY($1::text[])
     ORDER BY c.relname,a.attname`, [IDENTITY]);
  const runtimeColumns = new Map<string,string[]>();
  for (const row of locusRows.rows) { const a=runtimeColumns.get(row.table_name)??[]; a.push(row.column_name); runtimeColumns.set(row.table_name,a); }
  const sourceLoci = new Map(registry.memberBoundLoci.map(x => [x.table,x]));
  const runtimeOnlyDirect = [...runtimeColumns.keys()].filter(t => !sourceLoci.has(t));
  if (runtimeOnlyDirect.length) throw new Error(`runtime-only direct loci require separate adjudication: ${runtimeOnlyDirect.join(',')}`);
  const memberBoundLoci = [...runtimeColumns.entries()].map(([table, cols]) => {
    const source = sourceLoci.get(table)!;
    if (JSON.stringify([...cols].sort()) !== JSON.stringify([...source.identityColumns].sort())) throw new Error(`identity shape drift ${table}`);
    return source;
  }).sort((a,b)=>a.table.localeCompare(b.table));
  const staleSourceLoci = registry.memberBoundLoci.filter(x => !runtimeColumns.has(x.table)).sort((a,b)=>a.table.localeCompare(b.table));

  const fkRows = await query<{constraint_name:string;table_name:string;local_columns:string[];delete_code:string}>(`
    SELECT c.conname AS constraint_name, rel.relname AS table_name,
           array_agg(att.attname::text ORDER BY ord.ordinality)::text[] AS local_columns,
           c.confdeltype::text AS delete_code
      FROM pg_constraint c JOIN pg_class rel ON rel.oid=c.conrelid JOIN pg_namespace ns ON ns.oid=rel.relnamespace
      JOIN LATERAL unnest(c.conkey) WITH ORDINALITY ord(attnum,ordinality) ON TRUE
      JOIN pg_attribute att ON att.attrelid=c.conrelid AND att.attnum=ord.attnum
     WHERE c.contype='f' AND ns.nspname='public' AND c.confrelid=to_regclass('public.members')
     GROUP BY c.oid,c.conname,rel.relname,c.confdeltype ORDER BY rel.relname,c.conname`);

  const sourceGroups = new Map<string, typeof registry.memberForeignKeyDeclarations>();
  for (const d of registry.memberForeignKeyDeclarations) { const k=`${d.table}|${d.onDelete}`; const a=sourceGroups.get(k)??[]; a.push(d); sourceGroups.set(k,a); }
  const runtimeGroupCounts = new Map<string,number>();
  for (const row of fkRows.rows) { const k=`${row.table_name}|${action(row.delete_code)}`; runtimeGroupCounts.set(k,(runtimeGroupCounts.get(k)??0)+1); }

  const runtimeMemberForeignKeys = fkRows.rows.map(row => {
    const onDelete = action(row.delete_code); const key=`${row.table_name}|${onDelete}`;
    const source = sourceGroups.get(key) ?? [];
    if (source.length && new Set(source.map(x=>x.disposition)).size !== 1) throw new Error(`mixed source disposition ${key}`);
    const sourceStanding = source.length === 0 ? 'runtime_only' : source.length === runtimeGroupCounts.get(key) ? 'matched' : 'count_drift';
    const disposition = source.length ? source[0].disposition : 'refuse';
    const authorityReason = source.length
      ? `R3 runtime constraint inherits the unanimous P5-D source-group disposition for ${key}; PostgreSQL constraint identity is execution truth.`
      : `R3 runtime-only member FK effect ${key} is absent from v3 source declarations and remains fail-closed refuse.`;
    return {
      constraintName: row.constraint_name, table: row.table_name, localColumns: row.local_columns,
      onDelete, disposition, authorityReason,
      sourceDeclarationKeys: source.map(x=>x.declarationKey).sort(), sourceStanding,
    };
  }).sort((a,b)=>`${a.table}|${a.constraintName}`.localeCompare(`${b.table}|${b.constraintName}`));

  const runtimeKeys = new Set(runtimeMemberForeignKeys.map(x=>`${x.table}|${x.onDelete}`));
  const sourceOnlyFkGroups = [...sourceGroups.entries()].filter(([key])=>!runtimeKeys.has(key)).map(([key,ds])=>({
    key, table:ds[0].table, onDelete:ds[0].onDelete, disposition:ds[0].disposition,
    sourceDeclarationKeys:ds.map(x=>x.declarationKey).sort(),
  })).sort((a,b)=>a.key.localeCompare(b.key));

  const graphFks = runtimeMemberForeignKeys.map(x=>({constraintName:x.constraintName,table:x.table,localColumns:x.localColumns,onDelete:x.onDelete}));
  const out = {
    version:'account-erasure-runtime-authority-v1-r3',
    generatedAgainst:'09e4f884bab49b74edad7004fa0e6ece0a0ff3ee',
    sourceRegistryVersion:registry.version,
    sourceRegistrySha256:fileSha('config/governance/account-erasure-registry.v3.json'),
    activationAuthority:'F5-CONFORMANCE-REPAIR-01 · P5-D-R3 founder continuation 2026-09-17',
    activationProhibited:false,
    identityColumns:IDENTITY,
    postgresMajor,
    migrationCorpusSha256:corpusDigest(),
    schemaFingerprintSha256:stableGraphFingerprint(memberBoundLoci,graphFks),
    memberBoundLoci, staleSourceLoci, runtimeMemberForeignKeys, sourceOnlyFkGroups,
  };
  fs.writeFileSync(OUT, JSON.stringify(out,null,2)+'\n');
  console.log(JSON.stringify({output:OUT,loci:memberBoundLoci.length,staleSourceLoci:staleSourceLoci.map(x=>x.table),constraints:runtimeMemberForeignKeys.length,runtimeGroups:new Set(runtimeMemberForeignKeys.map(x=>`${x.table}|${x.onDelete}`)).size,runtimeOnlyGroups:new Set(runtimeMemberForeignKeys.filter(x=>x.sourceStanding==='runtime_only').map(x=>`${x.table}|${x.onDelete}`)).size,countDriftGroups:new Set(runtimeMemberForeignKeys.filter(x=>x.sourceStanding==='count_drift').map(x=>`${x.table}|${x.onDelete}`)).size,sourceOnlyGroups:sourceOnlyFkGroups.length},null,2));
  await closePool();
}
main().catch(async e=>{console.error(e);try{await closePool()}catch{};process.exit(1)});
