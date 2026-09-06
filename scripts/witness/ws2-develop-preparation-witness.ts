/**
 * DEVELOP PREPARATION WITNESS — read-only by default.
 *
 *   DATABASE_URL=postgres://... npx tsx scripts/witness/ws2-develop-preparation-witness.ts \
 *     <manuscriptId> [--expect-sha <sha>] [--after] [--apply]
 *
 * THREE MODES, ONE SUBJECT.
 *
 *   (default)  PREFLIGHT — what state the Work is in and what would happen.
 *              Opens no transaction and issues no INSERT or UPDATE.
 *   --after    POST-ACT — the invariants that must hold once the member has
 *              pressed Prepare. Also read-only: the member's gesture is the
 *              act of record, and a witness that performed it would be
 *              witnessing itself.
 *   --apply    Performs the preparation through the canonical WS2-04A service
 *              under MECHANICAL authority. For a scratch database, or where
 *              no member UI is in the loop. Announced, never default.
 *
 * ⛔ SUBJECT DRIFT IS INVALID, NOT FAILED. When `--expect-sha` pins the
 * production image, the SHA is read before and after. If it moved, the run
 * describes two different systems and its verdict is void — it exits INVALID
 * rather than reporting a pass or a fail over a subject that changed
 * underneath it.
 *
 * ⛔ NO MODEL PARTICIPATES, IN ANY MODE. The ceiling assertion calls the
 * reader's own `validateRequest`, which runs BEFORE `runStructured` — so the
 * refusal is the genuine one from the genuine validator, produced without an
 * inference call, without a commissioned reading and without a stored row.
 *
 * WHAT IT PRINTS. Structural counts, digests and identifiers. Never a line of
 * the member's prose.
 */

import { execSync } from 'child_process';
import { createHash } from 'crypto';

const SHA_CMD_DEFAULT = "ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'";

let checks = 0; let failures = 0;
function check(id: string, ok: boolean, detail = ''): void {
  checks += 1;
  if (ok) console.log(`  ✓ ${id}`);
  else { failures += 1; console.log(`  ✗ ${id}${detail ? ` — ${detail}` : ''}`); }
}
const row = (label: string, value: unknown) => console.log(`  ${label.padEnd(30)}${value}`);
const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

/** The live image's commit, or null when it cannot be read. Never fatal here. */
function readSha(cmd: string): string | null {
  try { return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null; }
  catch { return null; }
}

async function main() {
  const args = process.argv.slice(2);
  const manuscriptId = args.find((a) => !a.startsWith('--'));
  const after = args.includes('--after');
  const apply = args.includes('--apply');
  const expectSha = args[args.indexOf('--expect-sha') + 1];
  const pinned = args.includes('--expect-sha') && Boolean(expectSha) && !expectSha.startsWith('--');
  const shaCmd = process.env.WITNESS_SHA_CMD ?? SHA_CMD_DEFAULT;

  if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is required'); process.exit(2); }
  if (!manuscriptId) { console.error('usage: … <manuscriptId> [--expect-sha <sha>] [--after] [--apply]'); process.exit(2); }
  if (after && apply) { console.error('--after and --apply are different runs; pass one'); process.exit(2); }

  const { query } = await import('@/lib/db/postgres');
  const { resolveDevelopPreparation } = await import('@/lib/manuscript/development/preparation');
  const { DEVELOPMENTAL_READ_CEILING_CODE_POINTS } = await import('@/lib/manuscript/developmentalReader/contract');

  /* ── SUBJECT ─────────────────────────────────────────────────────────── */
  console.log('\nSUBJECT');
  const shaPre = pinned ? readSha(shaCmd) : null;
  if (pinned) {
    row('production GIT_COMMIT pre', shaPre ?? '(unreadable)');
    row('expected SHA', expectSha);
    if (shaPre === null) { console.log('\nINVALID — the live commit could not be read; the subject is not established.'); process.exit(3); }
    if (shaPre !== expectSha) { console.log(`\nINVALID — live commit ${shaPre} is not the named subject ${expectSha}.`); process.exit(3); }
  } else {
    row('production GIT_COMMIT', '(unpinned — pass --expect-sha to bind the subject)');
  }
  row('manuscript', manuscriptId);
  row('mode', apply ? 'APPLY (writes)' : after ? 'POST-ACT (read-only)' : 'PREFLIGHT (read-only)');

  const owner = await query<{ member_id: string; title: string | null }>(
    `SELECT member_id, title FROM member_manuscripts WHERE id = $1`, [manuscriptId]);
  if (owner.rows.length === 0) { console.log('\nINVALID — no such Work.'); process.exit(3); }
  const memberId = owner.rows[0].member_id;
  row('work', owner.rows[0].title ?? '(untitled)');

  /* ── STATE ───────────────────────────────────────────────────────────── */
  const state = await resolveDevelopPreparation(manuscriptId, memberId);
  console.log('\nPREPARATION');
  row('kind', state.kind);
  if (state.kind === 'exact' || state.kind === 'diverged' || state.kind === 'unresolvable') {
    row('classification', state.divergence.classification);
    row('boundaries', `${state.divergence.resolved} / ${state.divergence.boundaries}`);
    row('heading differences', state.divergence.headingsChanged);
    row('body line differences', state.divergence.bodyLinesChanged);
    row('source sections', state.sourceSections);
    row('authority', state.kind === 'exact' ? 'mechanical (PRISTINE)'
      : state.kind === 'diverged' ? 'member confirmation' : 'none — not offered');
    /* ⛔ THE DISTINCTION SURVIVES INTO THE RECORD, not only into the code.
       Founder ruling (2026-09-06). A witness that printed "mechanical" and
       nothing else would leave the reader to supply the meaning, and the
       meaning most readers supply is consent — the exact reading the ruling
       removes. On an exact Work the member's gesture INITIATES a structural
       preparation whose truth is already established; it is not their
       agreement to a transformation anyone disputes. Said here so a run
       filed as evidence cannot be read the other way. */
    if (state.kind === 'exact') {
      console.log('    ⓘ The member INITIATES this preparation. It is not consent to a disputed');
      console.log('      transformation: the draft is byte-identical to what its Source composes,');
      console.log('      and the round trip proves the partition rather than asking them to.');
    }
    if (state.kind === 'diverged') {
      console.log('    ⓘ The member CONFIRMS this conversion. Their agreement to the divergence');
      console.log('      shown above is the authority; nothing here is mechanically established.');
    }
  }
  if (state.kind === 'ready') row('draft sections', state.draftSections);

  const draftRow = async () => (await query<{
    id: string; content: string; version: string; section_addressable_at: Date | null; n: string;
  }>(
    `SELECT d.id, d.content, d.version, d.section_addressable_at,
            (SELECT count(*) FROM manuscript_draft_sections s WHERE s.draft_id = d.id)::text AS n
       FROM manuscript_working_drafts d WHERE d.manuscript_id = $1 AND d.member_id = $2`,
    [manuscriptId, memberId])).rows[0] ?? null;

  const before = await draftRow();
  console.log(`\n${after ? 'DRAFT' : 'BEFORE'}`);
  if (!before) { console.log('  (no working draft)'); }
  else {
    row('draft sections', before.n);
    row('draft content digest', sha256(before.content).slice(0, 16));
    row('draft version', before.version);
    row('section_addressable_at', before.section_addressable_at ? before.section_addressable_at.toISOString() : 'null');
    row('draft characters', before.content.length);
  }

  /* ── APPLY (only when asked) ─────────────────────────────────────────── */
  if (apply) {
    if (state.kind !== 'exact') { console.log(`\nINVALID — --apply carries MECHANICAL authority and this Work is ${state.kind}.`); process.exit(3); }
    const { convertDraftToSections } = await import('@/lib/manuscript/sections/convertDraft');
    console.log('\nAPPLYING — canonical WS2-04A conversion, mechanical authority');
    const r = await convertDraftToSections(manuscriptId, memberId, {
      authority: 'mechanical', stateDigest: state.stateDigest,
    });
    row('status', r.status);
    if (r.refusal) row('refusal', `${r.refusal}${r.detail ? ` — ${r.detail}` : ''}`);
    check('APPLY converted the draft', r.status === 'converted', r.refusal);
  }

  /* ── POST-ACT INVARIANTS ─────────────────────────────────────────────── */
  if (after || apply) {
    const now = await draftRow();
    console.log('\nAFTER');
    if (!now) { check('a working draft exists', false); }
    else {
      const sections = await query<{ text: string; source_section_id: string | null; position: number }>(
        `SELECT text, source_section_id, position FROM manuscript_draft_sections
          WHERE draft_id = $1 ORDER BY position ASC`, [now.id]);
      const sourceIds = await query<{ id: string }>(
        `SELECT id FROM manuscript_sections WHERE manuscript_id = $1 ORDER BY position ASC`, [manuscriptId]);
      const revision = await query<{ content: string; revision_number: number; has_partition: boolean }>(
        `SELECT content, revision_number, section_partition IS NOT NULL AS has_partition
           FROM working_draft_revisions
          WHERE draft_id = $1 AND note = 'Section conversion'
          ORDER BY revision_number DESC LIMIT 1`, [now.id]);

      const flattened = sections.rows.map((r) => r.text).join('');
      row('draft sections', sections.rows.length);
      row('source sections', sourceIds.rows.length);
      row('section_addressable_at', now.section_addressable_at ? now.section_addressable_at.toISOString() : 'null');
      row('flattened digest', sha256(flattened).slice(0, 16));
      row('draft content digest', sha256(now.content).slice(0, 16));

      check('the draft is section-addressable', now.section_addressable_at !== null);
      check('every Source section has a draft section',
        sections.rows.length === sourceIds.rows.length,
        `${sections.rows.length} vs ${sourceIds.rows.length}`);
      check('every draft section carries its Source provenance',
        sections.rows.every((r) => r.source_section_id !== null));
      check('the Source ids represented are exactly the Source ids',
        new Set(sections.rows.map((r) => r.source_section_id)).size === sourceIds.rows.length
        && sections.rows.every((r) => sourceIds.rows.some((s) => s.id === r.source_section_id)));
      check('positions are contiguous from zero',
        sections.rows.every((r, i) => r.position === i));

      /* ⛔ THE PROMISE THE CONVERSION MADE. Not "close", not "equivalent":
         the sections must reconstruct the draft byte for byte, and the
         pre-conversion revision must hold those same bytes. */
      check('the sections flatten to the draft exactly', flattened === now.content,
        `${flattened.length} vs ${now.content.length} chars`);
      check('a conversion revision was recorded', revision.rows.length > 0);
      check('the conversion revision holds the draft bytes exactly',
        revision.rows.length > 0 && revision.rows[0].content === now.content);
      /* ⛔ THE SECOND WALL. Capture freezes from the LATEST revision and
         refuses `partition_not_recorded` when it carries no boundaries. A
         conversion that records none leaves the Work prepared and unreadable. */
      check('the conversion revision records its partition',
        revision.rows.length > 0 && revision.rows[0].has_partition === true);
      const newest = await query<{ note: string | null; has_partition: boolean }>(
        `SELECT note, section_partition IS NOT NULL AS has_partition
           FROM working_draft_revisions WHERE draft_id = $1
          ORDER BY revision_number DESC LIMIT 1`, [now.id]);
      check('the NEWEST revision — the one capture reads — records a partition',
        newest.rows[0]?.has_partition === true,
        `newest note=${newest.rows[0]?.note ?? 'none'}`);

      const post = await resolveDevelopPreparation(manuscriptId, memberId);
      check('preparation now reports ready',
        post.kind === 'ready' && post.draftSections === sourceIds.rows.length, post.kind);
    }

    /* ── THE NEXT SEAM, NAMED RATHER THAN LAUNDERED ───────────────────── */
    console.log('\nDEVELOP CAPTURE');
    const addressable = await query<{ id: string }>(
      /* The readings route's own query, verbatim — what `not_readable` is
         decided by. Proving it here proves the defect this unit claimed to
         close is closed, in the exact terms the refusal is issued in. */
      `SELECT s.id
         FROM manuscript_draft_sections s
         JOIN manuscript_working_drafts d ON d.id = s.draft_id
         JOIN member_manuscripts m ON m.id = d.manuscript_id
        WHERE d.manuscript_id = $1 AND m.member_id = $2
          AND d.section_addressable_at IS NOT NULL
        ORDER BY s.position ASC`,
      [manuscriptId, memberId]);
    row('addressable section ids', addressable.rows.length);
    check('capture would NOT refuse not_readable', addressable.rows.length > 0);

    /* The ceiling, from the reader's OWN validator. `validateRequest` runs
       before `runStructured`, so this is the genuine refusal produced without
       an inference call, a commissioned reading or a stored row. */
    const { captureEvidence, loadRevisionContent } = await import('@/lib/manuscript/development/capture');
    const { recoverEvidence } = await import('@/lib/manuscript/development/resolve');
    const { validateRequest } = await import('@/lib/manuscript/developmentalReader/validate');
    type RecoveredBody = import('@/lib/manuscript/developmentalReader/contract').RecoveredBody;

    const cap = await captureEvidence(manuscriptId, memberId, {
      bodyScope: addressable.rows.map((r) => r.id), withStructure: false,
    });
    if (!cap.ok) {
      check('evidence captured for the whole draft', false, `${cap.refusal} — ${cap.detail}`);
    } else {
      const evidence = cap.value;
      const content = await loadRevisionContent(
        evidence.readState.draftId, evidence.readState.revisionNumber);
      if (content === null) {
        check('the kept revision could be recovered', false);
      } else {
        /* Built exactly as `commissionReading` builds it — same capture, same
           recovery, same order — so the validator sees the request the reader
           would have seen and nothing standing in for it. */
        const recovered: RecoveredBody[] = [];
        for (const id of addressable.rows.map((r) => r.id)) {
          const r = recoverEvidence({ kind: 'section', sectionId: id }, evidence.readState, content);
          if (r.ok && r.value.kind === 'text') recovered.push(r.value);
        }
        const verdict = validateRequest({ commissionedLens: 'development', evidence, recovered });
        row('ceiling (code points)', DEVELOPMENTAL_READ_CEILING_CODE_POINTS);
        row('validator verdict', verdict.ok ? 'within ceiling' : verdict.refusal);
        /* EXPECTED, not a failure. A whole-Work read of a long book is a
           DIFFERENT dimension of readability from a partitioned draft, and
           conflating the two would let this unit claim a capability it never
           built — or report its own success as a failure. */
        if (!verdict.ok && verdict.refusal === 'ceiling_exceeded') {
          console.log('  ⓘ whole-work read refuses ceiling_exceeded — EXPECTED for this Work.');
          console.log('    Preparation made the draft section-addressable; it did not make a');
          console.log('    381k-character book readable in one sitting. Scoped reading is a');
          console.log('    separate unit and is not claimed here.');
        }
      }
    }
  }

  /* ── VERDICT ─────────────────────────────────────────────────────────── */
  if (pinned) {
    const shaPost = readSha(shaCmd);
    if (shaPost !== shaPre) {
      console.log(`\nINVALID — the live commit moved during the run (${shaPre} → ${shaPost ?? 'unreadable'}).`);
      process.exit(3);
    }
  }

  if (!after && !apply) {
    console.log('\nRESULT                        READY TO WITNESS');
    console.log('WRITES                        NONE');
    process.exit(0);
  }
  console.log(`\n${checks} check(s) · ${failures} failure(s)`);
  console.log(apply ? 'WRITES                        the conversion, as announced' : 'WRITES                        NONE');
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
