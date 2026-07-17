/**
 * FIRST PROOF — Episodic Member-Marked Write Path.
 *
 * Exercises the REAL handler (POST from app/api/sovereign/episodes/mark/route.ts)
 * — not a copied INSERT — against the live local database, and proves the three
 * properties Step 7 must demonstrate:
 *
 *   1. EXACT VERBATIM FIDELITY      — a hostile input string (leading/trailing
 *      whitespace, tab, newline, curly + straight quotes, unicode, emoji, and a
 *      SQL-injection attempt) is stored byte-for-byte, with no trim, normalize,
 *      paraphrase, or escape-mangling. The injection attempt also proves the
 *      write is parameterized (the table survives).
 *   2. INTERPRETIVE ABSTENTION      — every interpretive column the system
 *      refuses to author stays NULL (experience_title/description/context,
 *      significance, emotional_intensity, breakthrough_level, spiral_stage), and
 *      every vector / resonance stays an empty array. The system invents nothing.
 *   3. SOURCE POINTER PRESERVATION  — source_turn_id / source_session_id are
 *      stored exactly as provided, opaque and uninterpreted.
 *
 * Plus the database backstop the route's doctrine leans on
 * (episodic_member_marked_requires_verbatim): the biconditional that a
 * member-marked row MUST carry non-empty verbatim, and a non-marked row MUST
 * keep the verbatim channel NULL (no system text smuggled through).
 *
 * Self-seeding (creates a synthetic member, a synthetic owned session —
 * required since the provenance ruling of 2026-07-17: the route refuses any
 * mark whose sourceSessionId does not resolve to a session owned by the
 * authenticated member — AND a synthetic auth_sessions credential), self-
 * cleaning (deletes everything it wrote in a finally block), re-runnable,
 * server-independent.
 *
 * AUTH (repaired 2026-07-17): getMemberIdFromRequest authenticates only a
 * VERIFIED auth_sessions credential; a bare x-member-id header is an
 * unverified claim, honored only when it matches the session's member. It
 * also reads cookies() from next/headers, which throws outside a Next
 * request scope. So this script (a) seeds an auth_sessions row for the
 * synthetic member and sends its token via x-session-token, and (b) invokes
 * the handler inside a real request scope — workAsyncStorage +
 * workUnitAsyncStorage populated via the same createRequestStoreForAPI
 * factory Next's own app-route module uses — so cookies() resolves instead
 * of throwing. Section [4] proves the refusals this hardening introduces:
 * bare-claim 401, claim-mismatch 401, and the R17 provenance 403s.
 *
 * Run:
 *   node --env-file=.env.local --import tsx scripts/verify-episodic-mark.ts
 *   # or, naming the database explicitly:
 *   DATABASE_URL="postgresql://soullab@localhost:5432/maia_consciousness" \
 *     npx tsx scripts/verify-episodic-mark.ts
 */

// MUST be first: installs globalThis.AsyncLocalStorage (Next's own baseline
// module, run by the server runtime before anything else). Next's async-storage
// modules capture that global at load time — without this, they load a fake
// storage that throws "AsyncLocalStorage accessed in runtime where it is not
// available" on first use under plain tsx.
import 'next/dist/server/node-environment-baseline';

import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import { workAsyncStorage } from 'next/dist/server/app-render/work-async-storage.external';
import { workUnitAsyncStorage } from 'next/dist/server/app-render/work-unit-async-storage.external';
import { createRequestStoreForAPI } from 'next/dist/server/async-storage/request-store';
import { POST } from '@/app/api/sovereign/episodes/mark/route';
import { query } from '@/lib/db/postgres';

const URL = 'http://localhost/api/sovereign/episodes/mark';

let failures = 0;
function check(name: string, cond: boolean, detail?: string): void {
  if (cond) {
    console.log(`  PASS  ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${name}${detail ? `\n          ${detail}` : ''}`);
  }
}
function show(s: unknown): string {
  return `${JSON.stringify(s)} (len ${typeof s === 'string' ? s.length : 'n/a'})`;
}

/**
 * Invoke a route handler inside a genuine Next request scope, so request APIs
 * (cookies() in getMemberIdFromRequest) resolve instead of throwing "called
 * outside a request scope". The request store comes from the SAME factory
 * Next's app-route module uses at runtime (createRequestStoreForAPI, phase
 * 'action'); the work store carries only the fields cookies() consults
 * (route / forceStatic / dynamicShouldError).
 */
function runInRequestScope<T>(req: NextRequest, fn: () => Promise<T>): Promise<T> {
  const requestStore = createRequestStoreForAPI(
    req,
    req.nextUrl,
    undefined as never, // implicitTags — stored, never consulted on this path
    undefined,
    undefined,
  );
  const workStore = {
    route: '/api/sovereign/episodes/mark',
    forceStatic: false,
    dynamicShouldError: false,
  } as never;
  return workAsyncStorage.run(workStore, () => workUnitAsyncStorage.run(requestStore, fn));
}

/** POST to the real handler with the given auth headers, inside a request scope. */
function mark(body: unknown, headers: Record<string, string>): Promise<Response> {
  const req = new NextRequest(URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  return runInRequestScope(req, () => POST(req));
}

/**
 * PRECONDITION (read-only) — refuse to run the authorship test unless the
 * provenance migration (20260531000001) is applied. This is not administrative:
 * against the un-migrated table the insert would either fail on old NOT NULLs
 * or, worse, SUCCEED while silently manufacturing significance=5 /
 * emotional_intensity=0.5 / breakthrough_level=0 — the exact interpretation we
 * removed. So this runs first, writes nothing, and exits(1) loudly if unmet.
 */
async function assertMigrationApplied(): Promise<void> {
  console.log('[0] Precondition — provenance migration applied (authorship test cannot run without it)');

  const { rows: colRows } = await query<{
    column_name: string;
    is_nullable: string;
    column_default: string | null;
  }>(
    `SELECT column_name, is_nullable, column_default
       FROM information_schema.columns
      WHERE table_name = 'episodic_memories'`,
  );
  const cols = new Map(colRows.map((r) => [r.column_name, r]));

  const { rows: conRows } = await query<{ ok: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'episodic_member_marked_requires_verbatim'
     ) AS ok`,
  );
  const hasCheck = conRows[0]?.ok === true;

  const unmet: string[] = [];
  const need = (label: string, ok: boolean, actual: string): void => {
    if (ok) {
      console.log(`  ok    ${label}`);
    } else {
      unmet.push(`${label} — ${actual}`);
      console.log(`  MISS  ${label} — ${actual}`);
    }
  };
  const exists = (c: string): void => need(`${c} exists`, cols.has(c), cols.has(c) ? 'present' : 'ABSENT');
  const nullable = (c: string): void => {
    const r = cols.get(c);
    need(`${c} nullable`, r?.is_nullable === 'YES', r ? `is_nullable=${r.is_nullable}` : 'column ABSENT');
  };
  const noManufacturingDefault = (c: string): void => {
    const r = cols.get(c);
    need(
      `${c} has no manufacturing default`,
      !!r && r.column_default === null,
      r ? `default=${r.column_default ?? 'NULL'}` : 'column ABSENT',
    );
  };

  exists('marked_by_member');
  exists('verbatim_text');
  exists('source_turn_id');
  exists('source_session_id');
  nullable('experience_title');
  nullable('experience_description');
  nullable('significance');
  nullable('emotional_intensity');
  nullable('breakthrough_level');
  noManufacturingDefault('significance');
  noManufacturingDefault('emotional_intensity');
  noManufacturingDefault('breakthrough_level');
  exists('archetypal_resonances'); // default [] is acceptable; only its presence is required
  need('CHECK episodic_member_marked_requires_verbatim live', hasCheck, hasCheck ? 'present' : 'ABSENT');

  if (unmet.length > 0) {
    console.error('\n════════════════════════════════════════════════════════════');
    console.error('  PRECONDITION FAILED — provenance migration NOT applied.');
    console.error('  Refusing to run the authorship test. Against an un-migrated');
    console.error('  table the write would either reject, or SILENTLY MANUFACTURE');
    console.error('  significance=5 / emotional_intensity=0.5 / breakthrough_level=0 —');
    console.error('  the interpretation this path exists to refuse. No row written.');
    console.error('  Apply database/migrations/20260531000001 first. Unmet:');
    for (const u of unmet) console.error(`    - ${u}`);
    console.error('════════════════════════════════════════════════════════════');
    process.exit(1);
  }
  console.log('  -> migration applied; authorship test may proceed.\n');
}

async function main(): Promise<void> {
  // Gate first: writes nothing, exits loudly if the migration is absent.
  await assertMigrationApplied();

  const memberId = randomUUID();
  const tag = Date.now();
  // Verified credential for the synthetic member (varchar(64) column; 49 chars).
  const sessionToken = `epimark-test-${randomUUID()}`;
  const authed = { 'x-session-token': sessionToken, 'x-member-id': memberId };

  // A deliberately hostile string. If ANY byte changes, fidelity is broken.
  const verbatim =
    '  I felt the floor tilt—then it steadied.\t' + // 2 leading spaces, em-dash, tab
    '\n"présence" 中文 ñ 🔥🌊  ' + // newline, quotes, unicode, emoji, 2 spaces
    "'); DROP TABLE episodic_memories;--   "; // injection attempt + 3 trailing spaces

  const sourceTurnId = `turn_${randomUUID()}`;
  const sourceSessionId = `sess_${randomUUID()}`;

  try {
    // ---- seed a synthetic member (only the NOT-NULL-without-default columns) ----
    await query(
      `INSERT INTO members (id, passkey, username, password_hash) VALUES ($1, $2, $3, $4)`,
      [memberId, `EPISODIC-MARK-TEST-${tag}`, `episodic_mark_test_${tag}`, 'test-not-a-real-hash'],
    );

    // ---- seed the verified auth_sessions credential the auth layer requires ----
    // (bare x-member-id no longer authenticates; see header. Short-lived on
    // purpose — even if teardown were skipped, the token dies in 15 minutes.)
    await query(
      `INSERT INTO auth_sessions (member_id, session_token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
      [memberId, sessionToken],
    );

    // ---- seed the owned source session the provenance contract requires ----
    // (an ordinary continuity/standard session owned by the synthetic member;
    // a fabricated session id would now be refused with 403 R18)
    await query(
      `INSERT INTO maia_sessions (id, member_id, mode, privacy_mode)
       VALUES ($1, $2, 'continuity', 'standard')`,
      [sourceSessionId, memberId],
    );

    // ======================================================================
    console.log('\n[1] Real handler — authenticated mark of a hostile string');
    // ======================================================================
    const res = await mark({ verbatimText: verbatim, sourceTurnId, sourceSessionId }, authed);
    const json: any = await res.json();

    check('POST returns 201', res.status === 201, `got ${res.status}: ${JSON.stringify(json)}`);
    check(
      'response verbatimText is byte-identical',
      json?.episode?.verbatimText === verbatim,
      `${show(json?.episode?.verbatimText)}\n          vs ${show(verbatim)}`,
    );
    check('response markedByMember === true', json?.episode?.markedByMember === true);
    check('response sourceTurnId preserved', json?.episode?.sourceTurnId === sourceTurnId);
    check('response sourceSessionId preserved', json?.episode?.sourceSessionId === sourceSessionId);

    const episodeId: string | undefined = json?.episode?.episodeId;
    check('response carries an episodeId', typeof episodeId === 'string' && episodeId.length > 0);

    // ======================================================================
    console.log('\n[2] Read the stored row back from the database');
    // ======================================================================
    const { rows } = await query<any>(
      `SELECT verbatim_text, marked_by_member, source_turn_id, source_session_id,
              experience_title, experience_description, experience_context,
              significance, emotional_intensity, breakthrough_level, spiral_stage,
              archetypal_resonances, semantic_vector, emotional_vector, somatic_vector,
              related_episodes, connection_strengths, connection_types, frameworks_active
         FROM episodic_memories
        WHERE episode_id = $1`,
      [episodeId],
    );
    check('exactly one row persisted', rows.length === 1, `got ${rows.length}`);
    const r = rows[0] ?? {};

    // ---- (1) EXACT VERBATIM FIDELITY ----
    console.log('\n  Proof 1 — exact verbatim fidelity');
    check(
      'DB verbatim_text byte-identical (no trim/normalize/escape)',
      r.verbatim_text === verbatim,
      `${show(r.verbatim_text)}\n          vs ${show(verbatim)}`,
    );
    const tbl = await query<any>(`SELECT to_regclass('public.episodic_memories') AS t`);
    check('episodic_memories table intact (injection neutralized)', tbl.rows[0]?.t === 'episodic_memories');

    // ---- (2) INTERPRETIVE ABSTENTION ----
    console.log('\n  Proof 2 — interpretive abstention (system invents nothing)');
    const mustBeNull = [
      'experience_title',
      'experience_description',
      'experience_context',
      'significance',
      'emotional_intensity',
      'breakthrough_level',
      'spiral_stage',
    ];
    for (const col of mustBeNull) {
      check(`${col} is NULL`, r[col] === null, `got ${JSON.stringify(r[col])}`);
    }
    const mustBeEmptyArray = [
      'archetypal_resonances',
      'semantic_vector',
      'emotional_vector',
      'somatic_vector',
      'related_episodes',
      'connection_strengths',
      'connection_types',
      'frameworks_active',
    ];
    for (const col of mustBeEmptyArray) {
      check(`${col} is empty []`, Array.isArray(r[col]) && r[col].length === 0, `got ${JSON.stringify(r[col])}`);
    }

    // ---- (3) SOURCE POINTER PRESERVATION ----
    console.log('\n  Proof 3 — source pointer preservation');
    check('DB source_turn_id preserved exactly', r.source_turn_id === sourceTurnId, show(r.source_turn_id));
    check('DB source_session_id preserved exactly', r.source_session_id === sourceSessionId, show(r.source_session_id));
    check('DB marked_by_member is TRUE', r.marked_by_member === true);

    // ======================================================================
    console.log('\n[3] Backstops — app-layer guard + DB CHECK biconditional');
    // ======================================================================
    // App layer: a whitespace-only mark is not a mark.
    const emptyRes = await mark({ verbatimText: '   \t\n  ', sourceSessionId }, authed);
    check('whitespace-only verbatim rejected with 400 (app layer)', emptyRes.status === 400, `got ${emptyRes.status}`);

    const after = await query<any>(
      `SELECT count(*)::int AS n FROM episodic_memories WHERE user_id = $1 AND marked_by_member = TRUE`,
      [memberId],
    );
    check('only the one valid mark persisted (empty mark wrote nothing)', after.rows[0]?.n === 1, `got ${after.rows[0]?.n}`);

    // DB CHECK (a): member-marked but empty verbatim → reject.
    let caughtA = false;
    try {
      await query(
        `INSERT INTO episodic_memories (user_id, episode_id, verbatim_text, marked_by_member) VALUES ($1, $2, $3, TRUE)`,
        [memberId, randomUUID(), '   '],
      );
    } catch (e: any) {
      caughtA = e?.code === '23514';
      if (!caughtA) console.log(`          (got code ${e?.code} ${e?.constraint ?? ''})`);
    }
    check('CHECK rejects member-marked empty verbatim (23514)', caughtA);

    // DB CHECK (b): NOT member-marked but verbatim present → reject (no smuggling).
    let caughtB = false;
    try {
      await query(
        `INSERT INTO episodic_memories (user_id, episode_id, verbatim_text, marked_by_member) VALUES ($1, $2, $3, FALSE)`,
        [memberId, randomUUID(), 'system-authored summary the member never said'],
      );
    } catch (e: any) {
      caughtB = e?.code === '23514';
      if (!caughtB) console.log(`          (got code ${e?.code} ${e?.constraint ?? ''})`);
    }
    check('CHECK rejects system text via verbatim channel when not marked (23514)', caughtB);

    // DB CHECK (c): the legitimate non-marked legacy shape (NULL verbatim) is allowed.
    let okC = false;
    try {
      await query(
        `INSERT INTO episodic_memories (user_id, episode_id, verbatim_text, marked_by_member, experience_title, experience_description) VALUES ($1, $2, NULL, FALSE, $3, $4)`,
        [memberId, randomUUID(), 'legacy title', 'legacy desc'],
      );
      okC = true;
    } catch (e: any) {
      console.log(`          (unexpected code ${e?.code} ${e?.constraint ?? ''})`);
    }
    check('CHECK allows non-marked row with NULL verbatim (legacy shape)', okC);

    // ======================================================================
    console.log('\n[4] Refusals — verified credential + provenance (R17)');
    // ======================================================================
    const validBody = { verbatimText: 'a real sentence', sourceTurnId, sourceSessionId };

    // Auth: a bare x-member-id claim (the pre-hardening transport) is NOT a
    // credential — no auth_sessions token, no member, 401.
    const bareClaim = await mark(validBody, { 'x-member-id': memberId });
    check('bare x-member-id without session token → 401', bareClaim.status === 401, `got ${bareClaim.status}`);

    // Auth: a valid token whose x-member-id claim names a DIFFERENT member is
    // a possible impersonation — rejected, not silently resolved either way.
    const mismatch = await mark(validBody, { 'x-session-token': sessionToken, 'x-member-id': randomUUID() });
    check('valid token with mismatched x-member-id claim → 401', mismatch.status === 401, `got ${mismatch.status}`);

    // Provenance: a mark that names NO source session is refused (403 R17) —
    // without provenance the Sanctuary boundary cannot be enforced at all.
    const noProv = await mark({ verbatimText: 'a real sentence', sourceTurnId }, authed);
    const noProvJson: any = await noProv.json();
    check('mark without sourceSessionId → 403', noProv.status === 403, `got ${noProv.status}`);
    check('  …and carries refusal R17', noProvJson?.refusal === 'R17', `got ${JSON.stringify(noProvJson)}`);

    // Provenance: a fabricated session id resolves like a nonexistent or
    // cross-member session — the same governed denial (403 R17).
    const ghost = await mark({ ...validBody, sourceSessionId: `sess_${randomUUID()}` }, authed);
    const ghostJson: any = await ghost.json();
    check('mark citing an unowned/nonexistent session → 403', ghost.status === 403, `got ${ghost.status}`);
    check('  …and carries refusal R17', ghostJson?.refusal === 'R17', `got ${JSON.stringify(ghostJson)}`);

    // None of the refused attempts wrote anything.
    const finalCount = await query<any>(
      `SELECT count(*)::int AS n FROM episodic_memories WHERE user_id = $1 AND marked_by_member = TRUE`,
      [memberId],
    );
    check('refused attempts wrote nothing (still exactly 1 mark)', finalCount.rows[0]?.n === 1, `got ${finalCount.rows[0]?.n}`);
  } finally {
    // ---- teardown: remove everything this run created ----
    await query(`DELETE FROM episodic_memories WHERE user_id = $1`, [memberId]);
    await query(`DELETE FROM auth_sessions WHERE member_id = $1`, [memberId]);
    await query(`DELETE FROM maia_sessions WHERE id = $1`, [sourceSessionId]);
    await query(`DELETE FROM members WHERE id = $1`, [memberId]);
  }

  console.log('\n────────────────────────────────────────');
  if (failures === 0) {
    console.log(
      'ALL CHECKS PASSED — verbatim fidelity, interpretive abstention, source preservation, auth + R17 provenance refusals.',
    );
  } else {
    console.log(`${failures} CHECK(S) FAILED.`);
  }
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('verify-episodic-mark crashed:', err);
  process.exit(1);
});
