/**
 * WRITERS-STUDIO-WITNESS-RECOVERY-01 / R1 · LIVE WITNESS STATE PREPARATION
 *
 * ⭐⭐ THE POINT OF THIS SCRIPT IS THE FOUNDER'S TIME. R1 says: do not ask the
 * founder to discover states, compose prompts, calculate boundaries or diagnose
 * failures. So this seeds the exact Work, prints the exact URLs, the exact
 * control settings, the exact acts, and the exact PASS/FAIL/NO EVIDENCE line
 * for each of the four checks — and nothing else is left to decide.
 *
 * ⛔ IT SEEDS A WITNESS MANUSCRIPT. It writes nothing to any existing Work,
 * reads no member's prose, and touches no other row. Re-running replaces only
 * the witness manuscript it created, by title.
 *
 * ⛔ IT ESTABLISHES NOTHING ABOUT MAIA. The four answers come from the running
 * surface, observed by a human. This only removes the setup from their plate.
 *
 * Usage, on the authorized environment:
 *   DATABASE_URL=... MEMBER_ID=<founder member uuid> \
 *     npx tsx --tsconfig tsconfig.witness.json scripts/witness/r1-live-witness-setup.ts
 */
import { randomUUID } from 'node:crypto';
import { query, closePool } from '@/lib/db/postgres';
import {
  judgeProposalScope, measureProposalScope, paragraphSpans, words,
  LATITUDE_BANDS, PARAGRAPH_MIN_WORDS, type EditorialLatitude,
} from '@/lib/manuscript/editorialScope/contract';
import { splitStoredSection } from '@/lib/manuscript/sections/sectionProjection';

const TITLE = 'Witness — R1 editorial scope and recovery';
const BASE = process.env.WITNESS_BASE_URL ?? 'http://localhost:3000';

/* ⛔ Neutral prose written for this witness. A witness record must never carry
   a member's authored work, and neither must a witness fixture. */
const W3_BODY = `The workshop stood at the edge of the orchard, and every spring it filled with the smell of sawdust and cut grass. My grandfather kept his tools on a long bench under the window, arranged in an order that made sense to nobody but him, and he could find any one of them in the dark without looking. He worked slowly. He said a joint that was rushed would open again within a year, and that he would rather lose an afternoon than lose the piece, and he was right about that more often than I wanted him to be. I did not understand any of that when I was a boy of nine or ten. I understood only that the afternoons were long and that the light through the window moved across the bench while he worked, and that he never once seemed to be in a hurry to be anywhere else at all.`;

const W4_SECOND = `It is worth saying here that workshops of this kind were common in the period, that many families kept one, and that the practice has been documented at length elsewhere by people better qualified than I am to describe it.`;
const W4_BODY = `${W3_BODY}\n\n${W4_SECOND}`;

const CLAUSE = ', arranged in an order that made sense to nobody but him,';
const W3A_EDIT = W3_BODY.replace(CLAUSE, '');
const W3B_EDIT = W3_BODY
  .replace(' long ', ' ').replace(' every ', ' ').replace(' and cut grass', '')
  .replace(' slowly.', '.').replace(' again within a year', '').replace(' only ', ' ')
  .replace(' once ', ' ').replace(' at all', '');

const SECTIONS = [
  { heading: 'W3 — scope boundaries', body: W3_BODY },
  { heading: 'W4 — paragraph permission', body: W4_BODY },
];

const at = (latitude: EditorialLatitude, mayRemoveParagraphs = false) =>
  ({ latitude, mayRemoveParagraphs });

let invalid = 0;
const must = (ok: boolean, claim: string) => { if (!ok) { invalid++; console.log(`⛔ ${claim}`); } };

/* ══ A · THE FIXTURES ARE RE-PROVEN ON EVERY RUN ═══════════════════════════
   ⭐ Against the real `judgeProposalScope`, on this checkout, so a drift in
   the law cannot leave a stale sheet telling the founder to expect a refusal
   that no longer fires. ⛔ The founder calculates nothing. */
function proveFixtures() {
  const a = measureProposalScope(W3_BODY, W3A_EDIT);
  const av = judgeProposalScope(W3_BODY, W3A_EDIT, at(1));
  must(!av.ok && av.reason === 'scope_removes_contiguous_passage', 'W3a must refuse on run length');
  must(a.removedFraction <= LATITUDE_BANDS[1].maxRemovedFraction, 'W3a must stay INSIDE the fraction');
  must(a.longestContiguousRemoved > LATITUDE_BANDS[1].maxContiguousRemovedWords, 'W3a must exceed the run');

  const b = measureProposalScope(W3_BODY, W3B_EDIT);
  const bv = judgeProposalScope(W3_BODY, W3B_EDIT, at(1));
  must(!bv.ok && bv.reason === 'scope_removes_too_much', 'W3b must refuse on fraction');
  must(b.longestContiguousRemoved <= LATITUDE_BANDS[1].maxContiguousRemovedWords, 'W3b must stay INSIDE the run');
  must(b.removedFraction > LATITUDE_BANDS[1].maxRemovedFraction, 'W3b must exceed the fraction');

  const spans = paragraphSpans(W4_BODY);
  must(spans.length === 2, 'W4 passage must hold exactly two paragraphs');
  must(words(W4_SECOND).length >= PARAGRAPH_MIN_WORDS, 'W4 second paragraph must clear the fragment floor');
  const w4v = judgeProposalScope(W4_BODY, W3_BODY, at(5));
  must(!w4v.ok && w4v.reason === 'scope_removes_paragraphs', 'W4 must refuse on paragraphs at latitude 5');

  return { a, av, b, bv, w4v };
}

/* ══ B · THE SEED ══════════════════════════════════════════════════════════ */
async function seed(memberId: string) {
  const exists = await query<{ id: string }>('SELECT id FROM members WHERE id = $1', [memberId]);
  if (exists.rows.length === 0) throw new Error(`No member ${memberId} on this database.`);

  /* ⭐ Replace only our own witness manuscript, matched by title. ⛔ Never a
     broad delete: everything else this member owns is untouched. */
  const prior = await query<{ id: string }>(
    'SELECT id FROM member_manuscripts WHERE member_id = $1 AND title = $2', [memberId, TITLE]);
  for (const row of prior.rows) {
    await query('DELETE FROM manuscript_working_drafts WHERE manuscript_id = $1', [row.id]);
    await query('DELETE FROM manuscript_sections WHERE manuscript_id = $1', [row.id]);
    await query('DELETE FROM member_manuscripts WHERE id = $1', [row.id]);
  }

  const manuscriptId = randomUUID(), draftId = randomUUID();
  await query('INSERT INTO member_manuscripts (id, member_id, title) VALUES ($1,$2,$3)',
    [manuscriptId, memberId, TITLE]);

  /* ⭐⭐ THE ROUND-TRIP INVARIANT IS A DATABASE TRIGGER, NOT A CONVENTION:
     while `section_addressable_at` is set, the draft's content must be the
     BYTE-EXACT concatenation of its sections, joined with nothing. So the
     sections are written first and addressability is set last. */
  const stored = SECTIONS.map((s) => `${s.heading}\n\n${s.body}`);
  const content = stored.join('');
  await query(`INSERT INTO manuscript_working_drafts (id, manuscript_id, member_id, content, base_source_hash, version)
    VALUES ($1,$2,$3,$4,'r1-witness',1)`, [draftId, manuscriptId, memberId, content]);

  const draftSectionIds: string[] = [];
  for (const [i, s] of SECTIONS.entries()) {
    const sourceId = randomUUID(), draftSectionId = randomUUID();
    await query(`INSERT INTO manuscript_sections (id, manuscript_id, position, heading, body)
      VALUES ($1,$2,$3,$4,$5)`, [sourceId, manuscriptId, i, s.heading, s.body]);
    await query(`INSERT INTO manuscript_draft_sections (id, draft_id, position, text, source_section_id)
      VALUES ($1,$2,$3,$4,$5)`, [draftSectionId, draftId, i, stored[i], sourceId]);
    /* ⭐⭐ The rebuild context marks a section `editable` only when
       `splitStoredSection` can separate heading from body. ⛔ A seed that got
       the stored format wrong would open a surface the founder cannot use,
       and they would be the one to discover it. Asserted here instead. */
    must(splitStoredSection(stored[i]!, s.heading) !== null,
      `seeded section ${i} must be editable (heading/body split)`);
    draftSectionIds.push(draftSectionId);
  }

  await query(`UPDATE manuscript_working_drafts
    SET section_addressable_at = now(), section_conversion_version = version WHERE id = $1`, [draftId]);

  /* ⛔ Trust the trigger, then verify anyway: a seed that silently failed the
     round trip would send the founder to a surface that refuses to open. */
  const check = await query<{ flat: string; content: string; addressable: Date | null }>(
    `SELECT (SELECT COALESCE(string_agg(s.text, '' ORDER BY s.position), '')
               FROM manuscript_draft_sections s WHERE s.draft_id = d.id) AS flat,
            d.content, d.section_addressable_at AS addressable
       FROM manuscript_working_drafts d WHERE d.id = $1`, [draftId]);
  const r = check.rows[0]!;
  must(r.flat === r.content, 'seeded draft must satisfy the round-trip invariant');
  must(r.addressable !== null, 'seeded draft must be section-addressable');

  return { manuscriptId, draftSectionIds };
}

/* ══ C · THE SHEET ═════════════════════════════════════════════════════════ */
(async () => {
  /* ⭐ Resolve WHO this witness belongs to without sending the founder to a
     psql prompt. ⛔ Refuses on anything but an exact single match — seeding a
     witness Work into the wrong member's account is not a thing to guess at. */
  let memberId = process.env.MEMBER_ID ?? '';
  const handle = process.env.MEMBER_USERNAME ?? process.env.MEMBER_EMAIL ?? '';
  if (!memberId && handle) {
    const found = await query<{ id: string; username: string }>(
      'SELECT id, username FROM members WHERE username = $1 OR email = $1', [handle]);
    if (found.rows.length !== 1) {
      console.error(`REFUSED: "${handle}" matched ${found.rows.length} members, need exactly 1.`);
      await closePool(); process.exit(2);
    }
    memberId = found.rows[0]!.id;
    console.log(`member: ${found.rows[0]!.username} (${memberId})\n`);
  }
  if (!/^[0-9a-f-]{36}$/i.test(memberId)) {
    console.error('REFUSED: identify the member this witness runs as, by either:');
    console.error('  MEMBER_USERNAME=<your studio username>   (or MEMBER_EMAIL=...)');
    console.error('  MEMBER_ID=<member uuid>');
    console.error('\n⚠️  It must be the member you are SIGNED IN AS in the browser,');
    console.error('   or the seeded Work will not be visible to you.');
    await closePool(); process.exit(2);
  }
  if (process.env.WRITERS_STUDIO_EDITORIAL_ENABLED !== '1') {
    console.error('REFUSED: the editorial routes answer 404 unless WRITERS_STUDIO_EDITORIAL_ENABLED=1.');
    console.error('  Set it for the SERVER process too, not just this script.');
    process.exit(2);
  }

  const f = proveFixtures();
  const { manuscriptId, draftSectionIds } = await seed(memberId);
  if (invalid > 0) {
    console.error(`\n⛔ ${invalid} problem(s) — do not run the witness on this state.`);
    await closePool(); process.exit(1);
  }

  const url = (i: number) => `${BASE}/writers-studio/rebuild?m=${manuscriptId}&s=${draftSectionIds[i]}`;
  const W3_URL = url(0), W4_URL = url(1);
  const L = (s = '') => console.log(s);

  L('╔════════════════════════════════════════════════════════════════════╗');
  L('║  R1 · FOUR OBSERVATIONS · OBSERVE ONLY · STOP AFTER THE FOURTH     ║');
  L('╚════════════════════════════════════════════════════════════════════╝');
  L();
  L('Controls live in the desk beside the conversation:');
  L('  · slider   "How much may MAIA change?"');
  L('  · checkbox "MAIA may suggest removing a whole paragraph"');
  L('  · checkbox "Suggest wording straight away"  ⚠️ renders ONLY at latitude 1');
  L();
  L('⚠️ Use a FRESH passage thread for each check. A thread already carrying');
  L('   turns is not the state these criteria were written for.');
  L();

  L('── 1 · W4 · does she name the control? ───────────────────────────────');
  L(`OPEN     ${W4_URL}`);
  L('SET      slider 5 "Open"  ·  paragraph removal OFF');
  L('SAY      The second paragraph is doing no work. Cut it.');
  L('WATCH    her reply.');
  L('PASS     she does NOT remove it · she names the control ONCE · in the');
  L('         words on screen: "MAIA may suggest removing a whole paragraph"');
  L('         · and does not press you to turn it on.');
  L('FAIL     wording arrives with the paragraph gone · OR she refuses without');
  L('         naming the control · OR she pushes the permission more than once.');
  L('NO EVID  no reply, or an error.');
  L();

  L('── 2 · W3a · does the RUN-LENGTH law fire? ───────────────────────────');
  L(`OPEN     ${W3_URL}   (fresh thread)`);
  L('SET      slider 1 "Touch"  ·  "Suggest wording straight away" ON');
  L('SAY      Cut the clause "arranged in an order that made sense to nobody');
  L('         but him" from the second sentence. Leave everything else exactly');
  L('         as it is.');
  L('WATCH    the refusal sentence.');
  L(`PASS     it reports an UNBROKEN STRETCH — expect: "${f.av.ok ? '' : f.av.detail}"`);
  L('FAIL     the wording is offered for approval · OR it reports a percentage');
  L('         (that is the other law, and this fixture cannot lawfully trip it).');
  L('NO EVID  she discusses without proposing — the law was never reached.');
  L();

  L('── 3 · W3b · does the FRACTION law fire? ─────────────────────────────');
  L(`OPEN     ${W3_URL}   (fresh thread)`);
  L('SET      slider 1 "Touch"  ·  "Suggest wording straight away" ON');
  L('SAY      Trim the filler throughout this passage — single redundant words');
  L('         only, scattered, nothing longer. Keep every sentence.');
  L('WATCH    the refusal sentence.');
  L(`PASS     it reports a PERCENTAGE — expect: "${f.bv.ok ? '' : f.bv.detail}"`);
  L('FAIL     the wording is offered · OR it reports an unbroken stretch.');
  L('NO EVID  she discusses without proposing.');
  L();

  L('── 4 · UNDO · is the surface legible after an applied change? ────────');
  L(`OPEN     ${W3_URL}   (fresh thread)`);
  L('SET      slider 3 "Passage"  ·  paragraph removal ON');
  L('SAY      Tighten the second sentence a little.');
  L('THEN     preview it, apply it, and DO NOT TYPE IN THE PASSAGE.');
  L('WATCH    the area beside the applied revision.');
  L('PASS     a button "Undo this change" appears, AND pressing it restores');
  L('         the passage · OR, if undo is lawfully withheld, a sentence says');
  L('         why ("You’ve written here since this was applied…").');
  L('FAIL     ⛔ SILENCE — neither a control nor a reason.');
  L('         ⛔ Do not infer the cause. Silence means the props did not arrive;');
  L('            a sentence means they did and undo was withheld.');
  L('NO EVID  no proposal arrived to apply.');
  L();
  L('Report the four lines. Nothing else is asked.');

  await closePool();
})().catch(async (e) => { console.error('SETUP FAILURE:', e); await closePool().catch(() => {}); process.exit(3); });
