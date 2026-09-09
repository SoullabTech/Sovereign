/**
 * WS-WHOLE-MANUSCRIPT-01 · the falsifier's subject, seeded.
 *
 * One synthetic member, one Work of 262 sections, addressable — the smallest
 * world in which the eleven machine checks can mean anything.
 *
 * ⛔ IT REFUSES RATHER THAN TRUSTS. This script writes rows; the one thing that
 * must never happen is that it writes them somewhere real. So it does not
 * assume `run.sh` set the environment correctly — it re-establishes the fact
 * itself, from the connection string, and exits non-zero if the database it was
 * handed is not the ephemeral one the harness just created.
 *
 * ⛔ NO AUTH BYPASS. The member is written with the application's own password
 * hasher and then signs in through `/api/members/signin` like anyone else. A
 * harness that forged a session would be proving the surface works for a
 * request the product cannot actually receive.
 */

import { createHash } from 'node:crypto';
import { Client } from 'pg';
import { hashPassword } from '@/lib/auth/passwordUtils';
import {
  DRAFT_ID, MANUSCRIPT_ID, MEMBER_ID, PASSKEY, PASSWORD, SECTION_COUNT,
  USERNAME, bodyFor, draftSectionId, flattenedContent, headingFor,
  sourceSectionId, storedTextFor,
} from './fixture';

const url = process.env.DATABASE_URL ?? '';

/* The harness builds its cluster under a run directory named `wm-falsifier.<pid>`
   and connects over that directory as a unix socket. Anything else — a TCP
   host, a different socket, an empty value — is refused here, unconditionally. */
if (!/wm-falsifier\.\d+/.test(url)) {
  console.error('⛔ DATABASE_URL is not this harness\'s ephemeral socket — refusing to seed.');
  console.error('   The falsifier never writes to a database it did not create.');
  process.exit(1);
}

async function main() {
  const db = new Client({ connectionString: url });
  await db.connect();

  const sourceText = Array.from({ length: SECTION_COUNT }, (_, i) => bodyFor(i)).join('\n\n');
  /* The flattening, not a join. The database refuses anything else while the
     draft is section-addressable, and it is right to. */
  const draftContent = flattenedContent();
  const baseSourceHash = createHash('sha256').update(sourceText).digest('hex');

  await db.query('BEGIN');

  await db.query(
    `INSERT INTO members (id, passkey, username, password_hash, name, onboarded,
                          onboarding_step, password_algo)
     VALUES ($1, $2, $3, $4, $5, true, 'complete', 'bcrypt')`,
    [MEMBER_ID, PASSKEY, USERNAME, await hashPassword(PASSWORD), 'Whole Manuscript Falsifier'],
  );

  await db.query(
    `INSERT INTO member_manuscripts (id, member_id, title, provenance, source_custody)
     VALUES ($1, $2, $3, 'member_written', 'source_custodied')`,
    [MANUSCRIPT_ID, MEMBER_ID, 'The Falsifier\'s Book'],
  );

  /* Source first: the draft sections carry `source_section_id` as provenance,
     and the heading the editor is named by is read back through it. */
  for (let i = 0; i < SECTION_COUNT; i++) {
    await db.query(
      `INSERT INTO manuscript_sections (id, manuscript_id, position, heading, body)
       VALUES ($1, $2, $3, $4, $5)`,
      [sourceSectionId(i), MANUSCRIPT_ID, i, headingFor(i), bodyFor(i)],
    );
  }

  /* `section_addressable_at` is what makes the write-state resolve
     `section_aware`; without it the canvas mounts the continuous Worktable and
     the Whole Manuscript surface never exists to be falsified. */
  await db.query(
    `INSERT INTO manuscript_working_drafts
       (id, manuscript_id, member_id, content, base_source_hash,
        revision_count, version, section_addressable_at)
     VALUES ($1, $2, $3, $4, $5, 1, 1, now())`,
    [DRAFT_ID, MANUSCRIPT_ID, MEMBER_ID, draftContent, baseSourceHash],
  );

  /* Revision 1 is the durable baseline the manuscripts API compares the live
     draft against. Seeding it identical to the draft is the honest state for a
     Work nobody has yet written into. */
  await db.query(
    `INSERT INTO working_draft_revisions (draft_id, revision_number, content, saved_by)
     VALUES ($1, 1, $2, $3)`,
    [DRAFT_ID, draftContent, MEMBER_ID],
  );

  for (let i = 0; i < SECTION_COUNT; i++) {
    await db.query(
      `INSERT INTO manuscript_draft_sections (id, draft_id, position, text, source_section_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [draftSectionId(i), DRAFT_ID, i, storedTextFor(i), sourceSectionId(i)],
    );
  }

  await db.query('COMMIT');

  /* ⛔ Seeding is not the same as being loadable. Assert the shape the surface
     will actually ask for, here, where a failure is legible — rather than
     letting it surface later as a browser check failing for a reason that has
     nothing to do with the view under test. */
  const { rows } = await db.query<{ n: string; editable: string }>(
    `SELECT count(*)::text AS n,
            count(*) FILTER (WHERE s.text LIKE ms.heading || E'\\n\\n%')::text AS editable
       FROM manuscript_draft_sections s
       JOIN manuscript_sections ms ON ms.id = s.source_section_id
      WHERE s.draft_id = $1`, [DRAFT_ID]);

  await db.end();

  const n = Number(rows[0].n);
  const editable = Number(rows[0].editable);
  if (n !== SECTION_COUNT || editable !== SECTION_COUNT) {
    console.error(`⛔ seed shape wrong: ${n} sections, ${editable} editable (expected ${SECTION_COUNT}/${SECTION_COUNT})`);
    process.exit(1);
  }
  console.log(`      seeded: 1 member · 1 Work · ${n} sections, all editable`);
}

main().catch((e) => { console.error(e); process.exit(1); });
