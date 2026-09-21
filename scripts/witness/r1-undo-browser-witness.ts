/**
 * WRITERS-STUDIO-WITNESS-RECOVERY-01 / R1 · UNDO BROWSER-DELIVERY FIXTURE
 *
 * ⭐⭐ THE ONE UNKNOWN LEFT IN THE UNDO FINDING is whether the props reach the
 * running surface. The server chain is witnessed at `23f1b3ada`; the browser
 * is not, and it is a browser fact.
 *
 * ⭐ IT NEEDS NO MODEL. An applied revision is seeded directly, exactly as the
 * server would have left it, and the desk is asked to render. ⛔ That is why
 * this can run where W4/W3a/W3b cannot: those measure what MAIA says.
 *
 * ⛔ Disposable databases only. Prints the URL and session token for a browser
 * to load, and nothing else.
 */
import { randomUUID } from 'node:crypto';
import { query, closePool } from '@/lib/db/postgres';
import { readApplicationRecovery } from '@/lib/manuscript/editorialRuntime/recovery';

const url = process.env.DATABASE_URL ?? '';
if (!/witness|shadow|disposable/i.test(url)) {
  console.error('REFUSED: DATABASE_URL must name a disposable witness database.');
  process.exit(2);
}

/** ⭐ The state the founder's W6 left behind: applied, untouched, undoable. */
const BEFORE = 'He worked slowly, and he said a joint that was rushed would open again within a year.';
const AFTER  = 'He worked slowly. A rushed joint, he said, would open again within a year.';
const HEADING = 'W3 — scope boundaries';

(async () => {
  const memberId = randomUUID(), manuscriptId = randomUUID(), draftId = randomUUID();
  const sectionId = randomUUID(), sourceId = randomUUID(), chainId = randomUUID();
  const threadId = randomUUID(), versionId = randomUUID(), authId = randomUUID();
  /* ⚠️ `session_token` is varchar(64); two raw uuids are 72 and the insert
     fails on length, not on anything meaningful. Hyphens stripped = exactly 64. */
  const token = (randomUUID() + randomUUID()).replace(/-/g, '');
  const RESULTING = 3;

  await query(`INSERT INTO members (id, passkey, username, password_hash)
    VALUES ($1,$2,$3,'witness')`, [memberId, `W-${memberId.slice(0,8)}`, `w_${memberId.slice(0,8)}`]);
  /* ⭐ A REAL SESSION ROW. ⛔ A bare x-member-id is refused by
     `getMemberIdFromRequest`, and rightly — so the witness authenticates the
     way a browser does rather than around it. */
  await query(`INSERT INTO auth_sessions (id, member_id, session_token, expires_at, revoked)
    VALUES ($1,$2,$3, NOW() + INTERVAL '2 hours', FALSE)`, [randomUUID(), memberId, token]);

  await query(`INSERT INTO member_manuscripts (id, member_id, title)
    VALUES ($1,$2,'Witness — R1 undo browser delivery')`, [manuscriptId, memberId]);

  /* ⛔ Sections first, addressability last: while set, content must be the
     byte-exact flattening. The applied AFTER text is what is in the work. */
  const stored = `${HEADING}\n\n${AFTER}`;
  await query(`INSERT INTO manuscript_working_drafts (id, manuscript_id, member_id, content, base_source_hash, version)
    VALUES ($1,$2,$3,$4,'r1-undo',$5)`, [draftId, manuscriptId, memberId, stored, RESULTING]);
  await query(`INSERT INTO manuscript_sections (id, manuscript_id, position, heading, body)
    VALUES ($1,$2,0,$3,$4)`, [sourceId, manuscriptId, HEADING, AFTER]);
  await query(`INSERT INTO manuscript_draft_sections (id, draft_id, position, text, source_section_id)
    VALUES ($1,$2,0,$3,$4)`, [sectionId, draftId, stored, sourceId]);
  await query(`UPDATE manuscript_working_drafts
    SET section_addressable_at = now(), section_conversion_version = version WHERE id = $1`, [draftId]);

  await query(`INSERT INTO proposal_chains (id, member_id, work_id, draft_id, base_version, target_section_id, expected_text)
    VALUES ($1,$2,$3,$4,$5,$6,$7)`, [chainId, memberId, manuscriptId, draftId, RESULTING - 1, sectionId, BEFORE]);
  await query(`INSERT INTO proposal_versions (id, chain_id, author, formulation, authored_at)
    VALUES ($1,$2,'maia',$3, now())`, [versionId, chainId, AFTER]);
  await query(`INSERT INTO ask_threads (id, manuscript_id, member_id, canonical_at_open, initiated_by, proposal_chain_id)
    VALUES ($1,$2,$3,'witness','author',$4)`, [threadId, manuscriptId, memberId, chainId]);
  await query(`INSERT INTO manuscript_revision_authorizations
      (id, member_id, proposal_chain_id, proposal_version_id, work_id, draft_id, base_version,
       target_section_id, expected_text, accepted_at, resulting_version)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now(), $10)`,
    [authId, memberId, chainId, versionId, manuscriptId, draftId, RESULTING - 1, sectionId, BEFORE, RESULTING]);
  await query(`INSERT INTO manuscript_application_recovery (authorization_id, before_body, after_body)
    VALUES ($1,$2,$3)`, [authId, BEFORE, AFTER]);

  /* ⛔ Assert the fixture is the state we mean BEFORE a browser looks at it.
     A page that renders nothing because the fixture was wrong would be read
     as the defect this witness exists to decide. */
  const rec = await readApplicationRecovery(memberId, threadId);
  if (!rec || rec.undoAvailability !== 'ok' || !rec.canUndo) {
    console.error(`FIXTURE INVALID: ${JSON.stringify(rec)}`);
    await closePool(); process.exit(1);
  }

  console.log(JSON.stringify({
    token, memberId,
    path: `/writers-studio/rebuild?m=${manuscriptId}&s=${sectionId}&editorialThread=${threadId}`,
    undoAvailability: rec.undoAvailability, canUndo: rec.canUndo, versionId,
  }));
  await closePool();
})().catch(async (e) => { console.error('FIXTURE FAILURE:', e); await closePool().catch(() => {}); process.exit(3); });
