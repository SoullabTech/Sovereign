/**
 * Shadow Field — P4 acceptance proof (MAIA-SHADOW-FIELD-01 · PROTOTYPE v1).
 *
 *   PGHOST=/tmp/pgproto PGPORT=5433 PGUSER=shadowproto PGDATABASE=shadow_proto \
 *     node --experimental-strip-types scripts/witness/shadow-field-p4-acceptance.ts
 *
 * Runs against an ISOLATED prototype database with the migration chain applied.
 * NOT production. The production database is explicitly not authorized for this lane.
 *
 * Fidelity discipline: the decision is made by importing the SAME pure function the route
 * calls (`decideKeep`), and the write uses the SAME SQL statement, extracted from the route
 * source at runtime rather than retyped here — so this proof cannot drift from the code it
 * claims to test. What it does NOT exercise: HTTP, cookies, `getCurrentSession`, and the
 * tester gate. Those are the founder walk's to establish.
 */

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { decideKeep } from '../../lib/maia/shadowField/keepDecision.ts';
import {
  openFieldSession, verifyFieldSession, closeFieldSession, __resetFieldSessionsForTest,
} from '../../lib/maia/shadowField/fieldSession.ts';

/**
 * The database is driven through psql rather than a client library — this container has no
 * node_modules — so the SQL executed is exactly the text under test, with no ORM in between.
 */
const PSQL = ['-h', process.env.PGHOST ?? '/tmp/pgproto', '-p', process.env.PGPORT ?? '5433',
  '-U', process.env.PGUSER ?? 'shadowproto', '-d', process.env.PGDATABASE ?? 'shadow_proto'];

function lit(v: string): string { return `'${v.replace(/'/g, "''")}'`; }

/** Run SQL, returning rows as objects. Throws on error, so a failed statement is visible. */
function sql(text: string): any[] {
  const modifying = /^\s*(INSERT|UPDATE|DELETE)\b/i.test(text);
  // A data-modifying statement with RETURNING cannot sit in a subselect; it can sit in a CTE.
  const wrapped = modifying
    ? `WITH r AS (${text}) SELECT coalesce(json_agg(r), '[]'::json) FROM r;`
    : `SELECT coalesce(json_agg(t), '[]'::json) FROM (${text}) t;`;
  const out = execFileSync('psql', [...PSQL, '-v', 'ON_ERROR_STOP=1', '-tAc', wrapped], { encoding: 'utf8' });
  return JSON.parse(out.trim() || '[]');
}

/** Run a prepared statement and map its RETURNING row onto the given column names. */
function execRow(text: string, cols: string[]): Record<string, string> {
  const out = execFileSync('psql', [...PSQL, '-v', 'ON_ERROR_STOP=1', '-tAc', text], { encoding: 'utf8' });
  // A multi-statement -c interleaves command tags (PREPARE, INSERT 0 1) with results;
  // the RETURNING row is the last line carrying a column separator.
  const lines = out.trim().split('\n').filter((l) => l.includes('|'));
  const parts = (lines[lines.length - 1] ?? '').split('|');
  return Object.fromEntries(cols.map((c, i) => [c, parts[i]]));
}
/** Run a statement with no result set. */
function exec(text: string): void {
  execFileSync('psql', [...PSQL, '-v', 'ON_ERROR_STOP=1', '-qc', text], { encoding: 'utf8', stdio: 'pipe' });
}

const KEEP_ROUTE = 'app/api/maia/shadow-field/keep/route.ts';
const LOADER = 'lib/maia/memoryAtomsLoader.ts';

let passed = 0;
let failed = 0;
function ok(label: string, detail = '') {
  passed++;
  console.log(`  \x1b[32m✅ PASS\x1b[0m  ${label}${detail ? `  \x1b[2m${detail}\x1b[0m` : ''}`);
}
function bad(label: string, detail = '') {
  failed++;
  console.log(`  \x1b[31m❌ FAIL\x1b[0m  ${label}${detail ? `  ${detail}` : ''}`);
}

/** The INSERT the route actually runs, lifted from its source. */
function routeInsertSql(): string {
  const src = readFileSync(KEEP_ROUTE, 'utf8');
  const m = src.match(/`(INSERT INTO member_memory_atoms[\s\S]*?RETURNING[^`]*)`/);
  if (!m) throw new Error('could not extract the INSERT from the keep route');
  return m[1];
}

/** The columns the runtime loader selects, lifted from its source. */
function loaderColumns(): string {
  const src = readFileSync(LOADER, 'utf8');
  const m = src.match(/const SELECT_COLUMNS = `([\s\S]*?)`/);
  if (!m) throw new Error('could not extract SELECT_COLUMNS from the loader');
  return m[1].trim();
}

const MEMBER_SANCTUARY = { sanctuary: true };
const MEMBER_OPEN = { sanctuary: false };

async function main() {
  console.log('\n\x1b[1mShadow Field — P4 acceptance (isolated prototype DB)\x1b[0m');
  console.log('\x1b[2mdecision via decideKeep(); write via the route\'s own SQL\x1b[0m\n');

  const suffix = Date.now();
  const member = sql(
    `INSERT INTO members (passkey, username, password_hash, name)
     VALUES (${lit(`SOULLAB-PROTO-${suffix}`)}, ${lit(`proto_${suffix}`)}, 'x', 'Prototype Member')
     RETURNING id`)[0];

  const INSERT = routeInsertSql();
  const count = () =>
    Number(sql(`SELECT count(*)::int AS n FROM member_memory_atoms WHERE member_id=${lit(member.id)}`)[0].n);

  // ── 1. normal explicit keep → one shadow_field row ───────────────────────
  const claim = { kind: 'question', text: 'Whether I can let things alone.', authorship: { authoredBy: 'member' } };
  const d1 = decideKeep(claim, MEMBER_OPEN);
  if (!d1.allow) { bad('1. normal keep decided allow', d1.reason); }
  else {
    const before = count();
    // The route's own statement text, prepared and executed verbatim in one connection.
    const row = execRow(
      `PREPARE keepins AS ${INSERT}; EXECUTE keepins(${lit(member.id)}, ${lit(d1.title)}, ${lit(d1.body)});`,
      ['id', 'source_type'],
    );
    const after = count();
    if (after - before === 1 && row.source_type === 'shadow_field') ok('1. normal explicit keep → exactly one shadow_field row');
    else bad('1. keep did not write exactly one shadow_field row', `${before}→${after} ${row?.source_type}`);

    // ── 2. round-trips through the loader's own column set ────────────────
    const back = sql(`SELECT ${loaderColumns()} FROM member_memory_atoms WHERE id = ${lit(row.id)}`)[0];
    if (back.source_type === 'shadow_field' && back.body === claim.text) ok('2. round-trips as shadow_field with member body intact');
    else bad('2. round-trip lost source_type or body', `${back?.source_type} / ${JSON.stringify(back?.body)?.slice(0, 40)}`);

    // ── 3. return_preference ──────────────────────────────────────────────
    if (back.return_preference === 'member_pulled') ok('3. return_preference is member_pulled (not ambiently retrieved)');
    else bad('3. wrong return_preference', String(back.return_preference));

    // ── 7b. member-placed enforced at the schema ──────────────────────────
    try {
      exec(`UPDATE member_memory_atoms SET facilitator_id = ${lit(member.id)} WHERE id = ${lit(row.id)}`);
      bad('7. a Field atom could be given practitioner attribution');
    } catch {
      ok('7. schema refuses practitioner/system authority on a shadow_field atom');
    }
  }

  // ── 4. MAIA possibility → refused ────────────────────────────────────────
  const before4 = count();
  const d4 = decideKeep({ kind: 'pattern', text: 'One possible reading is…', authorship: { authoredBy: 'maia_possibility' } }, MEMBER_OPEN);
  if (!d4.allow && d4.reason === 'maia_possibility_not_keepable' && count() === before4) ok('4. a MAIA possibility is refused, zero rows');
  else bad('4. a MAIA possibility was not refused', JSON.stringify(d4));

  // ── 5. proposed wording without acceptance → refused ─────────────────────
  const d5 = decideKeep({ kind: 'question', text: 'MAIA-worded line.', authorship: { authoredBy: 'maia_proposed', acceptedByMember: false } }, MEMBER_OPEN);
  if (!d5.allow && d5.reason === 'wording_not_accepted') ok('5. proposed wording without an acceptance act is refused');
  else bad('5. unaccepted proposed wording was allowed', JSON.stringify(d5));
  const d5b = decideKeep({ kind: 'question', text: 'MAIA-worded line.', authorship: { authoredBy: 'maia_proposed', acceptedByMember: true } }, MEMBER_OPEN);
  if (d5b.allow) ok('5b. proposed wording IS keepable once explicitly accepted');
  else bad('5b. accepted wording was refused', JSON.stringify(d5b));

  // ── 6. Sanctuary through the normal path → refused ───────────────────────
  const d6 = decideKeep(claim, MEMBER_SANCTUARY);
  if (!d6.allow && d6.reason === 'sanctuary') ok('6. Sanctuary refuses the keep at the persistence boundary');
  else bad('6. Sanctuary did not refuse', JSON.stringify(d6));

  // ── 7. FORGED request: claims non-Sanctuary while the server sitting IS ──
  const before7 = count();
  const forged = { ...claim, sanctuary: false, fieldToken: 'forged', serverSanctuary: false };
  const d7 = decideKeep(forged, MEMBER_SANCTUARY); // server state is what the route passes
  const after7 = count();
  if (!d7.allow && d7.reason === 'sanctuary' && after7 === before7) ok('7. forged non-Sanctuary claim refused, zero rows (P4-C1)');
  else bad('7. a forged claim reached the write', JSON.stringify(d7));

  // no verified sitting at all ⇒ fail closed
  const d7b = decideKeep(claim, null);
  if (!d7b.allow && d7b.reason === 'no_field_session') ok('7b. unknown/expired/closed sitting fails closed');
  else bad('7b. a missing Field session did not fail closed', JSON.stringify(d7b));

  // ── 8. existing atom types render identically ────────────────────────────
  // Fixtures must satisfy the same S5 atom mint gate the Field writer does — any real
  // writer of a new atom must attest posture and how it was generated.
  const spont = sql(`INSERT INTO member_memory_atoms (member_id, source_type, source_id, title, body, return_preference, posture_at_creation, generated_by)
     VALUES (${lit(member.id)},'spontaneous',NULL,'A kept line','member text','member_pulled','normal','member-gesture') RETURNING id`)[0];
  const idea = sql(`INSERT INTO member_memory_atoms (member_id, source_type, source_id, title, body, posture_at_creation, generated_by)
     VALUES (${lit(member.id)},'idea',${lit(member.id)},'An idea','ignored body','normal','member-gesture') RETURNING id`)[0];

  // The gate itself: an unattested atom is refused. This is what P4-C2 was missing.
  try {
    sql(`INSERT INTO member_memory_atoms (member_id, source_type, source_id, title, body, return_preference)
         VALUES (${lit(member.id)},'shadow_field',NULL,'unattested','x','member_pulled') RETURNING id`);
    bad('0. the S5 atom mint gate did NOT refuse an unattested atom');
  } catch {
    ok('0. S5 mint gate refuses an unattested atom — the contract the Field writer must satisfy');
  }
  const back8 = sql(`SELECT ${loaderColumns()} FROM member_memory_atoms
     WHERE id IN (${lit(spont.id)}, ${lit(idea.id)})`);
  const s = back8.find((r: any) => r.source_type === 'spontaneous');
  const i = back8.find((r: any) => r.source_type === 'idea');
  if (s?.body === 'member text' && i && i.source_type === 'idea') ok('8. spontaneous and sourced atoms are unaffected by the change');
  else bad('8. an existing atom type changed shape');

  // ── P5-C1. Leaving actually ends Field conversation authority ────────────
  __resetFieldSessionsForTest();
  const sitting = openFieldSession(member.id, false);
  if (verifyFieldSession(sitting.token, member.id)) ok('9. after Enter, the sitting verifies — a turn may proceed');
  else bad('9. a fresh sitting did not verify');

  closeFieldSession(sitting.token);
  if (!verifyFieldSession(sitting.token, member.id)) ok('10. after Leave, the SAME token no longer verifies — the turn refuses (P5-C1)');
  else bad('10. a closed sitting still verifies — Leave would not be real');

  const other = openFieldSession(member.id, true);
  if (!verifyFieldSession(other.token, 'a0000000-0000-4000-8000-000000000000')) ok("11. another member cannot use this member's sitting");
  else bad('11. a foreign member could verify the sitting');

  // A closed sitting also refuses the keep — the same wall, one decision.
  const dClosed = decideKeep(claim, verifyFieldSession(sitting.token, member.id));
  if (!dClosed.allow && dClosed.reason === 'no_field_session') ok('12. a keep after Leave is refused');
  else bad('12. a keep after Leave was allowed', JSON.stringify(dClosed));

  exec(`DELETE FROM member_memory_atoms WHERE member_id=${lit(member.id)}`);
  exec(`DELETE FROM members WHERE id=${lit(member.id)}`);

  console.log(`\n  ${passed} passed · ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
