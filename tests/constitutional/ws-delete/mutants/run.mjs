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
 *
 * Exit 0 only when every selected mutant was KILLED. A SETUP-ERROR (the anchor text is not found exactly once) or a
 * COMPILE-ERROR (the mutant broke the build, which is not a kill by a test) also fails the run: they prove nothing.
 * Every file is restored in a finally block and on SIGINT/SIGTERM. Fictional data only; nothing here touches a real database.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, copyFileSync, renameSync, mkdtempSync, existsSync } from 'node:fs';
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
  `${HOME}/__tests__/homeDeleteWriting.test.ts`,
  'lib/writersStudio/__tests__/deleteWork.test.ts',
  'lib/writersStudio/__tests__/removalCopyDrift.test.ts',
];
const PG_RUN = 'tests/constitutional/ws-delete/dynamic/run-local-pg16.sh';

/* [id, kind, file, anchor (must occur exactly once), replacement, the error it embodies] */
const MUTANTS = [
  // ── the command (lib/writersStudio/deleteWork.ts)
  ['L1', 'jest', LIB, '${workId ? `?workId=${encodeURIComponent(workId)}` : \'\'}', '', 'the Work card stops naming its Work, so a stale card can reach another Work\'s writing'],
  ['L2', 'jest', LIB, 'if (res.status === 404 && workId && manuscriptId) {', 'if (false as boolean && workId && manuscriptId) {', 'a vanished writing leaves an empty, openable Work behind (the detached state)'],
  ['L3', 'jest', LIB, 'if (withdrawn.ok) return { ok: true };', 'return { ok: true };', 'a failed withdrawal is reported as a successful delete'],
  ['L4', 'jest', LIB, 'if (res.status >= 500) return { ok: false, message: UNKNOWN_DELETE, unknown: true };\n  return { ok: false, message: GENERIC };', 'if (res.status >= 500) return { ok: false, message: GENERIC };\n  return { ok: false, message: GENERIC };', 'a server error that does not say what it did is reported as "nothing was removed"'],
  ['L5', 'jest', LIB, '    // The request may have reached the server before the connection failed: we do not know.\n    return { ok: false, message: UNKNOWN_DELETE, unknown: true };', '    return { ok: false, message: GENERIC };', 'a dropped connection is reported as "nothing was removed"'],
  ['L6', 'jest', LIB, 'if (res.status >= 500) return { ok: false, message: REMOVE_UNKNOWN, unknown: true };', 'if (res.status >= 500) return { ok: false, message: REMOVE_GENERIC };', 'a removal whose outcome is unknown is reported as "nothing changed"'],
  ['L7', 'jest', LIB, 'if (res.status === 401) return { ok: false, message: SESSION_ENDED_DELETE };', 'if (false as boolean) return { ok: false, message: SESSION_ENDED_DELETE };', 'an ended session is told to "try again"'],
  ['L8', 'jest', LIB, 'if (refusal) return { ok: false, message: deletionRefusalCopy(refusal), refusal };', 'if (refusal) return { ok: false, message: deletionRefusalCopy(refusal) };', 'the refusal classification is dropped, so shared writing cannot be told from any failure'],
  ['L9', 'jest', LIB, "if (outcome.refusal === 'declared_in_other_works') throw new DeletionSharedMaterial", 'if (outcome.refusal) throw new DeletionSharedMaterial', 'every refusal opens the "keep the writing" question'],
  ['L10', 'jest', LIB, 'if (outcome.removed) { await quietly(refresh); throw new DeletionUnconfirmed(outcome.message); }', 'if (outcome.removed) { throw new DeletionUnconfirmed(outcome.message); }', 'the page is not re-read after a removal that committed'],
  ['L11', 'jest', LIB, "if (outcome.refusal === 'work_no_longer_holds_it' || outcome.unknown) { await quietly(refresh); throw new Error(outcome.message); }", "if (outcome.refusal === 'work_no_longer_holds_it' || outcome.unknown) { throw new Error(outcome.message); }", 'the member is told about a stale card or an unknown outcome before the page is made true'],
  ['L12', 'jest', LIB, 'if (outcome.unknown) await quietly(refresh);', '', 'an unknown removal outcome is not followed by a re-read'],
  ['L13', 'jest', LIB, 'const quietly = (refresh: Refresh) => refresh().catch(() => undefined);', 'const quietly = (refresh: Refresh) => refresh().then(() => undefined);', 'a failed re-read turns a successful delete into a reported failure'],
  ['L14', 'jest', LIB, "'This writing is also in another of your Works, so it cannot be deleted from here without taking it from there. '\n    + `You can remove this Work instead.", "'Nothing is deleted. This writing is also in another of your Works, so it cannot be deleted from here without taking it from there. '\n    + `You can remove this Work instead.", 'the removal copy says nothing is deleted (the Work, its conversations and its image are)'],
  ['L15', 'jest', LIB, "/* Not \"Keep it\": under a question that says \"keep the writing\" that reads as an answer, not as cancel. */\n  cancel: 'Don’t remove',", "cancel: 'Keep it',", 'the cancel button reads as an answer to "keep the writing?"'],
  ['L16', 'jest', LIB, "'It cannot be undone, and private backups already taken", "'Private backups already taken", 'the removal copy drops that it cannot be undone'],
  ['L17', 'jest', LIB, 'None of the writings is deleted: each stays', 'Each stays', 'the several-writings copy does not say that none is deleted'],
  ['L18', 'jest', LIB, ': the original file, if there was one, and our own record of the deletion. ', ': the original file, if there was one. ', 'the custody sentence names only one of the two things that may be unconfirmed'],
  // ── the door (useWorkDeleteDoor.tsx)
  ['H1', 'jest', DOOR, "const stillShared = sharedWith !== null\n    && allWorks.some((other) => other.id !== work.id && manuscriptIdsOf(other).includes(sharedWith));", 'const stillShared = sharedWith !== null;', 'the removal question is trusted from the 409 instead of re-derived from the Works on screen'],
  ['H2', 'jest', DOOR, "if (choices.length > 1 || ids.length > 1) return { kind: 'many', manuscriptId: null };", "if (false as boolean) return { kind: 'many', manuscriptId: null };", 'Delete on a Work with several writings silently picks one to destroy'],
  ['H3', 'jest', DOOR, 'setSettled(`“${title}” was removed.`);', "setSettled('');", 'no removed state after Remove'],
  ['H4', 'jest', DOOR, 'onDeletionNotice(removedWorkNotice(title, removalMode), false);', '', 'no page notice after Remove'],
  ['H5', 'jest', DOOR, 'onDeletionNotice(`“${title}”: ${err.message}`);', '', 'the custody message stays on a card that is about to unmount'],
  ['H7', 'jest', DOOR, 'setConfirming(false);\n    setSharedWith(null);\n    setDeleteError(null);', 'setConfirming(false);\n    setDeleteError(null);', 'Keep it leaves the card in the removal state'],
  ['H8', 'jest', DOOR, 'else if (err instanceof DeletionSharedMaterial && manuscriptId) {', 'else if (err instanceof Error && manuscriptId) {', 'any error opens the removal question'],
  ['H9', 'jest', DOOR, 'await onRemoveWork(work.id);', 'await onDeleteWork(work.id, null);', 'the removal button calls Delete again'],
  ['H10', 'jest', DOOR, "{kind === 'many' ? 'Remove' : 'Delete'}", "{'Delete'}", 'a Work with several writings is offered Delete'],
  ['H11', 'jest', DOOR, 'const words = deleteConfirmCopy(kind, title);', "const words = deleteConfirmCopy('writing', title);", 'every Delete confirmation describes the one-writing case'],
  ['H12', 'jest', DOOR, 'if (err instanceof DeletionUnconfirmed) {', 'if (false as boolean) {', 'an unconfirmed removal is shown as an ordinary failure'],
  ['H13', 'jest', DOOR, "const removalMode: 'shared' | 'many' | null = kind === 'many' ? 'many' : (stillShared ? 'shared' : null);", "const removalMode: 'shared' | 'many' | null = stillShared ? 'shared' : null;", 'a Work with several writings has no door at all'],
  // ── the page (P4R1HomeView.tsx, P4R1HomeController.tsx)
  ['V1', 'jest', VIEW, '          {deleteNoticeEl}\n          <section className="fr-home-anchor fr-home-threshold" data-field="anchor">', '          <section className="fr-home-anchor fr-home-threshold" data-field="anchor">', 'the welcome screen after the last Work is deleted drops the notice'],
  ['V2', 'jest', VIEW, '          {deleteNoticeEl}\n          <section className="fr-home-region">\n            <p className="fr-home-eyebrow">Your Works</p>\n            <div className="fr-home-shelf fr-home-shelf-4">', '          <section className="fr-home-region">\n            <p className="fr-home-eyebrow">Your Works</p>\n            <div className="fr-home-shelf fr-home-shelf-4">', 'the many-Works layout drops the notice'],
  ['V3', 'jest', VIEW, '          {deleteNoticeEl}\n          <WorkAnchor\n            work={props.returnWork}', '          <WorkAnchor\n            work={props.returnWork}', 'the returning-to-one-Work layout drops the notice'],
  ['V4', 'jest', VIEW, '          {deleteNoticeEl}\n          <WorkAnchor\n            work={props.arrival.resume}', '          <WorkAnchor\n            work={props.arrival.resume}', 'the continue layout drops the notice'],
  ['V5', 'jest', VIEW, '          {deleteNoticeEl}\n          <p className="fr-home-here">{HOME_COPY.writingHere}</p>', '          <p className="fr-home-here">{HOME_COPY.writingHere}</p>', 'the loose-writing layout drops the notice'],
  ['V6', 'jest', VIEW, '          {unclaimedWriting}\n          {creationControls}\n          {/* Returning to one Work must never hide', '          {deleteNoticeEl}\n          {unclaimedWriting}\n          {creationControls}\n          {/* Returning to one Work must never hide', 'the notice is rendered twice in one layout'],
  ['V7', 'jest', VIEW, "role={noticeUrgent ? 'alert' : 'status'}", 'role="status"', 'the custody notice is only a polite status'],
  ['V8', 'jest', VIEW, '          {del.door}\n        </div>\n      </div>\n      <P4R1WorkMaterialsSummary work={work} />', '        </div>\n      </div>\n      <P4R1WorkMaterialsSummary work={work} />', 'the hero Work has no way to delete or remove it'],
  ['C1', 'jest', CTRL, 'runRemoveWork(workId, (url, init) => apiFetch(url, init), refresh)', 'runDeleteWork({ workId, manuscriptId: null }, (url, init) => apiFetch(url, init), refresh)', 'the controller\'s removal goes through Delete'],
  ['C2', 'jest', CTRL, 'onRemoveWork={onRemoveWork}', '', 'the view is never handed the removal act'],
  // ── the copy against the database (removalCopyDrift.test.ts)
  ['D1', 'jest', MIG_CORRECTIONS, 'living_work_id UUID NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,', 'living_work_id UUID NOT NULL REFERENCES living_works(id) ON DELETE RESTRICT,', 'a table starts blocking the removal of a Work (it would fail or leave a detached row)'],
  ['D2', 'jest', MIG_UNDERSTANDING, 'CREATE TABLE IF NOT EXISTS living_work_writer_understanding (', 'CREATE TABLE IF NOT EXISTS living_work_fictional_new_child (living_work_id UUID REFERENCES living_works(id) ON DELETE CASCADE);\nCREATE TABLE IF NOT EXISTS living_work_writer_understanding (', 'a new table starts cascading from a Work and the removal copy is not updated'],
  ['D3', 'jest', LIB, 'its conversations with MAIA, what you told MAIA about it, your corrections, where you left off,', 'its conversations with MAIA, what you told MAIA about it, your corrections,', 'the removal copy stops naming something that does go'],
  // ── the server (needs the local PostgreSQL 16 harness)
  ['S1', 'pg', ERASE, 'if (options.viaWorkId !== undefined && !claims.rows.some((row) => row.living_work_id === options.viaWorkId)) {', 'if (false as boolean) {', 'a stale card can erase another Work\'s writing and the Work itself'],
  ['S2', 'pg', ROUTE, 'viaWork === null ? {} : { viaWorkId: viaWork.toLowerCase() }', '{}', 'the route drops the Work the card named'],
  ['S3', 'pg', ROUTE, 'if (viaWork !== null && !UUID_RE.test(viaWork)) {', 'if (false as boolean) {', 'a malformed workId reaches the database'],
  ['S4', 'pg', ROUTE, 'viaWorkId: viaWork.toLowerCase()', 'viaWorkId: viaWork', 'an upper-case Work id never matches, so a valid card is refused as stale'],
  ['S5', 'pg', ERASE, 'if (claims.rows.length > 1) {', 'if (claims.rows.length > 2) {', 'a writing declared by two Works is erased out from under the other'],
  ['S6', 'pg', ERASE, "AND w.member_id = $2\n        FOR UPDATE OF e, w`,", "AND w.member_id = $2`,", 'the claim check reads a snapshot instead of waiting for an in-flight removal, so a Delete or a stale-card guard can act on a state that is about to change'],
  ['S7', 'pg', ERASE, "await tx.query(\n      `SELECT pg_advisory_xact_lock(hashtextextended('soullab:r20:recovery-capture', 0))`,\n    );", '', 'the erase no longer takes the recovery-capture lock, so a backup could capture half a deletion'],
];

const args = process.argv.slice(2);
if (args.includes('--list')) {
  for (const [id, kind, file, , , why] of MUTANTS) console.log(`${id.padEnd(4)} ${kind.padEnd(4)} ${file}\n       ${why}`);
  process.exit(0);
}
const jestOnly = args.includes('--jest-only');
const pgOnly = args.includes('--pg-only');
const ids = args.filter((a) => !a.startsWith('--'));
const selected = MUTANTS.filter(([id, kind]) => (ids.length ? ids.includes(id) : true) && !(jestOnly && kind !== 'jest') && !(pgOnly && kind !== 'pg'));

const backups = new Map();
const restoreAll = () => { for (const [path, bak] of backups) { try { renameSync(bak, path); } catch { /* already restored */ } } backups.clear(); };
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { restoreAll(); process.exit(130); });
process.on('exit', restoreAll);

const out = mkdtempSync(join(tmpdir(), 'ws-delete-mutants-'));
const run = (kind) => {
  if (kind === 'jest') {
    const r = spawnSync('npx', ['jest', ...JEST_TESTS, '--silent', '--coverage=false'], { cwd: ROOT, encoding: 'utf8', timeout: 600000 });
    return { code: r.status ?? 1, text: `${r.stdout}\n${r.stderr}` };
  }
  const env = { ...process.env, WS_DELETE_OUT: out };
  const r = spawnSync('bash', [PG_RUN], { cwd: ROOT, encoding: 'utf8', timeout: 900000, env });
  const log = join(out, 'jest.log');
  return { code: r.status ?? 1, text: `${r.stdout}\n${r.stderr}\n${existsSync(log) ? readFileSync(log, 'utf8') : ''}` };
};

let bad = 0;
const rows = [];
for (const [id, kind, file, anchor, replacement, why] of selected) {
  const path = join(ROOT, file);
  const original = readFileSync(path, 'utf8');
  const count = original.split(anchor).length - 1;
  if (count !== 1) { rows.push(['SETUP-ERROR', id, `${why} (anchor found ${count} times)`, []]); bad++; continue; }
  const bak = `${path}.mutbak`;
  copyFileSync(path, bak);
  backups.set(path, bak);
  try {
    writeFileSync(path, original.replace(anchor, () => replacement));
    const { code, text } = run(kind);
    const compile = /SyntaxError|Test suite failed to run|Cannot find module|error TS\d+/.test(text);
    const failed = text.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('✕') || /^● .* › /.test(l)).slice(0, 2).map((l) => l.slice(0, 120));
    const verdict = compile ? 'COMPILE-ERROR' : code !== 0 ? 'KILLED' : 'SURVIVED';
    if (verdict !== 'KILLED') bad++;
    rows.push([verdict, id, why, failed]);
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
