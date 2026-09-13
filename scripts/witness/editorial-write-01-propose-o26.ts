/**
 * EDITORIAL-WRITE-01 — create the o26 proposal, and change nothing.
 *
 * ⭐ MAIA / the system may PREPARE a proposal. The member act being proven is
 * the one that comes next:
 *
 *   SEE the exact proposed change  →  ACCEPT CHANGES  →  write authority
 *
 * ── ⛔ WHAT THIS SCRIPT DOES NOT DO ───────────────────────────────────────
 *
 * ⛔ It does not accept anything. The manuscript stays at v34 until the founder
 * clicks. It writes exactly one row into `manuscript_revision_proposals`.
 *
 * ⭐ AND IT REFUSES TO CREATE A PROPOSAL THAT COULD NEVER BE ACCEPTED. The
 * exactly-once check runs BEFORE `proposeRevision`, using the same guard the
 * preview and the acceptance use. A proposal that names nothing, or names two
 * places, would render as `no_longer_matches` the instant it was opened — an
 * offer the member could only decline. Better never made.
 *
 * ── RUN ───────────────────────────────────────────────────────────────────
 *
 *   DATABASE_URL=postgresql://soullab@localhost:5432/maia_focus_witness \
 *     npx tsx scripts/witness/editorial-write-01-propose-o26.ts
 */

import { query } from '@/lib/db/postgres';
import { splitStoredSection } from '@/lib/manuscript/sections/saveSection';
import { occurrences } from '@/lib/manuscript/revisionProposal/contract';
import { proposeRevision } from '@/lib/manuscript/revisionProposal/store';

const WORK = 'a3ae67fd-a21e-4948-8766-4c397d2e4712';
const MEMBER = 'ce284751-e457-42f6-89b6-bc07d0876682';
const TOKEN = 'WITNESS-ALPHA';
/** ⭐ `position` is 0-indexed; the writer's §23 is position 22. */
const POSITION = 22;

const stop = (why: string): never => { console.error(`\n⛔ ${why}`); process.exit(1); };

async function main() {
  console.log('EDITORIAL-WRITE-01 — preparing the o26 proposal\n');

  const d = await query<{ id: string; version: number }>(
    `SELECT id, version FROM manuscript_working_drafts
      WHERE manuscript_id = $1 AND member_id = $2`, [WORK, MEMBER]);
  if (d.rows.length === 0) stop('no working draft for this Work and member');
  const draft = d.rows[0];
  const version = Number(draft.version);
  console.log(`DRAFT      ${draft.id}  ·  version ${version}`);

  /* ⛔ The controlled comparison is v34. A proposal built against anything else
     is a different experiment, and it would be built silently. */
  if (version !== 34) stop(`the Work is at v${version}; this specimen is bound to v34`);

  const s = await query<{ id: string; text: string; heading: string | null }>(
    `SELECT s.id, s.text, ms.heading
       FROM manuscript_draft_sections s
       LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
      WHERE s.draft_id = $1 AND s.position = $2`, [draft.id, POSITION]);
  if (s.rows.length === 0) stop(`no section at position ${POSITION}`);
  const section = s.rows[0];
  console.log(`SECTION    ${section.id}  ·  §${POSITION + 1}` +
    (section.heading ? `  ·  “${section.heading}”` : ''));

  const split = splitStoredSection(section.text, section.heading);
  if (!split) stop('this cut cannot split that section into heading and body');

  /* ⭐⭐ THE SAME GUARD THE PREVIEW AND THE ACCEPTANCE USE. */
  const n = occurrences(split!.body, TOKEN);
  console.log(`TOKEN      ${TOKEN}  ·  ${n} occurrence(s) in the body\n`);
  if (n === 0) stop('the token is not in the current body — nothing to propose');
  if (n > 1) stop(`the token occurs ${n} times — a proposal cannot name one exact place`);

  const proposal = await proposeRevision(MEMBER, {
    workId: WORK,
    draftId: draft.id,
    baseVersion: version,
    targetSectionId: section.id,
    expectedText: TOKEN,
    /* ⛔ The empty string. Nothing replaces it; the characters simply go. */
    replacementText: '',
  });

  console.log(`PROPOSAL   ${proposal.id}`);
  console.log(`           delete_exact_text · against v${proposal.baseVersion}`);
  console.log(`           accepted_at ${proposal.acceptedAt ?? 'null'}` +
    `  ·  resulting_version ${proposal.resultingVersion ?? 'null'}\n`);

  console.log('⭐ OPEN THIS, with WRITERS_STUDIO_WRITE_ENABLED=1 on the server:\n');
  console.log(`   http://localhost:3100/writers-studio/canvas` +
    `?m=${WORK}&proposal=${proposal.id}\n`);
  console.log('⛔ The manuscript is still at v34. Nothing changes until you accept.');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
