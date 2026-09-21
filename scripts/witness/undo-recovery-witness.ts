/**
 * WRITERS-STUDIO-WITNESS-RECOVERY-01 · UNDO RECOVERY LEGIBILITY WITNESS
 *
 * ⭐⭐ WHAT THIS ESTABLISHES, AND WHAT IT DOES NOT.
 *
 * ESTABLISHES, against a real PostgreSQL and the real modules:
 *   · the four recovery states classify as their named `undoAvailability`;
 *   · the real `RevisionDesk` renders a CONTROL or a REASON in each state,
 *     on both surfaces, and is never silent about an applied revision.
 *
 * ⛔ DOES NOT ESTABLISH that the props arrive in the running application.
 * That is a browser fact and this is not a browser. The founder's own
 * instruction governs: if neither a control nor a reason renders live, the
 * finding stays open as a prop/wiring defect — ⛔ never inferred from absence.
 *
 * ⛔ READ-ONLY WITH RESPECT TO ANY REAL WORK. It demands a disposable
 * DATABASE_URL and refuses to run against anything that looks like production.
 */
import { randomUUID } from 'node:crypto';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { query, closePool } from '@/lib/db/postgres';
import { readApplicationRecovery, classifyUndoAvailability } from '@/lib/manuscript/editorialRuntime/recovery';
import { readEditorialThread } from '@/lib/manuscript/editorialRuntime/thread';
import RevisionDesk from '@/app/writers-studio/insight/RevisionDesk';

type State = 'ok' | 'work_moved' | 'already_undone' | 'no_snapshot';

/* ⛔ THE GUARD IS FIRST AND IS NOT NEGOTIABLE. A witness that can point at
   production is not a witness, it is an incident waiting for a typo. */
const url = process.env.DATABASE_URL ?? '';
if (!url || !/witness|shadow|disposable/i.test(url)) {
  console.error('REFUSED: DATABASE_URL must name a disposable witness database.');
  process.exit(2);
}

const lines: string[] = [];
const say = (s: string) => { lines.push(s); console.log(s); };

/** One complete, self-consistent fixture per state. */
async function seed(state: State) {
  const memberId = randomUUID(), manuscriptId = randomUUID(), chainId = randomUUID();
  const threadId = randomUUID(), draftId = randomUUID(), authId = randomUUID();
  const versionId = randomUUID(), sectionId = randomUUID();
  const BEFORE = 'The original passage, exactly as the author left it.';
  const AFTER = 'The applied passage, exactly as MAIA proposed it.';
  const resulting = 7;
  /* ⭐ work_moved is the ONLY state where the draft has moved past the
     application. Every other difference between fixtures is held constant. */
  const draftVersion = state === 'work_moved' ? resulting + 1 : resulting;

  /* ⭐ The custody chain the schema insists on, and rightly: a draft belongs
     to a manuscript, and a manuscript belongs to a member. ⛔ No shortcut. */
  await query(`INSERT INTO members (id, passkey, username, password_hash) VALUES ($1,$2,$3,'witness')`,
    [memberId, `WITNESS-${memberId.slice(0, 8)}`, `witness_${memberId.slice(0, 8)}`]);
  await query(`INSERT INTO member_manuscripts (id, member_id, title) VALUES ($1,$2,'Witness manuscript')`,
    [manuscriptId, memberId]);
  await query(`INSERT INTO manuscript_working_drafts (id, manuscript_id, member_id, content, base_source_hash, version)
    VALUES ($1,$2,$3,$4,$5,$6)`, [draftId, manuscriptId, memberId, AFTER, 'witness-hash', draftVersion]);
  await query(`INSERT INTO manuscript_draft_sections (id, draft_id, position, text) VALUES ($1,$2,0,$3)`,
    [sectionId, draftId, AFTER]);
  await query(`INSERT INTO proposal_chains (id, member_id, work_id, draft_id, base_version, target_section_id, expected_text)
    VALUES ($1,$2,$3,$4,$5,$6,$7)`, [chainId, memberId, manuscriptId, draftId, resulting - 1, sectionId, BEFORE]);
  await query(`INSERT INTO ask_threads (id, manuscript_id, member_id, canonical_at_open, initiated_by, proposal_chain_id)
    VALUES ($1,$2,$3,'witness','author',$4)`, [threadId, manuscriptId, memberId, chainId]);
  await query(`INSERT INTO proposal_versions (id, chain_id, author, formulation, authored_at)
    VALUES ($1,$2,'maia',$3, now())`, [versionId, chainId, AFTER]);
  await query(`INSERT INTO manuscript_revision_authorizations
      (id, member_id, proposal_chain_id, proposal_version_id, work_id, draft_id, base_version,
       target_section_id, expected_text, accepted_at, resulting_version)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now(), $10)`,
    [authId, memberId, chainId, versionId, manuscriptId, draftId, resulting - 1, sectionId, BEFORE, resulting]);

  if (state !== 'no_snapshot') {
    /* ⚠️ `r.resulting_version` is the version the work returned TO, so the table
       requires it to be present exactly when `undone_at` is. ⛔ Not the same
       column as `a.resulting_version`, which is what the read actually uses. */
    const undoneAt = state === 'already_undone' ? new Date() : null;
    await query(`INSERT INTO manuscript_application_recovery (authorization_id, before_body, after_body, undone_at, resulting_version)
      VALUES ($1,$2,$3,$4,$5)`,
      [authId, BEFORE, AFTER, undoneAt, undoneAt ? resulting + 1 : null]);
  }
  return { memberId, threadId, versionId };
}

/** The real component, both surfaces, at one recovery reading. */
function render(inline: boolean, appliedVersionId: string | null,
                onUndo: (() => void) | undefined, undoAvailability: State) {
  return renderToStaticMarkup(createElement(RevisionDesk as never, {
    inline, manuscriptId: 'witness', title: 'Witness passage', currentText: 'x',
    thread: { threadId: 't', chainId: 'c', locusText: 'x', targetSectionId: 's',
      sectionLabel: null, versions: [], turns: [], headVersionId: null },
    version: null, instruction: '', onInstruction: () => {}, onSend: () => {},
    onSelectVersion: () => {}, onApply: () => {}, onSaveMember: async () => true,
    busy: false, message: null, response: null, onKeep: () => {},
    showInspiration: false, appliedVersionId, onUndo, undoAvailability,
  } as never));
}

const strip = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

(async () => {
  say('WRITERS-STUDIO-WITNESS-RECOVERY-01 · UNDO RECOVERY LEGIBILITY');
  say(`server_encoding=${(await query<{ server_encoding: string }>('SHOW server_encoding')).rows[0]!.server_encoding}`);
  say('');

  let failures = 0;
  for (const state of ['ok', 'work_moved', 'already_undone', 'no_snapshot'] as State[]) {
    const { memberId, threadId, versionId } = await seed(state);
    const rec = await readApplicationRecovery(memberId, threadId);

    if (!rec) { say(`${state}: ⛔ NO RECOVERY ROW READ — fixture or query defect`); failures++; continue; }
    const classified = rec.undoAvailability;
    const agrees = classified === state;
    say(`${state}:`);
    say(`  undoAvailability = ${classified}   canUndo = ${rec.canUndo}   ${agrees ? 'MATCHES' : '⛔ MISMATCH'}`);
    if (!agrees) failures++;
    /* ⭐ canUndo and the reason must not be able to disagree — the desk picks
       the button from one and the sentence from the other. */
    if (rec.canUndo !== (classified === 'ok')) { say('  ⛔ canUndo disagrees with undoAvailability'); failures++; }

    for (const inline of [true, false]) {
      /* ⭐ Exactly what the live client does: the handler exists iff canUndo. */
      const onUndo = rec.canUndo ? () => {} : undefined;
      const text = strip(render(inline, rec.undone ? null : versionId, onUndo, classified));
      const hasControl = text.includes('Undo this change');
      /* ⛔ The silent case is the defect. Either is legible; neither is not. */
      const hasReason = /no longer be undone|already taken back|before the Studio kept/.test(text);
      /* ⭐ An undone application withdraws `appliedVersionId` at the client, so
         the whole block is gone and `undoMessage` speaks instead. ⛔ Recorded
         by name rather than waved through — a blanket escape here would be the
         same silence this witness exists to refuse. */
      const blockWithdrawn = rec.undone;
      const legible = hasControl || hasReason || blockWithdrawn;
      const note = blockWithdrawn && !hasControl && !hasReason
        ? ' (block withdrawn — applied revision no longer shown)' : '';
      say(`  ${inline ? 'inline' : 'page '}: control=${hasControl} reason=${hasReason}${note}${legible ? '' : ' ⛔ SILENT'}`);
      if (!legible) failures++;
    }
    say('');
  }

  /* ⭐⭐ THE LINK THE COMPONENT WITNESS CANNOT SUPPLY: does the payload the
     client actually receives carry the field? The thread route returns
     `read.view` verbatim, so reading the view IS reading the JSON body. */
  {
    const { memberId, threadId } = await seed('work_moved');
    /* ⚠️ It takes a VERIFIED IDENTITY, not a member id — an earlier run of
       this witness passed the string and read `identity.memberId` as undefined,
       which returned `thread_not_found` and looked exactly like a real refusal. */
    const read = await readEditorialThread({ status: 'verified', memberId } as never, threadId);
    if (!read.ok) {
      say(`thread view: ⛔ UNREADABLE (${read.reason}) — payload link NOT witnessed`);
      failures++;
    } else {
      const carried = read.view.application?.undoAvailability;
      const inJson = JSON.parse(JSON.stringify(read.view)).application?.undoAvailability;
      say(`thread view: application.undoAvailability = ${carried} · survives JSON = ${inJson}`);
      if (carried !== 'work_moved' || inJson !== 'work_moved') failures++;
    }
    say('');
  }

  /* ⭐ The pure predicate, exercised where a database cannot reach: the
     no-custody-and-moved case, which must never blame the writer's own hand. */
  const both = classifyUndoAvailability({ hasSnapshot: false, undone: true, currentVersion: 9, resultingVersion: 7 });
  say(`custody absent AND undone AND moved → ${both}${both === 'no_snapshot' ? '' : ' ⛔ EXPECTED no_snapshot'}`);
  if (both !== 'no_snapshot') failures++;

  say('');
  say(failures === 0 ? 'RESULT: PASS · 0 failures' : `RESULT: FAIL · ${failures} failure(s)`);
  await closePool();
  process.exit(failures === 0 ? 0 : 1);
})().catch(async (e) => { console.error('INSTRUMENT FAILURE:', e); await closePool().catch(() => {}); process.exit(3); });
