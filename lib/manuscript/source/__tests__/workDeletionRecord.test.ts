/**
 * workDeletionRecord — the deletion record for a Work that goes WITHOUT its writing being erased in the same act (hermetic: no database).
 *
 * Two paths end a Work row and write no manuscript record of their own: Remove this Work (the living-works route) and X8 (the
 * cleanup branch of eraseManuscript, which ends a declaration that outlived its writing, and the Work with it when it then declares
 * nothing). Both now write a content-free `member_deletion` manifest and one `living_works` tombstone, in the SAME transaction as
 * the Work's deletion (lib/manuscript/source/workDeletionRecord.ts). This file pins four things:
 *
 *   (a) what the helper itself issues, over a fake transaction that records every statement and its parameters;
 *   (b) a DRIFT GUARD: the helper is a second spelling of statements that eraseManuscript.ts (the normal Delete) also spells, and
 *       eraseManuscript.ts is pinned by source-text law tests so it cannot call into them. The two spellings are held together here;
 *   (c) the SOURCE LAW of the Remove route: the advisory lock is the first statement of its transaction, the record follows the
 *       DELETE and precedes the image queue row, it is its own awaited statement (`await writeWorkDeletionRecord(...)`, not a
 *       conditional, a `void` or an un-awaited call) naming the id the DELETE returned, the independent R20 ledger is never sealed (a
 *       DECLARED STATE), and the writing is never tombstoned from here;
 *   (d) the SOURCE LAW of X8: the record is written inside the viaWorkId cleanup branch, only when a Work really went, as its own
 *       awaited statement, before the branch returns.
 *
 * Source is scanned AFTER comments are stripped: the comments in these files quote the very SQL and names they forbid or order, and a
 * scan of raw text would pass on a comment. Each law is a function from source text to a list of violations, run on the real file
 * (must be empty) and on hand-made wrong versions of it (must not be), so a law that has been reduced to a tautology fails here.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { TransactionClient } from '@/lib/db/postgres';
import { RECOVERY_CAPTURE_LOCK_SQL, takeRecoveryCaptureLock, writeWorkDeletionRecord } from '../workDeletionRecord';

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8');
const HELPER_PATH = 'lib/manuscript/source/workDeletionRecord.ts';
const ERASE_PATH = 'lib/manuscript/source/eraseManuscript.ts';
const ROUTE_PATH = 'app/api/sovereign/living-works/[id]/route.ts';

const REMOVE_NOTE = 'Writer Work removed by verified member request';
const X8_NOTE = 'Writer Work ended after its writing was already gone, by verified member request';
const WORK = 'a0000000-0000-4000-8000-00000000000a';
const MANIFEST = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

/* ───────────────────────── a small TypeScript scanner ───────────────────────── */

interface Scanned {
  /** The source with comments removed. String and template literal text is kept (the SQL lives in it). */
  readonly code: string;
  /** The same, offset for offset, with string and template literal TEXT blanked, so braces and keywords inside SQL cannot be mistaken for structure. */
  readonly skeleton: string;
}

/** Scans from `start`; when `untilCloseBrace` is set (inside a `${ ... }`), stops at the brace that closes it and returns its index. */
function scanInto(src: string, start: number, out: { code: string; skeleton: string }, untilCloseBrace: boolean): number {
  let i = start;
  let depth = 0;
  while (i < src.length) {
    const ch = src[i]!;
    const next = src[i + 1];
    if (ch === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i += 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      const close = src.indexOf('*/', i + 2);
      i = close === -1 ? src.length : close + 2;
      continue;
    }
    if (ch === '\'' || ch === '"') {
      let j = i + 1;
      while (j < src.length && src[j] !== ch) { if (src[j] === '\\') j += 1; j += 1; }
      const literal = src.slice(i, j + 1);
      out.code += literal;
      out.skeleton += ch + ' '.repeat(Math.max(0, literal.length - 2)) + ch;
      i = j + 1;
      continue;
    }
    if (ch === '`') {
      out.code += '`'; out.skeleton += '`';
      i += 1;
      while (i < src.length && src[i] !== '`') {
        if (src[i] === '\\') { out.code += src.slice(i, i + 2); out.skeleton += '  '; i += 2; continue; }
        if (src[i] === '$' && src[i + 1] === '{') {
          out.code += '${'; out.skeleton += '${';
          const end = scanInto(src, i + 2, out, true);
          out.code += '}'; out.skeleton += '}';
          i = end + 1;
          continue;
        }
        out.code += src[i]!; out.skeleton += src[i] === '\n' ? '\n' : ' ';
        i += 1;
      }
      out.code += '`'; out.skeleton += '`';
      i += 1;
      continue;
    }
    if (untilCloseBrace) {
      if (ch === '{') depth += 1;
      else if (ch === '}') { if (depth === 0) return i; depth -= 1; }
    }
    out.code += ch; out.skeleton += ch;
    i += 1;
  }
  return i;
}

function scan(src: string): Scanned {
  const out = { code: '', skeleton: '' };
  scanInto(src, 0, out, false);
  return out;
}

/** Index of the `}` that closes the `{` at `open`, in a skeleton. */
function closingBrace(skeleton: string, open: number): number {
  let depth = 0;
  for (let i = open; i < skeleton.length; i += 1) {
    if (skeleton[i] === '{') depth += 1;
    else if (skeleton[i] === '}') { depth -= 1; if (depth === 0) return i; }
  }
  return -1;
}

/** Index of the `{` of the innermost block that contains `at`, in a skeleton. */
function enclosingOpen(skeleton: string, at: number): number {
  let depth = 0;
  for (let i = at - 1; i >= 0; i -= 1) {
    if (skeleton[i] === '}') depth += 1;
    else if (skeleton[i] === '{') { if (depth === 0) return i; depth -= 1; }
  }
  return -1;
}

/** The statement text that introduces the block opening at `open`: back to the previous `;`, `{` or `}`. */
function headerOf(skeleton: string, open: number): string {
  let start = open;
  while (start > 0 && !';{}'.includes(skeleton[start - 1]!)) start -= 1;
  return skeleton.slice(start, open).replace(/\s+/g, ' ').trim();
}

/** The text from the start of the statement that holds `at` up to `at`: back to the previous `;`, `{` or `}` in a skeleton (comments gone,
 *  string text blanked). A brace-less `if (...) await f()`, `a && await f()`, a ternary, `void f()` and a missing `await` all leave
 *  something other than a bare `await` here, which `enclosingOpen` cannot see because it only looks for a `{`. */
function statementPrefix(skeleton: string, at: number): string {
  let start = at;
  while (start > 0 && !';{}'.includes(skeleton[start - 1]!)) start -= 1;
  return skeleton.slice(start, at);
}
/** What a record call's statement must look like before the call: nothing but `await`. */
const BARE_AWAIT = /^\s*await\s+$/;

const count = (haystack: string, needle: string) => haystack.split(needle).length - 1;
const norm = (sql: string) => sql.replace(/\s+/g, ' ').trim();
const escapeRe = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** The first template literal (backticks, no nesting) that contains `needle`. */
const literalContaining = (code: string, needle: string): string | undefined =>
  new RegExp('`[^`]*' + escapeRe(needle) + '[^`]*`').exec(code)?.[0];

/** Replaces exactly one occurrence, or throws: a mutant that did not apply would prove nothing. */
function mutate(src: string, from: string | RegExp, to: string): string {
  if (typeof from === 'string') {
    if (count(src, from) !== 1) throw new Error(`mutation target must occur exactly once (found ${count(src, from)}): ${from.slice(0, 60)}`);
    return src.replace(from, () => to);
  }
  if (!from.test(src)) throw new Error(`mutation pattern did not match: ${String(from)}`);
  return src.replace(from, () => to);
}

/* ───────────────────────── the source laws, as functions ───────────────────────── */

/** (c) The Remove route. Returns the names of the laws the given source breaks. */
function removeRouteLaw(routeSource: string): string[] {
  const { code, skeleton } = scan(routeSource);
  const broken: string[] = [];
  const fn = code.indexOf('export async function DELETE');
  if (fn < 0) return ['no-delete-handler'];
  const body = code.slice(fn);
  const bodySkeleton = skeleton.slice(fn);

  if (!/import\s*\{[^}]*\btakeRecoveryCaptureLock\b[^}]*\bwriteWorkDeletionRecord\b[^}]*\}\s*from\s*'@\/lib\/manuscript\/source\/workDeletionRecord'/.test(code)) broken.push('imports-the-helper');

  const lock = body.indexOf('takeRecoveryCaptureLock(');
  const record = body.indexOf('writeWorkDeletionRecord(');
  const deletion = body.indexOf('DELETE FROM living_works');
  const queue = body.indexOf('INSERT INTO vault_erasure_queue');
  const firstWorkStatement = body.indexOf('living_works');

  if (count(body, 'transaction(') !== 1) broken.push('exactly-one-transaction');
  if (!/transaction\(\s*async\s*\(tx\)\s*=>\s*\{\s*await takeRecoveryCaptureLock\(tx\);/.test(body)) broken.push('lock-is-first-in-the-transaction');
  if (lock < 0 || firstWorkStatement < 0 || lock > firstWorkStatement) broken.push('lock-before-the-first-statement-that-touches-living_works');
  if (count(body, 'takeRecoveryCaptureLock(') !== 1) broken.push('lock-taken-once');

  if (record < 0) broken.push('record-is-written');
  else {
    if (count(body, 'writeWorkDeletionRecord(') !== 1) broken.push('record-written-once');
    if (deletion < 0 || record < deletion) broken.push('record-after-the-delete');
    if (queue < 0 || record > queue) broken.push('record-before-the-image-queue-row');
    // Only past the "the DELETE removed nothing" guard: a lost race writes no record.
    if (deletion >= 0 && record > deletion && !/\.rows\.length\s*===\s*0\s*\)\s*return null;/.test(body.slice(deletion, record))) broken.push('record-after-the-lost-race-guard');
    // The id the DELETE returned, never the URL's and never another statement's: the variable the DELETE FROM living_works statement
    // was assigned to, whatever it is called.
    const deleted = /const\s+([A-Za-z_$][\w$]*)\s*=\s*await\s+tx\.query\s*(?:<[^>]*>)?\s*\(\s*`\s*DELETE FROM living_works/.exec(body)?.[1];
    if (deleted === undefined || !new RegExp('writeWorkDeletionRecord\\(\\s*tx\\s*,\\s*' + escapeRe(deleted) + '\\.rows\\[0\\]!?\\.id\\s*,').test(body)) broken.push('record-uses-the-returned-id');
    // For every real removal, with or without an image: its block is the transaction callback itself, not a braced `if`.
    const open = enclosingOpen(bodySkeleton, record);
    if (!/transaction\(\s*async\s*\(tx\)\s*=>\s*$/.test(headerOf(bodySkeleton, open))) broken.push('record-is-unconditional');
    // ...and its statement is exactly `await writeWorkDeletionRecord(...)`: a brace-less `if`, `&&`, a ternary, `void` or a missing
    // `await` leave something else in front of the call (an un-awaited call would let the transaction commit before the record exists).
    if (!BARE_AWAIT.test(statementPrefix(bodySkeleton, record))) broken.push('record-is-a-bare-awaited-statement');
  }

  // DECLARED STATE: the independent R20 ledger is not sealed on this path.
  if (/sealR20DeletionLedger|r20DeletionLedger/.test(code)) broken.push('ledger-is-not-sealed');
  // The route does not spell its own record, and never tombstones a writing.
  if (/INSERT\s+INTO\s+(deletion_manifests|provenance_tombstones)/.test(code)) broken.push('route-spells-no-record-sql');
  if (code.includes('member_manuscripts')) broken.push('no-member_manuscripts-tombstone');
  return broken;
}

/** (d) X8, the cleanup branch of eraseManuscript. */
function x8Law(eraseSource: string): string[] {
  const { code, skeleton } = scan(eraseSource);
  const broken: string[] = [];
  if (!/import\s*\{\s*writeWorkDeletionRecord\s*\}\s*from\s*'\.\/workDeletionRecord'/.test(code)) broken.push('imports-the-helper');

  const fn = code.indexOf('export async function eraseManuscript(');
  const tail = code.indexOf('if (!result.ok) return result;');
  if (fn < 0 || tail < 0) return [...broken, 'erase-shape-changed'];

  // The advisory lock is the first statement, spelled as the helper spells it.
  const firstQuery = code.indexOf('tx.query(', fn);
  if (!new RegExp('^tx\\.query\\(\\s*`' + escapeRe(RECOVERY_CAPTURE_LOCK_SQL) + '`').test(code.slice(firstQuery))) broken.push('lock-is-first-and-spelled-as-the-helper-spells-it');

  if (count(code, 'writeWorkDeletionRecord(') !== 1) broken.push('record-called-exactly-once');
  const call = code.indexOf('writeWorkDeletionRecord(');
  if (call < 0) return [...broken, 'record-is-called'];
  if (call > tail) broken.push('record-inside-the-transaction');

  const held = skeleton.indexOf('if (held.rows.length === 0) {', fn);
  const heldOpen = skeleton.indexOf('{', held);
  const heldClose = closingBrace(skeleton, heldOpen);
  const branch = skeleton.indexOf('if (options.viaWorkId !== undefined && claims.rows.some(', heldOpen);
  const branchOpen = skeleton.indexOf('{', skeleton.indexOf('))', branch));
  const branchClose = closingBrace(skeleton, branchOpen);
  if (held < 0 || branch < 0 || branch > heldClose || branchOpen < 0) return [...broken, 'viaWorkId-branch-not-found'];

  if (!(call > branchOpen && call < branchClose)) broken.push('record-inside-the-viaWorkId-branch');
  const afterCleanup = code.indexOf('removeDeclaration(', branchOpen);
  if (afterCleanup < 0 || call < afterCleanup) broken.push('record-after-removeDeclaration');
  const branchReturn = code.indexOf('return { ok: true as const', branchOpen);
  if (branchReturn < 0 || call > branchReturn) broken.push('record-before-the-branch-returns');

  const guardOpen = enclosingOpen(skeleton, call);
  if (!/^if \(\s*cleaned\.workRemovedId !== undefined\s*\)$/.test(headerOf(skeleton, guardOpen))) broken.push('record-guarded-by-workRemovedId');
  // The call's own statement is exactly `await writeWorkDeletionRecord(...)` (see the Remove route's law of the same name).
  if (!BARE_AWAIT.test(statementPrefix(skeleton, call))) broken.push('record-is-a-bare-awaited-statement');
  if (!/writeWorkDeletionRecord\(\s*tx\s*,\s*cleaned\.workRemovedId\s*,/.test(code)) broken.push('record-uses-the-id-removeDeclaration-returned');

  // Not sealed on this path: a cleanup deleted no writing, and the outcome keeps reading `recoverySealed = declarationOnly`.
  if (!code.includes('let recoverySealed = result.declarationOnly;')) broken.push('x8-keeps-recoverySealed-as-declarationOnly');
  if (!/declarationOnly:\s*true/.test(code.slice(branchOpen, branchClose))) broken.push('x8-returns-declarationOnly');
  return broken;
}

/* ───────────────────────── (0) the scanner itself ───────────────────────── */

describe('the scanner the source laws stand on', () => {
  it('removes line and block comments, keeps string and template text (the SQL lives there), and keeps both views the same length', () => {
    const src = [
      'const a = "x // not a comment"; // gone',
      '/* gone: INSERT INTO deletion_manifests */',
      'const b = `SELECT 1 /* kept: it is SQL */ -- kept`;',
      "const c = 'it\\'s // kept';",
    ].join('\n');
    const { code, skeleton } = scan(src);
    expect(code).not.toContain('gone');
    expect(code).toContain('"x // not a comment"');
    expect(code).toContain('/* kept: it is SQL */');
    expect(code).toContain("'it\\'s // kept'");
    expect(skeleton).toHaveLength(code.length);
    expect(skeleton).not.toContain('kept');
  });
  it('reads code inside ${ } of a template as code, and a comment inside it as a comment', () => {
    const { code, skeleton } = scan('const t = `a ${ f(/* gone */ x) } b`;');
    expect(code).toBe('const t = `a ${ f( x) } b`;');
    expect(skeleton).toBe('const t = `  ${ f( x) }  `;');
  });
  it('balances braces on the three real files (a derailed scan would not)', () => {
    for (const file of [HELPER_PATH, ERASE_PATH, ROUTE_PATH]) {
      const { code, skeleton } = scan(read(file));
      expect({ file, balanced: count(skeleton, '{') === count(skeleton, '}'), sameLength: skeleton.length === code.length, braces: count(skeleton, '{') > 0 })
        .toEqual({ file, balanced: true, sameLength: true, braces: true });
    }
  });
});

/* ───────────────────────── (a) the helper, over a fake transaction ───────────────────────── */

type Seen = { sql: string; params: unknown[] | undefined };
function fakeTx(over: { manifestRows?: Array<{ id: string }>; failOn?: 'manifest' | 'tombstone' } = {}) {
  const seen: Seen[] = [];
  const tx = {
    query: jest.fn(async (sql: string, params?: unknown[]) => {
      seen.push({ sql, params });
      if (sql.includes('INSERT INTO deletion_manifests')) {
        if (over.failOn === 'manifest') throw new Error('fictional manifest failure');
        return { rows: over.manifestRows ?? [{ id: MANIFEST }] };
      }
      if (sql.includes('INSERT INTO provenance_tombstones')) {
        if (over.failOn === 'tombstone') throw new Error('fictional tombstone failure');
        return { rows: [] };
      }
      if (sql.includes('pg_advisory_xact_lock')) return { rows: [] };
      throw new Error(`unexpected statement: ${sql.slice(0, 60)}`);
    }),
  };
  return { tx: tx as unknown as TransactionClient, seen, query: tx.query };
}

describe('takeRecoveryCaptureLock', () => {
  it('is the recovery-capture advisory lock, a transaction-scoped one, keyed exactly as eraseManuscript keys it', () => {
    expect(RECOVERY_CAPTURE_LOCK_SQL).toBe(`SELECT pg_advisory_xact_lock(hashtextextended('soullab:r20:recovery-capture', 0))`);
  });
  it('issues exactly that one statement, with no parameters, on the transaction it is given', async () => {
    const { tx, seen, query } = fakeTx();
    await takeRecoveryCaptureLock(tx);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(RECOVERY_CAPTURE_LOCK_SQL);
    expect(seen).toEqual([{ sql: RECOVERY_CAPTURE_LOCK_SQL, params: undefined }]);
  });
  it('lets a failing lock statement propagate (a transaction that could not take the lock must not go on)', async () => {
    const { tx, query } = fakeTx();
    query.mockRejectedValueOnce(new Error('fictional lock failure'));
    await expect(takeRecoveryCaptureLock(tx)).rejects.toThrow('fictional lock failure');
  });
});

describe('writeWorkDeletionRecord', () => {
  it('issues one manifest and then one tombstone, and nothing else, and returns the manifest id', async () => {
    const { tx, seen } = fakeTx();
    const id = await writeWorkDeletionRecord(tx, WORK, REMOVE_NOTE);
    expect(id).toBe(MANIFEST);
    expect(seen).toHaveLength(2);
    expect(seen[0]!.sql).toContain('INSERT INTO deletion_manifests');
    expect(seen[1]!.sql).toContain('INSERT INTO provenance_tombstones');
  });
  it('the manifest is a member_deletion by verified member self-service; the note is a PARAMETER, never interpolated into the SQL', async () => {
    for (const note of [REMOVE_NOTE, X8_NOTE] as const) {
      const { tx, seen } = fakeTx();
      await writeWorkDeletionRecord(tx, WORK, note);
      expect(seen[0]!.sql).toContain(`'member_deletion'`);
      expect(seen[0]!.sql).toContain(`'verified-member-self-service'`);
      expect(seen[0]!.sql).toMatch(/RETURNING id/);
      expect(seen[0]!.sql).not.toContain(note);
      expect(seen[0]!.params).toEqual([note]);
    }
  });
  it('the tombstone names exactly the manifest, the kind living_works, and the Work id as given (no re-spelling), and is idempotent on conflict', async () => {
    const { tx, seen } = fakeTx();
    const odd = 'A0000000-0000-4000-8000-00000000000A';       // the helper passes through what it is given; the CALLER must hand it the returned id
    await writeWorkDeletionRecord(tx, odd, REMOVE_NOTE);
    expect(seen[1]!.params).toEqual([MANIFEST, odd]);
    expect(seen[1]!.sql).toContain(`'living_works'`);
    expect(seen[1]!.sql).toMatch(/\$1::uuid/);
    expect(norm(seen[1]!.sql)).toMatch(/ON CONFLICT \(object_kind, object_id\) DO NOTHING$/);
  });
  it('writes nothing about a writing: no member_manuscripts, no editorial history, no queue row, no ledger', async () => {
    const { tx, seen } = fakeTx();
    await writeWorkDeletionRecord(tx, WORK, X8_NOTE);
    const all = seen.map((s) => s.sql).join('\n');
    expect(all).not.toMatch(/member_manuscripts|r20_erase_writer_editorial_history|vault_erasure_queue|manuscript_source_arrivals/);
  });
  it('a manifest that returns no id throws r20_manifest_not_created and writes NO tombstone for nothing', async () => {
    const { tx, seen } = fakeTx({ manifestRows: [] });
    await expect(writeWorkDeletionRecord(tx, WORK, REMOVE_NOTE)).rejects.toThrow('r20_manifest_not_created');
    expect(seen.map((s) => s.sql).some((sql) => sql.includes('provenance_tombstones'))).toBe(false);
  });
  it('a failing manifest insert propagates and no tombstone is attempted', async () => {
    const { tx, seen } = fakeTx({ failOn: 'manifest' });
    await expect(writeWorkDeletionRecord(tx, WORK, REMOVE_NOTE)).rejects.toThrow('fictional manifest failure');
    expect(seen).toHaveLength(1);
  });
  it('a failing tombstone insert propagates (the caller\'s transaction then rolls the Work\'s deletion back)', async () => {
    const { tx, seen } = fakeTx({ failOn: 'tombstone' });
    await expect(writeWorkDeletionRecord(tx, WORK, REMOVE_NOTE)).rejects.toThrow('fictional tombstone failure');
    expect(seen).toHaveLength(2);
  });
});

/* ───────────────────────── (b) the drift guard ───────────────────────── */

describe('DRIFT GUARD: the helper spells the same statements as the normal Delete in eraseManuscript.ts where they overlap', () => {
  const erase = scan(read(ERASE_PATH)).code;
  const helper = scan(read(HELPER_PATH)).code;

  it('the advisory-lock statement: RECOVERY_CAPTURE_LOCK_SQL appears verbatim, as a whole template literal, in eraseManuscript.ts', () => {
    expect(erase).toContain('`' + RECOVERY_CAPTURE_LOCK_SQL + '`');
    // ...and it is the helper's own single source, not a second copy that could drift inside the helper.
    expect(count(helper, 'soullab:r20:recovery-capture')).toBe(1);
  });

  it('the lock is the FIRST statement of eraseManuscript\'s transaction (the order the Remove route follows)', () => {
    const fn = erase.indexOf('export async function eraseManuscript(');
    const first = erase.indexOf('tx.query(', fn);
    expect(erase.slice(first, first + 200)).toContain(RECOVERY_CAPTURE_LOCK_SQL);
  });

  it('the manifest statement is the same text, whitespace aside, except that the note is a parameter here and a literal there', () => {
    const eraseManifest = literalContaining(erase, 'INSERT INTO deletion_manifests');
    const helperManifest = literalContaining(helper, 'INSERT INTO deletion_manifests');
    expect(eraseManifest).toBeDefined();
    expect(helperManifest).toBeDefined();
    const eraseNorm = norm(eraseManifest!).replace(`'Writer manuscript custody ended by verified member request'`, '$1');
    expect(norm(helperManifest!)).toBe(eraseNorm);
    // The two literals the refusal authority is keyed on, spelled the same in both files.
    for (const literal of [`'member_deletion'`, `'verified-member-self-service'`]) {
      expect(erase).toContain(literal);
      expect(helper).toContain(literal);
    }
    expect(erase).toContain('(reason_class, authorized_by, executed_at, note)');
    expect(helper).toContain('(reason_class, authorized_by, executed_at, note)');
  });

  it('the tombstone statement: same table, same columns, same uuid cast of the manifest, same ON CONFLICT clause, and the kind spelled living_works in both', () => {
    const eraseTomb = norm(literalContaining(erase, 'INSERT INTO provenance_tombstones')!);
    const helperTomb = norm(literalContaining(helper, 'INSERT INTO provenance_tombstones')!);
    const head = 'INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id)';
    const tail = 'ON CONFLICT (object_kind, object_id) DO NOTHING`';
    for (const text of [eraseTomb, helperTomb]) {
      expect(text.startsWith('`' + head)).toBe(true);
      expect(text.endsWith(tail)).toBe(true);
      expect(text).toContain('$1::uuid');
    }
    // The middle differs on purpose (a batch over unnest there, one VALUES row here); the kind string must not.
    expect(erase).toContain(`kinds.push('living_works')`);
    expect(helperTomb).toContain(`'living_works'`);
  });

  it('the two notes the helper accepts are exactly the ones its two callers pass, and the normal Delete\'s own note is neither', () => {
    expect(helper).toContain(`'${REMOVE_NOTE}'`);
    expect(helper).toContain(`'${X8_NOTE}'`);
    expect(scan(read(ROUTE_PATH)).code).toContain(`'${REMOVE_NOTE}'`);
    expect(erase).toContain(`'${X8_NOTE}'`);
    expect(count(helper, 'Writer ')).toBe(2);
  });

  it('the helper imports only a TYPE from the database module (it has no connection of its own to take a statement outside the transaction) and no ledger', () => {
    expect(helper).toMatch(/import type \{ TransactionClient \} from '@\/lib\/db\/postgres';/);
    expect(helper).not.toMatch(/import\s+\{[^}]*\b(query|transaction)\b[^}]*\}\s+from\s+'@\/lib\/db\/postgres'/);
    expect(helper).not.toMatch(/r20DeletionLedger|sealR20DeletionLedger|member_manuscripts|r20_erase_writer_editorial_history/);
  });
});

/* ───────────────────────── (c) the Remove route ───────────────────────── */

describe('SOURCE LAW: the Remove route (app/api/sovereign/living-works/[id]/route.ts DELETE)', () => {
  const route = read(ROUTE_PATH);

  it('keeps every law, on the real file', () => {
    expect(removeRouteLaw(route)).toEqual([]);
  });

  it('takeRecoveryCaptureLock is called before the first statement that touches living_works, as the first statement of the one transaction', () => {
    const { code } = scan(route);
    const body = code.slice(code.indexOf('export async function DELETE'));
    expect(body.indexOf('takeRecoveryCaptureLock(tx)')).toBeGreaterThan(-1);
    expect(body.indexOf('takeRecoveryCaptureLock(tx)')).toBeLessThan(body.indexOf('living_works'));
    expect(body.indexOf('living_works')).toBe(body.indexOf('SELECT id FROM living_works') + 'SELECT id FROM '.length);
  });

  it('writeWorkDeletionRecord is called after the DELETE FROM living_works and before the vault_erasure_queue insert', () => {
    const { code } = scan(route);
    const body = code.slice(code.indexOf('export async function DELETE'));
    const deletion = body.indexOf('DELETE FROM living_works');
    const record = body.indexOf('writeWorkDeletionRecord(');
    const queue = body.indexOf('INSERT INTO vault_erasure_queue');
    expect(deletion).toBeGreaterThan(-1);
    expect(record).toBeGreaterThan(deletion);
    expect(queue).toBeGreaterThan(record);
  });

  it('DECLARED STATE: not sealed, deliberately; changing this is a member-visible outcome decision (the route never imports or calls sealR20DeletionLedger)', () => {
    // Production has no R20_* variable on the app container, so a seal here would turn today's success into `custody_incomplete`;
    // and lib/writersStudio/deleteWork.ts reads any 500 with `removed: true` from this route as an owed IMAGE, so a failed seal could
    // not be reported truthfully without a client change. The manifest and tombstone are committed in the database, and any later
    // successful seal mirrors every row. If this test fails, a person has chosen to seal Remove: that is an outcome decision and a
    // client change, not a refactor, and this test is to be replaced by one that pins the new decision.
    const { code } = scan(route);
    expect(code).not.toContain('sealR20DeletionLedger');
    expect(code).not.toContain('r20DeletionLedger');
    expect(code).not.toMatch(/R20_/);
  });

  it('never tombstones a writing: no member_manuscripts in the route, and no record SQL of its own (the helper is the only author of the record)', () => {
    const { code } = scan(route);
    expect(code).not.toContain('member_manuscripts');
    expect(code).not.toMatch(/INSERT\s+INTO\s+(deletion_manifests|provenance_tombstones)/);
    expect(code).not.toContain('r20_erase_writer_editorial_history');
  });

  describe('defeat candidates (hand-made wrong routes: each must break the law it names)', () => {
    const CALL = `await writeWorkDeletionRecord(tx, gone.rows[0].id, 'Writer Work removed by verified member request');`;
    const LOCK = 'await takeRecoveryCaptureLock(tx);';
    const cases: Array<[string, string, (src: string) => string]> = [
      ['the lock is never taken', 'lock-is-first-in-the-transaction', (s) => mutate(s, LOCK, '')],
      ['the lock is taken after the Work lookup (the cycle with a Delete of the writing)', 'lock-is-first-in-the-transaction',
        (s) => mutate(mutate(s, LOCK, ''), 'if (owned.rows.length === 0) return null;', `if (owned.rows.length === 0) return null;\n      ${LOCK}`)],
      ['another statement touches living_works before the lock (the lock is still first INSIDE the transaction)', 'lock-before-the-first-statement-that-touches-living_works',
        (s) => mutate(s, 'const removed = await transaction(async (tx) => {', "await query('SELECT 1 FROM living_works WHERE id = $1', [id]);\n    const removed = await transaction(async (tx) => {")],
      ['the record is written before the delete', 'record-after-the-delete',
        (s) => mutate(mutate(s, CALL, ''), 'const visual = await tx.query', `${CALL}\n      const visual = await tx.query`)],
      ['the record is written after the image is queued', 'record-before-the-image-queue-row',
        (s) => mutate(mutate(s, CALL, ''), 'return { id: gone.rows[0].id, queueId };', `${CALL}\n      return { id: gone.rows[0].id, queueId };`)],
      ['the record is written even when the delete removed nothing', 'record-after-the-lost-race-guard',
        (s) => mutate(mutate(s, 'if (gone.rows.length === 0) return null;', ''), CALL, `${CALL}\n      if (gone.rows.length === 0) return null;`)],
      ['the tombstone names the id from the URL', 'record-uses-the-returned-id', (s) => mutate(s, 'writeWorkDeletionRecord(tx, gone.rows[0].id,', 'writeWorkDeletionRecord(tx, id,')],
      ['the record is written only for a Work that had an image', 'record-is-unconditional',
        (s) => mutate(s, CALL, `if (visual.rows[0]) { ${CALL} }`)],
      // The next five leave the record conditional or unawaited WITHOUT a brace, which the block check above cannot see: before the
      // statement check existed, the route law returned no violation for any of them. Each must now be caught by that check.
      ['the record is written only for a Work that had an image, with a brace-less `if`', 'record-is-a-bare-awaited-statement',
        (s) => mutate(s, CALL, `if (visual.rows[0]) ${CALL}`)],
      ['the record is written only for a Work that had an image, with `&&`', 'record-is-a-bare-awaited-statement',
        (s) => mutate(s, CALL, `visual.rows[0] && ${CALL}`)],
      ['the record is written only for a Work that had an image, with a ternary', 'record-is-a-bare-awaited-statement',
        (s) => mutate(s, CALL, `visual.rows[0] ? ${CALL.slice(0, -1)} : null;`)],
      ['the record call is fired and not awaited (`void`), so the transaction can commit before it exists', 'record-is-a-bare-awaited-statement',
        (s) => mutate(s, CALL, `void ${CALL.slice('await '.length)}`)],
      ['the record call has no `await` at all', 'record-is-a-bare-awaited-statement',
        (s) => mutate(s, CALL, CALL.slice('await '.length))],
      ['the tombstone names the id the lookup returned, not the one the DELETE returned', 'record-uses-the-returned-id',
        (s) => mutate(s, 'writeWorkDeletionRecord(tx, gone.rows[0].id,', 'writeWorkDeletionRecord(tx, owned.rows[0].id,')],
      ['the call is only mentioned in a comment', 'record-is-written', (s) => mutate(s, CALL, `// ${CALL}`)],
      ['the call is written twice', 'record-written-once', (s) => mutate(s, CALL, `${CALL}\n      ${CALL}`)],
      ['the ledger is sealed', 'ledger-is-not-sealed',
        (s) => mutate(mutate(s, "import { query, transaction } from '@/lib/db/postgres';", "import { query, transaction } from '@/lib/db/postgres';\nimport { sealR20DeletionLedger } from '@/lib/recovery/r20DeletionLedger';"), CALL, `${CALL}\n      await sealR20DeletionLedger();`)],
      ['the route spells its own record', 'route-spells-no-record-sql',
        (s) => mutate(s, CALL, "await tx.query(`INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id) VALUES ($1, 'living_works', $2)`, [null, id]);")],
      ['a writing is tombstoned', 'no-member_manuscripts-tombstone', (s) => mutate(s, CALL, `${CALL}\n      await tx.query("UPDATE member_manuscripts SET x = 1");`)],
      ['a second transaction is opened for the record', 'exactly-one-transaction', (s) => mutate(s, CALL, `await transaction(async (tx2) => { await writeWorkDeletionRecord(tx2, gone.rows[0].id, 'Writer Work removed by verified member request'); });`)],
    ];
    for (const [name, law, make] of cases) {
      it(`${name}: breaks "${law}"`, () => {
        expect(removeRouteLaw(make(route))).toContain(law);
      });
    }
    it('a comment that quotes the forbidden names and the ordering does not break anything (the real file has several)', () => {
      const withComment = route.replace('export async function DELETE', '/* sealR20DeletionLedger member_manuscripts INSERT INTO provenance_tombstones writeWorkDeletionRecord( */\nexport async function DELETE');
      expect(withComment).not.toBe(route);
      expect(removeRouteLaw(withComment)).toEqual([]);
    });
  });
});

/* ───────────────────────── (d) X8 in eraseManuscript.ts ───────────────────────── */

describe('SOURCE LAW: X8 (eraseManuscript.ts, the viaWorkId cleanup of a declaration that outlived its writing)', () => {
  const erase = read(ERASE_PATH);

  it('keeps every law, on the real file', () => {
    expect(x8Law(erase)).toEqual([]);
  });

  it('writeWorkDeletionRecord sits inside the viaWorkId branch, guarded by workRemovedId, before the branch returns', () => {
    const { code, skeleton } = scan(erase);
    const held = skeleton.indexOf('if (held.rows.length === 0) {');
    const branch = skeleton.indexOf('if (options.viaWorkId !== undefined && claims.rows.some(', held);
    const branchOpen = skeleton.indexOf('{', skeleton.indexOf('))', branch));
    const branchClose = closingBrace(skeleton, branchOpen);
    const call = code.indexOf('writeWorkDeletionRecord(');
    expect(call).toBeGreaterThan(branchOpen);
    expect(call).toBeLessThan(branchClose);
    expect(code.indexOf('removeDeclaration(', branchOpen)).toBeLessThan(call);
    expect(code.indexOf('return { ok: true as const', branchOpen)).toBeGreaterThan(call);
    expect(headerOf(skeleton, enclosingOpen(skeleton, call))).toMatch(/^if \(\s*cleaned\.workRemovedId !== undefined\s*\)$/);
  });

  it('it is the ONLY call: the normal Delete (a live writing) writes its own manifest and does not also call the helper', () => {
    const { code } = scan(erase);
    expect(count(code, 'writeWorkDeletionRecord(')).toBe(1);
    expect(count(code, 'INSERT INTO deletion_manifests')).toBe(1);        // the normal Delete's own, untouched
    expect(code).toContain(`'Writer manuscript custody ended by verified member request'`);
  });

  it('X8 does not seal: its outcome keeps recoverySealed = declarationOnly (a cleanup deleted no writing), and the seal call is skipped for it', () => {
    const { code } = scan(erase);
    expect(code).toContain('let recoverySealed = result.declarationOnly;');
    expect(code).toMatch(/if \(!result\.declarationOnly\) \{\s*try \{\s*recoverySealed = \(await sealR20DeletionLedger\(\)\)\.sealed;/);
    expect(count(code, 'sealR20DeletionLedger(')).toBe(1);
  });

  describe('defeat candidates (hand-made wrong versions of eraseManuscript.ts: each must break the law it names)', () => {
    const GUARD = 'if (cleaned.workRemovedId !== undefined) {';
    const guardedBlock = /\n[ \t]*if \(cleaned\.workRemovedId !== undefined\) \{\n[ \t]*await writeWorkDeletionRecord\([^\n]*\n[ \t]*\}/;
    const cases: Array<[string, string, (src: string) => string]> = [
      ['the record is written whether or not a Work went', 'record-guarded-by-workRemovedId', (s) => mutate(s, GUARD, '{')],
      ['the record is written for the caller\'s id, not the one the delete returned', 'record-uses-the-id-removeDeclaration-returned',
        (s) => mutate(s, 'writeWorkDeletionRecord(tx, cleaned.workRemovedId,', 'writeWorkDeletionRecord(tx, options.viaWorkId as string,')],
      ['the record is written after the branch has returned', 'record-before-the-branch-returns', (s) => {
        const block = guardedBlock.exec(s)![0];
        const returned = /return \{ ok: true as const, refs: \[\] as string\[\][^\n]*\n/.exec(s)![0];
        return mutate(mutate(s, block, ''), returned, `${returned}${block}\n`);
      }],
      ['the record is written outside the viaWorkId branch (after the not_found return)', 'record-inside-the-viaWorkId-branch', (s) => {
        const block = guardedBlock.exec(s)![0];
        return mutate(mutate(s, block, ''), "return { ok: false as const, refusal: 'not_found' as const };\n    }\n    /* The member pressed", `return { ok: false as const, refusal: 'not_found' as const };\n    }\n${block}\n    /* The member pressed`);
      }],
      ['the helper is also called by the normal Delete', 'record-called-exactly-once',
        (s) => mutate(s, 'const declaration = await removeDeclaration(tx, claims.rows[0]?.living_work_id, manuscriptId, memberId);',
          `const declaration = await removeDeclaration(tx, claims.rows[0]?.living_work_id, manuscriptId, memberId);\n    if (declaration.workRemovedId) await writeWorkDeletionRecord(tx, declaration.workRemovedId, 'x' as never);`)],
      ['the record is written after the transaction has ended', 'record-inside-the-transaction',
        (s) => mutate(mutate(s, guardedBlock.exec(s)![0], ''), 'if (!result.ok) return result;', `if (!result.ok) return result;\n  await writeWorkDeletionRecord(null as never, WORK_ID, 'x' as never);`)],
      // The next four spell the call so that it is not a bare `await` statement; the guard and the branch are left as they are where they can be.
      ['the record is written only under a brace-less `if` (the guard is not a block)', 'record-is-a-bare-awaited-statement',
        (s) => mutate(s, guardedBlock.exec(s)![0], '\n        if (cleaned.workRemovedId !== undefined) await writeWorkDeletionRecord(tx, cleaned.workRemovedId, \'x\' as never);')],
      ['the record is written under `&&` instead of an `if`', 'record-is-a-bare-awaited-statement',
        (s) => mutate(s, /await writeWorkDeletionRecord\(tx, cleaned\.workRemovedId,/, 'cleaned.workRemovedId !== undefined && await writeWorkDeletionRecord(tx, cleaned.workRemovedId,')],
      ['the record call is fired and not awaited (`void`)', 'record-is-a-bare-awaited-statement',
        (s) => mutate(s, /await writeWorkDeletionRecord\(tx, cleaned\.workRemovedId,/, 'void writeWorkDeletionRecord(tx, cleaned.workRemovedId,')],
      ['the record call has no `await` at all', 'record-is-a-bare-awaited-statement',
        (s) => mutate(s, /await writeWorkDeletionRecord\(tx, cleaned\.workRemovedId,/, 'writeWorkDeletionRecord(tx, cleaned.workRemovedId,')],
      ['the ledger is sealed for a cleanup', 'x8-keeps-recoverySealed-as-declarationOnly', (s) => mutate(s, 'let recoverySealed = result.declarationOnly;', 'let recoverySealed = false;')],
      ['the lock is spelled differently from the helper\'s', 'lock-is-first-and-spelled-as-the-helper-spells-it', (s) => mutate(s, `'soullab:r20:recovery-capture'`, `'soullab:r20:recovery-capture-x'`)],
      ['another statement comes before the lock', 'lock-is-first-and-spelled-as-the-helper-spells-it',
        (s) => mutate(s, 'const result = await transaction(async (tx) => {', 'const result = await transaction(async (tx) => {\n    await tx.query(`SELECT 1`);')],
      ['the call is only mentioned in a comment', 'record-called-exactly-once',
        (s) => mutate(s, /await writeWorkDeletionRecord\(tx, cleaned\.workRemovedId,/, '// await writeWorkDeletionRecord(tx, cleaned.workRemovedId,')],
    ];
    for (const [name, law, make] of cases) {
      it(`${name}: breaks "${law}"`, () => {
        expect(x8Law(make(erase))).toContain(law);
      });
    }
  });
});
