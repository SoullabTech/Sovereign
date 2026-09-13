/**
 * S3 · M-PHASE STATIC GUARDS.
 *
 * ⛔ NOT PART OF THE FROZEN CLASS-B SUITE. The freeze @ 2255b60d covers the
 * transition contract, the falsifiers, the candidates, the matrix and their
 * instruments. These guards are M-phase evidence about the SUBSTRATE, and
 * nothing here amends or relaxes anything frozen.
 *
 * They exist because V2 was chosen for a structural reason — permission must be
 * hard to represent, not merely forbidden in prose — and a structure nobody
 * checks decays into prose.
 *
 * ⭐ EVERY SCAN STRIPS COMMENTS FIRST. The 2026-09-07 C21 lesson, applied before
 * it could bite: the M1 migration DOCUMENTS the forbidden column names in order
 * to record that their absence is deliberate. A scanner that read raw source
 * would fail on the file's own statement of compliance.
 *
 * Run: npm run guards:s3-substrate
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const M1 = 'database/migrations/20260913000001_ask_authorization_acts.sql';
const M2 = 'database/migrations/20260913000002_disclosure_boundary_developmental_ask.sql';
const M2B = 'database/migrations/20260913000003_disclosure_gesture_authorize_sections.sql';
const CLAIMANT = 'lib/manuscript/ask/authorizationAct.ts';

const stripSql = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/--[^\n]*/g, ' ');
const stripTs = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
const read = (p: string) => readFileSync(p, 'utf8');

interface Guard { readonly id: string; readonly law: string; run(): void }
class Failed extends Error {}
const refuse = (m: string): never => { throw new Failed(m); };

/** The body of `CREATE TABLE ask_authorization_acts ( … );`, comments removed. */
function actTableBody(): string {
  const sql = stripSql(read(M1));
  const m = /CREATE TABLE IF NOT EXISTS ask_authorization_acts\s*\(([\s\S]*?)\n\);/.exec(sql);
  return m ? m[1]! : refuse('G1: the act table declaration could not be located');
}

const FORBIDDEN = ['authorized', 'may_cross', 'consent', 'section_id', 'section_ref', 'scope_kind'];

const G1: Guard = {
  id: 'G1',
  law: 'permission may not colonize the identity object',
  run() {
    const body = actTableBody().toLowerCase();
    const found = FORBIDDEN.filter((c) => new RegExp(`\\b${c}\\b`).test(body));
    if (found.length) refuse(`G1: act identity declares forbidden column(s): ${found.join(', ')}`);
  },
};

const G2: Guard = {
  id: 'G2',
  /**
   * ⚠️ CLAIM NARROWED 2026-09-13. Deletion custody is now enforced by the §2b
   * database triggers. This guard proves only that ORDINARY REPOSITORY CODE
   * contains no deletion path — defence in depth, and ⛔ no longer the
   * constitutional guarantee on its own.
   */
  law: 'ordinary repository code contains no deletion path (defence in depth)',
  run() {
    const roots = ['lib', 'app', 'scripts'];
    const hits: string[] = [];
    const walk = (d: string) => {
      let entries: string[];
      try { entries = readdirSync(d); } catch { return; }
      for (const e of entries) {
        if (e === 'node_modules' || e === '.next') continue;
        const p = join(d, e);
        const st = statSync(p);
        if (st.isDirectory()) { walk(p); continue; }
        if (!/\.(ts|tsx|sql)$/.test(e)) continue;
        const src = e.endsWith('.sql') ? stripSql(read(p)) : stripTs(read(p));
        if (/DELETE\s+FROM\s+ask_authorization_/i.test(src)) hits.push(p);
      }
    };
    roots.forEach(walk);
    if (hits.length) refuse(`G2: DELETE on the substrate found in: ${hits.join(', ')}`);
  },
};

const G3: Guard = {
  id: 'G3',
  law: 'the successful mutation IS the claim — a prior read is never the authority',
  run() {
    const src = stripTs(read(CLAIMANT));
    if (!/INSERT INTO ask_authorization_consumptions[\s\S]*?ON CONFLICT \(act_id\) DO NOTHING/i.test(src))
      refuse('G3: the claim is not an ON CONFLICT DO NOTHING insert');
    if (/FOR UPDATE/i.test(src)) refuse('G3: the claimant takes a row lock instead of an atomic insert');
    if (/\btransaction\s*\(/.test(src)) refuse('G3: the claimant leans on transaction(), which provides no such guarantee');
  },
};

const G4: Guard = {
  id: 'G4',
  law: 'the completion fact survives deletion of the outcome',
  run() {
    const body = stripSql(read(M1));
    const m = /completion_ref\s+text([^,\n]*)/i.exec(body);
    if (!m) return refuse('G4: completion_ref not declared');
    if (/REFERENCES/i.test(m[1]!))
      refuse('G4: completion_ref is a foreign key — deleting the outcome could erase the completion');
    if (!/completed_at\s+timestamptz/i.test(body))
      refuse('G4: completed_at — the durable positive fact — is missing');
  },
};

const G5: Guard = {
  id: 'G5',
  law: 'exactly one boundary value is added, and no other vocabulary moves',
  run() {
    const sql = stripSql(read(M2));
    const values = [...sql.matchAll(/'(writers_studio\.[^']+)'/g)].map((m) => m[1]!);
    const unique = [...new Set(values)];
    if (unique.length !== 2 || !unique.includes('writers_studio.developmental_ask->maia_cognition'))
      refuse(`G5: expected exactly the two boundary values; saw ${unique.join(' · ')}`);
    for (const other of ['source_class', 'participation_basis', 'scope_kind', 'authorized_by', 'gesture']) {
      if (new RegExp(`ALTER[\\s\\S]{0,200}${other}`, 'i').test(sql))
        refuse(`G5: the boundary migration also touches ${other}`);
    }
  },
};

const G6: Guard = {
  id: 'G6',
  law: 'the gesture widening adds exactly one value and touches no other vocabulary',
  run() {
    const sql = stripSql(read(M2B));
    const m = /gesture IN \(([\s\S]*?)\)/.exec(sql);
    if (!m) return refuse('G6: the gesture CHECK could not be located');
    const values = [...m[1]!.matchAll(/'([^']+)'/g)].map((x) => x[1]!);
    if (values.length !== 4 || !values.includes('authorize_sections'))
      refuse(`G6: expected the three existing gestures plus authorize_sections; saw ${values.join(' · ')}`);
    for (const other of ['boundary', 'source_class', 'participation_basis', 'scope_kind', 'authorized_by'])
      if (new RegExp(`ALTER[\\s\\S]{0,200}${other}`, 'i').test(sql))
        refuse(`G6: the gesture migration also touches ${other}`);
  },
};

const G7: Guard = {
  id: 'G7',
  law: 'deletion custody is enforced by the database, not by repository discipline',
  run() {
    const sql = stripSql(read(M1));
    for (const t of ['ask_authorization_acts', 'ask_authorization_consumptions']) {
      if (!new RegExp(`BEFORE DELETE ON ${t}`, 'i').test(sql))
        refuse(`G7: ${t} has no BEFORE DELETE guard`);
      if (!new RegExp(`BEFORE TRUNCATE ON ${t}`, 'i').test(sql))
        refuse(`G7: ${t} has no BEFORE TRUNCATE refusal — TRUNCATE would bypass every row guard`);
    }
    // The predicate that separates pruning from a lawful cascade must be a
    // PARENT-EXISTENCE test, not a manifest or a flag.
    if (!/EXISTS \(SELECT 1 FROM ask_authorization_acts WHERE id = OLD\.act_id\)/i.test(sql))
      refuse('G7: the consumption guard does not test for its parent act');
    if (!/EXISTS \(SELECT 1 FROM member_manuscripts[\s\S]{0,200}EXISTS \(SELECT 1 FROM ask_threads/i.test(sql))
      refuse('G7: the act guard does not test for both its Work and its thread');
  },
};

const GUARDS: readonly Guard[] = [G1, G2, G3, G4, G5, G6, G7];

let failed = 0;
console.log('S3 M-PHASE SUBSTRATE GUARDS\n⛔ not part of the frozen Class-B suite\n');
for (const g of GUARDS) {
  try { g.run(); console.log(`  ⭐ ${g.id}  ${g.law}`); }
  catch (e) { failed++; console.log(`  ⛔ ${g.id}  ${e instanceof Error ? e.message : String(e)}`); }
}
console.log(`\n${failed === 0 ? '⭐ all guards pass' : `⛔ ${failed} failed`}`);
process.exit(failed === 0 ? 0 : 1);
