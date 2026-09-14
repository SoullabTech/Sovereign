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
const CLAIMANT = 'lib/disclosure/authorizationAct.ts';
const ROUTE = 'app/api/sovereign/manuscripts/[id]/ask/route.ts';

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

/**
 * ⭐ ROUTE-INTEGRATION GUARDS. Structural only — the ORDER of the crossing, which
 * is checkable without a database. ⛔ They do not replace R1–R12, which need one.
 */
const G8: Guard = {
  id: 'G8',
  law: 'body is reachable exactly once, and only after claim and every boundary',
  run() {
    const src = stripTs(read(ROUTE));
    const loads = [...src.matchAll(/loadRevisionContent\s*\(/g)];
    if (loads.length !== 1)
      refuse(`G8: loadRevisionContent must be reachable exactly once; found ${loads.length}`);
    const at = (re: RegExp) => { const m = re.exec(src); return m ? m.index : -1; };
    const claim = at(/claimAct\s*\(/);
    const boundary = at(/establishDisclosureBoundary\s*\(/);
    const load = loads[0]!.index;
    if (claim < 0 || boundary < 0) refuse('G8: the claim or the boundary is absent from the route');
    if (!(claim < boundary && boundary < load))
      refuse('G8: order must be claim → boundary → body read');
  },
};

const G9: Guard = {
  id: 'G9',
  law: 'the client never submits authority',
  run() {
    const src = stripTs(read(ROUTE));
    for (const forbidden of ['allowBody', 'may_cross', 'mayCross']) {
      if (new RegExp(`body\\.${forbidden}|\\b${forbidden}\\s*[:=]`).test(src))
        refuse(`G9: the route reads a client-supplied ${forbidden}`);
    }
  },
};

const G10: Guard = {
  id: 'G10',
  law: 'the completion identity is the persisted turn, never the answer text',
  run() {
    const src = stripTs(read(ROUTE));
    /* ⭐ The transaction-aware form is the only one on this path since the
       RI-X1/RI-X2 repair. Both names are matched: the law is about what the
       completion identity IS, and a rename must not retire it. */
    const m = /recordCompletion(?:WithClient)?\s*\(([^)]*)\)/.exec(src);
    if (!m) return refuse('G10: recordCompletion is never called');
    if (/answer|outcome\./i.test(m[1]!))
      refuse('G10: a completion identity derived from the answer is transient text, not an execution');
    if (!/turnIndex/.test(m[1]!))
      refuse('G10: the completion identity does not name the persisted turn');
  },
};

const G11: Guard = {
  id: 'G11',
  law: 'scope is checked BEFORE the single-use act is spent',
  run() {
    const src = stripTs(read(ROUTE));
    const scope = src.indexOf('authorizationCovers');
    const claim = src.indexOf('claimAct(');
    if (scope < 0 || claim < 0) refuse('G11: the scope check or the claim is absent');
    if (!(scope < claim))
      refuse('G11: an incomplete client set would spend the member\'s opportunity');
  },
};

/**
 * ⭐⭐ THE RI-X1 / RI-X2 REPAIR, AS A PROPERTY OF THE PROGRAM.
 *
 * The turn, the confirmations and the completion are one fact. Written in
 * sequence they left two windows in which a durable canonical outcome existed
 * while the authority substrate could not see it — a retry then reported
 * `INTERRUPTED` over a completed execution (RI-X1), and a receipt confirmation
 * that returned `false` was ignored into an HTTP 200 (RI-X2).
 *
 * ⛔ THIS GUARDS ATOMICITY, NEVER AUTHORITY. The transaction begins after the
 * body has already crossed; the claim remains the `ON CONFLICT DO NOTHING`
 * insert, which happened long before it.
 */
const G12: Guard = {
  id: 'G12',
  law: 'the turn, the confirmations and the completion commit together or not at all',
  run() {
    const src = stripTs(read(ROUTE));

    /* The swallowing forms must be unreachable from this route: a boolean that
       can be dropped is what RI-X2 was. */
    if (/\bconfirmDisclosureCrossed\s*\(/.test(src))
      refuse('G12: the boolean confirmation form is reachable and its result can be ignored');
    if (/[^a-zA-Z]recordCompletion\s*\(/.test(src))
      refuse('G12: the pool-level completion form is reachable outside the transaction');
    if (/appendTurnWithClient/.test(src) === false)
      refuse('G12: the MAIA turn is not persisted on a transaction client');

    const tx = src.indexOf('transaction(');
    if (tx < 0) refuse('G12: there is no transaction around the post-cognition tail');
    for (const symbol of [
      'appendTurnWithClient', 'confirmDisclosureCrossedWithClient', 'recordCompletionWithClient',
    ]) {
      const at = src.indexOf(symbol, tx);
      if (at < 0) refuse(`G12: ${symbol} is not inside the transaction`);
    }

    /* ⭐ And the two failure modes must be UNIGNORABLE BY TYPE, not by
       discipline: neither may hand the caller a value it can drop. */
    const receipts = stripTs(read('lib/disclosure/contextDisclosureReceipt.ts'));
    if (!/confirmDisclosureCrossedWithClient[\s\S]{0,400}?Promise<void>/.test(receipts))
      refuse('G12: the transactional confirmation returns a value the caller can ignore');

    const claimant = stripTs(read(CLAIMANT));
    if (!/class CompletionNotRecorded extends Error/.test(claimant))
      refuse('G12: an unrecorded completion is not an error and can be stepped past');
    const body = /recordCompletionWithClient[\s\S]*?\n}/.exec(claimant);
    if (!body) refuse('G12: the transactional completion could not be located');
    if (!/throw new CompletionNotRecorded\('conflict'\)/.test(body![0]))
      refuse('G12: a conflicting completion does not abort');
    if (!/throw new CompletionNotRecorded\('no_consumption'\)/.test(body![0]))
      refuse('G12: a missing consumption does not abort');
  },
};

const GUARDS: readonly Guard[] = [G1, G2, G3, G4, G5, G6, G7, G8, G9, G10, G11, G12];

let failed = 0;
console.log('S3 M-PHASE SUBSTRATE GUARDS\n⛔ not part of the frozen Class-B suite\n');
for (const g of GUARDS) {
  try { g.run(); console.log(`  ⭐ ${g.id}  ${g.law}`); }
  catch (e) { failed++; console.log(`  ⛔ ${g.id}  ${e instanceof Error ? e.message : String(e)}`); }
}
console.log(`\n${failed === 0 ? '⭐ all guards pass' : `⛔ ${failed} failed`}`);
process.exit(failed === 0 ? 0 : 1);
