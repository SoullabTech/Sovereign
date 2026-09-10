/**
 * S3 · Step 7 — the acceptance walks, against the real running server.
 *
 * Twelve walks over HTTP plus the R1 Work-geometry invariant. Nothing is
 * repaired during the walk: a failure is recorded and the walk continues, so
 * the record shows the joined system as it is rather than as it became while
 * being watched.
 *
 * Usage: DATABASE_URL=… WALK_BASE=http://127.0.0.1:3100 \
 *          npx tsx scripts/witness/s3-step7/walk.ts <fixture.json>
 */
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';

const BASE = process.env.WALK_BASE ?? 'http://127.0.0.1:3100';
const FIX = JSON.parse(readFileSync(process.argv[2]!, 'utf8'));

let pass = 0, fail = 0;
const failures: string[] = [];
const check = (label: string, ok: boolean, detail?: unknown) => {
  if (ok) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; failures.push(label); console.log(`  FAIL  ${label}${detail === undefined ? '' : `\n        ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`}`); }
};
const section = (t: string) => console.log(`\n${t}\n${'-'.repeat(t.length)}`);

const ASK = `${BASE}/api/sovereign/manuscripts/${FIX.manuscriptId}/ask`;
async function ask(body: unknown, token: string = FIX.owner.token) {
  const r = await fetch(ASK, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-session-token': token },
    body: JSON.stringify(body),
  });
  let json: any = null;
  try { json = await r.json(); } catch { /* recorded as null */ }
  return { status: r.status, json };
}
const anchorFor = (key: string) => ({ on: 'observation', readingId: FIX.readingId, observationKey: key });

async function main() {
  const { query } = await import('@/lib/db/postgres');

  const GEOMETRY = `
    SELECT md5(string_agg(t, '|' ORDER BY t)) AS g FROM (
      SELECT 'D:'||d.id||':'||d.revision_count||':'||d.version||':'||md5(d.content) AS t
        FROM manuscript_working_drafts d WHERE d.manuscript_id = $1
      UNION ALL
      SELECT 'S:'||s.id||':'||s.position||':'||md5(s.text)
        FROM manuscript_draft_sections s
        JOIN manuscript_working_drafts d2 ON d2.id = s.draft_id
       WHERE d2.manuscript_id = $1
      UNION ALL
      SELECT 'U:'||u.id||':'||coalesce(u.parent_id::text,'-')||':'||u.position||':'||u.kind
             ||':'||coalesce(u.title,'-')||':'||u.origin
        FROM manuscript_structure_units u WHERE u.manuscript_id = $1
      UNION ALL
      SELECT 'M:'||m.unit_id||':'||m.draft_section_id
        FROM manuscript_structure_members m
        JOIN manuscript_structure_units u2 ON u2.id = m.unit_id
       WHERE u2.manuscript_id = $1
    ) x`;
  const geometry = async () =>
    (await query<{ g: string }>(GEOMETRY, [FIX.manuscriptId])).rows[0]!.g;

  const receipts = async (requestRef?: string) => (await query<{
    request_ref: string; section_ref: string | null; state: string; boundary: string; scope_kind: string;
  }>(
    `SELECT request_ref, section_ref, state, boundary, scope_kind
       FROM context_disclosure_receipts
      WHERE member_id = $1 ${requestRef ? 'AND request_ref = $2' : ''}
      ORDER BY attempted_at`,
    requestRef ? [FIX.owner.id, requestRef] : [FIX.owner.id])).rows;
  const receiptCount = async () => (await receipts()).length;

  /* ── W0 · the subject of this record ─────────────────────────────────── */
  section('W0 — pin the subject');
  const sha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  const dirty = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  const db = (await query<{ d: string; u: string; p: string; e: string }>(
    `SELECT current_database() d, current_user u, inet_server_port()::text p,
            current_setting('server_encoding') e`)).rows[0]!;
  const health = await fetch(`${BASE}/api/health`).then((r) => r.json()).catch(() => null);
  const mig = (await query<{ n: string }>(`SELECT count(*)::text n FROM schema_migrations`)).rows[0]!.n;
  console.log(`  application SHA   : ${sha}${dirty ? '  ⚠ WORKING TREE DIRTY' : ''}`);
  console.log(`  database          : ${db.d} as ${db.u} on :${db.p} · ${db.e} · ${mig} migrations`);
  console.log(`  fixture           : tag ${FIX.tag} · work ${FIX.manuscriptId} · reading ${FIX.readingId}`);
  console.log(`  server            : ${BASE} · health ${health ? JSON.stringify(health).slice(0, 120) : 'UNREACHABLE'}`);
  check('W0 the working tree is clean, so the SHA names what is running', dirty === '', dirty);
  check('W0 the database is UTF8', db.e === 'UTF8', db.e);
  check('W0 the server answers', health !== null);

  const geomAtOpen = await geometry();
  console.log(`  work geometry     : ${geomAtOpen}`);

  /* ── 1 · structure-only Ask ──────────────────────────────────────────── */
  section('WALK 1 — a structure-only Ask raises no authorization surface');
  const r1 = await ask({ question: 'What do the two parts do?', anchor: anchorFor(FIX.roles.structureOnly) });
  check('1a it is answered or refused without asking for body authority',
    r1.json?.result !== 'BODY_AUTHORITY_REQUIRED', { status: r1.status, result: r1.json?.result, refusal: r1.json?.refusal });
  check('1b no pending authorization is created for it', !('pendingAskRef' in (r1.json ?? {})), r1.json?.pendingAskRef);
  check('1c no sections are offered for authorization', !Array.isArray(r1.json?.sections), r1.json?.sections);

  /* ── 2 · body Ask · ACT 2 ────────────────────────────────────────────── */
  section('WALK 2 — a body Ask pauses, with server-derived section recognition');
  const r2 = await ask({ question: 'Say more about the lantern.', anchor: anchorFor(FIX.roles.singleSection) });
  const t1 = r2.json?.threadId;
  check('2a the turn pauses at BODY_AUTHORITY_REQUIRED', r2.json?.result === 'BODY_AUTHORITY_REQUIRED', r2.json);
  check('2b it carries a resumable pendingAskRef', typeof r2.json?.pendingAskRef === 'string' && r2.json.pendingAskRef.length >= 32);
  check('2c it names exactly the one section whose body is required',
    Array.isArray(r2.json?.sections) && r2.json.sections.length === 1 && r2.json.sections[0].sectionId === FIX.sections.w1, r2.json?.sections);
  /* ⚠️ The design's own promise, stated in sectionRecognition.ts: an authored
     title comes from the STRUCTURE lane — the member's word for a division —
     and `source_section_id` is provenance only, never a source of text. So the
     heading a member sees is the title of the PART that contains the section.
     An earlier draft of this walk asserted the source section's own heading
     ('Arrival'); that expectation was the instrument's, not the design's, and
     is corrected here. What the arrangement costs is measured at 7e. */
  /* The design's own promise, stated in sectionRecognition.ts: an authored title
     comes from the STRUCTURE lane — the member's word for a division — and
     `source_section_id` is provenance only, never a source of text. Since F1,
     the label carries that title BESIDE the section's canonical place, because a
     division is coarser than a section. `heading` stays authored-or-null. */
  const s2d = r2.json?.sections?.[0];
  check('2d the heading is the authored title, unaltered',
    typeof s2d?.heading === 'string' && s2d.heading.trim() === s2d.heading && s2d.heading.length > 0, s2d);
  check('2d\' the label carries that title AND names the section\'s place in the Work',
    typeof s2d?.label === 'string' && s2d.label.includes(s2d.heading) && /Section \d+/.test(s2d.label), s2d?.label);
  check('2e a paused turn crosses nothing', (await receipts()).length === 0);

  /* ── 3 · the act ─────────────────────────────────────────────────────── */
  section('WALK 3 — one explicit act, one actId, the same Ask resumes');
  const act1 = randomUUID();
  const before3 = await receiptCount();
  const r3 = await ask({
    question: 'Say more about the lantern.', threadId: t1,
    act: 'authorize_sections_and_resume', pendingAskRef: r2.json.pendingAskRef,
    actId: act1, authorizes: [FIX.sections.w1],
  });
  const rec3 = await receipts();
  check('3a the act is accepted — the protocol leaves the authorization states',
    !['BODY_AUTHORITY_REQUIRED', 'BODY_SCOPE_INCOMPLETE'].includes(r3.json?.result), { status: r3.status, result: r3.json?.result, refusal: r3.json?.refusal });
  check('3b it resumed the SAME thread, not a second one', r3.json?.threadId === t1, { was: t1, now: r3.json?.threadId });
  check('3c exactly one receipt exists, for the authorized section only',
    rec3.length === 1 && rec3[0].section_ref === FIX.sections.w1 && rec3[0].scope_kind === 'section', rec3);
  check('3d the crossing is recorded as crossed, on the developmental boundary',
    rec3[0]?.state === 'crossed' && rec3[0]?.boundary === 'writers_studio.ask->maia_developmental', rec3[0]);
  const requestRef3 = rec3[0]?.request_ref;

  /* ── 4 · the double click ────────────────────────────────────────────── */
  section('WALK 4 — the same press arriving twice is not a reuse attempt');
  const r4 = await ask({
    question: 'Say more about the lantern.', threadId: t1,
    act: 'authorize_sections_and_resume', pendingAskRef: r2.json.pendingAskRef,
    actId: act1, authorizes: [FIX.sections.w1],
  });
  check('4a the same actId is answered ACT_ALREADY_PROCESSED, not ALREADY_CONSUMED',
    r4.json?.result === 'ACT_ALREADY_PROCESSED', r4.json);
  check('4b it carries the truth about whether that act produced an answer',
    r4.json?.completion === 'completed' || r4.json?.completion === 'incomplete', r4.json?.completion);
  check('4c no second crossing was recorded', (await receipts()).length === rec3.length, await receipts());

  /* ── 5 · a different act on a spent claim ────────────────────────────── */
  section('WALK 5 — a different act on a spent authorization is refused as consumed');
  const r5 = await ask({
    question: 'Say more about the lantern.', threadId: t1,
    act: 'authorize_sections_and_resume', pendingAskRef: r2.json.pendingAskRef,
    actId: randomUUID(), authorizes: [FIX.sections.w1],
  });
  check('5a a DIFFERENT actId is answered ALREADY_CONSUMED', r5.json?.result === 'ALREADY_CONSUMED', r5.json);
  check('5b still no further crossing', (await receipts()).length === rec3.length);

  /* ── 6 · multi-section recognition ───────────────────────────────────── */
  section('WALK 6 — a multi-section requirement names every section, recognizably');
  const r6 = await ask({ question: 'How does the silence return?', anchor: anchorFor(FIX.roles.twoSectionsTwoUnits) });
  const t2 = r6.json?.threadId;
  const secs6: any[] = r6.json?.sections ?? [];
  check('6a it pauses', r6.json?.result === 'BODY_AUTHORITY_REQUIRED', r6.json);
  check('6b BOTH required sections are offered at once — all-or-none needs the whole set',
    secs6.length === 2 && new Set(secs6.map((s) => s.sectionId)).size === 2
      && secs6.some((s) => s.sectionId === FIX.sections.w2) && secs6.some((s) => s.sectionId === FIX.sections.w4), secs6);
  /* The recognition query orders by `s.position ASC`, but the result is re-keyed
     by the INPUT order — and the input is `[...required].sort()`, a lexicographic
     sort of UUIDs. So the order a member is shown is the order of the ids. */
  check('6c they arrive in the Work\'s own order, not in the order of their ids',
    secs6[0]?.sectionId === FIX.sections.w2 && secs6[1]?.sectionId === FIX.sections.w4,
    { shown: secs6.map((s: any) => s.sectionId), workOrder: [FIX.sections.w2, FIX.sections.w4] });

  /* ── 7 · how a section is made recognizable ──────────────────────────── */
  section('WALK 7 — a section is named by something the writer can recognize, never by its id');
  check('7a no label anywhere is, or contains, a UUID',
    secs6.every((s: any) => typeof s.label === 'string' && !/[0-9a-f]{8}-[0-9a-f]{4}/i.test(s.label)), secs6.map((s: any) => s.label));

  /* w5 belongs to no structure unit, so recognition has no authored title to
     draw on. This is the ONLY path to the generated positional label. */
  const r7 = await ask({ question: 'What is the coda doing?', anchor: anchorFor(FIX.roles.unplacedSection) });
  const coda = (r7.json?.sections ?? [])[0];
  check('7b a section in no structure unit has no authored heading, and the server does not invent one',
    coda?.heading === null, coda);
  check('7c it is still recognizable, by its place in the Work', coda?.label === 'Section 5', coda?.label);

  /* Two sections inside ONE unit. Recognition titles a section by its unit. */
  const r7b = await ask({ question: 'What single movement?', anchor: anchorFor(FIX.roles.twoSectionsOneUnit) });
  const pair = r7b.json?.sections ?? [];
  check('7d both sections of the same unit are offered', pair.length === 2, pair);
  check('7e ⭐ the two sections are DISTINGUISHABLE from one another in the request',
    new Set(pair.map((s: any) => s.label)).size === pair.length, pair.map((s: any) => `${s.sectionId} => ${s.label}`));

  /* ── 8 · partial authorization ───────────────────────────────────────── */
  section('WALK 8 — a partial authorization crosses nothing');
  const before8 = (await receipts()).length;
  const r8 = await ask({
    question: 'How does the silence return?', threadId: t2,
    act: 'authorize_sections_and_resume', pendingAskRef: r6.json.pendingAskRef,
    actId: randomUUID(), authorizes: [FIX.sections.w2],
  });
  check('8a it is BODY_SCOPE_INCOMPLETE', r8.json?.result === 'BODY_SCOPE_INCOMPLETE', r8.json);
  check('8b the outstanding section is named recognizably, not as an id',
    Array.isArray(r8.json?.outstanding) && r8.json.outstanding.length === 1
      && r8.json.outstanding[0].sectionId === FIX.sections.w4, r8.json?.outstanding);
  check('8c nothing crossed — not even the section that WAS authorized',
    (await receipts()).length === before8, await receipts());
  check('8d the authorization was not spent: the same ref is still resumable',
    typeof r8.json?.pendingAskRef === 'string');

  /* ── 9 · one act, N section-scoped crossings, one handoff ────────────── */
  section('WALK 9 — one act carries several section scopes through ONE handoff');
  const act9 = randomUUID();
  const r9 = await ask({
    question: 'How does the silence return?', threadId: t2,
    act: 'authorize_sections_and_resume', pendingAskRef: r6.json.pendingAskRef,
    actId: act9, authorizes: [FIX.sections.w2, FIX.sections.w4],
  });
  const all9 = await receipts();
  const new9 = all9.filter((r) => r.request_ref !== requestRef3);
  const refs9 = new Set(new9.map((r) => r.request_ref));
  check('9a the act is accepted', !['BODY_AUTHORITY_REQUIRED', 'BODY_SCOPE_INCOMPLETE'].includes(r9.json?.result),
    { status: r9.status, result: r9.json?.result, refusal: r9.json?.refusal });
  check('9b two receipts were written, one per authorized section', new9.length === 2, new9);
  check('9c they share ONE request_ref — one member act, one execution', refs9.size === 1, [...refs9]);
  check('9d each is scoped to its own section — the shared request is not a multi-section permission',
    new9.every((r) => r.scope_kind === 'section')
      && new Set(new9.map((r) => r.section_ref)).size === 2
      && new9.every((r) => [FIX.sections.w2, FIX.sections.w4].includes(r.section_ref!)), new9);
  check('9e both crossed', new9.every((r) => r.state === 'crossed'), new9.map((r) => r.state));

  /* ── 10 · display metadata is not authority ──────────────────────────── */
  section('WALK 10 — client display metadata never decides authority');
  const r10a = await ask({ question: 'And the lantern again?', anchor: anchorFor(FIX.roles.singleSection) });
  const before10 = (await receipts()).length;
  const r10 = await ask({
    question: 'And the lantern again?', threadId: r10a.json?.threadId,
    act: 'authorize_sections_and_resume', pendingAskRef: r10a.json?.pendingAskRef,
    actId: randomUUID(),
    /* A client asserting a heading, a label, and a second section it was never
       asked to authorize. None of it may reach authority. */
    authorizes: [FIX.sections.w2],
    sections: [{ id: FIX.sections.w1, heading: 'Arrival', label: 'Arrival' }],
    heading: 'Arrival', label: 'Arrival', bodyRequired: false, allowBody: true,
  });
  check('10a a client-named section that is NOT the required one does not satisfy the requirement',
    r10.json?.result === 'BODY_SCOPE_INCOMPLETE', r10.json);
  check('10b the outstanding set is re-derived on the server: the required section, not the client\'s',
    r10.json?.outstanding?.length === 1 && r10.json.outstanding[0].sectionId === FIX.sections.w1, r10.json?.outstanding);
  check('10c nothing crossed on the client\'s account of itself', (await receipts()).length === before10);

  /* ── 11 · continuity failures ────────────────────────────────────────── */
  section('WALK 11 — continuity failures are answered truthfully, each as itself');
  const r11a = await ask({
    question: 'And the lantern again?', threadId: r10a.json?.threadId,
    act: 'authorize_sections_and_resume', pendingAskRef: randomUUID() + randomUUID(),
    actId: randomUUID(), authorizes: [FIX.sections.w1],
  });
  check('11a an unknown authorization is 404 `unknown` — not "consumed", which would be a lie about someone',
    r11a.status === 404 && r11a.json?.refusal === 'unknown', { status: r11a.status, body: r11a.json });

  const r11b = await ask({ question: 'Once more.', anchor: anchorFor(FIX.roles.singleSection) });
  /* ⭐ THE EXPIRED CLAIM IS SEEDED, NOT AGED. `pending_ask_claims_forward_only()`
     refuses an UPDATE of `expires_at` — lifetime is immutable — and
     `expires_at > created_at` is a lifetime invariant, not a freshness one. So
     the row is written with BOTH timestamps in the past. The first attempt in
     this witness tried the UPDATE and was refused by the trigger; that refusal
     is the substrate behaving correctly, and is recorded as such. */
  const expiredRef = `expired-${randomUUID().replace(/-/g, '')}${randomUUID().replace(/-/g, '')}`.slice(0, 48);
  const thread11 = (await query<{ id: string }>(
    `SELECT id FROM ask_threads WHERE manuscript_id = $1 AND member_id = $2 ORDER BY opened_at DESC LIMIT 1`,
    [FIX.manuscriptId, FIX.owner.id])).rows[0]!.id;
  await query(
    `INSERT INTO pending_ask_claims (ref, member_id, manuscript_id, thread_id, reading_id, observation_key, created_at, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6, now() - interval '2 hours', now() - interval '1 hour')`,
    [expiredRef, FIX.owner.id, FIX.manuscriptId, thread11, FIX.readingId, FIX.roles.singleSection]);
  const r11c = await ask({
    question: 'Once more.', threadId: r11b.json?.threadId,
    act: 'authorize_sections_and_resume', pendingAskRef: expiredRef,
    actId: randomUUID(), authorizes: [FIX.sections.w1],
  });
  check('11b an expired authorization is 410 `expired` — its own answer, not a 404',
    r11c.status === 410 && r11c.json?.refusal === 'expired', { status: r11c.status, body: r11c.json });

  const r11d = await ask({
    question: 'Once more.', threadId: r11b.json?.threadId,
    act: 'authorize_sections_and_resume', pendingAskRef: r11b.json?.pendingAskRef,
    actId: 'x', authorizes: [FIX.sections.w1],
  });
  check('11c a malformed act is NOT silently downgraded to an ordinary Ask',
    r11d.json?.result !== 'BODY_AUTHORITY_REQUIRED', r11d.json);

  const r11e = await ask({ question: 'Whose Work is this?', anchor: anchorFor(FIX.roles.singleSection) }, FIX.other.token);
  check('11d another member reaches the Work as not found — no existence leak',
    r11e.status === 404 && r11e.json?.refusal === 'not_found', { status: r11e.status, body: r11e.json });

  /* ── 12 · the sixth state ────────────────────────────────────────────── */
  section('WALK 12 — DISCLOSURE_UNAVAILABLE: the act happened, nothing was read');
  const r12a = await ask({ question: 'And once more.', anchor: anchorFor(FIX.roles.singleSection) });
  const before12 = (await receipts()).length;
  /* Environment-level fault injection: the consent substrate is made genuinely
     unavailable. No code path is altered, and it is restored immediately. */
  await query(`ALTER TABLE runtime_consent_state RENAME TO runtime_consent_state__witness_offline`);
  let r12: any;
  try {
    r12 = await ask({
      question: 'And once more.', threadId: r12a.json?.threadId,
      act: 'authorize_sections_and_resume', pendingAskRef: r12a.json?.pendingAskRef,
      actId: randomUUID(), authorizes: [FIX.sections.w1],
    });
  } finally {
    await query(`ALTER TABLE runtime_consent_state__witness_offline RENAME TO runtime_consent_state`);
  }
  check('12a the sixth state is returned — not a 500, not BODY_AUTHORITY_REQUIRED, not BODY_UNVERIFIABLE',
    r12?.json?.result === 'DISCLOSURE_UNAVAILABLE', { status: r12?.status, body: r12?.json });
  check('12b it tells the member their act was spent', r12?.json?.actSpent === true, r12?.json?.actSpent);
  check('12c it still names the sections, so a new act is recognizable',
    Array.isArray(r12?.json?.sections) && r12.json.sections.length === 1
      && typeof r12.json.sections[0]?.label === 'string' && r12.json.sections[0].label.length > 0
      && !/[0-9a-f]{8}-[0-9a-f]{4}/i.test(r12.json.sections[0].label), r12?.json?.sections);
  check('12d nothing was read: no receipt crossed', (await receipts()).filter((r) => r.state === 'crossed').length
    === all9.filter((r) => r.state === 'crossed').length, await receipts());
  const spent12 = await query<{ n: string }>(
    `SELECT count(*)::text n FROM pending_ask_claims WHERE ref = $1 AND consumed_at IS NOT NULL`,
    [r12a.json?.pendingAskRef]);
  check('12e and the claim really is spent in the record, matching what the member was told',
    spent12.rows[0]!.n === '1', spent12.rows[0]);

  /* ── R1 · the Work did not move ──────────────────────────────────────── */
  section('R1 — the Work\'s geometry is unchanged by the whole interaction');
  const geomAtClose = await geometry();
  console.log(`  at open : ${geomAtOpen}`);
  console.log(`  at close: ${geomAtClose}`);
  check('R1 opening, pausing, authorizing, retrying, failing and completing changed no measured geometry',
    geomAtClose === geomAtOpen, { geomAtOpen, geomAtClose });

  /* ── result ──────────────────────────────────────────────────────────── */
  console.log(`\n${'='.repeat(70)}\n${pass} passed · ${fail} failed`);
  if (fail) console.log(`\nFAILED:\n  ${failures.join('\n  ')}`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
