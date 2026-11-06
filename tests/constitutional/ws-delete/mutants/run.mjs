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
  'app/writers-studio/__tests__/historyActions.test.ts',
  'lib/writersStudio/__tests__/deleteWork.test.ts',
  'lib/writersStudio/__tests__/deleteWorkTruth.test.ts',
  'lib/writersStudio/__tests__/removalCopyDrift.test.ts',
  'app/writers-studio/__tests__/listReloadReports.test.ts',
  'deleteWorkParam.test.ts',
  'deleteRoute.test.ts',
  'eraseManuscriptGuard.test.ts',
];
const PG_RUN = 'tests/constitutional/ws-delete/dynamic/run-local-pg16.sh';
const HISTORY = `${HOME}/P4R1HistoryPage.tsx`;
const HISTORY_RULE = 'app/writers-studio/historyActions.ts';
const WORK_ROUTE = 'app/api/sovereign/living-works/[id]/route.ts';
const LOAD_WORKS = 'app/writers-studio/useLivingWorks.ts';
const LOAD_MS = 'app/writers-studio/useCurrentManuscript.ts';

/* [id, kind, file, anchor (must occur exactly once, or `nth` of several), replacement, the error it embodies, { nth }?]
   kind: 'jest' (hermetic, jsdom) or 'pg' (needs the local PostgreSQL 16 harness). A '(textual guard)' mutant is caught only by a test that
   reads the source text: it is a guard against regression of a structure, not a proof of behaviour, and is labelled so. */
const MUTANTS = [
  // ── the command (lib/writersStudio/deleteWork.ts)
  ['L1', 'jest', LIB, '${workId ? `?workId=${encodeURIComponent(workId)}` : \'\'}', '', 'the Work card stops naming its Work, so a stale card can reach another Work\'s writing'],
  ['L2', 'jest', LIB, 'if (res.ok || res.status === 404) return { ok: true };\n  if (res.status === 401) return { ok: false, message: SESSION_ENDED_DELETE };', 'if (res.ok) return { ok: true };\n  if (res.status === 401) return { ok: false, message: SESSION_ENDED_DELETE };', 'a writing that is already gone (404) is reported as a failed delete'],
  ['L3', 'jest', LIB, '{ subject, ...(body.unconfirmed ? { unconfirmed: body.unconfirmed } : {}) }', '{ subject }', 'the obligations the server named are dropped, so every custody sentence names things that are not owed'],
  ['L4', 'jest', LIB, 'if (res.status >= 500) return { ok: false, message: UNKNOWN_DELETE, unknown: true };\n  return { ok: false, message: GENERIC };', 'if (res.status >= 500) return { ok: false, message: GENERIC };\n  return { ok: false, message: GENERIC };', 'a server error that does not say what it did is reported as "nothing was removed"'],
  ['L5', 'jest', LIB, '    // The request may have reached the server before the connection failed: we do not know.\n    return { ok: false, message: UNKNOWN_DELETE, unknown: true };', '    return { ok: false, message: GENERIC };', 'a dropped connection is reported as "nothing was removed"'],
  ['L6', 'jest', LIB, 'if (res.status >= 500) return { ok: false, message: REMOVE_UNKNOWN, unknown: true };', 'if (res.status >= 500) return { ok: false, message: REMOVE_GENERIC };', 'a removal whose outcome is unknown is reported as "nothing changed"'],
  ['L7', 'jest', LIB, '  if (res.status === 401) return { ok: false, message: SESSION_ENDED_DELETE };\n', '', 'an ended session is told to "try again"'],
  ['L8', 'jest', LIB, 'REFUSED_BEFORE_ANY_ACT.has(refusal)) return { ok: false, message: deletionRefusalCopy(refusal), refusal };', 'REFUSED_BEFORE_ANY_ACT.has(refusal)) return { ok: false, message: deletionRefusalCopy(refusal) };', 'the refusal classification is dropped, so shared writing cannot be told from any failure'],
  ['L8b', 'jest', LIB, "new Set(['declared_in_other_works', 'work_no_longer_holds_it'])", "new Set(['declared_in_other_works'])", 'a stale-card refusal is not recognised as a refusal before any act'],
  ['L9', 'jest', LIB, "if (outcome.refusal === 'declared_in_other_works') { await refreshed(refresh); throw new DeletionSharedMaterial", 'if (outcome.refusal) { await refreshed(refresh); throw new DeletionSharedMaterial', 'every refusal opens the "keep the writing" question'],
  ['L10', 'jest', LIB, '// Removed, but not yet confirmed: stop listing it AND still say so.\n  if (outcome.removed) { await refreshed(refresh); throw', '// Removed, but not yet confirmed: stop listing it AND still say so.\n  if (outcome.removed) { throw', 'the page is not re-read after a Delete that committed'],
  ['L10b', 'jest', LIB, 'if (outcome.removed) { await refreshed(refresh); throw new DeletionUnconfirmed(outcome.message); }\n  if (outcome.unknown) {', 'if (outcome.removed) { throw new DeletionUnconfirmed(outcome.message); }\n  if (outcome.unknown) {', 'the page is not re-read after a Remove that committed'],
  ['L10c', 'jest', LIB, 'throw new DeletionUnconfirmed(outcome.message)', 'throw new Error(outcome.message)', 'a committed Delete whose custody is unconfirmed is an ordinary failure the card swallows', { nth: 1 }],
  ['L10d', 'jest', LIB, 'throw new DeletionUnconfirmed(outcome.message)', 'throw new Error(outcome.message)', 'a committed Remove whose custody is unconfirmed is an ordinary failure the card swallows', { nth: 2 }],
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
  ['L25', 'jest', LIB, "const subject = workId && body.workRemoved !== false ? 'work' : 'writing';", "const subject = 'work';", 'a deletion that left the Work standing says "This work was removed"'],
  ['L26', 'jest', LIB, "new Set(['custody_incomplete', 'image_bytes_owed'])", "new Set(['custody_incomplete'])", 'the image-owed code is not recognised as owed after a committed removal'],
  ['L27', 'jest', LIB, "deletionRefusalCopy('image_bytes_owed', { subject: 'work' }), removed: true,", "REMOVE_GENERIC, removed: true,", 'a removed Work whose image is owed is told in the words of an ordinary failure'],
  ['L28', 'jest', LIB, '  if (body?.removed === true) {\n    // The Work row is gone and something it owned', '  if (false as boolean) {\n    // The Work row is gone and something it owned', 'a removed Work whose image is owed is read as a plain failure'],
  ['L29', 'jest', LIB, 'The Work it is in stays, with what else it holds. ', '', 'the confirmation for a writing in a Work does not say the Work stays'],
  ['L30', 'jest', LIB, 'The Work itself stays, with what else it holds.', '', 'the confirmation on a Work that keeps other parts does not say the Work stays'],
  ['L31', 'jest', LIB, 'Nothing was deleted. On Home, press Delete', 'On Home, press Delete', 'the shared-writing refusal does not say nothing was deleted'],
  ['L32', 'jest', LIB, "device. Nothing was deleted.'", "device.'", 'the stale-card refusal does not say nothing was deleted'],
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
  ['H15', 'jest', DOOR, "if (kind === 'writing-keeps-work') {\n              // The Work stays", "if (false as boolean) {\n              // The Work stays", 'deleting only the writing of a Work that stays replaces the Work\'s card with a ghost for good'],
  ['H16', 'jest', DOOR, 'onDeletionNotice(`The writing in “${title}” was deleted. The Work stays if it still holds anything else.${reload}`, false);', '', 'deleting only the writing of a Work that stays says nothing on the page'],
  ['H17', 'jest', DOOR, 'const shownError = state.deleteError ?? (shared !== null ? SHARED_BUT_NOT_SHOWN : null);', 'const shownError = state.deleteError;', 'a 409 the page cannot explain is a silent no-op'],
  ['H18', 'jest', DOOR, ': removeSharedWorkCopy(othersHolding)', ': removeSharedWorkCopy(1)', 'the removal sentence says "your other Work" when several Works hold the writing'],
  ['H19', 'jest', DOOR, "(result && !result.refreshed ? RELOAD_LINE : '')", "''", 'a Remove whose re-read failed does not tell the member to reload'],
  ['H20', 'jest', DOOR, "const reload = result && !result.refreshed ? RELOAD_LINE : '';", "const reload = '';", 'a Delete whose re-read failed does not tell the member to reload'],
  ['H21', 'jest', DOOR, 'update({ shared: { manuscriptId } });', '', 'a shared-writing refusal records nothing, so the removal question never opens'],
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
  ['V7', 'jest', VIEW, "role={notice.urgent ? 'alert' : 'status'}", 'role="status"', 'the custody notice is only a polite status'],
  ['V8', 'jest', VIEW, '          {del.door}\n        </div>\n      </div>\n      <P4R1WorkMaterialsSummary work={work} />', '        </div>\n      </div>\n      <P4R1WorkMaterialsSummary work={work} />', 'the hero Work has no way to delete or remove it'],
  ['V9', 'jest', VIEW, 'setNotices((current) => [...current, { id, message, urgent }]);', 'setNotices([{ id, message, urgent }]);', 'a later notice erases an unacknowledged custody alert'],
  ['V10', 'jest', VIEW, '          <WorkAnchor\n            key={props.returnWork.id}', '          <WorkAnchor', 'the hero Work\'s own state (its open Publish panel) follows the slot to the next Work'],
  ['V11', 'jest', VIEW, '          <WorkAnchor\n            key={props.arrival.resume.id}', '          <WorkAnchor', 'the continue layout\'s hero Work has the same slot-following state (its open Publish panel)'],
  ['V12', 'jest', VIEW, 'const words = deleteConfirmCopy(writingDeleteKindFor(manuscript.id, works), writingTitle);', "const words = deleteConfirmCopy('writing', writingTitle);", 'loose writing\'s confirmation talks about a Work that does not exist'],
  ['V13', 'jest', VIEW, "useEffect(() => { if (notices.length > 0) noticeRef.current?.scrollIntoView?.({ block: 'nearest' }); }, [notices.length]);", '', 'a notice appears off-screen'],
  ['V14', 'jest', VIEW, 'onClick={() => setNotices((current) => current.filter((n) => n.id !== notice.id))}', 'onClick={() => setNotices([])}', 'dismissing one notice dismisses them all'],
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
  ['C1', 'jest', CTRL, 'runRemoveWork(workId, (url, init) => apiFetch(url, init), refresh)', 'runDeleteWork({ workId, manuscriptId: null }, (url, init) => apiFetch(url, init), refresh)', 'the controller\'s removal goes through Delete'],
  ['C2', 'jest', CTRL, 'onRemoveWork={onRemoveWork}', '', 'the view is never handed the removal act'],
  ['C3', 'jest', CTRL, 'runDeleteWork({ workId, manuscriptId }, ', 'runDeleteWork({ workId, manuscriptId: null }, ', 'the controller drops the writing a Work card named, so Delete withdraws the Work and leaves the writing'],
  ['C4', 'jest', LIB, 'return read.every(Boolean);', 'return true;', 'the re-read reports success even when a list could not be read'],
  ['C4b', 'jest', LIB, "try { return (await load()) === true; } catch { return false; }", "return (await load()) === true;", 'a list that throws turns a committed delete into a rejection'],
  ['C5', 'jest', CTRL, 'reReadAll([reloadWorks, reloadManuscripts])', 'reReadAll([reloadWorks])', 'the re-read after a delete leaves one of the two lists stale'],
  ['LD1', 'jest', LOAD_WORKS, "setPhase('error');\n        return false;", "setPhase('error');\n        return true;", 'the Works list reports it was read when the server refused it'],
  ['LD2', 'jest', LOAD_WORKS, "// A failure to read is not an absence of works. Say only what is true.\n      setPhase('error');\n      return false;", "// A failure to read is not an absence of works. Say only what is true.\n      setPhase('error');\n      return true;", 'the Works list reports it was read when the network failed'],
  ['LD3', 'jest', LOAD_WORKS, "setPhase('unauthorized');\n        return false;", "setPhase('unauthorized');\n        return true;", 'the Works list reports it was read when the session had ended'],
  ['LD4', 'jest', LOAD_MS, "setPhase('error');\n        return false;", "setPhase('error');\n        return true;", 'the writings list reports it was read when the server refused it'],
  ['LD5', 'jest', LOAD_MS, "// A network failure is not an empty Studio. Say so.\n      setPhase('error');\n      return false;", "// A network failure is not an empty Studio. Say so.\n      setPhase('error');\n      return true;", 'the writings list reports it was read when the network failed'],
  ['LD6', 'jest', LOAD_MS, "setPhase('unauthorized');\n        return false;", "setPhase('unauthorized');\n        return true;", 'the writings list reports it was read when the session had ended'],
  ['Y1', 'jest', HISTORY_RULE, 'if (holders.length > 1) {', 'if (false as boolean) {', 'History offers a Delete on a writing two Works hold, which the server can only refuse'],
  ['Y2', 'jest', HISTORY, '{action.kind === \'open\' && action.why === \'shared\' ? (', '{false as boolean ? (', 'History hides Delete on a shared writing without saying where the way forward is'],
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
  ['J15', 'jest', ERASE, 'let recoverySealed = result.declarationOnly;', 'let recoverySealed = false;', 'the cleanup of a dangling declaration reads as an unsealed deletion record'],
  ['J16', 'jest', ERASE, 'if (!result.declarationOnly) {\n    try {', 'if (true as boolean) {\n    try {', 'the cleanup of a dangling declaration seals a deletion record nothing needed'],
  ['J17', 'jest', ERASE, 'await sweepVaultErasureQueue(100, ownIds);', 'await sweepVaultErasureQueue(100);', 'a backlog of other rows starves this deletion\'s own obligations'],
  ['J18', 'jest', ERASE, 'WHERE living_work_id = $1 AND member_id = $2 FOR UPDATE`,\n    [workId, memberId],', 'WHERE living_work_id = $1 AND member_id = $2`,\n    [workId, memberId],', '(textual guard) the Work\'s image is read without a lock before the Work goes'],
  ['J19', 'jest', ROUTE, "unconfirmed: { originalFile: outcome.owed.originalFile, image: outcome.owed.image, deletionRecord: !outcome.recoverySealed },", 'unconfirmed: { originalFile: true, image: true, deletionRecord: true },', 'the route says everything is owed whatever is'],
  ['J20', 'jest', ROUTE, 'workRemoved: outcome.workRemoved,', 'workRemoved: true,', 'the route says the Work went when only its writing did'],
  ['J21', 'jest', ROUTE, 'if (!outcome.sweptAll) {', 'if (false as boolean) {', 'an unconfirmed custody is answered as plain success'],
  ['W1', 'jest', WORK_ROUTE, 'if (stillOwed.rows.length > 0) {', 'if (false as boolean) {', 'a removed Work whose image bytes are still owed is reported as plain success'],
  ['W2', 'jest', WORK_ROUTE, 'SELECT id FROM vault_erasure_queue WHERE id = $1`,', 'SELECT id FROM vault_erasure_queue`,', 'any queued row, anyone\'s, makes a Work removal read as unconfirmed'],
  ['W3', 'jest', WORK_ROUTE, 'await sweepVaultErasureQueue(100, [removed.queueId]);', 'await sweepVaultErasureQueue(100, []);', 'a Work\'s own image waits behind a backlog of other rows'],
  ['W4', 'jest', WORK_ROUTE, 'WHERE living_work_id = $1 AND member_id = $2 FOR UPDATE`,\n        [id, memberId],', 'WHERE living_work_id = $1 AND member_id = $2`,\n        [id, memberId],', '(textual guard) the Work\'s image is read without a lock before the Work goes'],
  ['W5', 'jest', WORK_ROUTE, 'VALUES ($1) RETURNING id`,', 'VALUES ($1)`,', 'the Work\'s queue row cannot be named, so the sweep cannot take it first'],
  ['W6', 'jest', WORK_ROUTE, '`DELETE FROM living_works WHERE id = $1 AND member_id = $2 RETURNING id`,', '`DELETE FROM living_works WHERE id = $1 RETURNING id`,', 'a member can remove another member\'s Work by its id'],
  ['W7', 'jest', WORK_ROUTE, "refusal: 'image_bytes_owed', unconfirmed: { image: true } }", "refusal: 'image_bytes_owed' }", 'the image-owed answer does not say what is owed'],
  ['W8', 'jest', WORK_ROUTE, 'if (gone.rows.length === 0) return null;', '', 'a Work that is not this member\'s is answered as removed'],
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
  ['S9', 'pg', ERASE, "      return { ok: false as const, refusal: 'not_found' as const };\n    }\n    /* The member pressed Delete", "      return { ok: false as const, refusal: 'work_no_longer_holds_it' as const };\n    }\n    /* The member pressed Delete", 'a repeat Delete of a gone writing is told its card is stale'],
  ['S10', 'pg', ERASE, 'sweptAll: !owed.originalFile && !owed.image && recoverySealed,', 'sweptAll: !owed.originalFile && !owed.image && recoverySealed && Number((await query<{ n: string }>(`SELECT count(*)::int AS n FROM vault_erasure_queue`)).rows[0]?.n ?? 0) === 0,', 'another member\'s stuck queue row makes this member\'s Delete read as unconfirmed'],
  ['S11', 'pg', ERASE, 'ORDER BY (id = ANY($2::uuid[])) DESC, queued_at ASC LIMIT $1', 'ORDER BY queued_at ASC, (id = ANY($2::uuid[])) DESC LIMIT $1', 'a backlog of other rows starves this deletion\'s own obligations'],
  ['S12', 'pg', WORK_ROUTE, 'if (stillOwed.rows.length > 0) {', 'if (false as boolean) {', 'a removed Work whose image bytes are still owed is reported as plain success'],
  ['S13', 'pg', WORK_ROUTE, 'SELECT id FROM vault_erasure_queue WHERE id = $1`,', 'SELECT id FROM vault_erasure_queue WHERE $1::uuid IS NOT NULL`,', 'any queued row, anyone\'s, makes a Work removal read as unconfirmed'],
  ['S14', 'pg', WORK_ROUTE, 'await sweepVaultErasureQueue(100, [removed.queueId]);', 'await sweepVaultErasureQueue(100, []);', 'a Work\'s own image waits behind a backlog of other rows'],
  ['S15', 'pg', ERASE, 'if (options.viaWorkId !== undefined && claims.rows.some((row) => row.living_work_id === options.viaWorkId)) {', 'if (false as boolean) {', 'a declaration that outlived its writing is left behind (the detached state)'],
  ['S16', 'pg', ERASE, '\n        AND NOT EXISTS (\n          SELECT 1 FROM living_work_expressions e WHERE e.living_work_id = w.id\n        )', '', 'a Work that holds something else is removed with its dangling declaration'],
  ['S17', 'pg', ERASE, "          AND w.member_id = $2\n        FOR UPDATE OF e`,", "        FOR UPDATE OF e`,", 'a member can clean up the declaration of another member\'s Work through a gone writing'],
  ['S18', 'pg', ERASE, 'originalFile: result.originalQueueIds.some((id) => stillQueued.has(id)),', 'originalFile: false,', 'an original file still owed is not reported'],
  ['S19', 'pg', ERASE, 'let recoverySealed = result.declarationOnly;', 'let recoverySealed = false;', 'the cleanup of a dangling declaration reads as an unsealed deletion record'],
  ['S20', 'pg', ROUTE, "unconfirmed: { originalFile: outcome.owed.originalFile, image: outcome.owed.image, deletionRecord: !outcome.recoverySealed },", 'unconfirmed: { originalFile: true, image: true, deletionRecord: true },', 'the route says everything is owed whatever is'],
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

// The PostgreSQL harness needs root and the server binaries. Say so up front, instead of letting every pg mutant "die" for that reason.
if (selected.some((m) => m[1] === 'pg')) {
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
  if (kind === 'jest') {
    const r = await exec('npx', ['jest', ...JEST_TESTS, '--silent', '--coverage=false'], process.env, 900000);
    return { ...r, summary: /^Tests:\s/m };
  }
  const log = join(out, 'jest.log');
  rmSync(log, { force: true });                 // a log left by an earlier run must never be mistaken for this one
  const r = await exec('bash', [PG_RUN], { ...process.env, WS_DELETE_OUT: out }, 900000);
  return { ...r, text: `${r.text}\n${existsSync(log) ? readFileSync(log, 'utf8') : ''}`, summary: /^Tests:\s/m };
};
/** A failing TEST, not a failing hook: a `beforeAll`/`afterAll` error (a harness problem) is not evidence that the mutant was caught. */
const HOOK = /\b(before|after)(All|Each)\b|\bhook\b/i;
const failingLines = (text) => text.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('✕') || /^● .* › /.test(l));
const failingTests = (text) => failingLines(text).filter((l) => !HOOK.test(l));
const COMPILE = /SyntaxError|Test suite failed to run|Cannot find module|error TS\d+/;

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
