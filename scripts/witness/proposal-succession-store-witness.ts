/**
 * PROPOSAL-SUCCESSION-STORE-01 — the adapter witness, against a real database.
 *
 * ⭐⭐ THE ACCEPTANCE QUESTION:
 *
 *   Can the durable database round-trip the already-proven contract without
 *   ADDING, LOSING, SYNTHESIZING or REINTERPRETING any fact?
 *
 * ⛔ DISPOSABLE DATABASE ONLY — it refuses any `DATABASE_URL` whose database
 * name does not contain `witness`, for the same reason the schema witness does
 * and the same reason walk 12 should have: an instrument that can reach a
 * database someone uses is not an instrument, it is a hazard. (2026-09-10: a
 * fault injection written for a disposable cluster wedged a live dev database.)
 *
 * ⛔ EVERY ASSERTION IS ON BEHAVIOUR THROUGH THE ADAPTER, never on its source.
 * A constraint that exists and does not fire is not enforcement, and a function
 * whose name looks right is not a property.
 */

import { query, closePool } from '@/lib/db/postgres';
import {
  openChain, appendAuthoredVersion, readChain,
} from '@/lib/manuscript/proposalChain/store';
import { headOf, lineage, validateChain } from '@/lib/manuscript/proposalChain/succession';
import type { LocusIdentity } from '@/lib/manuscript/proposalChain/contract';

const url = process.env.DATABASE_URL ?? '';
/* ⚠️ THE QUERY STRING COMES OFF FIRST. Splitting on '/' before stripping `?`
   reads the last segment of `?host=/tmp` as the database name — which made the
   refusal fire on a database that WAS disposable. A guard that misidentifies
   its subject is not a guard, even when it happens to say no. */
const dbName = url.split('?')[0].split('/').pop() ?? '';
if (!dbName.includes('witness')) {
  console.error(`REFUSED · '${dbName || '(none)'}' is not a witness database.`);
  process.exit(2);
}

let pass = 0; let fail = 0;
const ok = (s: string) => { pass++; console.log(`  PASS  ${s}`); };
const bad = (s: string, detail: unknown) => {
  fail++; console.log(`  FAIL  ${s}\n     -> ${String(detail)}`);
};
const eq = (s: string, got: unknown, want: unknown) =>
  JSON.stringify(got) === JSON.stringify(want)
    ? ok(`${s}  [${JSON.stringify(got)}]`)
    : bad(s, `got ${JSON.stringify(got)} · want ${JSON.stringify(want)}`);

const MEMBER = '11111111-1111-1111-1111-111111111111';
const OTHER  = '55555555-5555-5555-5555-555555555555';

const uuid = async () =>
  (await query<{ u: string }>('SELECT gen_random_uuid() AS u')).rows[0].u;

const locus = async (expected = ', fixated'): Promise<LocusIdentity> => ({
  workId: await uuid(), draftId: await uuid(), baseVersion: 40,
  targetSectionId: await uuid(), expectedText: expected,
});

async function main() {
  /* ⛔ NO CLEANUP, AND THAT IS THE SUBSTRATE BEING RIGHT.
     The first draft began `DELETE FROM proposal_versions`, and the second run
     died on it: `proposal_versions is append-only: an authored formulation is
     finished (attempted DELETE)`. ⭐ The witness could not tidy up after itself
     because the immutability it exists to respect refused it — recorded rather
     than worked around.

     Every chain below is opened fresh with a server-minted id, so runs do not
     interfere and no assertion here is global. */
  await query(`INSERT INTO members (id) VALUES ($1), ($2) ON CONFLICT DO NOTHING`,
    [MEMBER, OTHER]);

  console.log('── PROPOSAL-SUCCESSION-STORE-01 · round-trip ────────────────');

  /* ── F1 · MAIA/member authorship survives, and NON-ALTERNATING. ──────────
     ⚠️ The fixture is deliberately maia · maia · member · member. An
     alternating fixture cannot discriminate an implementation that infers the
     author from position — the homogeneous-fixture defect this programme has
     already been caught by once. */
  const L = await locus();
  const chain = await openChain(MEMBER, { locus: L });
  for (const [author, text] of [
    ['maia', 'f1'], ['maia', 'f2'], ['member', 'f3'], ['member', 'f4'],
  ] as const) {
    const r = await appendAuthoredVersion(MEMBER, chain.id, {
      author, replacementText: text,
    });
    if (r.outcome !== 'appended') { bad('F1 · append', r.reason); return finish(); }
  }
  const stored = await readChain(MEMBER, chain.id);
  if (!stored) { bad('F1 · readChain', 'null'); return finish(); }

  eq('F1 · round-trip preserves MAIA/member authorship exactly',
    lineage(stored.versions).map((v) => `${v.author}:${v.replacementText}`),
    ['maia:f1', 'maia:f2', 'member:f3', 'member:f4']);

  /* ── F2 · supersedes survives exactly. ──────────────────────────────────── */
  const line = lineage(stored.versions);
  eq('F2 · round-trip preserves supersedes exactly',
    line.map((v, i) => v.supersedes === (i === 0 ? null : line[i - 1].id)),
    [true, true, true, true]);

  /* ── F3/F4 · rationale: ABSENT vs AUTHORED, and no third state. ─────────── */
  const noRat = line[0];
  'rationale' in noRat
    ? bad('F3 · NULL rationale hydrates as absent, not \'\'',
        `the key is present: ${JSON.stringify(noRat.rationale)}`)
    : ok('F3 · NULL rationale hydrates as ABSENT — the key is not on the object');

  const withRat = await appendAuthoredVersion(MEMBER, chain.id, {
    author: 'member', replacementText: 'f5', rationale: 'tighter, and it lands',
  });
  eq('F4 · a substantive rationale survives unchanged',
    withRat.outcome === 'appended' ? withRat.version.rationale : withRat,
    'tighter, and it lands');

  /* ── F5/F6 · governedBy absent stays absent; present stays the LINEAGE
     REFERENCE ONLY. ⛔ Nothing may resolve it to a decision EVENT. ─────────── */
  'governedBy' in chain
    ? bad('F5 · governedBy absent remains absent', 'the key is present')
    : ok('F5 · governedBy absent remains ABSENT — the key is not on the object');

  const ruling = await uuid();
  const governed = await openChain(MEMBER, {
    locus: await locus('elsewhere'), governedBy: { decisionChainId: ruling },
  });
  const backG = await readChain(MEMBER, governed.id);
  eq('F6 · governedBy present remains the lineage reference only',
    backG?.chain.governedBy, { decisionChainId: ruling });

  /* ── F7 · ⭐⭐ TIMESTAMPS DO NOT DETERMINE LINEAGE.
     The fixture is built with raw SQL so `authored_at` can be set DELIBERATELY
     CONTRADICTORY to succession: the root is the NEWEST row, and every
     successor is older than what it replaces. An adapter that sorted by
     `authored_at` and reconstructed predecessor order would return the exact
     reverse of the truth. ───────────────────────────────────────────────────── */
  const tc = await openChain(MEMBER, { locus: await locus('contradictory') });
  const ids = [await uuid(), await uuid(), await uuid(), await uuid()];
  const times = ['2030-01-01T00:00:00Z', '2029-01-01T00:00:00Z',
                 '2028-01-01T00:00:00Z', '2027-01-01T00:00:00Z'];
  for (let i = 0; i < ids.length; i++) {
    await query(
      `INSERT INTO proposal_versions
         (id, chain_id, author, formulation, supersedes, authored_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [ids[i], tc.id, i % 2 === 0 ? 'maia' : 'member', `t${i + 1}`,
        i === 0 ? null : ids[i - 1], times[i]]);
  }
  const tcBack = await readChain(MEMBER, tc.id);
  eq('F7 · ⭐ timestamps do not determine lineage (root is the NEWEST row)',
    lineage(tcBack!.versions).map((v) => v.replacementText),
    ['t1', 't2', 't3', 't4']);
  eq('F7b · and the head is the OLDEST row, because supersedes says so',
    headOf(tcBack!.versions)?.replacementText, 't4');

  /* ── F8 · a foreign member's chain cannot be read. ──────────────────────── */
  const asOther = await readChain(OTHER, chain.id);
  asOther === null
    ? ok('F8 · a foreign-member chain reads as null — indistinguishable from absent')
    : bad('F8 · foreign-member chain', 'a chain was returned');
  const absent = await readChain(MEMBER, await uuid());
  absent === null
    ? ok('F8b · and an absent chain reads as null too — the SAME shape')
    : bad('F8b · absent chain', 'a chain was returned');

  /* ── F9 · append to another member's chain refuses. ─────────────────────── */
  const foreignAppend = await appendAuthoredVersion(OTHER, chain.id, {
    author: 'maia', replacementText: 'intruder',
  });
  eq('F9 · append to another member\'s chain refuses',
    foreignAppend.outcome === 'refused' ? foreignAppend.reason : 'APPENDED',
    'chain_unknown');
  const after = await readChain(MEMBER, chain.id);
  eq('F9b · ⛔ and NOTHING was written — a refusal that wrote would pass F9',
    after!.versions.length, stored.versions.length + 1);

  /* ── F10 · a cross-chain predecessor still reaches the DATABASE constraint.
     ⭐ Asserted directly against the table: the pure layer refuses it first, so
     this proves the second guard is real rather than assumed. ─────────────── */
  const other = await openChain(MEMBER, { locus: await locus('second') });
  let dbRefusal = 'NOT REFUSED';
  try {
    await query(
      `INSERT INTO proposal_versions (chain_id, author, formulation, supersedes)
       VALUES ($1, 'maia', 'x', $2)`, [other.id, line[0].id]);
  } catch (e) { dbRefusal = (e as { constraint?: string }).constraint ?? String(e); }
  eq('F10 · a cross-chain predecessor reaches the database constraint',
    dbRefusal, 'proposal_versions_predecessor_same_chain');

  /* ── F11 · version history cannot be rewritten through the adapter.
     ⛔ Asserted as ABSENCE OF CAPABILITY, not as a thrown error: the module
     exports nothing that updates or deletes a version. A test that called an
     update and caught the trigger would be testing the schema lane again. ─── */
  const surface = Object.keys(
    await import('@/lib/manuscript/proposalChain/store')).sort();
  const mutators = surface.filter((k) =>
    /update|replace|delete|remove|rewrite|edit|set/i.test(k));
  eq('F11 · the adapter exports no way to rewrite or delete a version',
    mutators, []);

  /* ── F14 · ⭐⭐ THE WRITE PATH ALSO REFUSES THE CLOCK.
     F7 proves READING does not infer order from time. It does not touch the
     append path, and the falsifier M2 — `headIdOf` taking the newest row —
     SURVIVED the first run because of exactly that gap. So: append through the
     adapter onto the contradictory-timestamp chain. The structural head is
     `t4`, the OLDEST row; the newest is `t1`. A clock-based head would make
     the new version supersede `t1` and branch the chain. */
  const onto = await appendAuthoredVersion(MEMBER, tc.id, {
    author: 'member', replacementText: 't5',
  });
  eq('F14 · ⭐ an append supersedes the STRUCTURAL head, not the newest row',
    onto.outcome === 'appended' ? onto.version.supersedes : onto,
    ids[3]);
  const tcAfter = await readChain(MEMBER, tc.id);
  eq('F14b · and the chain is still linear, root first',
    lineage(tcAfter!.versions).map((v) => v.replacementText),
    ['t1', 't2', 't3', 't4', 't5']);

  /* ── F15 · ⭐ AN EMPTY FORMULATION IS A FORMULATION — a deletion.
     The schema admits `formulation = ''` deliberately. M10 (spread-guarding
     `replacementText`) SURVIVED the first run because nothing stored one. */
  const del = await appendAuthoredVersion(MEMBER, tc.id, {
    author: 'member', replacementText: '',
  });
  eq('F15 · an empty replacementText round-trips as \'\', never as absent',
    del.outcome === 'appended'
      ? [del.version.replacementText, 'replacementText' in del.version]
      : del,
    ['', true]);

  /* ── F16 · ⭐⭐ THE HYDRATOR DOES NOT DEPEND ON A CHECK IN ANOTHER FILE.
     Census §6.5: the project idiom `...(r.x ? {…} : {})` tests TRUTHINESS, and
     for `rationale` that coincides with `!== null` ONLY because of the
     `btrim` CHECK. M3 (reverting to truthiness) SURVIVED the first run because
     a lawful database cannot hold `''` — the claim was unfalsifiable.

     ⭐ So the CHECK is lifted for exactly one insert. If `''` is ever on disk,
     the adapter must REPORT it, not silently convert a stored fact into
     absence — losing a fact is the failure mode this whole lane is about.

     ⛔ CRASH-SAFE BY CONSTRUCTION, which the 2026-09-10 walk-12 finding
     requires: the constraint is re-added in `finally`, AND re-added
     unconditionally before the drop, so an interrupted previous run cannot
     leave this database permissive. */
  const CHK = 'proposal_versions_rationale_check';
  const addCheck = () => query(
    `ALTER TABLE proposal_versions ADD CONSTRAINT ${CHK}
       CHECK (rationale IS NULL OR length(btrim(rationale)) > 0) NOT VALID`);
  await query(`ALTER TABLE proposal_versions DROP CONSTRAINT IF EXISTS ${CHK}`);
  await addCheck();
  try {
    await query(`ALTER TABLE proposal_versions DROP CONSTRAINT ${CHK}`);
    const blankId = await uuid();
    await query(
      `INSERT INTO proposal_versions (id, chain_id, author, formulation, rationale, supersedes)
       VALUES ($1, $2, 'maia', 'blank-rationale', '', $3)`,
      [blankId, tc.id, del.outcome === 'appended' ? del.version.id : null]);
    const back = await readChain(MEMBER, tc.id);
    const blank = back!.versions.find((x) => x.id === blankId)!;
    eq('F16 · ⭐ an empty rationale ON DISK is REPORTED, never absented away',
      ['rationale' in blank, blank.rationale], [true, '']);
  } finally {
    await query(`ALTER TABLE proposal_versions DROP CONSTRAINT IF EXISTS ${CHK}`);
    await addCheck();
  }

  /* ── F17 · ⭐⭐ A NON-23505 DATABASE ERROR CROSSES THE ADAPTER AS FAILURE.
     ⛔ FOUNDER REVIEW, 2026-09-14: the census made this distinction
     load-bearing and the implementation honours it, but no assertion
     DEMONSTRATED it — it was left to source inspection. After what this
     programme learned from the S3 `unreachable` collapse, that is not good
     enough: there, a real provider failure surfaced as one word with no cause
     because an error was captured and then discarded one layer down.

     So: a fault that raises a KNOWN NON-23505 SQLSTATE on insert. The adapter
     must let it ESCAPE. ⛔ It must NOT come back as `chain_unknown`,
     `chain_corrupt` or `simultaneous_append` — a domain refusal would tell the
     caller a RULE said no when in fact the DATABASE could not answer.

     ⛔ CRASH-SAFE, the F16 discipline: dropped in `finally`, and dropped
     unconditionally before creation, so an interrupted earlier run cannot leave
     this database carrying the fault. */
  const FAULT = 'proposal_versions_witness_fault';
  const dropFault = () =>
    query(`DROP TRIGGER IF EXISTS ${FAULT} ON proposal_versions`);
  await dropFault();
  await query(
    `CREATE OR REPLACE FUNCTION ${FAULT}() RETURNS trigger AS $fn$
     BEGIN
       RAISE EXCEPTION 'witness fault injection' USING ERRCODE = '57P01';
     END; $fn$ LANGUAGE plpgsql`);
  let escaped: unknown = 'NOTHING THROWN';
  let returned: unknown = null;
  try {
    await query(
      `CREATE TRIGGER ${FAULT} BEFORE INSERT ON proposal_versions
         FOR EACH ROW EXECUTE FUNCTION ${FAULT}()`);
    try {
      returned = await appendAuthoredVersion(MEMBER, chain.id, {
        author: 'maia', replacementText: 'must not be swallowed',
      });
    } catch (e) { escaped = e; }
  } finally {
    await dropFault();
    await query(`DROP FUNCTION IF EXISTS ${FAULT}()`);
  }

  const code = (escaped as { code?: string })?.code;
  code === '57P01'
    ? ok('F17 · ⭐ a non-23505 database error ESCAPES the adapter  [57P01]')
    : bad('F17 · a non-23505 database error escapes',
        returned !== null
          ? `it was COLLAPSED INTO A DOMAIN REFUSAL: ${JSON.stringify(returned)}`
          : `thrown, but not the injected fault: ${String(escaped)}`);

  /* ⭐ And the transaction rolled back — a failed append leaves no partial row. */
  const afterFault = await readChain(MEMBER, chain.id);
  eq('F17b · and nothing was written by the failed append',
    afterFault!.versions.some((x) => x.replacementText === 'must not be swallowed'),
    false);

  /* ── F12 · the stored chain is a VALID chain by the pure contract's own
     judgement — the round-trip closing on itself. ─────────────────────────── */
  const v = validateChain(after!.chain, after!.versions);
  v.ok
    ? ok('F12 · what came back out validates under the pure contract')
    : bad('F12 · round-trip validity', v.reason);

  /* ── F13 · nothing was ADDED. Every contract key, and no others. ────────── */
  eq('F13 · a version carries exactly the contract\'s keys — nothing added',
    Object.keys(line[0]).sort(),
    ['author', 'authoredAt', 'chainId', 'id', 'replacementText', 'supersedes']);
  eq('F13b · and a chain carries exactly its own',
    Object.keys(after!.chain).sort(),
    ['id', 'locus', 'memberId', 'openedAt']);

  finish();
}

function finish(): void {
  console.log(`\n  ${pass} passed · ${fail} failed`);
  void closePool().then(() => process.exit(fail === 0 ? 0 : 1));
}

main().catch((e) => { console.error(e); void closePool().then(() => process.exit(1)); });
