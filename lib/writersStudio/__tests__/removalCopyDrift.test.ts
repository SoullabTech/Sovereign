/**
 * Drift guard: what "Remove this Work" tells the member goes must match what the database actually removes.
 *
 * Removing a Work deletes the `living_works` row, and every table with a foreign key into it that says ON DELETE CASCADE goes with
 * it. The confirmation names what goes in the member's words. If a new table starts cascading from a Work and the copy is not
 * updated, the confirmation silently under-describes the act: the member agrees to less than happens. That is the exact failure
 * the founder rejected in the WORK-SHELF-01 ruling ("the label may not outrun the act"), and it already happened once: the
 * 2026-09-08 census said "link rows only" and seven later migrations made it false.
 *
 * This test reads every migration and the baseline, collects every table that references `living_works`, and:
 *   1. fails when the set differs from the one below (a new cascading child forces a decision here, not a silent change);
 *   2. fails when any such reference does NOT cascade (it would make removing a Work fail, or leave a detached row);
 *   3. fails when a member-facing child is not covered by a phrase that appears in every confirmation that says what goes.
 *
 * It is static: it reads SQL text, not a database. The physical probes (tests/constitutional/ws-delete/dynamic) cover, among the tables a
 * Work cascades into, only `living_work_expressions` and `living_work_visuals`. Every other cascade, and every claim about what STAYS
 * after a Remove (conversations about a writing, the proposal wording, the origin records), rests on this scan and on reading the DDL
 * (lane record 6.9.5), not on a physical cascade. The scan sees only tables with a DIRECT foreign key into `living_works`.
 */
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { REMOVE_MANY_WORK_COPY, REMOVE_SHARED_WORK_COPY, deleteConfirmCopy, removeSharedWorkCopy } from '@/lib/writersStudio/deleteWork';

const repo = join(__dirname, '..', '..', '..');
const files = [
  join(repo, 'database', 'baseline', '0001_baseline_2026-09-01.sql'),
  ...readdirSync(join(repo, 'database', 'migrations')).filter((name) => name.endsWith('.sql')).sort().map((name) => join(repo, 'database', 'migrations', name)),
];

type Reference = { readonly table: string; readonly onDelete: string; readonly file: string };

/** SQL with comments and identifier quotes removed, so an example in a comment or "public"."name" cannot change the answer. */
const clean = (sql: string) => sql.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--[^\n]*/g, '').replace(/"/g, '');

/** The text of ONE column or constraint definition after `REFERENCES living_works(...)`: up to the first comma, semicolon or closing
 *  parenthesis at the same depth. A window of the next N characters would read the NEXT column's `ON DELETE CASCADE` as this one's. */
function clauseAfterReference(sql: string, afterOpenParen: number): string {
  let depth = 1;
  let i = afterOpenParen;
  for (; i < sql.length && depth > 0; i += 1) {
    if (sql[i] === '(') depth += 1;
    else if (sql[i] === ')') depth -= 1;
  }
  const start = i;                        // just after the column list's closing parenthesis
  depth = 0;
  for (; i < sql.length; i += 1) {
    const ch = sql[i];
    if (ch === '(') depth += 1;
    else if (ch === ')') { if (depth === 0) break; depth -= 1; }
    else if ((ch === ',' || ch === ';') && depth === 0) break;
  }
  return sql.slice(start, i);
}

/** The clause of a reference written with NO column list: from just after the table name to the first comma, semicolon or closing
 *  parenthesis at the same depth (the same end as clauseAfterReference). */
function clauseAfterName(sql: string, from: number): string {
  let depth = 0;
  let i = from;
  for (; i < sql.length; i += 1) {
    const ch = sql[i];
    if (ch === '(') depth += 1;
    else if (ch === ')') { if (depth === 0) break; depth -= 1; }
    else if ((ch === ',' || ch === ';') && depth === 0) break;
  }
  return sql.slice(from, i);
}

function referencesToLivingWorks(): Reference[] {
  const found: Reference[] = [];
  for (const file of files) {
    const sql = clean(readFileSync(file, 'utf8'));
    const owner = /(?:CREATE TABLE(?: IF NOT EXISTS)?|ALTER TABLE(?: ONLY| IF EXISTS)*)\s+(?:public\.)?([a-z_0-9]+)/gi;
    const owners: Array<{ at: number; name: string }> = [];
    for (let m = owner.exec(sql); m; m = owner.exec(sql)) owners.push({ at: m.index, name: m[1]!.toLowerCase() });
    // `REFERENCES living_works(id)` AND the legal short form `REFERENCES living_works` (no column list: it points at the primary key).
    // `\b(?!_)` keeps `living_works_something_else` from matching.
    const ref = /REFERENCES\s+(?:public\.)?living_works\b(?!_)\s*(\()?/gi;
    for (let m = ref.exec(sql); m; m = ref.exec(sql)) {
      const table = [...owners].reverse().find((o) => o.at < m!.index)?.name;
      if (!table) throw new Error(`could not find the table that owns a reference to living_works in ${file}`);
      const clause = m[1] ? clauseAfterReference(sql, m.index + m[0].length) : clauseAfterName(sql, m.index + m[0].length);
      // A missing ON DELETE is NO ACTION: it would BLOCK the removal of a Work, and must be seen as such.
      const onDelete = /ON DELETE\s+(CASCADE|SET NULL|SET DEFAULT|RESTRICT|NO ACTION)/i.exec(clause)?.[1]?.toUpperCase() ?? 'NO ACTION';
      found.push({ table, onDelete, file: file.slice(repo.length + 1) });
    }
  }
  return found;
}

/** Tables that carry a `living_work_id` column WITHOUT a foreign key to living_works: nothing cascades to them, so a Work's removal
 *  leaves their rows behind. Each must be a conscious decision recorded below. */
function tablesCarryingAWorkIdWithoutAForeignKey(withKey: ReadonlySet<string>): string[] {
  const names = new Set<string>();
  for (const file of files) {
    const sql = clean(readFileSync(file, 'utf8'));
    const create = /CREATE TABLE(?: IF NOT EXISTS)?\s+(?:public\.)?([a-z_0-9]+)\s*\(/gi;
    for (let m = create.exec(sql); m; m = create.exec(sql)) {
      let depth = 1;
      let i = m.index + m[0].length;
      for (; i < sql.length && depth > 0; i += 1) {
        if (sql[i] === '(') depth += 1;
        else if (sql[i] === ')') depth -= 1;
      }
      const body = sql.slice(m.index + m[0].length, i);
      if (/(^|[\s,(])living_work_id\s+[a-z]/i.test(body) && !withKey.has(m[1]!.toLowerCase())) names.add(m[1]!.toLowerCase());
    }
  }
  // A column added to an existing table is the same hazard written a different way.
  for (const file of files) {
    const sql = clean(readFileSync(file, 'utf8'));
    const alter = /ALTER TABLE(?: ONLY| IF EXISTS)*\s+(?:public\.)?([a-z_0-9]+)\s+([^;]*?);/gi;
    for (let m = alter.exec(sql); m; m = alter.exec(sql)) {
      if (/ADD COLUMN(?: IF NOT EXISTS)?\s+living_work_id\s+[a-z]/i.test(m[2]!) && !withKey.has(m[1]!.toLowerCase())) names.add(m[1]!.toLowerCase());
    }
  }
  return [...names].sort();
}

/** `CHECK (num_nonnulls(manuscript_id, living_work_id) = 1)`, immediately after the constraint's name. */
const ONE_CONTAINER_CHECK = /^\s*CHECK\s*\(\s*num_nonnulls\s*\(\s*manuscript_id\s*,\s*living_work_id\s*\)\s*=\s*1\s*\)/i;

/**
 * The DDL fact the sentence "conversations about a writing stay when a Work is removed" rests on. Removing a Work reaches `ask_threads`
 * only through `living_work_id`. A conversation bound to a writing sits on `manuscript_id`; while `ask_threads_one_container` holds
 * (exactly one of `manuscript_id` and `living_work_id` is set) and `living_work_id` is nullable, such a thread carries NO Work id, so
 * nothing cascades to it. The foreign-key scan cannot see this: `ask_threads` is already a known cascading table, so a migration that
 * dropped the CHECK, or made the column required and moved writing-bound threads onto a Work, would change what Remove erases and no
 * other test here would fail.
 *
 * Read from the SQL text in migration order, comments stripped. FAIL-CLOSED: a renamed constraint, a different expression, or a column
 * defined in some other way reads as "does not hold", which fails the test that pins it and forces a decision here. It does not read
 * the `ask_threads_freeze` trigger (which stops a thread's container being changed after it is opened).
 */
function askThreadsWritingBoundInvariant(sqlFiles: readonly string[]): { readonly oneContainerCheck: boolean; readonly workIdNullable: boolean } {
  let oneContainerCheck = false;
  let workIdNullable = false;
  for (const raw of sqlFiles) {
    const sql = clean(raw);
    const alter = /ALTER TABLE(?: ONLY| IF EXISTS)*\s+(?:public\.)?ask_threads\b([^;]*);/gi;
    for (let m = alter.exec(sql); m; m = alter.exec(sql)) {
      const body = m[1]!;
      // The actions of one statement, in the order they are written; the last one that touches a fact decides it.
      const action = /(DROP\s+CONSTRAINT(?:\s+IF\s+EXISTS)?\s+ask_threads_one_container\b)|(ADD\s+CONSTRAINT\s+ask_threads_one_container\b)|(ADD\s+COLUMN(?:\s+IF\s+NOT\s+EXISTS)?\s+living_work_id\b)|(ALTER\s+COLUMN\s+living_work_id\s+(SET|DROP)\s+NOT\s+NULL)/gi;
      for (let a = action.exec(body); a; a = action.exec(body)) {
        const after = a.index + a[0].length;
        if (a[1]) oneContainerCheck = false;
        else if (a[2]) oneContainerCheck = ONE_CONTAINER_CHECK.test(clauseAfterName(body, after));
        else if (a[3]) workIdNullable = !/\bNOT\s+NULL\b/i.test(clauseAfterName(body, after));
        else workIdNullable = a[5]!.toUpperCase() === 'DROP';
      }
    }
  }
  return { oneContainerCheck, workIdNullable };
}

/** Whether the Remove bodies owe the sentence that conversations about a writing stay: when any table keeps rows after a Work goes, OR
 *  when the DDL keeps writing-bound threads off the Work (so the sentence is true even if the retained-table map were ever emptied). */
function retentionSentenceOwed(keeps: Readonly<Record<string, string>>, invariant: { readonly oneContainerCheck: boolean; readonly workIdNullable: boolean }): boolean {
  return Object.keys(keeps).length > 0 || (invariant.oneContainerCheck && invariant.workIdNullable);
}

/**
 * Every table with a DIRECT foreign key into a Work (all of which must cascade), and what it is to the member. Tables further down are
 * not keys here: the relationship's episodes and Save receipts cascade from `writer_editorial_relationships`, and `ask_turns` from its
 * thread, and they appear only in a `what` string. A new child of an existing parent would change what Remove erases without failing
 * this test (the blind spot lane record 6.3 accepted).
 *
 * Two bodies say what goes, and they do NOT say the same thing about conversations (post-merge census, 2026-11-06):
 *   - the DELETE bodies (the Work goes WITH its writing) name `phrase`: "its conversations with MAIA", which is true there because the
 *     writing and everything bound to it go too;
 *   - the REMOVE bodies (the Work goes, the writing stays) name `removePhrase` when it differs: only a conversation that belongs to the
 *     Work ROW goes. Conversations about a WRITING belong to the manuscript and stay, and the Remove bodies say so in a separate
 *     sentence (see the retention test below).
 * `phrase` null means the table is structure, or a content-free record, that the copy has no member-facing words for (see NAMES_NOTHING).
 */
const KNOWN: Record<string, { readonly phrase: string | null; readonly removePhrase?: string; readonly what: string }> = {
  living_work_expressions: { phrase: null, what: 'the Work\'s declarations of what it holds (structure, not a thing the member keeps separately)' },
  living_work_materials: { phrase: 'list of materials', what: 'the materials the Work lists' },
  living_work_material_considerations: { phrase: 'list of materials', what: 'the member\'s considerations of those materials' },
  living_work_visuals: { phrase: 'its image', what: 'the Work\'s image (its bytes are queued for destruction)' },
  living_work_writer_understanding: { phrase: 'what you told MAIA about it', what: 'what the writer told MAIA about the Work' },
  ask_threads: {
    phrase: 'conversations with MAIA',
    removePhrase: 'any conversation you had with MAIA about it while it held no writing',
    what: 'conversations that belong to the Work ROW itself (ask_threads.living_work_id: opened while the Work held no writing; ask_turns follow by cascade). '
      + 'Conversations about a WRITING sit on ask_threads.manuscript_id, carry no Work id and are NOT removed with the Work',
  },
  writer_studio_corrections: { phrase: 'your corrections', what: 'corrections the writer made to what MAIA said about the Work' },
  // Not a conversation. The old map credited this table with the phrase 'conversations with MAIA', which it never covered.
  writer_editorial_relationships: {
    phrase: null,
    what: 'the content-free custody record of the Work\'s editorial relationship with MAIA: the relationship row, and its episodes and Save receipts by cascade. '
      + 'It holds no conversation text and none of the writer\'s wording (that lives in proposal_versions and stays with the writing), so no phrase about conversations covers it',
  },
  writer_studio_relationship_returns: { phrase: 'where you left off', what: 'where the writer last returned to the Work' },
  writer_studio_place_returns: { phrase: 'where you left off', what: 'the place in the writing the writer last returned to' },
  work_reading_scope_events: { phrase: 'what you told MAIA about it', what: 'the content-free record of the writer\'s standing permission for MAIA to read the Work (a permission, not a thing the member keeps; it ends with the Work)' },
  // Baseline tables with no live writer in this tree (production row counts are UNKNOWN). They still cascade, so they are listed.
  developmental_reviews: { phrase: null, what: 'legacy readings of a Work; no live writer in this tree' },
  studio_companion_turns: {
    phrase: 'conversations with MAIA',
    removePhrase: 'any conversation you had with MAIA about it while it held no writing',
    what: 'legacy Studio companion turns anchored on the Work row; no live writer in this tree',
  },
};

/**
 * The tables the copy has NO member-facing words for, each a recorded decision: a new `phrase: null` cannot slip in as a way of not
 * deciding what the member is told. Two are structure or legacy; one is a content-free custody record.
 */
const NAMES_NOTHING = ['developmental_reviews', 'living_work_expressions', 'writer_editorial_relationships'];

/**
 * Tables that carry a `living_work_id` with NO foreign key: removing the Work does NOT remove their rows. They are listed so that
 * a NEW one cannot appear unnoticed, and so the removal copy never claims more than this. Both are content-free ORIGIN records of
 * editorial conversations, retained on purpose ("No FK: withdrawal/redeclaration must remain possible without rewriting retained
 * origin", migration 20261020000001) and bound to the writing's proposal chain, so they go when the WRITING is erased, not when
 * a Work is removed.
 *
 * They are not the only things that stay. They are the only retained tables that carry a Work id at all: the editing conversations
 * (ask_threads bound to the manuscript, and their ask_turns), the proposal wording, directions, authorizations and recovery snapshots
 * carry no Work id, so this scan cannot see them, and they stay as well. The Remove bodies say so in one sentence: that the
 * conversations about the writing stay with the writing, and that deleting the writing deletes them (the retention test below). Save
 * receipts are NOT among the things that stay: they cascade from the relationship record.
 */
const KEEPS_ROWS_AFTER_WORK_REMOVAL: Record<string, string> = {
  writer_editorial_chain_origins: 'content-free origin of an editorial proposal chain; retained by design; erased with the writing',
  writer_editorial_thread_origins: 'content-free origin of an editorial thread; retained by design; erased with the writing',
};

/** The words a body uses for what goes with the Work: from "what you built inside ...:" to the irreversibility sentence. */
const goesList = (body: string): string | undefined => /what you built inside (?:it|the Work): (.*?)\. It cannot be undone/s.exec(body)?.[1];

describe('what Remove says goes matches what the database removes with a Work', () => {
  const refs = referencesToLivingWorks();

  it('NO foreign key is invisible to the parser: every REFERENCES living_works found is read to the end of its own clause', () => {
    // Defeat of the old reader: a reference with no ON DELETE followed, within 220 characters, by another column\'s CASCADE.
    const sql = clean('living_work_id UUID NOT NULL REFERENCES living_works(id),\n  other_id UUID REFERENCES other(id) ON DELETE CASCADE');
    expect(/ON DELETE/.test(clauseAfterReference(sql, sql.indexOf('(') + 1))).toBe(false);
    const composite = clean('FOREIGN KEY (living_work_id, member_id)\n REFERENCES living_works(id, member_id)\n ON UPDATE RESTRICT ON DELETE CASCADE\n);');
    expect(clauseAfterReference(composite, composite.indexOf('REFERENCES living_works(') + 'REFERENCES living_works('.length)).toMatch(/ON DELETE CASCADE/);
  });

  it('the short form REFERENCES living_works (no column list) is seen, with its own ON DELETE and not its neighbour\'s', () => {
    const noAction = clean('living_work_id UUID NOT NULL REFERENCES living_works,\n  other_id UUID REFERENCES other(id) ON DELETE CASCADE');
    const at = noAction.indexOf('REFERENCES living_works') + 'REFERENCES living_works'.length;
    expect(/ON DELETE/.test(clauseAfterName(noAction, at))).toBe(false);
    const cascading = clean('living_work_id UUID NOT NULL REFERENCES public.living_works ON DELETE CASCADE,\n  x int');
    const at2 = cascading.indexOf('REFERENCES public.living_works') + 'REFERENCES public.living_works'.length;
    expect(clauseAfterName(cascading, at2)).toMatch(/ON DELETE CASCADE/);
  });

  it('tables that carry a living_work_id WITHOUT a foreign key are each a recorded decision (a new one forces a look at the removal copy)', () => {
    const withKey = new Set(refs.map((r) => r.table));
    expect(tablesCarryingAWorkIdWithoutAForeignKey(withKey)).toEqual(Object.keys(KEEPS_ROWS_AFTER_WORK_REMOVAL).sort());
  });

  it('finds the references at all (the guard is not vacuous)', () => {
    expect(refs.length).toBeGreaterThanOrEqual(12);
  });

  it('the set of tables that reference a Work is exactly the one the copy was written against', () => {
    const tables = [...new Set(refs.map((r) => r.table))].sort();
    expect(tables).toEqual(Object.keys(KNOWN).sort());
  });

  it('every reference cascades: none blocks the removal of a Work or leaves a detached row behind', () => {
    const notCascading = refs.filter((r) => r.onDelete !== 'CASCADE');
    expect(notCascading).toEqual([]);
  });

  it('every member-facing child is covered by words in the GOES-LIST of each confirmation that says what goes (not by a sentence about what stays)', () => {
    // The phrase is looked for in the goes-list only. 'conversations with MAIA' also appears in the sentences about the WRITING's
    // conversations, so a whole-body search would be satisfied by a sentence that says the opposite of "goes".
    const deletes = [deleteConfirmCopy('writing', 'T').body, deleteConfirmCopy('empty', 'T').body];
    const removes = [REMOVE_SHARED_WORK_COPY.body, REMOVE_MANY_WORK_COPY.body, removeSharedWorkCopy(3).body];
    for (const body of [...deletes, ...removes]) expect({ body: body.slice(0, 40), found: goesList(body) !== undefined }).toEqual({ body: body.slice(0, 40), found: true });
    for (const [table, { phrase, removePhrase }] of Object.entries(KNOWN)) {
      if (phrase !== null) {
        for (const body of deletes) expect({ table, phrase, covered: goesList(body)!.includes(phrase) }).toEqual({ table, phrase, covered: true });
      }
      const forRemove = removePhrase ?? phrase;
      if (forRemove !== null) {
        for (const body of removes) expect({ table, phrase: forRemove, covered: goesList(body)!.includes(forRemove) }).toEqual({ table, phrase: forRemove, covered: true });
      }
    }
  });

  it('the Remove goes-lists do not claim the conversations ABOUT a writing go (they stay), and the Delete goes-lists still do claim their own', () => {
    for (const body of [REMOVE_SHARED_WORK_COPY.body, REMOVE_MANY_WORK_COPY.body, removeSharedWorkCopy(3).body]) {
      expect(goesList(body)).not.toContain('its conversations with MAIA');
    }
    for (const body of [deleteConfirmCopy('writing', 'T').body, deleteConfirmCopy('empty', 'T').body]) {
      expect(goesList(body)).toContain('its conversations with MAIA');
    }
  });

  it('the tables the copy names nothing for are each a recorded decision', () => {
    const nulls = Object.entries(KNOWN).filter(([, { phrase }]) => phrase === null).map(([table]) => table).sort();
    expect(nulls).toEqual([...NAMES_NOTHING].sort());
  });

  it('the DDL still keeps a writing-bound conversation off the Work: ask_threads_one_container holds and living_work_id is nullable (what "they stay with the writing" rests on)', () => {
    // Static, from the SQL text. There is no physical probe of this (lane record 6.9.5). If this fails, the Remove copy's claim that
    // conversations about a writing stay is no longer backed by the schema, and the copy and this test are decided together.
    expect(askThreadsWritingBoundInvariant(files.map((file) => readFileSync(file, 'utf8')))).toEqual({ oneContainerCheck: true, workIdNullable: true });
  });

  describe('the invariant reader sees each way of losing it (defeat cases, each built on the real migrations)', () => {
    const real = files.map((file) => readFileSync(file, 'utf8'));
    const held = { oneContainerCheck: true, workIdNullable: true };
    const later = (sql: string) => askThreadsWritingBoundInvariant([...real, sql]);
    const subjectMigration = real.find((text) => text.includes('ADD CONSTRAINT ask_threads_one_container'))!;
    const withoutIt = (edit: (text: string) => string) => askThreadsWritingBoundInvariant(real.map((text) => (text === subjectMigration ? edit(text) : text)));

    it('reads the real migrations as holding (the control the cases below are defeats of)', () => {
      expect(subjectMigration).toBeDefined();
      expect(askThreadsWritingBoundInvariant(real)).toEqual(held);
    });
    it('a later migration that DROPS the CHECK', () => {
      expect(later('ALTER TABLE ask_threads DROP CONSTRAINT ask_threads_one_container;')).toEqual({ ...held, oneContainerCheck: false });
    });
    it('a later migration that re-adds the CHECK with a weaker expression', () => {
      expect(later('ALTER TABLE ask_threads DROP CONSTRAINT IF EXISTS ask_threads_one_container; ALTER TABLE ask_threads ADD CONSTRAINT ask_threads_one_container CHECK (num_nonnulls(manuscript_id, living_work_id) >= 1);'))
        .toEqual({ ...held, oneContainerCheck: false });
    });
    it('a later migration that re-adds the CHECK over other columns', () => {
      expect(later('ALTER TABLE ask_threads DROP CONSTRAINT IF EXISTS ask_threads_one_container; ALTER TABLE ask_threads ADD CONSTRAINT ask_threads_one_container CHECK (num_nonnulls(manuscript_id, proposal_chain_id) = 1);'))
        .toEqual({ ...held, oneContainerCheck: false });
    });
    it('a later migration that makes living_work_id required', () => {
      expect(later('ALTER TABLE ask_threads ALTER COLUMN living_work_id SET NOT NULL;')).toEqual({ ...held, workIdNullable: false });
    });
    it('the real column definition with NOT NULL added to it', () => {
      const edited = withoutIt((text) => text.replace('ADD COLUMN IF NOT EXISTS living_work_id UUID REFERENCES', 'ADD COLUMN IF NOT EXISTS living_work_id UUID NOT NULL REFERENCES'));
      expect(edited).toEqual({ ...held, workIdNullable: false });
    });
    it('the real migration with its ADD CONSTRAINT written as a comment, and with the expression changed', () => {
      expect(withoutIt((text) => text.replace('ADD CONSTRAINT ask_threads_one_container', '-- ADD CONSTRAINT ask_threads_one_container'))).toEqual({ ...held, oneContainerCheck: false });
      expect(withoutIt((text) => text.replace('num_nonnulls(manuscript_id, living_work_id) = 1) NOT VALID', 'num_nonnulls(manuscript_id, living_work_id) = 2) NOT VALID'))).toEqual({ ...held, oneContainerCheck: false });
    });
    it('a comment, another table, another constraint name, or no migrations at all do not count', () => {
      const text = 'ALTER TABLE ask_threads ADD CONSTRAINT ask_threads_one_container CHECK (num_nonnulls(manuscript_id, living_work_id) = 1);';
      expect(askThreadsWritingBoundInvariant([`-- ${text}`, `/* ${text} */`]).oneContainerCheck).toBe(false);
      expect(askThreadsWritingBoundInvariant([text.replace('ALTER TABLE ask_threads', 'ALTER TABLE other_threads')]).oneContainerCheck).toBe(false);
      expect(askThreadsWritingBoundInvariant([text.replace('ADD CONSTRAINT ask_threads_one_container', 'ADD CONSTRAINT some_other_name')]).oneContainerCheck).toBe(false);
      expect(askThreadsWritingBoundInvariant([])).toEqual({ oneContainerCheck: false, workIdNullable: false });
    });
    it('the last statement decides: dropped and then re-added in the same strength holds again', () => {
      expect(later('ALTER TABLE ask_threads DROP CONSTRAINT ask_threads_one_container; ALTER TABLE ask_threads ADD CONSTRAINT ask_threads_one_container CHECK (num_nonnulls(manuscript_id, living_work_id) = 1);')).toEqual(held);
      expect(later('ALTER TABLE ask_threads ALTER COLUMN living_work_id SET NOT NULL; ALTER TABLE ask_threads ALTER COLUMN living_work_id DROP NOT NULL;')).toEqual(held);
    });
  });

  it('the retention sentence is owed while any table keeps rows after a Work goes, AND while the DDL keeps writing-bound threads off the Work, even if the retained-table map were empty', () => {
    const held = { oneContainerCheck: true, workIdNullable: true };
    const lost = { oneContainerCheck: false, workIdNullable: true };
    expect(retentionSentenceOwed(KEEPS_ROWS_AFTER_WORK_REMOVAL, lost)).toBe(true);        // the retained origin tables alone oblige it
    expect(retentionSentenceOwed({}, held)).toBe(true);                                    // the invariant alone obliges it (the guard may not switch itself off)
    expect(retentionSentenceOwed({}, { oneContainerCheck: true, workIdNullable: false })).toBe(false);
    expect(retentionSentenceOwed({}, lost)).toBe(false);                                   // neither holds: not owed (the pinning test above fails first)
  });

  it('while the sentence is owed, BOTH Remove bodies say the conversations stay with the writing and that deleting the writing ends them', () => {
    // The retention sentence is pinned two ways, both static. (1) The retained origin tables above, a PROXY: the conversations carry no
    // Work id, so this scan cannot see them. (2) The ask_threads invariant, which is the fact the sentence is actually about. That
    // conversations about a writing stay rests on reading the DDL (lane record 6.9.5), not on a physical probe. It is owed whenever
    // EITHER holds, so emptying the retained-table map cannot switch this check off while the sentence is still true.
    if (!retentionSentenceOwed(KEEPS_ROWS_AFTER_WORK_REMOVAL, askThreadsWritingBoundInvariant(files.map((file) => readFileSync(file, 'utf8'))))) return;
    const shape = /not part of the Work, so removing the Work does not remove them: they stay with the writings?, and deleting (?:the|a) writing deletes (?:them|its conversations)\.$/;
    for (const body of [REMOVE_SHARED_WORK_COPY.body, removeSharedWorkCopy(2).body, REMOVE_MANY_WORK_COPY.body]) {
      expect(body).toMatch(shape);
      // After the goes-list and the irreversibility sentence, never inside the list.
      expect(body.indexOf('conversations with MAIA about')).toBeGreaterThan(body.indexOf('It cannot be undone'));
    }
  });

  it('the confirmation where the Work STAYS does not say the Work\'s own conversations go', () => {
    // Delete on a Work that holds more than a writing removes the writing and its conversations about the writing; the Work and
    // what else it holds remain. It must not claim the Work-level things go.
    const text = deleteConfirmCopy('writing-keeps-work', 'T').body;
    expect(text).toContain('The Work itself stays');
    expect(text).not.toContain('what you told MAIA about it');
    expect(text).not.toContain('your corrections');
    // The same act asked from the writing (History, the loose list) leaves the Work standing too.
    const fromWriting = deleteConfirmCopy('writing-from-work', 'T').body;
    expect(fromWriting).toContain('The Work it is in stays');
    expect(fromWriting).not.toContain('what you told MAIA about it');
    expect(fromWriting).not.toContain('your corrections');
  });
});
