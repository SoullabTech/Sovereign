#!/usr/bin/env node
/**
 * WS-DELETE-01 · R-SHARED — the defeat-candidate (mutation) runner for the Work-card Delete surface.
 *
 * A passing suite proves nothing about its own strength. Each entry below is a plausible, WRONG version of one decision in the
 * code (the smallest edit that embodies a named error). The runner applies it, runs the tests that are meant to catch it, and
 * restores the file. A mutant that is not killed means the suite cannot tell the right code from the wrong code: the SUITE is
 * repaired (never the mutant narrowed until it dies for the wrong reason).
 *
 *   node tests/constitutional/ws-delete/mutants/run.mjs               # every mutant (jest ones, then PostgreSQL ones)
 *   node tests/constitutional/ws-delete/mutants/run.mjs --jest-only
 *   node tests/constitutional/ws-delete/mutants/run.mjs --pg-only     # needs the local PG16 harness (root, postgres binaries)
 *   node tests/constitutional/ws-delete/mutants/run.mjs L1 H3         # by id
 *   node tests/constitutional/ws-delete/mutants/run.mjs --list
 *   node tests/constitutional/ws-delete/mutants/run.mjs --check       # only verify every anchor is found, run nothing
 *
 * Exit 0 only when every selected mutant was KILLED. The unmutated suite must be GREEN first (a red baseline would make every
 * mutant look killed). A kill counts only when a failing test assertion was actually parsed from the output: SETUP-ERROR (anchor not
 * found as asked), COMPILE-ERROR (the mutant broke the build) and UNPROVEN (non-zero exit but no failing test seen) all fail the run.
 * The runner refuses to start while a .mutbak from an earlier, killed run exists.
 * Every file is restored in a finally block and on SIGINT/SIGTERM. Fictional data only; nothing here touches a real database.
 */
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, copyFileSync, renameSync, mkdtempSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const HOME = 'app/dev/writers-studio-pc3-live';
const VIEW = `${HOME}/P4R1HomeView.tsx`;
const CTRL = `${HOME}/P4R1HomeController.tsx`;
const DOOR = `${HOME}/useWorkDeleteDoor.tsx`;
const LIB = 'lib/writersStudio/deleteWork.ts';
const ERASE = 'lib/manuscript/source/eraseManuscript.ts';
const ROUTE = 'app/api/sovereign/manuscripts/[id]/route.ts';
const MIG_CORRECTIONS = 'database/migrations/20260929000004_writer_studio_corrections.sql';
const MIG_UNDERSTANDING = 'database/migrations/20260929000001_writer_understanding.sql';
const JEST_TESTS = [
  `${HOME}/__tests__/homeWorkDeleteSharedAndCustody.test.ts`,
  `${HOME}/__tests__/homeWorkDeleteRound2.test.ts`,
  `${HOME}/__tests__/homeDeleteWriting.test.ts`,
  `${HOME}/__tests__/historyPage.test.tsx`,
  `${HOME}/__tests__/historyContainerAndNotices.test.ts`,
  `${HOME}/__tests__/homeHistoryNotices.test.ts`,
  'cabinBranch.test.ts',
  'app/writers-studio/__tests__/historyActions.test.ts',
  'lib/writersStudio/__tests__/deleteWork.test.ts',
  'lib/writersStudio/__tests__/deleteWorkTruth.test.ts',
  'lib/writersStudio/__tests__/removalCopyDrift.test.ts',
  'app/writers-studio/__tests__/listReloadReports.test.ts',
  'deleteWorkParam.test.ts',
  'deleteRoute.test.ts',
  'eraseManuscriptGuard.test.ts',
  // WS-DELETE-01 follow-up (Remove / X8 deletion record, corrected Remove copy): the two suites written for it. Without them in this
  // closed list no jest candidate could be killed by them, and the source-law and copy-law candidates below would all look alive.
  'lib/manuscript/source/__tests__/workDeletionRecord.test.ts',
  'lib/writersStudio/__tests__/removeCopyConversations.test.ts',
  // WS-DELETE-01 retained editorial threads (2026-11-08): the orphaned-origin gate's two hermetic suites (also run alone as kind 'jestog').
  'lib/manuscript/editorialRuntime/__tests__/orphanedOriginGate.test.ts',
  'app/api/writers-studio/editorial/adoption/__tests__/originUnavailable.test.ts',
];
const PG_RUN = 'tests/constitutional/ws-delete/dynamic/run-local-pg16.sh';
// The orphaned-origin gate has its own two kinds so its candidates run only its own suites: 'jestog' = its two hermetic suites,
// 'pgog' = the retained-editorial PostgreSQL probe with its own runner.
const OG_JEST = [
  'lib/manuscript/editorialRuntime/__tests__/orphanedOriginGate.test.ts',
  'app/api/writers-studio/editorial/adoption/__tests__/originUnavailable.test.ts',
];
const PG_RUN_OG = 'tests/constitutional/ws-delete/dynamic/run-retained-editorial-pg16.sh';
const OG_ORPHAN = 'lib/writers-studio/orphanedEditorialOrigin.ts';
const OG_ADOPT = 'lib/manuscript/editorialRuntime/adoption.ts';
const OG_LIST = 'lib/manuscript/editorialRuntime/relationships.ts';
const OG_ADOPT_ROUTE = 'app/api/writers-studio/editorial/adoption/route.ts';
const OG_UNDO = 'lib/manuscript/editorialRuntime/recovery.ts';
const OG_ASK = 'app/api/sovereign/manuscripts/[id]/ask/route.ts';
const HISTORY = `${HOME}/P4R1HistoryPage.tsx`;
const HISTORY_RULE = 'app/writers-studio/historyActions.ts';
const WORK_ROUTE = 'app/api/sovereign/living-works/[id]/route.ts';
const LOAD_WORKS = 'app/writers-studio/useLivingWorks.ts';
const LOAD_MS = 'app/writers-studio/useCurrentManuscript.ts';
const LOAD_HISTORY = 'app/writers-studio/useStudioHistory.ts';
const NOTICES = `${HOME}/useNoticeStack.tsx`;
const HISTORY_ROUTE = 'app/api/sovereign/studio/history/route.ts';
const HELPER = 'lib/manuscript/source/workDeletionRecord.ts';

/* ── building blocks for the follow-up candidates (RR / XR / HX / CX at the end of MUTANTS) ───────────────────────────────────────────
   `L` joins lines so a multi-line anchor can be written without escaping the template literals the SQL lives in.
   `twin` emits one candidate as a jest (hermetic) kind and as a physical PostgreSQL twin (`<id>p`): the same wrong code, judged by the
   other instrument. The jest kind is what runs in every ordinary test run; the twin is what shows the database actually refusing it. */
const L = (...lines) => lines.join('\n');
const twin = (id, file, anchor, replacement, why, opts, jestWhy = why) => [
  [id, 'jest', file, anchor, replacement, jestWhy, ...(opts ? [opts] : [])],
  [`${id}p`, 'pg', file, anchor, replacement, `${why} [physical twin of ${id}]`, ...(opts ? [opts] : [])],
];
/** A record written WITHOUT the shared helper: the wrong spelling a caller that did not call writeWorkDeletionRecord might produce. */
const inlineRecord = ({ indent, idExpr, note, reason = 'member_deletion', by = 'verified-member-self-service', kind = 'living_works', tombstone = true }) => {
  const lines = [
    'const inlineManifest = await tx.query<{ id: string }>(',
    `  \`INSERT INTO deletion_manifests (reason_class, authorized_by, executed_at, note) VALUES ('${reason}', '${by}', now(), $1) RETURNING id\`,`,
    `  ['${note}'],`,
    ');',
  ];
  if (tombstone) {
    lines.push(
      'await tx.query(',
      `  \`INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id) VALUES ($1::uuid, '${kind}', $2) ON CONFLICT (object_kind, object_id) DO NOTHING\`,`,
      `  [inlineManifest.rows[0].id, ${idExpr}],`,
      ');',
    );
  }
  return lines.map((l) => ' '.repeat(indent) + l).join('\n');
};
// The Remove route (WORK_ROUTE) as it now reads, in the pieces the Remove candidates cut at.
const RM_NOTE = 'Writer Work removed by verified member request';
const RM_LOCK = '      await takeRecoveryCaptureLock(tx);';
const RM_OWNED = L(
  '      const owned = await tx.query<{ id: string }>(',
  '        `SELECT id FROM living_works WHERE id = $1 AND member_id = $2 FOR UPDATE`,',
  '        [id, memberId],',
  '      );',
  '      if (owned.rows.length === 0) return null;',
);
const RM_VISUAL = L(
  '      const visual = await tx.query<{ storage_path: string }>(',
  '        `SELECT storage_path FROM living_work_visuals WHERE living_work_id = $1 AND member_id = $2 FOR UPDATE`,',
  '        [id, memberId],',
  '      );',
);
const RM_DELETE = L(
  '      const gone = await tx.query<{ id: string }>(',
  '        `DELETE FROM living_works WHERE id = $1 AND member_id = $2 RETURNING id`,',
  '        [id, memberId],',
  '      );',
);
const RM_GONE_GUARD = '      if (gone.rows.length === 0) return null;';
const RM_RECORD_COMMENT = L(
  '      /* The record of the removal, written only now that THIS statement really deleted the row (a lost race writes nothing), with the',
  '         id the DELETE returned and not the one from the URL. Same transaction: if it cannot be written the Work is not removed. */',
);
const RM_CALL = `      await writeWorkDeletionRecord(tx, gone.rows[0].id, '${RM_NOTE}');`;
const RM_TAIL = L(
  '      const path = visual.rows[0]?.storage_path;',
  '      let queueId: string | null = null;',
  '      if (path) {',
  '        const queued = await tx.query<{ id: string }>(',
  '          `INSERT INTO vault_erasure_queue (artifact_ref) VALUES ($1) RETURNING id`,',
  '          [path],',
  '        );',
  '        queueId = queued.rows[0]?.id ?? null;',
  '      }',
  '      return { id: gone.rows[0].id, queueId };',
  '    });',
  '',
  '    if (!removed) {',
  "      return NextResponse.json({ error: 'Not found' }, { status: 404 });",
  '    }',
);
// X8 (ERASE), the call inside the viaWorkId branch.
const X8_NOTE = 'Writer Work ended after its writing was already gone, by verified member request';
const X8_CALL = `          await writeWorkDeletionRecord(tx, cleaned.workRemovedId, '${X8_NOTE}');`;

/* [id, kind, file, anchor (must occur exactly once, or `nth` of several), replacement, the error it embodies, { nth }?]
   kind: 'jest' (hermetic, jsdom) or 'pg' (needs the local PostgreSQL 16 harness). A '(textual guard)' mutant is caught only by a test that
   reads the source text: it is a guard against regression of a structure, not a proof of behaviour, and is labelled so. */
const MUTANTS = [
  // ── the command (lib/writersStudio/deleteWork.ts)
  ['L1', 'jest', LIB, '${workId ? `?workId=${encodeURIComponent(workId)}` : \'\'}', '', 'the Work card stops naming its Work, so a stale card can reach another Work\'s writing'],
  ['L2', 'jest', LIB, '  if (res.status === 404) return viaWorkRoute ? { ok: true, workRemoved: true } : { ok: true, alreadyGone: true };\n', '', 'a writing that is already gone (404) is reported as a failed delete'],
  ['L3', 'jest', LIB, '{ subject, ...(body.unconfirmed ? { unconfirmed: body.unconfirmed } : {}) }', '{ subject }', 'the obligations the server named are dropped, so every custody sentence names things that are not owed'],
  ['L4', 'jest', LIB, 'if (res.status >= 500) return { ok: false, message: UNKNOWN_DELETE, unknown: true };\n  return { ok: false, message: GENERIC };', 'if (res.status >= 500) return { ok: false, message: GENERIC };\n  return { ok: false, message: GENERIC };', 'a server error that does not say what it did is reported as "nothing was removed"'],
  ['L5', 'jest', LIB, '    // The request may have reached the server before the connection failed: we do not know.\n    return { ok: false, message: UNKNOWN_DELETE, unknown: true };', '    return { ok: false, message: GENERIC };', 'a dropped connection is reported as "nothing was removed"'],
  ['L6', 'jest', LIB, 'if (res.status >= 500) return { ok: false, message: REMOVE_UNKNOWN, unknown: true };', 'if (res.status >= 500) return { ok: false, message: REMOVE_GENERIC };', 'a removal whose outcome is unknown is reported as "nothing changed"'],
  ['L7', 'jest', LIB, '  if (res.status === 401) return { ok: false, message: SESSION_ENDED_DELETE };\n', '', 'an ended session is told to "try again"'],
  ['L8', 'jest', LIB, 'REFUSED_BEFORE_ANY_ACT.has(refusal)) return { ok: false, message: deletionRefusalCopy(refusal), refusal };', 'REFUSED_BEFORE_ANY_ACT.has(refusal)) return { ok: false, message: deletionRefusalCopy(refusal) };', 'the refusal classification is dropped, so shared writing cannot be told from any failure'],
  ['L8b', 'jest', LIB, "new Set(['declared_in_other_works', 'work_no_longer_holds_it'])", "new Set(['declared_in_other_works'])", 'a stale-card refusal is not recognised as a refusal before any act'],
  ['L9', 'jest', LIB, "if (outcome.refusal === 'declared_in_other_works') {", 'if (outcome.refusal) {', 'every refusal opens the "keep the writing" question'],
  ['L10', 'jest', LIB, 'if (outcome.removed) { const fresh = await refreshed(refresh); throw new DeletionUnconfirmed(withReload(outcome.message, fresh), outcome.workRemoved); }', 'if (outcome.removed) { throw new DeletionUnconfirmed(outcome.message, outcome.workRemoved); }', 'the page is not re-read after a Delete that committed'],
  ['L10b', 'jest', LIB, 'if (outcome.removed) { const fresh = await refreshed(refresh); throw new DeletionUnconfirmed(withReload(outcome.message, fresh), true); }', 'if (outcome.removed) { throw new DeletionUnconfirmed(outcome.message, true); }', 'the page is not re-read after a Remove that committed'],
  ['L10c', 'jest', LIB, 'throw new DeletionUnconfirmed(withReload(outcome.message, fresh), outcome.workRemoved)', 'throw new Error(outcome.message)', 'a committed Delete whose custody is unconfirmed is an ordinary failure the card swallows'],
  ['L10d', 'jest', LIB, 'throw new DeletionUnconfirmed(withReload(outcome.message, fresh), true)', 'throw new Error(outcome.message)', 'a committed Remove whose custody is unconfirmed is an ordinary failure the card swallows'],
  ['L11', 'jest', LIB, 'const fresh = await refreshed(refresh);\n    throw new DeletionNotice(`${outcome.message} ${fresh ? HOME_CURRENT : HOME_NOT_RELOADED}`);', 'throw new DeletionNotice(`${outcome.message} ${HOME_CURRENT}`);', 'a stale-card refusal says Home is current without re-reading it'],
  ['L11a', 'jest', LIB, '${fresh ? HOME_CURRENT : HOME_NOT_RELOADED}', '${HOME_CURRENT}', 'a stale-card refusal says Home is current even when the re-read failed'],
  ['L11b', 'jest', LIB, '${fresh ? HOME_CURRENT_CHECK : HOME_NOT_RELOADED}', '${HOME_CURRENT_CHECK}', 'an unknown Delete outcome says Home is current even when the re-read failed', { nth: 1 }],
  ['L11c', 'jest', LIB, '${fresh ? HOME_CURRENT_CHECK : HOME_NOT_RELOADED}', '${HOME_CURRENT_CHECK}', 'an unknown Remove outcome says Home is current even when the re-read failed', { nth: 2 }],
  ['L12a', 'jest', LIB, 'throw new DeletionNotice(', 'throw new Error(', 'a stale-card refusal is a dialog error on a card the re-read may already have removed', { nth: 1 }],
  ['L12b', 'jest', LIB, 'throw new DeletionNotice(', 'throw new Error(', 'an unknown Delete outcome is a dialog error on a card the re-read may already have removed', { nth: 2 }],
  ['L12c', 'jest', LIB, 'throw new DeletionNotice(', 'throw new Error(', 'an unknown Remove outcome is a dialog error on a card the re-read may already have removed', { nth: 3 }],
  ['L13', 'jest', LIB, 'try { return (await refresh()) !== false; } catch { return false; }', 'return (await refresh()) !== false;', 'a failed re-read turns a successful delete into a reported failure'],
  ['L13b', 'jest', LIB, 'try { return (await refresh()) !== false; } catch { return false; }', 'try { await refresh(); return true; } catch { return false; }', 'a re-read that reports failure is treated as success'],
  ['L14', 'jest', LIB, '`This writing is also in ${where}, so', '`Nothing is deleted. This writing is also in ${where}, so', 'the removal copy says nothing is deleted (the Work, its conversations and its image are)'],
  ['L15', 'jest', LIB, "/* Not \"Keep it\": under a question that says \"keep the writing\" that reads as an answer, not as cancel. */\n    cancel: 'Don’t remove',", "cancel: 'Keep it',", 'the cancel button reads as an answer to "keep the writing?"'],
  ['L16', 'jest', LIB, "'It cannot be undone, and private backups already taken", "'Private backups already taken", 'the removal copy drops that it cannot be undone'],
  ['L17', 'jest', LIB, 'None of the writings is deleted: each stays', 'Each stays', 'the several-writings copy does not say that none is deleted'],
  ['L18', 'jest', LIB, 'our independent record of the deletion has been sealed', 'our independent record of the deletion has been destroyed', 'the custody sentence says the deletion record (which is kept on purpose) is owed destruction', { nth: 1 }],
  ['L18b', 'jest', LIB, 'our independent record of the deletion has been sealed', 'our independent record of the deletion has been destroyed', 'the default custody sentence says the deletion record is owed destruction', { nth: 2 }],
  ['L21', 'jest', LIB, "refusal !== null && OWED_AFTER_REMOVAL.has(refusal) ? refusal : 'custody_incomplete'", "refusal !== null ? refusal : 'custody_incomplete'", 'a committed removal with a code the client does not know is told as "nothing was removed"'],
  ['L22', 'jest', LIB, 'if (res.status >= 500) return { ok: false, message: UNKNOWN_DELETE, unknown: true };\n  return { ok: false, message: GENERIC };', 'if (res.status >= 500 && refusal === null) return { ok: false, message: UNKNOWN_DELETE, unknown: true };\n  return { ok: false, message: GENERIC };', 'a 5xx with a refusal code the client does not know is told as "nothing was removed"'],
  ['L23', 'jest', LIB, "return custodyCopy(context.subject ?? 'work', { image: true });", "return custodyCopy(context.subject ?? 'work', { originalFile: true });", 'an owed IMAGE is described as the original file'],
  ['L24', 'jest', LIB, 'const named = unconfirmed !== undefined && (unconfirmed.originalFile || unconfirmed.image || unconfirmed.deletionRecord);', 'const named = false;', 'the custody sentence ignores which obligations the server named and lists the generic pair'],
  ['L25', 'jest', LIB, "const subject = workId && (viaWorkRoute || body.workRemoved === true) ? 'work' : 'writing';", "const subject = 'work';", 'a deletion that left the Work standing says "This work was removed"'],
  ['L26', 'jest', LIB, "new Set(['custody_incomplete', 'image_bytes_owed'])", "new Set(['custody_incomplete'])", 'the image-owed code is not recognised as owed after a committed removal'],
  ['L27', 'jest', LIB, "deletionRefusalCopy('image_bytes_owed', { subject: 'work' }), removed: true,", "REMOVE_GENERIC, removed: true,", 'a removed Work whose image is owed is told in the words of an ordinary failure'],
  ['L28', 'jest', LIB, '  if (body?.removed === true) {\n    // The Work row is gone and something it owned', '  if (false as boolean) {\n    // The Work row is gone and something it owned', 'a removed Work whose image is owed is read as a plain failure'],
  ['L29', 'jest', LIB, 'The Work it is in stays, with what else it holds. ', '', 'the confirmation for a writing in a Work does not say the Work stays'],
  ['L30', 'jest', LIB, 'The Work itself stays, with what else it holds.', '', 'the confirmation on a Work that keeps other parts does not say the Work stays'],
  ['L31', 'jest', LIB, 'Nothing was deleted. On Home, press Delete', 'On Home, press Delete', 'the shared-writing refusal does not say nothing was deleted'],
  ['L32', 'jest', LIB, "device. Nothing was deleted.'", "device.'", 'the stale-card refusal does not say nothing was deleted'],
  ['L33', 'jest', LIB, "const subject = workId && (viaWorkRoute || body.workRemoved === true) ? 'work' : 'writing';", "const subject = workId && (viaWorkRoute || body.workRemoved !== false) ? 'work' : 'writing';", 'a body that does not say is told "This work was removed" (the Work is said to have gone only on evidence)'],
  ['L34', 'jest', LIB, 'if (viaWorkRoute) return { ok: true, workRemoved: true };', 'if (viaWorkRoute) return { ok: true };', 'the Work route\'s success does not say the Work is gone'],
  ['L35', 'jest', LIB, "return typeof said === 'boolean' ? { ok: true, workRemoved: said } : { ok: true };", 'return { ok: true, workRemoved: true };', 'the client assumes the Work went whatever the server said'],
  ['L36', 'jest', LIB, 'if (res.status === 404) return viaWorkRoute ? { ok: true, workRemoved: true } : { ok: true, alreadyGone: true };', 'if (res.status === 404) return { ok: true, workRemoved: true };', 'a writing already gone (404) is taken to mean its Work went too'],
  ['L37', 'jest', LIB, 'throw new DeletionUnconfirmed(withReload(outcome.message, fresh), outcome.workRemoved)', 'throw new DeletionUnconfirmed(outcome.message, outcome.workRemoved)', 'an unconfirmed Delete whose re-read failed does not tell the member to reload'],
  ['L38', 'jest', LIB, 'throw new DeletionUnconfirmed(withReload(outcome.message, fresh), outcome.workRemoved)', 'throw new DeletionUnconfirmed(withReload(outcome.message, fresh))', 'an unconfirmed Delete drops the server\'s word on the Work'],
  ['L39', 'jest', LIB, 'throw new DeletionUnconfirmed(withReload(outcome.message, fresh), true)', 'throw new DeletionUnconfirmed(outcome.message, true)', 'an unconfirmed Remove whose re-read failed does not tell the member to reload'],
  ['L40', 'jest', LIB, 'throw new DeletionSharedMaterial(withReload(outcome.message, fresh), fresh)', 'throw new DeletionSharedMaterial(outcome.message)', 'a shared refusal whose re-read failed does not tell the member to reload'],
  ['L41', 'jest', LIB, 'if (res.ok || res.status === 404) return { ok: true, workRemoved: true };', 'if (res.ok || res.status === 404) return { ok: true };', 'a successful Remove does not say the Work is gone'],
  ['L42', 'jest', LIB, '...(outcome.workRemoved !== undefined ? { workRemoved: outcome.workRemoved } : {}),', '', 'the server\'s word on the Work is dropped before it reaches the page'],
  ['L46', 'jest', LIB, '      ...(outcome.alreadyGone ? { alreadyGone: true } : {}),\n', '', 'the page is never told the writing was already gone (the 404 is lost between the command and the page)'],
  ['L44', 'jest', LIB, ': { ok: true, alreadyGone: true };', ': { ok: true };', 'a 404 (the writing was already gone) is indistinguishable from a 200 that did not say, so the page cannot word them differently'],
  ['L45', 'jest', LIB, 'throw new DeletionSharedMaterial(withReload(outcome.message, fresh), fresh)', 'throw new DeletionSharedMaterial(withReload(outcome.message, fresh), true)', 'a shared refusal does not say its re-read failed, so a Work card that cannot see the other Work cannot say why'],
  ['L43', 'jest', LIB, '(viaWorkRoute ? true : undefined)', 'undefined', 'the Work route\'s owed-image answer does not say the Work is gone'],
  // ── the door (useWorkDeleteDoor.tsx)
  ['H1', 'jest', DOOR, ': allWorks.filter((other) => other.id !== work.id && manuscriptIdsOf(other).includes(shared.manuscriptId)).length;', ': 1;', 'the removal question is trusted from the 409 instead of re-derived from the Works on screen'],
  ['H2', 'jest', DOOR, "if (choices.length > 1 || ids.length > 1) return { kind: 'many', manuscriptId: null };", "if (false as boolean) return { kind: 'many', manuscriptId: null };", 'Delete on a Work with several writings silently picks one to destroy'],
  ['H3', 'jest', DOOR, 'update({ settled: `“${title}” was removed.`, confirming: false, shared: null });', 'update({ confirming: false, shared: null });', 'no removed state after Remove'],
  ['H4', 'jest', DOOR, "onDeletionNotice(removedWorkNotice(title, removalMode) + (result && !result.refreshed ? RELOAD_LINE : ''), false);", '', 'no page notice after Remove'],
  ['H5', 'jest', DOOR, 'confirming: false });\n              onDeletionNotice(`“${title}”: ${err.message}`);', 'confirming: false });', 'the custody message of a Delete stays on a card that is about to unmount'],
  ['H5b', 'jest', DOOR, 'confirming: false, shared: null });\n              onDeletionNotice(`“${title}”: ${err.message}`);', 'confirming: false, shared: null });', 'the custody message of a Remove stays on a card that is about to unmount'],
  ['H5c', 'jest', DOOR, 'confirming: false });\n              onDeletionNotice(`“${title}”: ${err.message}`);', 'confirming: false });\n              onDeletionNotice(`“${title}”: ${err.message}`, false);', 'the custody message of a Delete is only a polite status'],
  ['H5d', 'jest', DOOR, 'confirming: false, shared: null });\n              onDeletionNotice(`“${title}”: ${err.message}`);', 'confirming: false, shared: null });\n              onDeletionNotice(`“${title}”: ${err.message}`, false);', 'the custody message of a Remove is only a polite status'],
  ['H7', 'jest', DOOR, 'onClick={() => update({ confirming: true, deleteError: null, removeError: null, shared: null })}', 'onClick={() => update({ confirming: true, deleteError: null, removeError: null })}', 'a later Delete reopens in the removal state the previous question left behind'],
  ['H8', 'jest', DOOR, 'else if (err instanceof DeletionSharedMaterial && manuscriptId) {', 'else if (err instanceof Error && manuscriptId) {', 'any error opens the removal question'],
  ['H9', 'jest', DOOR, 'await onRemoveWork(work.id);', 'await onDeleteWork(work.id, null);', 'the removal button calls Delete again'],
  ['H10', 'jest', DOOR, "{kind === 'many' ? 'Remove' : 'Delete'}", "{'Delete'}", 'a Work with several writings is offered Delete'],
  ['H11', 'jest', DOOR, 'const words = deleteConfirmCopy(kind, title);', "const words = deleteConfirmCopy('writing', title);", 'every Delete confirmation describes the one-writing case'],
  ['H12', 'jest', DOOR, "if (err instanceof DeletionUnconfirmed) {\n              // The writing is gone and its custody is unconfirmed.", "if (false as boolean) {\n              // The writing is gone and its custody is unconfirmed.", 'an unconfirmed Delete is shown as an ordinary failure'],
  ['H12b', 'jest', DOOR, 'if (err instanceof DeletionUnconfirmed) {\n              // The Work row is gone', 'if (false as boolean) {\n              // The Work row is gone', 'an unconfirmed Remove is shown as an ordinary failure'],
  ['H13', 'jest', DOOR, "const removalMode: 'shared' | 'many' | null = kind === 'many' ? 'many' : (stillShared ? 'shared' : null);", "const removalMode: 'shared' | 'many' | null = stillShared ? 'shared' : null;", 'a Work with several writings has no door at all'],
  ['H14a', 'jest', DOOR, 'onDeletionNotice(`“${title}”: ${err.message}`, false);\n            } else {', '\n            } else {', 'a re-read outcome of a Remove is left in a dialog on a card the re-read may have removed'],
  ['H14b', 'jest', DOOR, 'onDeletionNotice(`“${title}”: ${err.message}`, false);\n            } else if (err instanceof DeletionSharedMaterial', '\n            } else if (err instanceof DeletionSharedMaterial', 'a re-read outcome of a Delete is left in a dialog on a card the re-read may have removed'],
  ['H15', 'jest', DOOR, '} else if (result?.workRemoved === false) {', '} else if (false as boolean) {', 'a Delete the server answered "the Work stays" is told as "already gone"'],
  ['H16', 'jest', DOOR, 'onDeletionNotice(`The writing in “${title}” was deleted. The Work stays, with what else it holds.${reload}`, false);', '', 'deleting only the writing of a Work that stays says nothing on the page'],
  ['H24', 'jest', DOOR, 'err.workRemoved === true ? { settled: `“${title}” was removed from your studio.`, confirming: false } : { confirming: false }', '{ settled: `“${title}” was removed from your studio.`, confirming: false }', 'an unconfirmed Delete turns a Work the server KEPT into a "removed" card (the card\'s guess instead of the server\'s word)'],
  ['H25', 'jest', DOOR, 'if (result?.workRemoved === true) {', 'if (result?.workRemoved !== false) {', 'a Delete the server did not describe (the writing was already gone) turns the Work\'s card into a "deleted" card'],
  ['H27', 'jest', DOOR, '...(err.reloaded ? {} : { reloadFailed: true })', '', 'the door forgets that the re-read failed after a shared refusal'],
  ['H28', 'jest', DOOR, '(shared.reloadFailed ? `${SHARED_BUT_NOT_SHOWN} ${RELOAD_HOME_LINE}` : SHARED_BUT_NOT_SHOWN)', 'SHARED_BUT_NOT_SHOWN', 'a shared refusal whose re-read failed does not tell the Work card\'s member to reload'],
  ['H29', 'jest', DOOR, '} else if (result?.alreadyGone) {', '} else if (true as boolean) {', 'a Delete that deleted the writing but did not say whether the Work went is told as "already gone"'],
  ['H26', 'jest', DOOR, "that writing was already gone.${result.refreshed ? ' Home now shows what is current.' : reload}", "that writing was already gone. Home now shows what is current.", 'an \"already gone\" notice says Home is current although the re-read failed'],
  ['H30', 'jest', DOOR, "was deleted.${result?.refreshed ? ' Home now shows what is current.' : reload}", "was deleted. Home now shows what is current.", 'a notice for a deletion whose Work fate is unsaid says Home is current although the re-read failed'],
  ['H17', 'jest', DOOR, 'const shownError = state.deleteError ?? (shared !== null ? (shared.reloadFailed ? `${SHARED_BUT_NOT_SHOWN} ${RELOAD_HOME_LINE}` : SHARED_BUT_NOT_SHOWN) : null);', 'const shownError = state.deleteError;', 'a 409 the page cannot explain is a silent no-op'],
  ['H18', 'jest', DOOR, ': removeSharedWorkCopy(othersHolding)', ': removeSharedWorkCopy(1)', 'the removal sentence says "your other Work" when several Works hold the writing'],
  ['H19', 'jest', DOOR, "(result && !result.refreshed ? RELOAD_LINE : '')", "''", 'a Remove whose re-read failed does not tell the member to reload'],
  ['H20', 'jest', DOOR, "const reload = result && !result.refreshed ? RELOAD_LINE : '';", "const reload = '';", 'a Delete whose re-read failed does not tell the member to reload'],
  ['H21', 'jest', DOOR, 'update({ shared: { manuscriptId, ...(err.reloaded ? {} : { reloadFailed: true }) } });', '', 'a shared-writing refusal records nothing, so the removal question never opens'],
  ['H22', 'jest', DOOR, '} finally {\n            update({ deleting: false });', '} finally {', 'a Delete that failed leaves the dialog busy for good'],
  ['H22b', 'jest', DOOR, '} finally {\n            update({ removing: false });', '} finally {', 'a Remove that failed leaves the dialog busy for good'],
  ['H23', 'jest', DOOR, 'update({ deleting: true, deleteError: null, shared: null });', 'update({ deleting: true, deleteError: null });', 'a second Delete starts with the first one\'s shared-writing verdict still on screen'],
  // ── the page (P4R1HomeView.tsx, P4R1HomeController.tsx)
  ['V1', 'jest', VIEW, '          {deleteNoticeEl}\n          <section className="fr-home-anchor fr-home-threshold" data-field="anchor">', '          <section className="fr-home-anchor fr-home-threshold" data-field="anchor">', 'the welcome screen after the last Work is deleted drops the notice'],
  ['V2', 'jest', VIEW, '          {deleteNoticeEl}\n          <section className="fr-home-region">\n            <p className="fr-home-eyebrow">Your Works</p>\n            <div className="fr-home-shelf fr-home-shelf-4">', '          <section className="fr-home-region">\n            <p className="fr-home-eyebrow">Your Works</p>\n            <div className="fr-home-shelf fr-home-shelf-4">', 'the many-Works layout drops the notice'],
  ['V3', 'jest', VIEW, '          {deleteNoticeEl}\n          <WorkAnchor\n            key={props.returnWork.id}', '          <WorkAnchor\n            key={props.returnWork.id}', 'the returning-to-one-Work layout drops the notice'],
  ['V4', 'jest', VIEW, '          {deleteNoticeEl}\n          <WorkAnchor\n            key={props.arrival.resume.id}', '          <WorkAnchor\n            key={props.arrival.resume.id}', 'the continue layout drops the notice'],
  ['V5', 'jest', VIEW, '          {deleteNoticeEl}\n          <p className="fr-home-here">{HOME_COPY.writingHere}</p>', '          <p className="fr-home-here">{HOME_COPY.writingHere}</p>', 'the loose-writing layout drops the notice'],
  ['V6', 'jest', VIEW, '          {unclaimedWriting}\n          {creationControls}\n          {/* Returning to one Work must never hide', '          {deleteNoticeEl}\n          {unclaimedWriting}\n          {creationControls}\n          {/* Returning to one Work must never hide', 'the notice is rendered twice in one layout'],
  ['V7', 'jest', NOTICES, "role={notice.urgent ? 'alert' : 'status'}", 'role="status"', 'the custody notice is only a polite status'],
  ['V8', 'jest', VIEW, '          {del.door}\n        </div>\n      </div>\n      <P4R1WorkMaterialsSummary work={work} />', '        </div>\n      </div>\n      <P4R1WorkMaterialsSummary work={work} />', 'the hero Work has no way to delete or remove it'],
  ['V9', 'jest', NOTICES, 'setNotices((current) => [...current, { id, message, urgent }]);', 'setNotices([{ id, message, urgent }]);', 'a later notice erases an unacknowledged custody alert'],
  ['V10', 'jest', VIEW, '          <WorkAnchor\n            key={props.returnWork.id}', '          <WorkAnchor', 'the hero Work\'s own state (its open Publish panel) follows the slot to the next Work'],
  ['V11', 'jest', VIEW, '          <WorkAnchor\n            key={props.arrival.resume.id}', '          <WorkAnchor', 'the continue layout\'s hero Work has the same slot-following state (its open Publish panel)'],
  ['V12', 'jest', VIEW, 'const words = deleteConfirmCopy(writingDeleteKindFor(manuscript.id, works), writingTitle);', "const words = deleteConfirmCopy('writing', writingTitle);", 'loose writing\'s confirmation talks about a Work that does not exist'],
  ['V13', 'jest', NOTICES, "useEffect(() => { if (notices.length > 0) ref.current?.scrollIntoView?.({ block: 'nearest' }); }, [notices.length]);", '', 'a notice appears off-screen'],
  ['V14', 'jest', NOTICES, 'onClick={() => stack.dismiss(notice.id)}', 'onClick={() => stack.notices.forEach((n) => stack.dismiss(n.id))}', 'dismissing one notice dismisses them all'],
  ['V15', 'jest', VIEW, 'if (err instanceof DeletionUnconfirmed) {\n          setConfirmingDelete(null);', 'if (false as boolean) {\n          setConfirmingDelete(null);', 'an unconfirmed deletion of loose writing is shown as an ordinary failure in a dialog that may be gone'],
  ['V16', 'jest', VIEW, 'if (err instanceof DeletionNotice || err instanceof DeletionSharedMaterial) {', 'if (false as boolean) {', 'a re-read outcome of a loose-writing deletion is left in a dialog that may be gone'],
  ['V17', 'jest', VIEW, 'if (result && !result.refreshed) showNotice(', 'if (false as boolean) showNotice(', 'a loose-writing deletion whose re-read failed does not tell the member to reload'],
  ['V18', 'jest', VIEW, 'state: doors[workId] ?? INITIAL_DOOR,', 'state: INITIAL_DOOR,', 'a Work\'s open question and busy flags are not remembered by the page, so a re-read forgets them'],
  ['V19', 'jest', VIEW, '[workId]: { ...(current[workId] ?? INITIAL_DOOR), ...patch }', '[workId]: { ...INITIAL_DOOR, ...patch }', 'each change to a Work\'s door state forgets the rest of it'],
  ['A1', 'jest', VIEW, 'allWorks={props.works}', 'allWorks={[]}', 'the returning-to-one-Work hero cannot see the other Works', { nth: 1 }],
  ['A2', 'jest', VIEW, 'allWorks={props.works}', 'allWorks={[]}', '"Your other Works" cards cannot see the other Works', { nth: 2 }],
  ['A3', 'jest', VIEW, 'allWorks={props.works}', 'allWorks={[]}', 'the continue hero cannot see the other Works', { nth: 3 }],
  ['A4', 'jest', VIEW, 'allWorks={props.works}', 'allWorks={[]}', '"Also written" cards cannot see the other Works', { nth: 4 }],
  ['A5', 'jest', VIEW, 'allWorks={props.works}', 'allWorks={[]}', 'the continue shelf cannot see the other Works', { nth: 5 }],
  ['A6', 'jest', VIEW, 'allWorks={props.works}', 'allWorks={[]}', 'the loose-writing layout\'s Works cannot see the other Works', { nth: 6 }],
  ['A7', 'jest', VIEW, 'allWorks={props.works}', 'allWorks={[]}', 'the many-Works layout cannot see the other Works', { nth: 7 }],
  ['C1', 'jest', CTRL, 'runRemoveWork(workId, (url, init) => apiFetch(url, init), refresh)', 'runDeleteWork({ workId, manuscriptId: null }, (url, init) => apiFetch(url, init), refresh)', '(textual guard) the controller\'s removal goes through Delete'],
  ['C2', 'jest', CTRL, 'onRemoveWork={onRemoveWork}', '', '(textual guard) the view is never handed the removal act'],
  ['C3', 'jest', CTRL, 'runDeleteWork({ workId, manuscriptId }, ', 'runDeleteWork({ workId, manuscriptId: null }, ', '(textual guard) the controller drops the writing a Work card named, so Delete withdraws the Work and leaves the writing'],
  ['C4', 'jest', LIB, 'return read.every(Boolean);', 'return true;', 'the re-read reports success even when a list could not be read'],
  ['C4b', 'jest', LIB, "try { return (await load()) === true; } catch { return false; }", "return (await load()) === true;", 'a list that throws turns a committed delete into a rejection'],
  ['C5', 'jest', CTRL, 'reReadAll([reloadWorks, reloadManuscripts, reloadHistory])', 'reReadAll([reloadWorks])', '(textual guard) the re-read after a delete leaves the other lists stale'],
  ['C5b', 'jest', CTRL, 'reReadAll([reloadWorks, reloadManuscripts, reloadHistory])', 'reReadAll([reloadWorks, reloadManuscripts])', '(textual guard) Home\'s own History still names a deleted writing while the notice says Home shows what is current'],
  ['C6', 'jest', CTRL, 'const refresh = useCallback(', 'const mapOutcome = (outcome: { refusal?: string }) => outcome.refusal;\n  const refresh = useCallback(', '(textual guard) the controller starts mapping server outcomes itself instead of running the one place that maps them'],
  ['WK1', 'jest', DOOR, "if (holders.length === 0) return 'loose';", "if (holders.length === 0) return 'writing';", 'a writing no Work holds is described as one whose Work goes with it'],
  ['WK2', 'jest', DOOR, 'return holders.every(', 'return holders.some(', 'a writing held by a Work that stays AND one that goes is described as only going'],
  ['LD1', 'jest', LOAD_WORKS, "setPhase('error');\n        return false;", "setPhase('error');\n        return true;", 'the Works list reports it was read when the server refused it'],
  ['LD2', 'jest', LOAD_WORKS, "// A failure to read is not an absence of works. Say only what is true.\n      setPhase('error');\n      return false;", "// A failure to read is not an absence of works. Say only what is true.\n      setPhase('error');\n      return true;", 'the Works list reports it was read when the network failed'],
  ['LD3', 'jest', LOAD_WORKS, "setPhase('unauthorized');\n        return false;", "setPhase('unauthorized');\n        return true;", 'the Works list reports it was read when the session had ended'],
  ['LD4', 'jest', LOAD_MS, "setPhase('error');\n        return false;", "setPhase('error');\n        return true;", 'the writings list reports it was read when the server refused it'],
  ['LD5', 'jest', LOAD_MS, "// A network failure is not an empty Studio. Say so.\n      setPhase('error');\n      return false;", "// A network failure is not an empty Studio. Say so.\n      setPhase('error');\n      return true;", 'the writings list reports it was read when the network failed'],
  ['LD6', 'jest', LOAD_MS, "setPhase('unauthorized');\n        return false;", "setPhase('unauthorized');\n        return true;", 'the writings list reports it was read when the session had ended'],
  ['LD7', 'jest', LOAD_HISTORY, "setPhase('error');\n        return false;", "setPhase('error');\n        return true;", 'History reports it was read when the server refused it'],
  ['LD8', 'jest', LOAD_HISTORY, "setPhase('unauthorized');\n        return false;", "setPhase('unauthorized');\n        return true;", 'History reports it was read when the session had ended'],
  ['LD9', 'jest', LOAD_HISTORY, "} catch {\n      setPhase('error');\n      return false;", "} catch {\n      setPhase('error');\n      return true;", 'History reports it was read when the network failed'],
  ['Y1', 'jest', HISTORY_RULE, 'if (holders.length > 1) {', 'if (false as boolean) {', 'History offers a Delete on a writing two Works hold, which the server can only refuse'],
  ['Y2', 'jest', HISTORY, '{action.kind === \'open\' && action.why === \'shared\' ? (', '{false as boolean ? (', 'History hides Delete on a shared writing without saying where the way forward is'],
  ['HY1', 'jest', HISTORY, 'return result && !read ? { ...result, refreshed: false } : result;', 'return result;', 'a History whose own list could not be re-read does not tell the member to reload'],
  ['HY2', 'jest', HISTORY, '          await reload();\n          throw err;', '          throw err;', 'a refused or unconfirmed attempt leaves History listing the writing'],
  ['HY3', 'jest', HISTORY, 'const read = await reload();', 'const read = true;', 'History is not re-read after a deletion the server accepted'],
  ['HY4', 'jest', HISTORY, 'const stack = props.noticeStack ?? ownStack;', 'const stack = ownStack;', 'a message raised on History is lost at Back to Home, and an outcome that arrives after it is delivered nowhere'],
  ['HY5', 'jest', HISTORY, 'Your history could not be read just now. Try again to see what is current.', 'Your history could not be read just now. Nothing has changed.', 'a History that could not be re-read after a deletion says nothing has changed'],
  ['HY6', 'jest', HISTORY, 'On Home, press Remove on that Work: that removes the Work and what you built inside it, and deletes none of its writings. Then delete this writing.', 'Open it and take it out of that Work first, then delete it.', 'History points at a control that is not on the screen it sends the member to'],
  ['HY7', 'jest', HISTORY, '<NoticeList stack={stack} />', '', 'History shows none of its notices'],
  ['HY8', 'jest', VIEW, '            noticeStack={noticeStack}\n', '', 'Home does not hand its notice stack to History, so an alert raised there is lost at Back to Home'],
  ['Y3', 'jest', HISTORY, 'const words = deleteConfirmCopy(writingDeleteKindFor(action.manuscriptId, props.works), action.title);', "const words = deleteConfirmCopy('loose', action.title);", 'History does not say that a Work holding only this writing goes with it'],
  // ── the hermetic server tests (no database)
  ['J1', 'jest', ROUTE, 'viaWork === null ? {} : { viaWorkId: viaWork.toLowerCase() }', '{}', 'the route drops the Work the card named'],
  ['J2', 'jest', ROUTE, 'viaWorkId: viaWork.toLowerCase()', 'viaWorkId: viaWork', 'an upper-case Work id never matches, so a valid card is refused as stale'],
  ['J3', 'jest', ROUTE, 'if (viaWork !== null && !UUID_RE.test(viaWork)) {', 'if (false as boolean) {', 'a malformed workId reaches the database'],
  ['J4', 'jest', ROUTE, ': { refusal: outcome.refusal },', ': { refusal: outcome.refusal, works: 0 },', 'the stale-card refusal starts to describe other Works'],
  ['J5', 'jest', ERASE, 'if (options.viaWorkId !== undefined && !claims.rows.some(', 'if (options.viaWorkId !== undefined && claims.rows.length <= 1 && !claims.rows.some(', 'the stale-card guard is evaluated after the shared-writing refusal'],
  ['J6', 'jest', ERASE, 'ORDER BY w.id\n        FOR UPDATE`,', 'ORDER BY w.id`,', '(textual guard) the Work rows are read, not locked, before the expression rows'],
  ['J7', 'jest', ERASE, "      return { ok: false as const, refusal: 'not_found' as const };\n    }\n    /* The member pressed Delete", "      return { ok: false as const, refusal: 'work_no_longer_holds_it' as const };\n    }\n    /* The member pressed Delete", 'a repeat Delete of a gone writing is told its card is stale'],
  ['J8', 'jest', ERASE, '        FOR UPDATE OF e`,', '        FOR UPDATE OF e, w`,', '(textual guard) the expression rows are locked together with the Work rows again (the old cycle)'],
  ['J9', 'jest', ERASE, 'if (options.viaWorkId !== undefined && claims.rows.some((row) => row.living_work_id === options.viaWorkId)) {', 'if (false as boolean) {', 'a declaration that outlived its writing is left behind (the detached state)'],
  ['J10', 'jest', ERASE, '\n        AND NOT EXISTS (\n          SELECT 1 FROM living_work_expressions e WHERE e.living_work_id = w.id\n        )', '', '(textual guard) a Work that holds something else is removed with its dangling declaration (the behaviour is killed by pg candidate S16)'],
  ['J11', 'jest', ERASE, 'originalFile: result.originalQueueIds.some((id) => stillQueued.has(id)),', 'originalFile: false,', 'an original file still owed is not reported'],
  ['J12', 'jest', ERASE, 'image: result.imageQueueIds.some((id) => stillQueued.has(id)),', 'image: false,', 'an image still owed is not reported'],
  ['J13', 'jest', ERASE, 'sweptAll: !owed.originalFile && !owed.image && recoverySealed,', 'sweptAll: !owed.originalFile && recoverySealed,', 'an owed image does not stop the answer reading as complete'],
  ['J14', 'jest', ERASE, 'sweptAll: !owed.originalFile && !owed.image && recoverySealed,', 'sweptAll: !owed.image && recoverySealed,', 'an owed original file does not stop the answer reading as complete'],
  // J15 / J16 / S19 (and XR5 below) encode the DECLARED, deliberate non-action of the WS-DELETE-01 follow-up, not the older "X8 writes
  // no record" law (which the follow-up deliberately changed: X8 now writes a manifest and a living_works tombstone when a Work goes).
  // The law they still defend is narrower: X8 does NOT seal the independent R20 ledger and keeps `recoverySealed = declarationOnly`,
  // because production has no R20_* variable on the app container, so a seal would turn today's success into `custody_incomplete`.
  // The anchors are unchanged; only the stated reason was rewritten, so the text no longer claims "nothing needed" sealing.
  ['J15', 'jest', ERASE, 'let recoverySealed = result.declarationOnly;', 'let recoverySealed = false;', 'the X8 cleanup (which now writes a Work record it deliberately does not seal) reads as an unsealed deletion record, turning a success into custody_incomplete (declared non-action)'],
  ['J16', 'jest', ERASE, 'if (!result.declarationOnly) {\n    try {', 'if (true as boolean) {\n    try {', 'the X8 cleanup calls the R20 seal that the follow-up deliberately does not call (declared non-action; also seals when no Work went)'],
  ['J17', 'jest', ERASE, 'await sweepVaultErasureQueue(100, ownIds);', 'await sweepVaultErasureQueue(100);', 'a backlog of other rows starves this deletion\'s own obligations'],
  ['J18', 'jest', ERASE, 'WHERE living_work_id = $1 AND member_id = $2 FOR UPDATE`,\n    [workId, memberId],', 'WHERE living_work_id = $1 AND member_id = $2`,\n    [workId, memberId],', '(textual guard) the Work\'s image is read without a lock before the Work goes'],
  ['J26', 'jest', HISTORY_ROUTE, "if (process.env.MAIA_CABIN_MODE === 'offline') {", 'if (false as boolean) {', 'the offline cabin\'s History answers 401, so every re-read that includes History reports that it could not read'],
  ['J22', 'jest', ROUTE, 'return NextResponse.json({ removed: true, workRemoved: outcome.workRemoved });', 'return NextResponse.json({ removed: true });', 'the success answer does not say whether the Work went, so the page must guess'],
  // J23 / S21: the Work-row lookup is still the cut, but since the follow-up the recovery-capture advisory lock is taken FIRST, so a
  // Remove and a Delete can no longer deadlock on row locks (the key serialises them). What the candidate embodies is now: the image row
  // before the Work row, which still cycles against any transaction that holds the Work row WITHOUT the key. The hermetic LOCK ORDER
  // test and the physical probe DL-3b (a rival that holds the Work row) are the instruments; DL-1/DL-2/DL-3 no longer are.
  ['J23', 'jest', WORK_ROUTE, "      const owned = await tx.query<{ id: string }>(\n        `SELECT id FROM living_works WHERE id = $1 AND member_id = $2 FOR UPDATE`,\n        [id, memberId],\n      );\n      if (owned.rows.length === 0) return null;\n", '', 'Remove takes the image row before the Work row (the order that deadlocks with any transaction that holds the Work row without the recovery-capture key)'],
  ['J24', 'jest', ERASE, 'workRemoved: declaration.workRemovedId !== undefined };', 'workRemoved: claims.rows.length > 0 };', 'a delete of a live writing says the Work went whenever a Work declared it, even if it stays'],
  ['J25', 'jest', ERASE, 'workRemoved: cleaned.workRemovedId !== undefined }', 'workRemoved: true }', 'the cleanup of a vanished writing says the Work went even when it stays'],
  ['J19', 'jest', ROUTE, "unconfirmed: { originalFile: outcome.owed.originalFile, image: outcome.owed.image, deletionRecord: !outcome.recoverySealed },", 'unconfirmed: { originalFile: true, image: true, deletionRecord: true },', 'the route says everything is owed whatever is'],
  ['J20', 'jest', ROUTE, 'workRemoved: outcome.workRemoved,', 'workRemoved: true,', 'the route says the Work went when only its writing did'],
  ['J21', 'jest', ROUTE, 'if (!outcome.sweptAll) {', 'if (false as boolean) {', 'an unconfirmed custody is answered as plain success'],
  ['W1', 'jest', WORK_ROUTE, 'if (stillOwed.rows.length > 0) {', 'if (false as boolean) {', 'a removed Work whose image bytes are still owed is reported as plain success'],
  ['W2', 'jest', WORK_ROUTE, 'SELECT id FROM vault_erasure_queue WHERE id = $1`,', 'SELECT id FROM vault_erasure_queue`,', '(textual guard) any queued row, anyone\'s, makes a Work removal read as unconfirmed'],
  ['W3', 'jest', WORK_ROUTE, 'await sweepVaultErasureQueue(100, [removed.queueId]);', 'await sweepVaultErasureQueue(100, []);', 'a Work\'s own image waits behind a backlog of other rows'],
  ['W4', 'jest', WORK_ROUTE, 'WHERE living_work_id = $1 AND member_id = $2 FOR UPDATE`,\n        [id, memberId],', 'WHERE living_work_id = $1 AND member_id = $2`,\n        [id, memberId],', '(textual guard) the Work\'s image is read without a lock before the Work goes'],
  ['W5', 'jest', WORK_ROUTE, 'VALUES ($1) RETURNING id`,', 'VALUES ($1)`,', 'the Work\'s queue row cannot be named, so the sweep cannot take it first'],
  ['W6', 'jest', WORK_ROUTE, '`DELETE FROM living_works WHERE id = $1 AND member_id = $2 RETURNING id`,', '`DELETE FROM living_works WHERE id = $1 RETURNING id`,', '(textual guard) a member can remove another member\'s Work by its id'],
  ['W7', 'jest', WORK_ROUTE, "refusal: 'image_bytes_owed', unconfirmed: { image: true } }", "refusal: 'image_bytes_owed' }", 'the image-owed answer does not say what is owed'],
  // ── the copy against the database (removalCopyDrift.test.ts)
  ['D1', 'jest', MIG_CORRECTIONS, 'living_work_id UUID NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,', 'living_work_id UUID NOT NULL REFERENCES living_works(id) ON DELETE RESTRICT,', '(static guard: reads the migrations) a table starts blocking the removal of a Work (it would fail or leave a detached row)'],
  ['D2', 'jest', MIG_UNDERSTANDING, 'CREATE TABLE IF NOT EXISTS living_work_writer_understanding (', 'CREATE TABLE IF NOT EXISTS living_work_fictional_new_child (living_work_id UUID REFERENCES living_works(id) ON DELETE CASCADE);\nCREATE TABLE IF NOT EXISTS living_work_writer_understanding (', '(static guard: reads the migrations) a new table starts cascading from a Work and the removal copy is not updated'],
  // D3 is anchored on WHAT_GOES_WITH_A_WORK, which since the follow-up is the DELETE goes-list only; the REMOVE goes-list is its own
  // constant (WHAT_GOES_WITH_A_REMOVED_WORK) and has the matching candidate CX8 below.
  ['D3', 'jest', LIB, 'its conversations with MAIA, what you told MAIA about it, your corrections, its plans, where you left off,', 'its conversations with MAIA, what you told MAIA about it, your corrections, its plans,', 'the Delete copy stops naming something that does go'],
  ['D4', 'jest', MIG_CORRECTIONS, 'living_work_id UUID NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,', 'living_work_id UUID NOT NULL REFERENCES living_works(id),', '(static guard: reads the migrations) a foreign key with no ON DELETE (it blocks the Work\'s removal) hides behind a neighbouring column\'s CASCADE'],
  ['D5', 'jest', MIG_UNDERSTANDING, 'CREATE TABLE IF NOT EXISTS living_work_writer_understanding (', 'CREATE TABLE IF NOT EXISTS living_work_fictional_orphan (living_work_id UUID NOT NULL);\nCREATE TABLE IF NOT EXISTS living_work_writer_understanding (', '(static guard: reads the migrations) a new table carries a Work id with no foreign key, so a Work\'s removal leaves its rows behind unnoticed'],
  // ── the server (needs the local PostgreSQL 16 harness)
  ['S1', 'pg', ERASE, 'if (options.viaWorkId !== undefined && !claims.rows.some((row) => row.living_work_id === options.viaWorkId)) {', 'if (false as boolean) {', 'a stale card can erase another Work\'s writing and the Work itself'],
  ['S2', 'pg', ROUTE, 'viaWork === null ? {} : { viaWorkId: viaWork.toLowerCase() }', '{}', 'the route drops the Work the card named'],
  ['S3', 'pg', ROUTE, 'if (viaWork !== null && !UUID_RE.test(viaWork)) {', 'if (false as boolean) {', 'a malformed workId reaches the database'],
  ['S4', 'pg', ROUTE, 'viaWorkId: viaWork.toLowerCase()', 'viaWorkId: viaWork', 'an upper-case Work id never matches, so a valid card is refused as stale'],
  ['S5', 'pg', ERASE, 'if (claims.rows.length > 1) {', 'if (claims.rows.length > 2) {', 'a writing declared by two Works is erased out from under the other'],
  ['S6', 'pg', ERASE, 'ORDER BY w.id\n        FOR UPDATE`,', 'ORDER BY w.id`,', 'the Work rows are read instead of locked first, so a Delete can act on a state that is about to change'],
  ['S7', 'pg', ERASE, "await tx.query(\n      `SELECT pg_advisory_xact_lock(hashtextextended('soullab:r20:recovery-capture', 0))`,\n    );", '', 'the erase no longer takes the recovery-capture lock, so a backup could capture half a deletion'],
  ['S8', 'pg', ERASE, 'if (options.viaWorkId !== undefined && !claims.rows.some(', 'if (options.viaWorkId !== undefined && claims.rows.length <= 1 && !claims.rows.some(', 'the stale-card guard is evaluated after the shared-writing refusal'],
  ['S9', 'pg', ERASE, "      return { ok: false as const, refusal: 'not_found' as const };\n    }\n    /* The member pressed Delete", "      return { ok: false as const, refusal: 'work_no_longer_holds_it' as const };\n    }\n    /* The member pressed Delete", 'a repeat Delete of a gone writing is told its card is stale'],
  ['S10', 'pg', ERASE, 'sweptAll: !owed.originalFile && !owed.image && recoverySealed,', 'sweptAll: !owed.originalFile && !owed.image && recoverySealed && Number((await query<{ n: string }>(`SELECT count(*)::int AS n FROM vault_erasure_queue`)).rows[0]?.n ?? 0) === 0,', 'another member\'s stuck queue row makes this member\'s Delete read as unconfirmed'],
  ['S11', 'pg', ERASE, 'ORDER BY (id = ANY($2::uuid[])) DESC, queued_at ASC LIMIT $1', 'ORDER BY queued_at ASC, (id = ANY($2::uuid[])) DESC LIMIT $1', 'a backlog of other rows starves this deletion\'s own obligations'],
  ['S12', 'pg', WORK_ROUTE, 'if (stillOwed.rows.length > 0) {', 'if (false as boolean) {', 'a removed Work whose image bytes are still owed is reported as plain success'],
  ['S13', 'pg', WORK_ROUTE, 'SELECT id FROM vault_erasure_queue WHERE id = $1`,', 'SELECT id FROM vault_erasure_queue WHERE $1::uuid IS NOT NULL`,', 'any queued row, anyone\'s, makes a Work removal read as unconfirmed'],
  ['S14', 'pg', WORK_ROUTE, 'await sweepVaultErasureQueue(100, [removed.queueId]);', 'await sweepVaultErasureQueue(100, []);', 'a Work\'s own image waits behind a backlog of other rows'],
  ['S15', 'pg', ERASE, 'if (options.viaWorkId !== undefined && claims.rows.some((row) => row.living_work_id === options.viaWorkId)) {', 'if (false as boolean) {', 'a declaration that outlived its writing is left behind (the detached state)'],
  ['S16', 'pg', ERASE, '\n        AND NOT EXISTS (\n          SELECT 1 FROM living_work_expressions e WHERE e.living_work_id = w.id\n        )', '', 'a Work that holds something else is removed with its dangling declaration'],
  ['S17', 'pg', ERASE, "          AND w.member_id = $2\n        FOR UPDATE OF e`,", "          AND $2::uuid IS NOT NULL\n        FOR UPDATE OF e`,", 'a member can clean up the declaration of another member\'s Work through a gone writing'],
  ['S18', 'pg', ERASE, 'originalFile: result.originalQueueIds.some((id) => stillQueued.has(id)),', 'originalFile: false,', 'an original file still owed is not reported'],
  // (S19: same declared non-action as J15 above; physical instrument.)
  ['S19', 'pg', ERASE, 'let recoverySealed = result.declarationOnly;', 'let recoverySealed = false;', 'the X8 cleanup (which now writes a Work record it deliberately does not seal) reads as an unsealed deletion record, turning a success into custody_incomplete (declared non-action)'],
  ['S21', 'pg', WORK_ROUTE, "      const owned = await tx.query<{ id: string }>(\n        `SELECT id FROM living_works WHERE id = $1 AND member_id = $2 FOR UPDATE`,\n        [id, memberId],\n      );\n      if (owned.rows.length === 0) return null;\n", '', 'Remove takes the image row before the Work row, and a transaction that holds the Work row without the recovery-capture key (probe DL-3b) deadlocks with it (a 500 for an act that did not happen); against a real Delete the key now serialises the two'],
  ['S22', 'pg', ERASE, 'workRemoved: declaration.workRemovedId !== undefined };', 'workRemoved: claims.rows.length > 0 };', 'a delete of a live writing says the Work went whenever a Work declared it, even if it stays'],
  ['S23', 'pg', ROUTE, 'return NextResponse.json({ removed: true, workRemoved: outcome.workRemoved });', 'return NextResponse.json({ removed: true });', 'the success answer does not say whether the Work went'],
  ['S20', 'pg', ROUTE, "unconfirmed: { originalFile: outcome.owed.originalFile, image: outcome.owed.image, deletionRecord: !outcome.recoverySealed },", 'unconfirmed: { originalFile: true, image: true, deletionRecord: true },', 'the route says everything is owed whatever is'],

  // ══ WS-DELETE-01 follow-up (2026-11-06): the deletion record of Remove and X8, the recovery-capture lock first, and the corrected Remove copy ══
  // Each entry is a plausible WRONG version of one decision of the new behaviour. `<id>` is judged by the hermetic suites; `<id>p` (the
  // physical twin) by the PostgreSQL probes. A '(textual guard)' entry is caught only by a test that reads source text.
  // ── Remove (WORK_ROUTE): the record
  ...twin('RR1', WORK_ROUTE, L(RM_CALL, '', RM_TAIL), L(RM_TAIL, `    await writeWorkDeletionRecord({ query } as never, removed.id, '${RM_NOTE}');`), 'Remove writes its manifest and tombstone AFTER the transaction has committed, through the module-level query: a record that fails leaves the Work gone with no record, and the record is not atomic with the deletion'),
  ...twin('RR2', WORK_ROUTE, L(RM_LOCK, RM_OWNED), L(RM_OWNED, RM_LOCK), 'Remove takes the recovery-capture lock AFTER the Work-row FOR UPDATE (a cycle with a Delete, and no lock at all for an id that is not this member\'s)'),
  ...twin('RR3', WORK_ROUTE, `${RM_LOCK}\n`, '', 'Remove does not take the recovery-capture lock at all, so it can delete a Work in the middle of a coherent backup capture'),
  ...twin('RR4', WORK_ROUTE, `${RM_LOCK}\n`, "      await tx.query(`SELECT pg_advisory_xact_lock(hashtextextended('soullab:r20:recovery-capture ', 0))`);\n", 'Remove spells its own lock with a mistyped key (a trailing space), so it takes a lock nothing else takes and waits for no backup'),
  ...twin('RR5', WORK_ROUTE, `${RM_CALL}\n`, `${inlineRecord({ indent: 6, idExpr: 'gone.rows[0].id', note: RM_NOTE, kind: 'living_work' })}\n`, 'Remove tombstones the kind "living_work" (a typo) instead of "living_works", so a governed restore never recognises the Work'),
  ...twin('RR6', WORK_ROUTE, "await writeWorkDeletionRecord(tx, gone.rows[0].id, 'Writer Work removed", "await writeWorkDeletionRecord(tx, id, 'Writer Work removed", 'Remove tombstones the id from the URL instead of the id the DELETE returned (a different spelling of the same uuid never matches the database\'s own)'),
  ...twin('RR7', WORK_ROUTE, `${RM_CALL}\n`, `${inlineRecord({ indent: 6, idExpr: 'gone.rows[0].id', note: RM_NOTE, reason: 'governance' })}\n`, 'Remove records the removal under the wrong reason class (governance, not a member\'s own deletion)'),
  ...twin('RR7b', WORK_ROUTE, `${RM_CALL}\n`, `${inlineRecord({ indent: 6, idExpr: 'gone.rows[0].id', note: RM_NOTE, by: 'founder' })}\n`, 'Remove records the removal as authorized by someone other than the verified member'),
  ...twin('RR8', WORK_ROUTE, `${RM_CALL}\n`, `${inlineRecord({ indent: 6, idExpr: 'gone.rows[0].id', note: RM_NOTE, tombstone: false })}\n`, 'Remove writes a manifest and no tombstone, so the record names nothing and a governed restore brings the Work back'),
  ...twin('RR9', WORK_ROUTE, L(RM_LOCK, RM_OWNED, RM_VISUAL, RM_DELETE, RM_GONE_GUARD, '', RM_RECORD_COMMENT, RM_CALL), L(RM_LOCK, `      await writeWorkDeletionRecord(tx, id, '${RM_NOTE}');`, RM_OWNED, RM_VISUAL, RM_DELETE, RM_GONE_GUARD), 'Remove writes the record BEFORE it has checked that the Work is this member\'s, so any member (or none) can tombstone any Work id'),
  ...twin('RR10', WORK_ROUTE, L(RM_GONE_GUARD, '', RM_RECORD_COMMENT, RM_CALL), L(`      await writeWorkDeletionRecord(tx, gone.rows[0]?.id ?? id, '${RM_NOTE}');`, RM_GONE_GUARD), 'Remove writes the record BEFORE it checks that its own DELETE removed a row, so a lost race (another request removed the Work first) writes a record for a deletion this request did not do (against a real database that branch is unreachable by timing alone, because the lookup holds the Work row FOR UPDATE; the twin RR10p is killed only by the fault-injection probe ROLL-3, which makes the DELETE remove nothing)'),
  ...twin('RR11', WORK_ROUTE, L(RM_DELETE, RM_GONE_GUARD, '', RM_RECORD_COMMENT, RM_CALL), L(
    '      const kept = await tx.query<{ expression_id: string }>(',
    "        `SELECT expression_id FROM living_work_expressions WHERE living_work_id = $1 AND expression_type = 'manuscript'`,",
    '        [id],',
    '      );',
    RM_DELETE,
    RM_GONE_GUARD,
    `      const manifestId = await writeWorkDeletionRecord(tx, gone.rows[0].id, '${RM_NOTE}');`,
    '      for (const row of kept.rows) {',
    '        await tx.query(',
    "          `INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id) VALUES ($1::uuid, 'member_manuscripts', $2) ON CONFLICT (object_kind, object_id) DO NOTHING`,",
    '          [manifestId, row.expression_id],',
    '        );',
    '      }',
  ), 'Remove copies the Delete flow and tombstones the writings the Work held, although Remove keeps every one of them', undefined, 'Remove copies the Delete flow and tombstones the writings the Work held, although Remove keeps every one of them (hermetically it dies on the scripted client, which admits only the known statement shapes, and on the no-member_manuscripts source law; the behavioural kill is RR11p)'),
  // RR11b has no physical twin on purpose: the PG harness stubs r20_erase_writer_editorial_history as a no-op (the real one erases a
  // MANUSCRIPT's editorial history and needs a manuscript tombstone), so no probe could see the call. The hermetic kill is real but narrow.
  ['RR11b', 'jest', WORK_ROUTE, L(RM_DELETE, RM_GONE_GUARD, '', RM_RECORD_COMMENT, RM_CALL), L(
    '      const kept = await tx.query<{ expression_id: string }>(',
    "        `SELECT expression_id FROM living_work_expressions WHERE living_work_id = $1 AND expression_type = 'manuscript'`,",
    '        [id],',
    '      );',
    RM_DELETE,
    RM_GONE_GUARD,
    `      const manifestId = await writeWorkDeletionRecord(tx, gone.rows[0].id, '${RM_NOTE}');`,
    '      for (const row of kept.rows) {',
    '        await tx.query(`SELECT r20_erase_writer_editorial_history($1::uuid, $2::uuid, $3::uuid)`, [manifestId, memberId, row.expression_id]);',
    '      }',
  ), '(textual guard) Remove calls the editorial-history erasure for the writings the Work held, although Remove keeps every writing and its editorial history (hermetically it dies on the scripted client, which admits only the known statement shapes, and on the no-r20_erase_writer_editorial_history source law)'],
  ...twin('RR12', WORK_ROUTE, '    if (removed.queueId) {\n      await sweepVaultErasureQueue(100, [removed.queueId]);', "    await (await import('@/lib/recovery/r20DeletionLedger')).sealR20DeletionLedger();\n    if (removed.queueId) {\n      await sweepVaultErasureQueue(100, [removed.queueId]);", 'Remove seals the independent R20 ledger (a member-visible outcome decision the follow-up declares NOT taken: with no R20_* variable on the app it would turn today\'s success into custody_incomplete)'),
  // ── X8 (ERASE, the viaWorkId branch only): the record
  ...twin('XR1', ERASE, `${X8_CALL}\n`, `${inlineRecord({ indent: 10, idExpr: 'cleaned.workRemovedId', note: X8_NOTE, tombstone: false })}\n`, 'X8 writes a manifest and no tombstone for the Work it ended'),
  ...twin('XR2', ERASE, "await writeWorkDeletionRecord(tx, cleaned.workRemovedId, 'Writer Work ended", "await writeWorkDeletionRecord(tx, manuscriptId, 'Writer Work ended", 'X8 tombstones the (already gone) writing\'s id as if it were the Work\'s'),
  ...twin('XR2b', ERASE, `${X8_CALL}\n`, `${inlineRecord({ indent: 10, idExpr: 'cleaned.workRemovedId', note: X8_NOTE, kind: 'member_manuscripts' })}\n`, 'X8 tombstones the Work id under the kind of a writing, so the Work is never recognised'),
  ...twin('XR3', ERASE, L('        if (cleaned.workRemovedId !== undefined) {', "          await writeWorkDeletionRecord(tx, cleaned.workRemovedId, 'Writer Work ended"), L('        if (true as boolean) {', "          await writeWorkDeletionRecord(tx, cleaned.workRemovedId ?? options.viaWorkId!, 'Writer Work ended"), 'X8 records a Work that STAYED (it still holds something else): a tombstone for a Work that still exists'),
  ...twin('XR4', ERASE, `${X8_CALL}\n`, `          await writeWorkDeletionRecord({ query } as never, cleaned.workRemovedId, '${X8_NOTE}');\n`, 'X8 writes its record through the module-level query (its own connection), outside the Work\'s transaction: the record can commit although the deletion rolls back'),
  ...twin('XR5', ERASE, L('  let recoverySealed = result.declarationOnly;', '  if (!result.declarationOnly) {'), L('  let recoverySealed = result.declarationOnly && !result.workRemoved;', '  if (!result.declarationOnly || result.workRemoved) {'), 'X8 seals the R20 ledger for the Work it removed (the declared non-action is that it does not: with no R20_* variable on the app that turns a success into custody_incomplete)'),
  ...twin('XR6', ERASE, `${X8_CALL}\n`, `${inlineRecord({ indent: 10, idExpr: 'cleaned.workRemovedId', note: X8_NOTE, reason: 'governance' })}\n`, 'X8 records the Work\'s end under a different reason class from every other member deletion'),
  ...twin('XR7', ERASE, `await writeWorkDeletionRecord(tx, cleaned.workRemovedId, '${X8_NOTE}');`, `await writeWorkDeletionRecord(tx, cleaned.workRemovedId, '${RM_NOTE}');`, 'X8 writes the note of a Remove, so the record cannot tell the two paths apart'),
  ...twin('XR8', ERASE, `${X8_CALL}\n`, L(`          const x8ManifestId = await writeWorkDeletionRecord(tx, cleaned.workRemovedId, '${X8_NOTE}');`, "          await tx.query(`INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id) VALUES ($1::uuid, 'member_manuscripts', $2) ON CONFLICT (object_kind, object_id) DO NOTHING`, [x8ManifestId, manuscriptId]);\n"), 'X8 also tombstones the writing, as the Delete flow does, although no writing was erased here'),
  // ── the helper (HELPER): what both paths share
  ...twin('HX1', HELPER, '  await tx.query(RECOVERY_CAPTURE_LOCK_SQL);\n', '', 'takeRecoveryCaptureLock does nothing, so Remove takes no lock although its source calls the helper'),
  ...twin('HX2', HELPER, "VALUES ($1::uuid, 'living_works', $2)", "VALUES ($1::uuid, 'member_manuscripts', $2)", 'the helper tombstones a Work under the kind of a writing'),
  ...twin('HX3', HELPER, "hashtextextended('soullab:r20:recovery-capture', 0)", "hashtextextended('soullab:r20:recovery-capturr', 0)", 'the helper\'s lock key is mistyped, so Remove waits for no backup and takes a lock nothing else takes'),
  ...twin('HX4', HELPER, "VALUES ('member_deletion', 'verified-member-self-service', now(), $1)", "VALUES ('governance', 'verified-member-self-service', now(), $1)", 'the helper records the deletion under the wrong reason class'),
  ...twin('HX5', HELPER, "VALUES ('member_deletion', 'verified-member-self-service', now(), $1)", "VALUES ('member_deletion', 'founder', now(), $1)", 'the helper records the deletion as authorized by someone other than the verified member'),
  ...twin('HX6', HELPER, "VALUES ('member_deletion', 'verified-member-self-service', now(), $1)", "VALUES ('member_deletion', 'verified-member-self-service', NULL, $1)", 'the helper records a deletion with no execution time', undefined, '(textual guard) the helper records a deletion with no execution time (the hermetic kill is the drift guard that compares the helper\'s manifest text with eraseManuscript.ts; the behavioural kill is HX6p)'),
  ...twin('HX7', HELPER, L('  await tx.query(', '    `INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id)', "     VALUES ($1::uuid, 'living_works', $2)", '     ON CONFLICT (object_kind, object_id) DO NOTHING`,', '    [manifestId, removedWorkId],', '  );', ''), '', 'the helper writes a manifest and never a tombstone'),
  ['HX8', 'jest', HELPER, '\n     ON CONFLICT (object_kind, object_id) DO NOTHING`,', '`,', '(textual guard) the helper\'s tombstone insert loses its ON CONFLICT clause, so recording a Work whose id is already tombstoned throws and aborts the removal (no probe records one id twice)'],
  ['HX9', 'jest', HELPER, "  const manifestId = manifest.rows[0]?.id;\n  if (!manifestId) throw new Error('r20_manifest_not_created');\n", '  const manifestId = manifest.rows[0]?.id;\n', 'the helper writes a tombstone for a manifest that was never created (undefined id) instead of throwing'],
  // ── the corrected Remove copy (LIB)
  ['CX1', 'jest', LIB, ' ${CONVERSATIONS_STAY_WITH_THE_WRITING}`,', '`,', 'the single-writing Remove dialog no longer says where the conversations about the writing stay and what ends them'],
  ['CX2', 'jest', LIB, ' ${CONVERSATIONS_STAY_WITH_THE_WRITINGS}`,', '`,', 'the several-writings Remove dialog no longer says where the conversations about the writings stay and what ends them'],
  ['CX3', 'jest', LIB, 'they stay with the writing, and deleting the writing deletes them.', 'they stay with the writing.', 'the single-writing retention sentence has no exit: it says the conversations stay and not what ends them'],
  ['CX3b', 'jest', LIB, 'they stay with the writings, and deleting a writing deletes its conversations.', 'they stay with the writings.', 'the several-writings retention sentence has no exit'],
  ['CX4', 'jest', LIB, "const WHAT_GOES_WITH_A_REMOVED_WORK =\n  'what you told MAIA about it,", "const WHAT_GOES_WITH_A_REMOVED_WORK =\n  'its conversations with MAIA, what you told MAIA about it,", 'the Remove goes-list is restored to say "its conversations with MAIA" go with the Work (mostly false: the conversations about a writing stay)'],
  ['CX5', 'jest', LIB, 'they stay with the writing, and deleting the writing deletes them.', 'they stay with the writing, and cannot be opened again from here; deleting the writing deletes them.', 'the retention sentence makes a blanket claim that the conversations cannot be opened (false: Develop and any other Work holding the writing still can)'],
  ['CX5b', 'jest', LIB, 'they stay with the writings, and deleting a writing deletes its conversations.', 'they stay with the writings, and nothing is left of them in the Studio; deleting a writing deletes its conversations.', 'the plural retention sentence claims that nothing is left (a blanket emptiness claim)'],
  ['CX6', 'jest', LIB, 'Your conversations with MAIA about that writing are not part of the Work', 'Your conversations with MAIA and Save receipts about that writing are not part of the Work', 'the Remove copy says Save receipts stay with the writing (they do not: they cascade away with the Work\'s editorial relationship record)'],
  ['CX7', 'jest', LIB, ' ${CONVERSATIONS_STAY_WITH_THE_WRITING}`,', ' ${CONVERSATIONS_STAY_WITH_THE_WRITINGS}`,', 'the single-writing Remove dialog carries the plural sentence ("those writings")'],
  ['CX8', 'jest', LIB, "const WHAT_GOES_WITH_A_REMOVED_WORK =\n  'what you told MAIA about it, your corrections, its plans, where you left off,", "const WHAT_GOES_WITH_A_REMOVED_WORK =\n  'what you told MAIA about it, your corrections, its plans,", 'the Remove goes-list stops naming something that does go (the counterpart of D3, which now covers the Delete list only)'],
  ['CX9', 'jest', LIB, ', and any conversation you had with MAIA about it while it held no writing\';', '\';', 'the Remove goes-list drops the conversations that DO belong to the Work row (opened while the Work held no writing), which do go'],
  // ── the editing-conversations clause (LIB), ruling 2026-11-08, lane record 6.9.5(e)
  ['CX10', 'jest', LIB, "they stay with the writing, and deleting the writing deletes them. '\n  + EDITING_CONVERSATIONS_NOT_OFFERED;", "they stay with the writing, and deleting the writing deletes them.';", 'the single-writing Remove dialog drops the clause, so it says nothing about the passage-by-passage conversations that no Work will offer again'],
  ['CX10b', 'jest', LIB, "deleting a writing deletes its conversations. '\n  + EDITING_CONVERSATIONS_NOT_OFFERED;", "deleting a writing deletes its conversations.';", 'the several-writings Remove dialog drops the clause'],
  ['CX11', 'jest', LIB, "and no Work will offer them again.'", "and they can no longer be opened.'", 'the clause turns into a claim about reach ("can no longer be opened"), which is false: the ask route still reads a thread by id for its owner'],
  ['CX12', 'jest', LIB, "and no Work will offer them again.'", "and no Work will offer them again, and nothing is left of them in the Studio.'", 'the clause grows a claim about what is left, which is false: the history stays, with the member\'s own words, until the writing is deleted'],

  // ══ WS-DELETE-01 retained editorial threads (2026-11-08): the orphaned-origin gate (founder-chosen option b-narrow) ══
  // Each entry is a plausible WRONG version of one decision of the gate. `<id>` is judged by the two hermetic suites ('jestog'), `<id>p`
  // by the retained-editorial PostgreSQL probe ('pgog'); an entry with only one half says why in its text. A '(textual guard)' entry is
  // caught only by a test that reads source text. There is NO candidate for "gate on the Work row instead of the relationship" on
  // purpose: the relationship is deleted by cascade from the Work, so no observable behaviour tells the two apart (irreducible).
  ['OG1', 'jestog', OG_ADOPT, 'if (await threadOriginIsOrphaned(memberId, input.threadId)) {', 'if (false as boolean) {', 'adoption is not gated at all: a removed Work\'s retained version still changes the writing'],
  ['OG1p', 'pgog', OG_ADOPT, 'if (await threadOriginIsOrphaned(memberId, input.threadId)) {', 'if (false as boolean) {', 'adoption is not gated at all: a removed Work\'s retained version still changes the writing'],
  ['OG2', 'jestog', OG_ADOPT, 'if (await threadOriginIsOrphaned(memberId, input.threadId)) {', 'if ((await authorizeVersion(memberId, chainId, input.versionId), await threadOriginIsOrphaned(memberId, input.threadId))) {', 'adoption refuses AFTER minting the permission: a durable authorization exists for an act that was refused'],
  ['OG2p', 'pgog', OG_ADOPT, 'if (await threadOriginIsOrphaned(memberId, input.threadId)) {', 'if ((await authorizeVersion(memberId, chainId, input.versionId), await threadOriginIsOrphaned(memberId, input.threadId))) {', 'adoption refuses AFTER minting the permission: a durable authorization exists for an act that was refused'],
  ['OG3', 'jestog', OG_ADOPT_ROUTE, "outcome.reason === 'origin_unavailable' ? 409 : 404;", "outcome.reason === 'origin_unavailable' ? 404 : 404;", 'the route answers a removed Work as an unknown id (404) instead of the 409 the thread, version and open paths use'],
  ['OG3p', 'pgog', OG_ADOPT_ROUTE, "outcome.reason === 'origin_unavailable' ? 409 : 404;", "outcome.reason === 'origin_unavailable' ? 404 : 404;", 'the route answers a removed Work as an unknown id (404) instead of the 409 the thread, version and open paths use'],
  // OG4 has no hermetic twin: GATE-8's substring checks cannot see an extra OR branch; only a database can say what the predicate does to a thread that never had an origin.
  ['OG4p', 'pgog', OG_ORPHAN, "  return `EXISTS (\n    SELECT 1 FROM writer_editorial_thread_origins o\n     WHERE o.thread_id = ${threadRef}\n       AND NOT EXISTS (\n         SELECT 1 FROM writer_editorial_relationships r\n          WHERE r.id = o.relationship_id AND r.member_id = o.member_id))`;", "  return `(NOT EXISTS (\n    SELECT 1 FROM writer_editorial_relationships r\n     WHERE r.id = (SELECT o.relationship_id FROM writer_editorial_thread_origins o WHERE o.thread_id = ${threadRef})))`;", 'a thread that never had an origin row reads as orphaned (its missing origin names no relationship that exists), so the gate refuses and the list hides older threads that the 2026-11-01 ruling and its notice protect'],
  ['OG5', 'jestog', OG_ORPHAN, '       AND NOT EXISTS (\n         SELECT 1 FROM writer_editorial_relationships r\n          WHERE r.id = o.relationship_id AND r.member_id = o.member_id))`;', '       AND TRUE)`;', 'every thread that has an origin row counts as orphaned, so a LIVE conversation is refused and hidden too'],
  ['OG5p', 'pgog', OG_ORPHAN, '       AND NOT EXISTS (\n         SELECT 1 FROM writer_editorial_relationships r\n          WHERE r.id = o.relationship_id AND r.member_id = o.member_id))`;', '       AND TRUE)`;', 'every thread that has an origin row counts as orphaned, so a LIVE conversation is refused and hidden too'],
  ['OG7', 'jestog', OG_LIST, "        AND NOT ${orphanedOriginSql('th.id')}\n", '', 'the list still offers a removed Work\'s thread, with its frozen passage, to a surface that cannot open it'],
  ['OG7p', 'pgog', OG_LIST, "        AND NOT ${orphanedOriginSql('th.id')}\n", '', 'the list still offers a removed Work\'s thread, with its frozen passage, to a surface that cannot open it'],
  ['OG8', 'jestog', OG_LIST, "AND NOT ${orphanedOriginSql('th.id')}", "AND ${orphanedOriginSql('th.id')}", 'the list filter is inverted: only the removed Work\'s threads are offered'],
  ['OG8p', 'pgog', OG_LIST, "AND NOT ${orphanedOriginSql('th.id')}", "AND ${orphanedOriginSql('th.id')}", 'the list filter is inverted: only the removed Work\'s threads are offered'],
  ['OG9', 'jestog', OG_UNDO, 'export async function undoApplication(memberId: string, authorizationId: string): Promise<RecoveryOutcome> {\n  return transaction(async tx => {', "export async function undoApplication(memberId: string, authorizationId: string): Promise<RecoveryOutcome> {\n  return transaction(async tx => {\n    const og = await tx.query(`SELECT 1 FROM ask_threads th JOIN manuscript_revision_authorizations a ON a.proposal_chain_id = th.proposal_chain_id WHERE a.id = $1 AND ${(await import('@/lib/writers-studio/orphanedEditorialOrigin')).orphanedOriginSql('th.id')}`, [authorizationId]);\n    if (og.rows.length > 0) return { kind: 'refused', reason: 'unknown_application' };", '(textual guard) undo is gated too, which strips the only way back from an adoption the member made before the Remove'],
  ['OG9p', 'pgog', OG_UNDO, 'export async function undoApplication(memberId: string, authorizationId: string): Promise<RecoveryOutcome> {\n  return transaction(async tx => {', "export async function undoApplication(memberId: string, authorizationId: string): Promise<RecoveryOutcome> {\n  return transaction(async tx => {\n    const og = await tx.query(`SELECT 1 FROM ask_threads th JOIN manuscript_revision_authorizations a ON a.proposal_chain_id = th.proposal_chain_id WHERE a.id = $1 AND ${(await import('@/lib/writers-studio/orphanedEditorialOrigin')).orphanedOriginSql('th.id')}`, [authorizationId]);\n    if (og.rows.length > 0) return { kind: 'refused', reason: 'unknown_application' };", 'undo is gated too, which strips the only way back from an adoption the member made before the Remove'],
  ['OG10', 'jestog', OG_ASK, 'if (!t || t.manuscriptId !== id) {', "if (!t || t.manuscriptId !== id || (await (await import('@/lib/writers-studio/orphanedEditorialOrigin')).threadOriginIsOrphaned(memberId, threadId))) {", '(textual guard) the ask route\'s ?thread= read is gated, which removes the member\'s only sight of what is retained before option (c) gives them a door'],
  ['OG10p', 'pgog', OG_ASK, 'if (!t || t.manuscriptId !== id) {', "if (!t || t.manuscriptId !== id || (await (await import('@/lib/writers-studio/orphanedEditorialOrigin')).threadOriginIsOrphaned(memberId, threadId))) {", 'the ask route\'s ?thread= read is gated, which removes the member\'s only sight of what is retained before option (c) gives them a door'],
  ['OG11', 'jestog', OG_ADOPT_ROUTE, "const BODY_KEYS = ['threadId', 'versionId'] as const;", "const BODY_KEYS = ['threadId', 'versionId', 'relationshipId'] as const;", '(textual guard) the adoption body grows a relationshipId: the strict variant (b-strict) arrives through a contract change nobody chose'],
  ['OG12', 'jestog', OG_ORPHAN, 'return r.rows.length === 1 && r.rows[0]!.orphaned === true;', 'return r.rows.length === 1 && r.rows[0]!.orphaned !== false;', 'an unanswered value (null) is read as an orphan, so a database that cannot answer refuses members'],
  ['OG13', 'jestog', OG_ORPHAN, 'return r.rows.length === 1 && r.rows[0]!.orphaned === true;', 'return r.rows.length !== 1 || r.rows[0]!.orphaned === true;', 'a thread that is not the member\'s (no row) is read as an orphan'],
  ['OG14', 'jestog', OG_ORPHAN, '    [memberId, threadId]);', '    [threadId, memberId]);', 'the member and the thread are swapped in the orphan question, so it asks about nobody and fails open'],
  ['OG14p', 'pgog', OG_ORPHAN, '    [memberId, threadId]);', '    [threadId, memberId]);', 'the member and the thread are swapped in the orphan question, so it asks about nobody and fails open'],
];

const args = process.argv.slice(2);
if (args.includes('--list')) {
  for (const [id, kind, file, , , why] of MUTANTS) console.log(`${id.padEnd(4)} ${kind.padEnd(4)} ${file}\n       ${why}`);
  process.exit(0);
}
const jestOnly = args.includes('--jest-only');
const pgOnly = args.includes('--pg-only');
const checkOnly = args.includes('--check');
const ids = args.filter((a) => !a.startsWith('--'));
const unknownIds = ids.filter((id) => !MUTANTS.some((m) => m[0] === id));
if (unknownIds.length) { console.error(`unknown mutant id(s): ${unknownIds.join(', ')}`); process.exit(2); }
const duplicates = MUTANTS.map((m) => m[0]).filter((id, i, all) => all.indexOf(id) !== i);
if (duplicates.length) { console.error(`duplicate mutant id(s): ${[...new Set(duplicates)].join(', ')}`); process.exit(2); }
const selected = MUTANTS.filter(([id, kind]) => (ids.length ? ids.includes(id) : true) && !(jestOnly && !kind.startsWith('jest')) && !(pgOnly && !kind.startsWith('pg')));
if (selected.length === 0) { console.error('no mutant selected (the ids and kind filters match nothing); nothing was run'); process.exit(2); }

/** Where is the `nth` (1-based) occurrence of `anchor`? -1 when there are fewer. For the default (no nth) the anchor must be UNIQUE. */
const locate = (text, anchor, nth) => {
  const all = [];
  for (let at = text.indexOf(anchor); at !== -1; at = text.indexOf(anchor, at + 1)) all.push(at);
  if (nth === undefined) return all.length === 1 ? { at: all[0], found: 1 } : { at: -1, found: all.length };
  return all.length >= nth ? { at: all[nth - 1], found: all.length } : { at: -1, found: all.length };
};

// An earlier run that was killed (SIGKILL, power) can leave a mutated file and its backup behind. Never start on top of one.
const leftovers = [...new Set(MUTANTS.map((m) => m[2]))].filter((f) => existsSync(join(ROOT, `${f}.mutbak`)));
if (leftovers.length) {
  console.error(`REFUSING TO START: a previous run left backups behind (${leftovers.map((f) => `${f}.mutbak`).join(', ')}).\nEach .mutbak is the ORIGINAL file; the file beside it may still be mutated. Restore with: mv <file>.mutbak <file>`);
  process.exit(2);
}

// The anchors are checked against the files as they are now, before anything is run.
let setupErrors = 0;
for (const [id, , file, anchor, , why, opts] of selected) {
  const { found, at } = locate(readFileSync(join(ROOT, file), 'utf8'), anchor, opts?.nth);
  if (at === -1) { console.log(`SETUP-ERROR   ${id.padEnd(4)} ${why} (anchor found ${found} time(s)${opts?.nth ? `, wanted occurrence ${opts.nth}` : ', wanted exactly 1'})`); setupErrors += 1; }
}
if (setupErrors) process.exit(2);
if (checkOnly) { console.log(`${selected.length} anchors found.`); process.exit(0); }

// The PostgreSQL harness needs root and the server binaries. Say so up front, instead of letting every pg mutant "die" for that reason.
if (selected.some((m) => m[1].startsWith('pg'))) {
  const pgbin = process.env.PGBIN ?? '/usr/lib/postgresql/16/bin';
  const root = typeof process.getuid === 'function' && process.getuid() === 0;
  if (!root || !existsSync(join(pgbin, 'initdb')) || !existsSync(join(pgbin, 'pg_ctl'))) {
    console.error(`PG HARNESS UNAVAILABLE: it needs to run as root with the PostgreSQL 16 binaries in ${pgbin}. The pg mutants were NOT run. Use --jest-only, or run on a host that has them.`);
    process.exit(3);
  }
}

const backups = new Map();
let child = null;
const restoreAll = () => { for (const [path, bak] of backups) { try { renameSync(bak, path); } catch { /* already restored */ } } backups.clear(); };
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { try { child?.kill('SIGTERM'); } catch { /* gone */ } restoreAll(); process.exit(130); });
process.on('exit', restoreAll);

const out = mkdtempSync(join(tmpdir(), 'ws-delete-mutants-'));

/** Run a command to completion WITHOUT blocking the event loop, so a signal can restore the files; time-bounded, and a timeout is
 *  reported as a timeout (never as a failing test). */
const exec = (cmd, cmdArgs, env, timeoutMs) => new Promise((done) => {
  child = spawn(cmd, cmdArgs, { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let text = '';
  let timedOut = false;
  child.stdout.on('data', (d) => { text += d; });
  child.stderr.on('data', (d) => { text += d; });
  const timer = setTimeout(() => { timedOut = true; child?.kill('SIGTERM'); setTimeout(() => child?.kill('SIGKILL'), 15000).unref(); }, timeoutMs);
  child.on('error', (err) => { clearTimeout(timer); child = null; done({ code: null, timedOut: false, spawnError: true, text: String(err) }); });
  child.on('close', (code) => { clearTimeout(timer); child = null; done({ code, timedOut, spawnError: false, text }); });
});

const run = async (kind) => {
  if (kind === 'jest' || kind === 'jestog') {
    const r = await exec('npx', ['jest', ...(kind === 'jest' ? JEST_TESTS : OG_JEST), '--silent', '--coverage=false'], process.env, 900000);
    return { ...r, summary: /^Tests:\s/m };
  }
  const log = join(out, 'jest.log');
  rmSync(log, { force: true });                 // a log left by an earlier run must never be mistaken for this one
  const r = await exec('bash', [kind === 'pgog' ? PG_RUN_OG : PG_RUN], { ...process.env, WS_DELETE_OUT: out }, 900000);
  return { ...r, text: `${r.text}\n${existsSync(log) ? readFileSync(log, 'utf8') : ''}`, summary: /^Tests:\s/m };
};
/** A failing TEST, not a failing hook: a `beforeAll`/`afterAll` error (a harness problem) is not evidence that the mutant was caught. */
const HOOK = /\b(before|after)(All|Each)\b|\bhook\b/i;
const failingLines = (text) => text.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('✕') || /^● .* › /.test(l));
const failingTests = (text) => failingLines(text).filter((l) => !HOOK.test(l));
// A candidate that breaks the SQL (a parameter-count or parameter-type error, or a syntax error, fails EVERY request) is a broken build, not a kill by the behaviour it names.
const COMPILE = /SyntaxError|Test suite failed to run|Cannot find module|error TS\d+|bind message supplies|could not determine data type of parameter|syntax error at or near/;

// BASELINE: the unmutated suite must be green, or "killed" would only mean "red". Each harness kind that will be used is run once.
for (const kind of [...new Set(selected.map((m) => m[1]))]) {
  const base = await run(kind);
  if (base.timedOut || base.spawnError || base.code !== 0 || !base.summary.test(base.text) || failingLines(base.text).length > 0) {
    console.error(`BASELINE RED for the ${kind} suite${base.timedOut ? ' (timed out)' : ''}: the unmutated code does not pass, so no kill could mean anything.\n${failingLines(base.text).slice(0, 10).join('\n')}`);
    process.exit(2);
  }
  console.log(`baseline green (${kind})`);
}

let bad = 0;
const rows = [];
for (const [id, kind, file, anchor, replacement, why, opts] of selected) {
  const path = join(ROOT, file);
  const original = readFileSync(path, 'utf8');
  const { at } = locate(original, anchor, opts?.nth);
  const bak = `${path}.mutbak`;
  copyFileSync(path, bak);
  backups.set(path, bak);
  try {
    writeFileSync(path, original.slice(0, at) + replacement + original.slice(at + anchor.length));
    const { code, text, summary, timedOut, spawnError } = await run(kind);
    const failed = failingTests(text);
    let verdict;
    if (timedOut) verdict = 'TIMEOUT';                                     // a hung run is not a kill
    else if (spawnError) verdict = 'SPAWN-ERROR';
    else if (COMPILE.test(text)) verdict = 'COMPILE-ERROR';                // a build break is not a kill by a test
    else if (code === 0) verdict = 'SURVIVED';
    else if (!summary.test(text) || failed.length === 0) verdict = 'UNPROVEN';  // non-zero exit, but no TEST was seen to fail (a hook error alone does not count)
    else verdict = 'KILLED';
    if (verdict !== 'KILLED') bad += 1;
    // How many failing test names to print per candidate: 2 by default; MUTANT_SHOW_FAILED=n (or `all`) prints more, to read the whole kill.
    const shown = process.env.MUTANT_SHOW_FAILED === 'all' ? failed.length : Number(process.env.MUTANT_SHOW_FAILED ?? 2) || 2;
    rows.push([verdict, id, why, failed.slice(0, shown).map((l) => l.slice(0, 160))]);
  } finally {
    renameSync(bak, path);
    backups.delete(path);
  }
}
for (const [verdict, id, why, failed] of rows) {
  console.log(`${verdict.padEnd(13)} ${id.padEnd(4)} ${why}`);
  for (const f of failed) console.log(`${' '.repeat(18)}${f}`);
}
const killed = rows.filter((r) => r[0] === 'KILLED').length;
console.log(`\n${killed} of ${rows.length} mutants killed${bad ? `; ${bad} NOT killed (see above)` : ''}`);
process.exit(bad ? 1 : 0);
