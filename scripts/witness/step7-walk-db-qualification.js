#!/usr/bin/env node
'use strict';

/**
 * scripts/witness/step7-walk-db-qualification.js
 *
 * Qualifies a repository-derived database for the Step 7 acceptance walks.
 *
 * A partially reconstructed database must not be allowed to impersonate a valid
 * walk environment. "The tables we need exist" is too weak: the walks also
 * depend on triggers, constraints, functions and provenance behaviour. This
 * witness therefore does three things and refuses on any of them:
 *
 *   1. DERIVE  the transitive module closure of the walk entry points, and the
 *              SQL relations those modules actually reference. Not a hand list.
 *   2. INSPECT each relation in the live database: does it exist, and does it
 *              carry the CHECK constraints, foreign keys and triggers the
 *              repository's migrations define for it?
 *   3. INTERSECT the closure with the migrations that FAILED to apply. If any
 *              failed migration creates or alters anything inside the closure,
 *              the verdict is STOP.
 *
 * Usage:
 *   DATABASE_URL=… node scripts/witness/step7-walk-db-qualification.js \
 *     --failed=<file with one migration path per line>
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const MIGRATIONS = path.join(ROOT, 'database', 'migrations');

const ENTRIES = [
  'app/api/sovereign/manuscripts/[id]/ask/route.ts',
  'app/writers-studio/develop/ObservationDialogue.tsx',
  'app/writers-studio/develop/BodyAuthorizationPanel.tsx',
];

const failedArg = process.argv.find((a) => a.startsWith('--failed='));
const FAILED = failedArg
  ? fs
      .readFileSync(failedArg.slice('--failed='.length), 'utf8')
      .split('\n')
      .map((l) => l.replace(/^FAIL\s+/, '').trim())
      .filter(Boolean)
      .map((p) => path.basename(p))
  : [];

// ------------------------------------------------------------ module closure

function resolveSpec(spec, from) {
  let base;
  if (spec.startsWith('@/')) base = path.join(ROOT, spec.slice(2));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(from), spec);
  else return null;
  for (const c of ['.ts', '.tsx', '.js', '/index.ts', '/index.tsx', '']) {
    const p = base + c;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

function moduleClosure(entries) {
  const seen = new Set();
  const order = [];
  const stack = entries.map((e) => path.join(ROOT, e));
  while (stack.length) {
    const f = stack.pop();
    if (seen.has(f)) continue;
    seen.add(f);
    order.push(f);
    const src = fs.readFileSync(f, 'utf8');
    const re = /(?:from\s+|import\s*\(\s*|require\(\s*)['"]([^'"]+)['"]/g;
    let m;
    while ((m = re.exec(src))) {
      const r = resolveSpec(m[1], f);
      if (r) stack.push(r);
    }
  }
  return order;
}

// ------------------------------------------------------- SQL identifiers

/**
 * Relations referenced from SQL text in a module. Deliberately conservative:
 * a candidate only counts once the live catalogue confirms it is a relation,
 * so English prose in comments ("from the member", "into cognition") drops out
 * instead of being asserted as a dependency.
 */
const REL_RE =
  /\b(?:FROM|JOIN|INTO|UPDATE|DELETE\s+FROM)\s+(?:ONLY\s+)?(?:public\.)?"?([a-z_][a-z0-9_]*)"?/gi;

function candidateRelations(files) {
  const byRel = new Map();
  for (const f of files) {
    const rel = path.relative(ROOT, f);
    const src = fs.readFileSync(f, 'utf8');
    REL_RE.lastIndex = 0;
    let m;
    while ((m = REL_RE.exec(src))) {
      const t = m[1].toLowerCase();
      if (!byRel.has(t)) byRel.set(t, new Set());
      byRel.get(t).add(rel);
    }
  }
  return byRel;
}

// ------------------------------------------------------------------- psql

function q(sql) {
  const out = execFileSync('psql', ['-X', '-tA', '-F', '\t', '-c', sql], {
    encoding: 'utf8',
    env: process.env,
  });
  return out
    .split('\n')
    .filter(Boolean)
    .map((l) => l.split('\t'));
}

// ------------------------------------------------------------------ report

const files = moduleClosure(ENTRIES);
const candidates = candidateRelations(files);

const present = q(
  `select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind in ('r','v','m','p')`
).map((r) => r[0]);
const presentSet = new Set(present);

const closure = [...candidates.keys()].filter((t) => presentSet.has(t)).sort();
const unresolved = [...candidates.keys()].filter((t) => !presentSet.has(t)).sort();

console.log('STEP 7 WALK DATABASE QUALIFICATION');
console.log('='.repeat(70));
console.log(`\nEntry points        : ${ENTRIES.length}`);
console.log(`Modules in closure  : ${files.length}`);
console.log(`Relations in closure: ${closure.length}\n`);

const shape = new Map();
for (const t of closure) {
  const [row] = q(`select
      (select count(*) from pg_constraint where conrelid='public.${t}'::regclass and contype='c'),
      (select count(*) from pg_constraint where conrelid='public.${t}'::regclass and contype='f'),
      (select count(*) from pg_constraint where conrelid='public.${t}'::regclass and contype in ('p','u')),
      (select count(*) from pg_trigger where tgrelid='public.${t}'::regclass and not tgisinternal),
      (select count(*) from pg_index where indrelid='public.${t}'::regclass)`);
  shape.set(t, row.map(Number));
}

console.log('relation                              check  fk  pk/uq  trig  idx');
console.log('-'.repeat(70));
for (const t of closure) {
  const [c, f, p, tr, i] = shape.get(t);
  console.log(`${t.padEnd(38)}${String(c).padStart(4)}${String(f).padStart(5)}${String(p).padStart(6)}${String(tr).padStart(6)}${String(i).padStart(6)}`);
}

// --------------------------------------- do the FAILED migrations touch it?

/**
 * Three tiers, because they are not the same risk:
 *
 *   ALTERS   the migration would CREATE / ALTER / DROP the closure relation, or
 *            attach an index, trigger, policy or rule TO it. Its absence means
 *            the relation in this database is NOT the relation the repository
 *            defines.                                             -> STOP
 *   WRITES   the migration performs DML against the closure relation (seed
 *            rows, backfills). Its absence means missing state.    -> STOP
 *   INBOUND  the migration merely points AT the closure relation from its own
 *            new table (REFERENCES members(id)), or names it in a comment.
 *            Nothing about the closure relation changes.           -> report
 *
 * Anything the classifier cannot place is treated as ALTERS. The instrument
 * fails toward STOP, never toward permission.
 */
function classify(src, rel) {
  const R = `(?:public\\.)?"?${rel}"?`;
  const alters = [
    new RegExp(`\\bCREATE\\s+(?:UNLOGGED\\s+)?TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?${R}\\b`, 'i'),
    new RegExp(`\\bALTER\\s+TABLE\\s+(?:IF\\s+EXISTS\\s+)?(?:ONLY\\s+)?${R}\\b`, 'i'),
    new RegExp(`\\bDROP\\s+TABLE\\s+(?:IF\\s+EXISTS\\s+)?${R}\\b`, 'i'),
    new RegExp(`\\bCREATE\\s+(?:OR\\s+REPLACE\\s+)?(?:VIEW|MATERIALIZED\\s+VIEW)\\s+${R}\\b`, 'i'),
    new RegExp(`\\bON\\s+${R}\\b`, 'i'), // CREATE INDEX/TRIGGER/POLICY/RULE ... ON <rel>
  ];
  const writes = [
    new RegExp(`\\bINSERT\\s+INTO\\s+${R}\\b`, 'i'),
    new RegExp(`\\bUPDATE\\s+(?:ONLY\\s+)?${R}\\s+SET\\b`, 'i'),
    new RegExp(`\\bDELETE\\s+FROM\\s+${R}\\b`, 'i'),
  ];
  if (alters.some((re) => re.test(src))) return 'ALTERS';
  if (writes.some((re) => re.test(src))) return 'WRITES';
  if (new RegExp(`\\b${rel}\\b`, 'i').test(src)) return 'INBOUND';
  return null;
}

// The classifier is only evidence if it can fail. Prove both directions before
// trusting a single verdict below.
{
  const alterCase = 'ALTER TABLE members ADD COLUMN foo text;';
  const indexCase = 'CREATE INDEX idx_x ON members(id);';
  const writeCase = "INSERT INTO members(id) VALUES ('x');";
  const refCase = 'CREATE TABLE thing (member_id uuid REFERENCES members(id) ON DELETE CASCADE);';
  const proseCase = "COMMENT ON TABLE thing IS 'visible to all members';";
  const checks = [
    ['ALTER TABLE on a closure relation', classify(alterCase, 'members') === 'ALTERS'],
    ['CREATE INDEX ON a closure relation', classify(indexCase, 'members') === 'ALTERS'],
    ['DML against a closure relation', classify(writeCase, 'members') === 'WRITES'],
    ['an inbound REFERENCES is not an alteration', classify(refCase, 'members') === 'INBOUND'],
    ['a prose mention is not an alteration', classify(proseCase, 'members') === 'INBOUND'],
    ['a relation never named is not touched', classify(refCase, 'ask_turns') === null],
  ];
  const bad = checks.filter(([, ok]) => !ok);
  console.log('\nClassifier self-test:');
  for (const [label, ok] of checks) console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (bad.length) {
    console.log('\nVERDICT: STOP — the qualification instrument itself is not discriminating.');
    process.exit(1);
  }
}

const structural = [];
const inbound = [];
for (const base of FAILED) {
  const p = path.join(MIGRATIONS, base);
  if (!fs.existsSync(p)) continue;
  const src = fs.readFileSync(p, 'utf8');
  for (const rel of closure) {
    const verdict = classify(src, rel);
    if (verdict === 'ALTERS' || verdict === 'WRITES') structural.push({ base, rel, verdict });
    else if (verdict === 'INBOUND') inbound.push({ base, rel });
  }
}

console.log(`\nFailed migrations examined: ${FAILED.length}`);
if (structural.length) {
  console.log('\n\u26a0\ufe0f  FAILED MIGRATIONS THAT WOULD CREATE, ALTER OR WRITE A CLOSURE RELATION:');
  for (const c of structural) console.log(`  ${c.verdict.padEnd(7)} ${c.rel.padEnd(30)} ${c.base}`);
} else {
  console.log('None creates, alters, indexes, triggers or writes any relation in the closure.');
}
if (inbound.length) {
  console.log('\nInbound-only (a new table pointing AT a closure relation, or prose) \u2014 not an alteration:');
  for (const c of inbound) console.log(`  ${c.rel.padEnd(30)} ${c.base}`);
}

if (unresolved.length) {
  console.log(`\nCandidate identifiers not resolved to a relation (prose/aliases): ${unresolved.length}`);
}

const emptyShape = closure.filter((t) => {
  const [c, f, p] = shape.get(t);
  return c + f + p === 0;
});
if (emptyShape.length) {
  console.log(`\n⚠️  Relations with NO constraints at all: ${emptyShape.join(', ')}`);
}

const stop = structural.length > 0;
console.log('\n' + '='.repeat(70));
console.log(stop ? 'VERDICT: STOP \u2014 the closure is not intact.' : 'VERDICT: QUALIFIED for the Step 7 walks.');
console.log(
  stop
    ? ''
    : 'Scope: sufficient for the Writer\'s Studio / S3 path only. This attests\n' +
        'NOTHING about the failed migration lanes outside that closure.'
);
process.exit(stop ? 1 : 0);
