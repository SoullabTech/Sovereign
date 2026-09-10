/**
 * FOCUS-WITNESS-01 · W0–W3 against the frozen candidate.
 *
 *   ⭐⭐ THE APPLICATION MUST CAUSE THE CROSSING. This script does not call the
 *       assembler, does not mint authority, and does not insert a receipt. It
 *       makes one authenticated HTTP request to the real route and then reads
 *       what the system durably recorded about it.
 *
 * ⛔ W4 / P10 ARE NOT ATTEMPTED. There is no member-reachable Focus surface at
 * this candidate, so the inhabited question is DEFERRED to
 * D9-PHENOMENOLOGY-WITNESS-01 — not waived, and not answered here by asking a
 * human about an HTTP response.
 *
 * ⛔ NO REPAIR DURING THE RUN. Any material failure or ambiguity STOPS the
 * witness with the finding recorded; the candidate is not moved.
 *
 *   FOCUS_WITNESS_BASE=http://localhost:PORT \
 *   FOCUS_WITNESS_TOKEN=<from the credential fixture> \
 *   DATABASE_URL=postgres://…/<DB-B> \
 *   npx tsx scripts/witness/focus-witness-01.ts
 */

import { randomUUID } from 'crypto';
import { query } from '../../lib/db/postgres';

const BASE = process.env.FOCUS_WITNESS_BASE;
const TOKEN = process.env.FOCUS_WITNESS_TOKEN;
const MEMBER = '3f3f3f3f-0000-4000-8000-000000000001';

let pass = 0, fail = 0;
const w = (id: string, ok: boolean, detail = '') => {
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id.padEnd(6)}  ${detail}`);
};

async function main() {
  if (!BASE || !TOKEN) {
    console.error('FOCUS_WITNESS_BASE and FOCUS_WITNESS_TOKEN are required.');
    process.exit(2);
  }

  /* ── W0 · CUSTODY ─────────────────────────────────────────────────────── */
  const work = await query<{ manuscript_id: string; draft_id: string }>(
    `SELECT d.manuscript_id, d.id AS draft_id
       FROM manuscript_working_drafts d
       JOIN member_manuscripts m ON m.id = d.manuscript_id
      WHERE d.member_id = $1 AND m.member_id = $1
        AND d.section_addressable_at IS NOT NULL
      LIMIT 1`, [MEMBER]);
  w('W0.1', work.rows.length === 1, 'the member owns exactly one addressable seeded Work');
  if (work.rows.length !== 1) { console.log('\n⛔ STOP — fixture blocker.'); process.exit(1); }
  const { manuscript_id: workRef, draft_id: draftId } = work.rows[0];

  const sections = await query<{ id: string; text: string }>(
    `SELECT id, text FROM manuscript_draft_sections WHERE draft_id = $1 ORDER BY position`, [draftId]);
  w('W0.2', sections.rows.length >= 3, `${sections.rows.length} draft sections seeded`);

  const priorCrossings = await query<{ n: string }>(
    `SELECT count(*)::text AS n FROM context_disclosure_receipts WHERE member_id = $1`, [MEMBER]);
  w('W0.3', priorCrossings.rows[0].n === '0', 'no pre-existing Focus crossing for this member');

  /* ── W1 · THE REAL APPLICATION SEAM ───────────────────────────────────── */
  const sessionId = randomUUID();
  const ask = 'What is this section actually doing?';
  const started = new Date();
  const res = await fetch(`${BASE}/api/writers-studio/focus`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-session-token': TOKEN },
    body: JSON.stringify({
      sessionId, workRef, scopeKind: 'section',
      sectionRef: sections.rows[1].id, gesture: 'work_with_this', ask,
    }),
  });
  const body = await res.json().catch(() => ({} as Record<string, unknown>));

  /* ⭐ A 404 here means the route is flag-gated OFF — an environment finding, not
     a candidate defect. A 401 means the credential did not traverse the real
     resolver. Both stop the witness rather than being worked around. */
  w('W1.1', res.status !== 404, res.status === 404
    ? 'the route 404s — WRITERS_STUDIO_FOCUS_ENABLED is not set in the witness environment'
    : 'the Focus route is reachable in the witness environment');
  w('W1.2', res.status !== 401, res.status === 401
    ? 'identity did not resolve — the credential did not traverse resolveCanonicalIdentity'
    : 'the authenticated identity resolved through the real seam');
  if (res.status === 404 || res.status === 401) { console.log('\n⛔ STOP.'); process.exit(1); }

  w('W1.3', res.status === 200, `HTTP ${res.status}`);
  const state = (body as Record<string, unknown>).state;
  console.log(`        §3a state: ${JSON.stringify(state)}`);

  /* ── W2 · THE REAL WORK WAS READ LAWFULLY ─────────────────────────────── */
  /* ⛔ The adversarial cases are discharged by gate:focus-assembler and are NOT
     re-run here. What the walk must show is that the SUCCESSFUL path traversed
     the same governed implementation — evidenced by a crossing recorded at the
     governed boundary for the governed scope. */
  const receipts = await query<{
    disclosure_id: string; boundary: string; source_class: string; source_ref: string;
    scope_kind: string; section_ref: string | null; state: string; request_ref: string;
    gesture: string; authorized_by: string; attempted_at: string;
  }>(
    `SELECT disclosure_id, boundary, source_class, source_ref, scope_kind, section_ref,
            state, request_ref, gesture, authorized_by, attempted_at
       FROM context_disclosure_receipts
      WHERE member_id = $1 AND attempted_at >= $2
      ORDER BY attempted_at`, [MEMBER, started.toISOString()]);
  w('W2.1', receipts.rows.length === 1, `${receipts.rows.length} receipt(s) for this act`);
  if (receipts.rows.length !== 1) { console.log('\n⛔ STOP.'); process.exit(1); }
  const r = receipts.rows[0];

  /* ── W3 · CROSSING EVIDENCE ───────────────────────────────────────────── */
  w('W3.1', r.boundary === 'manuscript_prose->maia_cognition', `boundary=${r.boundary}`);
  w('W3.2', r.source_class === 'work' && r.source_ref === workRef, `source=${r.source_class}/${r.source_ref}`);
  w('W3.3', r.scope_kind === 'section' && r.section_ref === sections.rows[1].id,
    `scope=${r.scope_kind} sectionRef=${r.section_ref === sections.rows[1].id ? 'the section that crossed' : r.section_ref}`);
  w('W3.4', r.state === 'crossed' || r.state === 'attempted', `state=${r.state}`);
  w('W3.5', r.authorized_by === 'member' && r.gesture === 'work_with_this',
    `authorized_by=${r.authorized_by} gesture=${r.gesture}`);

  const consent = await query<{ n: string }>(
    `SELECT count(*)::text AS n FROM runtime_consent_state WHERE request_id = $1`, [r.request_ref]);
  w('W3.6', consent.rows[0].n === '1', 'the receipt names a real consent-state row');

  /* ⭐ The content-free constitution, observed rather than assumed. */
  const cols = await query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
      WHERE table_name = 'context_disclosure_receipts'`, []);
  const banned = ['text', 'passage', 'excerpt', 'summary', 'embedding', 'hash',
    'digest', 'fingerprint', 'start_offset', 'end_offset', 'range', 'length', 'word_count'];
  const leaked = cols.rows.map(c => c.column_name).filter(c => banned.includes(c));
  w('W3.7', leaked.length === 0, leaked.length ? `receipt carries ${leaked.join(', ')}` : 'the receipt is content-free');

  /* ⛔ W3.8 — NO EVIDENCE CLEANUP. The disposable database is the teardown; a
     witness that deleted its own receipt would be destroying the thing it came
     to observe. This asserts the guard is real rather than trusting this file. */
  let refused = false;
  try { await query(`DELETE FROM context_disclosure_receipts WHERE disclosure_id = $1`, [r.disclosure_id]); }
  catch { refused = true; }
  w('W3.8', refused, 'an ungoverned DELETE of this receipt is refused');

  console.log(`\n${pass} passed · ${fail} failed`);
  console.log(fail === 0
    ? '\n✅ FOCUS-WITNESS-01 · TECHNICAL CROSSING PASS · PHENOMENOLOGY DEFERRED — SUBJECT HAS NO SURFACE'
    : '\n⛔ FOCUS-WITNESS-01 · STOP · finding recorded · the candidate does not move');
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(e => { console.error('witness failed:', e); process.exit(1); });
