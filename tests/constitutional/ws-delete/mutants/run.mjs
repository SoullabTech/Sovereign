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
import { spawnSync } from 'node:child_process';
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
  'app/writers-studio/__tests__/historyActions.test.ts',
  'lib/writersStudio/__tests__/deleteWork.test.ts',
  'lib/writersStudio/__tests__/deleteWorkTruth.test.ts',
  'lib/writersStudio/__tests__/removalCopyDrift.test.ts',
  'deleteWorkParam.test.ts',
  'eraseManuscriptGuard.test.ts',
];
const PG_RUN = 'tests/constitutional/ws-delete/dynamic/run-local-pg16.sh';
const HISTORY = `${HOME}/P4R1HistoryPage.tsx`;
const HISTORY_RULE = 'app/writers-studio/historyActions.ts';
const WORK_ROUTE = 'app/api/sovereign/living-works/[id]/route.ts';

/* [id, kind, file, anchor (must occur exactly once, or `nth` of several), replacement, the error it embodies, { nth }?] */
const MUTANTS = [
  // ── the command (lib/writersStudio/deleteWork.ts)
  ['L1', 'jest', LIB, '${workId ? `?workId=${encodeURIComponent(workId)}` : \'\'}', '', 'the Work card stops naming its Work, so a stale card can reach another Work\'s writing'],
  ['L2', 'jest', LIB, 'if (res.status === 404 && workId && manuscriptId) {', 'if (false as boolean && workId && manuscriptId) {', 'a vanished writing leaves an empty, openable Work behind (the detached state)'],
  ['L3', 'jest', LIB, 'if (outcome.ok) return { ok: true };\n  if (outcome.sessionEnded)', 'return { ok: true };\n  if (outcome.sessionEnded)', 'a failed follow-through is reported as a successful delete'],
  ['L4', 'jest', LIB, 'if (res.status >= 500) return { ok: false, message: UNKNOWN_DELETE, unknown: true };\n  return { ok: false, message: GENERIC };', 'if (res.status >= 500) return { ok: false, message: GENERIC };\n  return { ok: false, message: GENERIC };', 'a server error that does not say what it did is reported as "nothing was removed"', { nth: 1 }],
  ['L4b', 'jest', LIB, 'if (res.status >= 500) return { ok: false, message: UNKNOWN_DELETE, unknown: true };\n  return { ok: false, message: GENERIC };', 'if (res.status >= 500) return { ok: false, message: GENERIC };\n  return { ok: false, message: GENERIC };', 'a dangling declaration\'s withdrawal that errors in an unknown way is reported as "nothing was removed"', { nth: 2 }],
  ['L5', 'jest', LIB, '    // The request may have reached the server before the connection failed: we do not know.\n    return { ok: false, message: UNKNOWN_DELETE, unknown: true };', '    return { ok: false, message: GENERIC };', 'a dropped connection is reported as "nothing was removed"'],
  ['L6', 'jest', LIB, 'if (res.status >= 500) return { ok: false, message: REMOVE_UNKNOWN, unknown: true };', 'if (res.status >= 500) return { ok: false, message: REMOVE_GENERIC };', 'a removal whose outcome is unknown is reported as "nothing changed"'],
  ['L7', 'jest', LIB, 'if (res.ok || res.status === 404) return { ok: true };\n  if (res.status === 401) return { ok: false, message: SESSION_ENDED_DELETE, sessionEnded: true };\n\n  const body', 'if (res.ok || res.status === 404) return { ok: true };\n\n  const body', 'an ended session is told to "try again"'],
  ['L8', 'jest', LIB, 'REFUSED_BEFORE_ANY_ACT.has(refusal)) return { ok: false, message: deletionRefusalCopy(refusal), refusal };', 'REFUSED_BEFORE_ANY_ACT.has(refusal)) return { ok: false, message: deletionRefusalCopy(refusal) };', 'the refusal classification is dropped, so shared writing cannot be told from any failure'],
  ['L9', 'jest', LIB, "if (outcome.refusal === 'declared_in_other_works') { await refreshed(refresh); throw new DeletionSharedMaterial", 'if (outcome.refusal) { await refreshed(refresh); throw new DeletionSharedMaterial', 'every refusal opens the "keep the writing" question'],
  ['L10', 'jest', LIB, '// Removed, but not yet confirmed: stop listing it AND still say so.\n  if (outcome.removed) { await refreshed(refresh); throw', '// Removed, but not yet confirmed: stop listing it AND still say so.\n  if (outcome.removed) { throw', 'the page is not re-read after a Delete that committed'],
  ['L10b', 'jest', LIB, 'if (outcome.ok) { await refreshed(refresh); return; }\n  if (outcome.removed) { await refreshed(refresh); throw new DeletionUnconfirmed(outcome.message); }\n  if (outcome.unknown) {', 'if (outcome.ok) { await refreshed(refresh); return; }\n  if (outcome.removed) { throw new DeletionUnconfirmed(outcome.message); }\n  if (outcome.unknown) {', 'the page is not re-read after a Remove that committed'],
  ['L11', 'jest', LIB, 'const fresh = await refreshed(refresh);\n    throw new Error(`${outcome.message} ${fresh ? HOME_CURRENT : HOME_NOT_RELOADED}`);', 'throw new Error(`${outcome.message} ${HOME_CURRENT}`);', 'a stale-card refusal says Home is current without re-reading it'],
  ['L11b', 'jest', LIB, 'outcome.unknown ? `${outcome.message} ${fresh ? HOME_CURRENT_CHECK : HOME_NOT_RELOADED}` : outcome.message', 'outcome.unknown ? `${outcome.message} ${HOME_CURRENT_CHECK}` : outcome.message', 'an unknown Delete outcome says Home is current even when the re-read failed'],
  ['L11c', 'jest', LIB, 'throw new Error(`${outcome.message} ${fresh ? HOME_CURRENT_CHECK : HOME_NOT_RELOADED}`);\n  }\n  throw new Error(outcome.message);\n}', 'throw new Error(`${outcome.message} ${HOME_CURRENT_CHECK}`);\n  }\n  throw new Error(outcome.message);\n}', 'an unknown Remove outcome says Home is current even when the re-read failed'],
  ['L12', 'jest', LIB, 'if (outcome.unknown || outcome.stale) {\n    const fresh = await refreshed(refresh);', 'if (outcome.unknown) {\n    const fresh = await refreshed(refresh);', 'a failed follow-through after "already gone" does not re-read the page it proved stale'],
  ['L13', 'jest', LIB, 'try { return (await refresh()) !== false; } catch { return false; }', 'return (await refresh()) !== false;', 'a failed re-read turns a successful delete into a reported failure'],
  ['L13b', 'jest', LIB, 'try { return (await refresh()) !== false; } catch { return false; }', 'try { await refresh(); return true; } catch { return false; }', 'a re-read that reports failure is treated as success'],
  ['L14', 'jest', LIB, '`This writing is also in ${where}, so', '`Nothing is deleted. This writing is also in ${where}, so', 'the removal copy says nothing is deleted (the Work, its conversations and its image are)'],
  ['L15', 'jest', LIB, "/* Not \"Keep it\": under a question that says \"keep the writing\" that reads as an answer, not as cancel. */\n    cancel: 'Don’t remove',", "cancel: 'Keep it',", 'the cancel button reads as an answer to "keep the writing?"'],
  ['L16', 'jest', LIB, "'It cannot be undone, and private backups already taken", "'Private backups already taken", 'the removal copy drops that it cannot be undone'],
  ['L17', 'jest', LIB, 'None of the writings is deleted: each stays', 'Each stays', 'the several-writings copy does not say that none is deleted'],
  ['L18', 'jest', LIB, 'our independent record of the deletion has been sealed.', 'our independent record of the deletion has been destroyed.', 'the custody sentence says the deletion record (which is kept on purpose) is owed destruction'],
  ['L19', 'jest', LIB, 'return outcome.unknown\n    ? { ok: false, message: UNKNOWN_DELETE, unknown: true, stale: true }', 'return outcome.unknown\n    ? { ok: false, message: GENERIC, stale: true }', 'a follow-through whose outcome is unknown is reported as "nothing was removed"'],
  ['L20', 'jest', LIB, 'const outcome = workStays ? await withdrawDeclaration(workId, manuscriptId, fetcher) : await removeWork(workId, fetcher);', 'const outcome = await removeWork(workId, fetcher);', 'a Work that was to STAY is removed because its writing was already gone'],
  ['L21', 'jest', LIB, "refusal !== null && OWED_AFTER_REMOVAL.has(refusal) ? refusal : 'custody_incomplete'", "refusal !== null ? refusal : 'custody_incomplete'", 'a committed removal with a code the client does not know is told as "nothing was removed"'],
  ['L22', 'jest', LIB, 'if (res.status >= 500) return { ok: false, message: UNKNOWN_DELETE, unknown: true };\n  return { ok: false, message: GENERIC };', 'if (res.status >= 500 && refusal === null) return { ok: false, message: UNKNOWN_DELETE, unknown: true };\n  return { ok: false, message: GENERIC };', 'a 5xx with a refusal code the client does not know is told as "nothing was removed"', { nth: 1 }],
  ['L23', 'jest', LIB, "    case 'image_bytes_owed':\n      return 'This work was removed from your studio, but we could not yet confirm that its image has been destroyed. '", "    case 'image_bytes_owed':\n      return 'This work was removed from your studio, but we could not confirm that its original file has been destroyed. '", 'an owed IMAGE is described as the original file'],
  // ── the door (useWorkDeleteDoor.tsx)
  ['H1', 'jest', DOOR, ': allWorks.filter((other) => other.id !== work.id && manuscriptIdsOf(other).includes(shared.manuscriptId)).length;', ': 1;', 'the removal question is trusted from the 409 instead of re-derived from the Works on screen'],
  ['H2', 'jest', DOOR, "if (choices.length > 1 || ids.length > 1) return { kind: 'many', manuscriptId: null };", "if (false as boolean) return { kind: 'many', manuscriptId: null };", 'Delete on a Work with several writings silently picks one to destroy'],
  ['H3', 'jest', DOOR, 'setSettled(`“${title}” was removed.`);', "setSettled('');", 'no removed state after Remove'],
  ['H4', 'jest', DOOR, 'onDeletionNotice(removedWorkNotice(title, removalMode), false);', '', 'no page notice after Remove'],
  ['H5', 'jest', DOOR, 'setConfirming(false);\n              onDeletionNotice(`“${title}”: ${err.message}`);\n            } else if (err instanceof DeletionSharedMaterial', 'setConfirming(false);\n            } else if (err instanceof DeletionSharedMaterial', 'the custody message of a Delete stays on a card that is about to unmount'],
  ['H5b', 'jest', DOOR, 'setShared(null);\n              onDeletionNotice(`“${title}”: ${err.message}`);', 'setShared(null);', 'the custody message of a Remove stays on a card that is about to unmount'],
  ['H7', 'jest', DOOR, 'unseen.current = null;\n    setConfirming(false);\n    setShared(null);', 'unseen.current = null;\n    setConfirming(false);', 'Keep it leaves the card in the removal state'],
  ['H8', 'jest', DOOR, 'else if (err instanceof DeletionSharedMaterial && manuscriptId) {', 'else if (err instanceof Error && manuscriptId) {', 'any error opens the removal question'],
  ['H9', 'jest', DOOR, 'await onRemoveWork(work.id);', 'await onDeleteWork(work.id, null);', 'the removal button calls Delete again'],
  ['H10', 'jest', DOOR, "{kind === 'many' ? 'Remove' : 'Delete'}", "{'Delete'}", 'a Work with several writings is offered Delete'],
  ['H11', 'jest', DOOR, 'const words = deleteConfirmCopy(kind, title);', "const words = deleteConfirmCopy('writing', title);", 'every Delete confirmation describes the one-writing case'],
  ['H12', 'jest', DOOR, '            if (err instanceof DeletionUnconfirmed) {\n              // The Work is gone from the list', '            if (false as boolean) {\n              // The Work is gone from the list', 'an unconfirmed Delete is shown as an ordinary failure'],
  ['H12b', 'jest', DOOR, '            if (err instanceof DeletionUnconfirmed) {\n              // The Work row is gone', '            if (false as boolean) {\n              // The Work row is gone', 'an unconfirmed Remove is shown as an ordinary failure'],
  ['H13', 'jest', DOOR, "const removalMode: 'shared' | 'many' | null = kind === 'many' ? 'many' : (stillShared ? 'shared' : null);", "const removalMode: 'shared' | 'many' | null = stillShared ? 'shared' : null;", 'a Work with several writings has no door at all'],
  ['H14', 'jest', DOOR, 'if (unseen.current) handOver.current(unseen.current, false);', '', 'a message the member has not seen is lost with its card'],
  ['H15', 'jest', DOOR, "if (kind === 'writing-keeps-work') {\n              // The Work stays", "if (false as boolean) {\n              // The Work stays", 'deleting only the writing of a Work that stays replaces the Work\'s card with a ghost for good'],
  ['H16', 'jest', DOOR, "{ workStays: kind === 'writing-keeps-work' }", '{}', 'a Work that was to stay is not marked as staying, so a vanished writing costs the member the Work'],
  ['H17', 'jest', DOOR, 'const shownError = deleteError ?? (shared !== null ? shared.message : null);', 'const shownError = deleteError;', 'a 409 the page cannot explain is a silent no-op'],
  ['H18', 'jest', DOOR, ': removeSharedWorkCopy(othersHolding)', ': removeSharedWorkCopy(1)', 'the removal sentence says "your other Work" when several Works hold the writing'],
  ['H19', 'jest', DOOR, 'unseen.current = null;\n          try {\n            await onRemoveWork(work.id);', 'try {\n            await onRemoveWork(work.id);', 'a message from an earlier attempt is handed to the page after a later attempt succeeded'],
  // ── the page (P4R1HomeView.tsx, P4R1HomeController.tsx)
  ['V1', 'jest', VIEW, '          {deleteNoticeEl}\n          <section className="fr-home-anchor fr-home-threshold" data-field="anchor">', '          <section className="fr-home-anchor fr-home-threshold" data-field="anchor">', 'the welcome screen after the last Work is deleted drops the notice'],
  ['V2', 'jest', VIEW, '          {deleteNoticeEl}\n          <section className="fr-home-region">\n            <p className="fr-home-eyebrow">Your Works</p>\n            <div className="fr-home-shelf fr-home-shelf-4">', '          <section className="fr-home-region">\n            <p className="fr-home-eyebrow">Your Works</p>\n            <div className="fr-home-shelf fr-home-shelf-4">', 'the many-Works layout drops the notice'],
  ['V3', 'jest', VIEW, '          {deleteNoticeEl}\n          <WorkAnchor\n            key={props.returnWork.id}', '          <WorkAnchor\n            key={props.returnWork.id}', 'the returning-to-one-Work layout drops the notice'],
  ['V4', 'jest', VIEW, '          {deleteNoticeEl}\n          <WorkAnchor\n            key={props.arrival.resume.id}', '          <WorkAnchor\n            key={props.arrival.resume.id}', 'the continue layout drops the notice'],
  ['V5', 'jest', VIEW, '          {deleteNoticeEl}\n          <p className="fr-home-here">{HOME_COPY.writingHere}</p>', '          <p className="fr-home-here">{HOME_COPY.writingHere}</p>', 'the loose-writing layout drops the notice'],
  ['V6', 'jest', VIEW, '          {unclaimedWriting}\n          {creationControls}\n          {/* Returning to one Work must never hide', '          {deleteNoticeEl}\n          {unclaimedWriting}\n          {creationControls}\n          {/* Returning to one Work must never hide', 'the notice is rendered twice in one layout'],
  ['V7', 'jest', VIEW, "role={notice.urgent ? 'alert' : 'status'}", 'role="status"', 'the custody notice is only a polite status'],
  ['V8', 'jest', VIEW, '          {del.door}\n        </div>\n      </div>\n      <P4R1WorkMaterialsSummary work={work} />', '        </div>\n      </div>\n      <P4R1WorkMaterialsSummary work={work} />', 'the hero Work has no way to delete or remove it'],
  ['V9', 'jest', VIEW, 'setNotices((current) => [...current, { id, message, urgent }]);', 'setNotices([{ id, message, urgent }]);', 'a later notice erases an unacknowledged custody alert'],
  ['V10', 'jest', VIEW, '          <WorkAnchor\n            key={props.returnWork.id}', '          <WorkAnchor', 'the hero Work\'s delete state follows the slot, so the next Work is hidden behind "was deleted"'],
  ['V11', 'jest', VIEW, '          <WorkAnchor\n            key={props.arrival.resume.id}', '          <WorkAnchor', 'the continue layout\'s hero Work has the same slot-following state'],
  ['V12', 'jest', VIEW, 'const words = deleteConfirmCopy(writingDeleteKindFor(manuscript.id, works), writingTitle);', "const words = deleteConfirmCopy('writing', writingTitle);", 'loose writing\'s confirmation talks about a Work that does not exist'],
  ['V13', 'jest', VIEW, "useEffect(() => { if (notices.length > 0) noticeRef.current?.scrollIntoView?.({ block: 'nearest' }); }, [notices.length]);", '', 'a notice appears off-screen'],
  ['V14', 'jest', VIEW, 'onClick={() => setNotices((current) => current.filter((n) => n.id !== notice.id))}', 'onClick={() => setNotices([])}', 'dismissing one notice dismisses them all'],
  ['A1', 'jest', VIEW, 'allWorks={props.works}', 'allWorks={[]}', 'the returning-to-one-Work hero cannot see the other Works', { nth: 1 }],
  ['A2', 'jest', VIEW, 'allWorks={props.works}', 'allWorks={[]}', '"Your other Works" cards cannot see the other Works', { nth: 2 }],
  ['A3', 'jest', VIEW, 'allWorks={props.works}', 'allWorks={[]}', 'the continue hero cannot see the other Works', { nth: 3 }],
  ['A4', 'jest', VIEW, 'allWorks={props.works}', 'allWorks={[]}', '"Also written" cards cannot see the other Works', { nth: 4 }],
  ['A5', 'jest', VIEW, 'allWorks={props.works}', 'allWorks={[]}', 'the continue shelf cannot see the other Works', { nth: 5 }],
  ['A6', 'jest', VIEW, 'allWorks={props.works}', 'allWorks={[]}', 'the loose-writing layout\'s Works cannot see the other Works', { nth: 6 }],
  ['A7', 'jest', VIEW, 'allWorks={props.works}', 'allWorks={[]}', 'the many-Works layout cannot see the other Works', { nth: 7 }],
  ['C1', 'jest', CTRL, 'runRemoveWork(workId, (url, init) => apiFetch(url, init), refresh)', 'runDeleteWork({ workId, manuscriptId: null }, (url, init) => apiFetch(url, init), refresh)', 'the controller\'s removal goes through Delete'],
  ['C2', 'jest', CTRL, 'onRemoveWork={onRemoveWork}', '', 'the view is never handed the removal act'],
  ['C3', 'jest', CTRL, '...(options?.workStays ? { workStays: true } : {})', '', 'the Work-stays intent never reaches the command'],
  ['C4', 'jest', CTRL, 'return read.every(Boolean);', 'return true;', 'the re-read reports success even when a list could not be read'],
  ['Y1', 'jest', HISTORY_RULE, 'if (holders.length > 1) {', 'if (false as boolean) {', 'History offers a Delete on a writing two Works hold, which the server can only refuse'],
  ['Y2', 'jest', HISTORY, '{action.kind === \'open\' && action.why === \'shared\' ? (', '{false as boolean ? (', 'History hides Delete on a shared writing without saying where the way forward is'],
  ['Y3', 'jest', HISTORY, 'const words = deleteConfirmCopy(writingDeleteKindFor(action.manuscriptId, props.works), action.title);', "const words = deleteConfirmCopy('loose', action.title);", 'History does not say that a Work holding only this writing goes with it'],
  // ── the hermetic server tests (no database)
  ['J1', 'jest', ROUTE, 'viaWork === null ? {} : { viaWorkId: viaWork.toLowerCase() }', '{}', 'the route drops the Work the card named'],
  ['J2', 'jest', ROUTE, 'viaWorkId: viaWork.toLowerCase()', 'viaWorkId: viaWork', 'an upper-case Work id never matches, so a valid card is refused as stale'],
  ['J3', 'jest', ROUTE, 'if (viaWork !== null && !UUID_RE.test(viaWork)) {', 'if (false as boolean) {', 'a malformed workId reaches the database'],
  ['J4', 'jest', ROUTE, ': { refusal: outcome.refusal },', ': { refusal: outcome.refusal, works: 0 },', 'the stale-card refusal starts to describe other Works'],
  ['J5', 'jest', ERASE, 'if (options.viaWorkId !== undefined && !claims.rows.some(', 'if (options.viaWorkId !== undefined && claims.rows.length <= 1 && !claims.rows.some(', 'the stale-card guard is evaluated after the shared-writing refusal'],
  ['J6', 'jest', ERASE, 'ORDER BY w.id\n        FOR UPDATE`,', 'ORDER BY w.id`,', 'the Work rows are read, not locked, before the expression rows'],
  ['J7', 'jest', ERASE, "return stillHeld.rows.length === 0\n        ? { ok: false as const, refusal: 'not_found' as const }\n        : { ok: false as const, refusal: 'work_no_longer_holds_it' as const };", "return { ok: false as const, refusal: 'work_no_longer_holds_it' as const };", 'a repeat Delete of a gone writing is told its card is stale'],
  ['J8', 'jest', ERASE, '        FOR UPDATE OF e`,', '        FOR UPDATE OF e, w`,', 'the expression rows are locked together with the Work rows again (the old cycle)'],
  // ── the copy against the database (removalCopyDrift.test.ts)
  ['D1', 'jest', MIG_CORRECTIONS, 'living_work_id UUID NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,', 'living_work_id UUID NOT NULL REFERENCES living_works(id) ON DELETE RESTRICT,', 'a table starts blocking the removal of a Work (it would fail or leave a detached row)'],
  ['D2', 'jest', MIG_UNDERSTANDING, 'CREATE TABLE IF NOT EXISTS living_work_writer_understanding (', 'CREATE TABLE IF NOT EXISTS living_work_fictional_new_child (living_work_id UUID REFERENCES living_works(id) ON DELETE CASCADE);\nCREATE TABLE IF NOT EXISTS living_work_writer_understanding (', 'a new table starts cascading from a Work and the removal copy is not updated'],
  ['D3', 'jest', LIB, 'its conversations with MAIA, what you told MAIA about it, your corrections, where you left off,', 'its conversations with MAIA, what you told MAIA about it, your corrections,', 'the removal copy stops naming something that does go'],
  ['D4', 'jest', MIG_CORRECTIONS, 'living_work_id UUID NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,', 'living_work_id UUID NOT NULL REFERENCES living_works(id),', 'a foreign key with no ON DELETE (it blocks the Work\'s removal) hides behind a neighbouring column\'s CASCADE'],
  ['D5', 'jest', MIG_UNDERSTANDING, 'CREATE TABLE IF NOT EXISTS living_work_writer_understanding (', 'CREATE TABLE IF NOT EXISTS living_work_fictional_orphan (living_work_id UUID NOT NULL);\nCREATE TABLE IF NOT EXISTS living_work_writer_understanding (', 'a new table carries a Work id with no foreign key, so a Work\'s removal leaves its rows behind unnoticed'],
  // ── the server (needs the local PostgreSQL 16 harness)
  ['S1', 'pg', ERASE, 'if (options.viaWorkId !== undefined && !claims.rows.some((row) => row.living_work_id === options.viaWorkId)) {', 'if (false as boolean) {', 'a stale card can erase another Work\'s writing and the Work itself'],
  ['S2', 'pg', ROUTE, 'viaWork === null ? {} : { viaWorkId: viaWork.toLowerCase() }', '{}', 'the route drops the Work the card named'],
  ['S3', 'pg', ROUTE, 'if (viaWork !== null && !UUID_RE.test(viaWork)) {', 'if (false as boolean) {', 'a malformed workId reaches the database'],
  ['S4', 'pg', ROUTE, 'viaWorkId: viaWork.toLowerCase()', 'viaWorkId: viaWork', 'an upper-case Work id never matches, so a valid card is refused as stale'],
  ['S5', 'pg', ERASE, 'if (claims.rows.length > 1) {', 'if (claims.rows.length > 2) {', 'a writing declared by two Works is erased out from under the other'],
  ['S6', 'pg', ERASE, 'ORDER BY w.id\n        FOR UPDATE`,', 'ORDER BY w.id`,', 'the Work rows are read instead of locked first, so a Delete can act on a state that is about to change'],
  ['S7', 'pg', ERASE, "await tx.query(\n      `SELECT pg_advisory_xact_lock(hashtextextended('soullab:r20:recovery-capture', 0))`,\n    );", '', 'the erase no longer takes the recovery-capture lock, so a backup could capture half a deletion'],
  ['S8', 'pg', ERASE, 'if (options.viaWorkId !== undefined && !claims.rows.some(', 'if (options.viaWorkId !== undefined && claims.rows.length <= 1 && !claims.rows.some(', 'the stale-card guard is evaluated after the shared-writing refusal'],
  ['S9', 'pg', ERASE, "return stillHeld.rows.length === 0\n        ? { ok: false as const, refusal: 'not_found' as const }\n        : { ok: false as const, refusal: 'work_no_longer_holds_it' as const };", "return { ok: false as const, refusal: 'work_no_longer_holds_it' as const };", 'a repeat Delete of a gone writing is told its card is stale'],
  ['S10', 'pg', ERASE, 'sweptAll: owed === 0 && recoverySealed,', 'sweptAll: Number((await query<{ n: string }>(`SELECT count(*)::int AS n FROM vault_erasure_queue`)).rows[0]?.n ?? 0) === 0 && recoverySealed,', 'another member\'s stuck queue row makes this member\'s Delete read as unconfirmed'],
  ['S11', 'pg', ERASE, 'ORDER BY (id = ANY($2::uuid[])) DESC, queued_at ASC LIMIT $1', 'ORDER BY queued_at ASC, (id = ANY($2::uuid[])) DESC LIMIT $1', 'a backlog of other rows starves this deletion\'s own obligations'],
  ['S12', 'pg', WORK_ROUTE, 'if (stillOwed.rows.length > 0) {', 'if (false as boolean) {', 'a removed Work whose image bytes are still owed is reported as plain success'],
  ['S13', 'pg', WORK_ROUTE, 'SELECT id FROM vault_erasure_queue WHERE id = $1`,', 'SELECT id FROM vault_erasure_queue WHERE $1::uuid IS NOT NULL`,', 'any queued row, anyone\'s, makes a Work removal read as unconfirmed'],
  ['S14', 'pg', WORK_ROUTE, 'await sweepVaultErasureQueue(100, [removed.queueId]);', 'await sweepVaultErasureQueue(100, []);', 'a Work\'s own image waits behind a backlog of other rows'],
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
const selected = MUTANTS.filter(([id, kind]) => (ids.length ? ids.includes(id) : true) && !(jestOnly && kind !== 'jest') && !(pgOnly && kind !== 'pg'));

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

const backups = new Map();
const restoreAll = () => { for (const [path, bak] of backups) { try { renameSync(bak, path); } catch { /* already restored */ } } backups.clear(); };
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { restoreAll(); process.exit(130); });
process.on('exit', restoreAll);

const out = mkdtempSync(join(tmpdir(), 'ws-delete-mutants-'));
const run = (kind) => {
  if (kind === 'jest') {
    const r = spawnSync('npx', ['jest', ...JEST_TESTS, '--silent', '--coverage=false'], { cwd: ROOT, encoding: 'utf8', timeout: 900000 });
    return { code: r.status ?? 1, text: `${r.stdout}\n${r.stderr}`, summary: /^Tests:\s/m };
  }
  const log = join(out, 'jest.log');
  rmSync(log, { force: true });                 // a log left by an earlier run must never be mistaken for this one
  const r = spawnSync('bash', [PG_RUN], { cwd: ROOT, encoding: 'utf8', timeout: 900000, env: { ...process.env, WS_DELETE_OUT: out } });
  return { code: r.status ?? 1, text: `${r.stdout}\n${r.stderr}\n${existsSync(log) ? readFileSync(log, 'utf8') : ''}`, summary: /^Tests:\s/m };
};
const failingLines = (text) => text.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('✕') || /^● .* › /.test(l));
const COMPILE = /SyntaxError|Test suite failed to run|Cannot find module|error TS\d+/;

// BASELINE: the unmutated suite must be green, or "killed" would only mean "red". Each harness kind that will be used is run once.
for (const kind of [...new Set(selected.map((m) => m[1]))]) {
  const base = run(kind);
  const knownLoadFailures = /app\/api\/sovereign\/living-works\/\[id\]\/expressions/.test(base.text); // not in our file lists; harmless if present
  if (base.code !== 0 || !base.summary.test(base.text) || failingLines(base.text).length > 0) {
    console.error(`BASELINE RED for the ${kind} suite: the unmutated code does not pass, so no kill could mean anything.${knownLoadFailures ? '' : ''}\n${failingLines(base.text).slice(0, 10).join('\n')}`);
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
    const { code, text, summary } = run(kind);
    const failed = failingLines(text);
    let verdict;
    if (COMPILE.test(text)) verdict = 'COMPILE-ERROR';                     // a build break is not a kill by a test
    else if (code === 0) verdict = 'SURVIVED';
    else if (!summary.test(text) || failed.length === 0) verdict = 'UNPROVEN';  // non-zero exit, but no test was seen to fail
    else verdict = 'KILLED';
    if (verdict !== 'KILLED') bad += 1;
    rows.push([verdict, id, why, failed.slice(0, 2).map((l) => l.slice(0, 120))]);
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
