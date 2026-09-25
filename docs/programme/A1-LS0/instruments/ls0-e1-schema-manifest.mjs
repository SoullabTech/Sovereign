// A1-LS0 · migration-sufficiency dependency check (packet §3).
//
// Inputs: the canonical migrations directory, the migrate instrument's
// applied/refused ledgers, and pg_stat snapshots taken before and after a
// scenario run (tables + functions; track_functions = all).
// Output: the schema objects the scenarios actually touched, the migration
// that creates each, and — for every refused migration — whether it creates or
// alters anything the scenarios touched. Any overlap ⇒ dependency NOT
// independent ⇒ the run is INSTRUMENT / ENVIRONMENT FAILURE for affected paths.
//
// Usage: node ls0-e1-schema-manifest.mjs <canonical_root> <migrate_out_dir> <stats_before.json> <stats_after.json> <triggers.json> <out.json> <e1_objects.json> <run_statement_log>
import fs from 'node:fs';
import path from 'node:path';

const [ROOT, MIG_OUT, BEFORE, AFTER, TRIGGERS, OUT, E1OBJ, RUNLOG] = process.argv.slice(2);
const migDir = path.join(ROOT, 'database/migrations');
const files = fs.readdirSync(migDir).filter((f) => f.endsWith('.sql')).sort();
const readTsv = (p) => fs.readFileSync(p, 'utf8').split('\n').filter(Boolean).map((l) => l.split('\t'));
const applied = new Set(readTsv(path.join(MIG_OUT, 'applied.tsv')).map((r) => r[1]));
const refused = readTsv(path.join(MIG_OUT, 'refused.tsv')).map((r) => ({ file: r[1], reason: r[4] ?? r[3] }));

const strip = (sql) => sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
const src = Object.fromEntries(files.map((f) => [f, strip(fs.readFileSync(path.join(migDir, f), 'utf8'))]));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const creators = (kind, name) => {
  const re = kind === 'table'
    ? new RegExp(`CREATE\\s+(?:UNLOGGED\\s+)?TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?(?:"?public"?\\.)?"?${esc(name)}"?[\\s(]`, 'i')
    : new RegExp(`CREATE\\s+(?:OR\\s+REPLACE\\s+)?FUNCTION\\s+(?:"?public"?\\.)?"?${esc(name)}"?\\s*\\(`, 'i');
  return files.filter((f) => re.test(src[f]));
};
// "Supplies" per packet §3: creates, alters, indexes, attaches a trigger to, or
// writes data into the object. A bare reference (e.g. a foreign key to it)
// supplies nothing and is reported separately as a reference only.
const N = (name) => `(?:"?public"?\\.)?"?${esc(name)}"?(?![a-z0-9_])`;
const supplies = (file, name) => [
  new RegExp(`CREATE\\s+(?:UNLOGGED\\s+)?TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?${N(name)}`, 'i'),
  new RegExp(`ALTER\\s+TABLE\\s+(?:IF\\s+EXISTS\\s+)?(?:ONLY\\s+)?${N(name)}`, 'i'),
  new RegExp(`CREATE\\s+(?:UNIQUE\\s+)?INDEX[^;]*?\\sON\\s+(?:ONLY\\s+)?${N(name)}`, 'i'),
  new RegExp(`CREATE\\s+(?:OR\\s+REPLACE\\s+)?(?:CONSTRAINT\\s+)?TRIGGER[^;]*?\\sON\\s+${N(name)}`, 'i'),
  new RegExp(`CREATE\\s+(?:OR\\s+REPLACE\\s+)?FUNCTION\\s+${N(name)}\\s*\\(`, 'i'),
  new RegExp(`(?:CREATE|DROP)\\s+(?:OR\\s+REPLACE\\s+)?(?:MATERIALIZED\\s+)?VIEW\\s+(?:IF\\s+(?:NOT\\s+)?EXISTS\\s+)?${N(name)}`, 'i'),
  new RegExp(`(?:INSERT\\s+INTO|UPDATE|DELETE\\s+FROM)\\s+${N(name)}`, 'i'),
].some((re) => re.test(src[file]));
const mentions = (file, name) => supplies(file, name);
const references = (file, name) => new RegExp(`(?:^|[^a-z0-9_])"?${esc(name)}"?(?:[^a-z0-9_]|$)`, 'i').test(src[file]);

const b = JSON.parse(fs.readFileSync(BEFORE, 'utf8'));
const a = JSON.parse(fs.readFileSync(AFTER, 'utf8'));
const act = (t) => (t.seq_scan ?? 0) + (t.idx_scan ?? 0) + (t.n_tup_ins ?? 0) + (t.n_tup_upd ?? 0) + (t.n_tup_del ?? 0);
const bt = Object.fromEntries(b.tables.map((t) => [t.relname, act(t)]));
const touchedTables = a.tables.filter((t) => act(t) > (bt[t.relname] ?? 0)).map((t) => t.relname).sort();
const bf = Object.fromEntries(b.functions.map((f) => [f.funcname, Number(f.calls)]));
const touchedFunctions = a.functions.filter((f) => Number(f.calls) > (bf[f.funcname] ?? 0)).map((f) => f.funcname).sort();
const triggers = JSON.parse(fs.readFileSync(TRIGGERS, 'utf8')).filter((t) => touchedTables.includes(t.table));
const triggerFunctions = [...new Set(triggers.map((t) => t.function))].sort();

const manifest = {
  touchedTables: touchedTables.map((name) => ({ name, createdBy: creators('table', name), createdByApplied: creators('table', name).some((f) => applied.has(f)) })),
  touchedFunctions: touchedFunctions.map((name) => ({ name, createdBy: creators('function', name), createdByApplied: creators('function', name).some((f) => applied.has(f)) })),
  triggersOnTouchedTables: triggers,
  triggerFunctions: triggerFunctions.map((name) => ({ name, createdBy: creators('function', name), createdByApplied: creators('function', name).some((f) => applied.has(f)) })),
};
const objects = [...touchedTables, ...touchedFunctions, ...triggerFunctions];
const refusedCheck = refused.map((r) => ({
  ...r,
  overlapsTouchedObjects: objects.filter((o) => mentions(r.file, o)),
  referencesOnly: objects.filter((o) => !mentions(r.file, o) && references(r.file, o)),
}));
const unexplained = [
  ...manifest.touchedTables.filter((t) => !t.createdByApplied),
  ...manifest.touchedFunctions.filter((t) => !t.createdByApplied),
  ...manifest.triggerFunctions.filter((t) => !t.createdByApplied),
];
const overlapping = refusedCheck.filter((r) => r.overlapsTouchedObjects.length > 0);

// ── Runtime check: what each refused migration SUPPLIES, whether it is
// present in E1 (partial application under autocommit), and whether any
// statement the scenarios actually executed referenced it.
const e1 = JSON.parse(fs.readFileSync(E1OBJ, 'utf8'));
const e1Tables = new Set(e1.tables ?? []); const e1Cols = new Set(e1.columns ?? []); const e1Fns = new Set(e1.functions ?? []);
// Whole bracketed segment: multi-line statements continue without a LOG prefix.
const runSql = fs.readFileSync(RUNLOG, 'utf8');
const used = (id) => new RegExp(`(?:^|[^a-z0-9_])"?${esc(id)}"?(?:[^a-z0-9_]|$)`, 'i').test(runSql);
const ID = '"?(?:public"?\\.)?"?([a-z_][a-z0-9_]*)"?';
const suppliedBy = (file) => {
  const t = src[file]; const out = [];
  for (const m of t.matchAll(new RegExp(`CREATE\\s+(?:UNLOGGED\\s+)?TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?${ID}`, 'gi'))) out.push({ kind: 'table', id: m[1] });
  for (const m of t.matchAll(new RegExp(`CREATE\\s+(?:OR\\s+REPLACE\\s+)?FUNCTION\\s+${ID}\\s*\\(`, 'gi'))) out.push({ kind: 'function', id: m[1] });
  for (const m of t.matchAll(new RegExp(`ALTER\\s+TABLE\\s+(?:IF\\s+EXISTS\\s+)?(?:ONLY\\s+)?${ID}([\\s\\S]*?);`, 'gi'))) {
    for (const c of m[2].matchAll(/ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?"?([a-z_][a-z0-9_]*)"?/gi)) out.push({ kind: 'column', id: `${m[1]}.${c[1]}`, table: m[1], column: c[1] });
  }
  return out;
};
const runtimeRefused = refused.map((r) => {
  const items = suppliedBy(r.file).map((o) => {
    const present = o.kind === 'table' ? e1Tables.has(o.id) : o.kind === 'function' ? e1Fns.has(o.id) : e1Cols.has(o.id);
    const referenced = o.kind === 'column' ? (used(o.column) && used(o.table)) : used(o.id);
    return { ...o, presentInE1: present, referencedByRun: referenced };
  });
  return { file: r.file, reason: r.reason, supplied: items.length,
    presentAndReferenced: items.filter((i) => i.presentInE1 && i.referencedByRun).map((i) => `${i.kind}:${i.id}`),
    referencedButAbsent: items.filter((i) => !i.presentInE1 && i.referencedByRun).map((i) => `${i.kind}:${i.id}`),
    presentButUnused: items.filter((i) => i.presentInE1 && !i.referencedByRun).map((i) => `${i.kind}:${i.id}`) };
});
const runtimeDependent = runtimeRefused.filter((r) => r.presentAndReferenced.length || r.referencedButAbsent.length);
fs.writeFileSync(OUT, JSON.stringify({
  appliedCount: applied.size, refusedCount: refused.length,
  manifest, refused: refusedCheck,
  touchedObjectsNotCreatedByAnAppliedMigration: unexplained.map((u) => u.name),
  refusedMigrationsOverlappingTouchedObjects: overlapping.map((r) => ({ file: r.file, objects: r.overlapsTouchedObjects })),
  staticVerdict: overlapping.length === 0 ? 'INDEPENDENT' : 'OVERLAP_REQUIRES_RUNTIME_CHECK',
  runtimeRefused,
  runtimeDependentRefusedMigrations: runtimeDependent.map((r) => ({ file: r.file, presentAndReferenced: r.presentAndReferenced, referencedButAbsent: r.referencedButAbsent })),
  verdict: runtimeDependent.length === 0 ? 'INDEPENDENT' : 'DEPENDENT_INSTRUMENT_FAILURE',
}, null, 2));
console.log(`runtimeDependent=${runtimeDependent.length} touched tables=${touchedTables.length} functions=${touchedFunctions.length} triggerFns=${triggerFunctions.length} refused=${refused.length} overlapping=${overlapping.length} unexplained=${unexplained.length}`);
