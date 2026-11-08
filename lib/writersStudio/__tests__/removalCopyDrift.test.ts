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
 * It is static: it reads SQL text, not a database. The physical behaviour is proven by tests/constitutional/ws-delete/dynamic.
 */
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { REMOVE_MANY_WORK_COPY, REMOVE_SHARED_WORK_COPY, deleteConfirmCopy } from '@/lib/writersStudio/deleteWork';

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

/**
 * Every table that cascades from a Work, and what it is to the member. `phrase` is the words in the confirmation that cover it;
 * null means the table is structure the member never sees as a thing of their own (their declarations of what the Work holds).
 */
const KNOWN: Record<string, { readonly phrase: string | null; readonly what: string }> = {
  living_work_expressions: { phrase: null, what: 'the Work\'s declarations of what it holds (structure, not a thing the member keeps separately)' },
  living_work_materials: { phrase: 'list of materials', what: 'the materials the Work lists' },
  living_work_material_considerations: { phrase: 'list of materials', what: 'the member\'s considerations of those materials' },
  living_work_visuals: { phrase: 'its image', what: 'the Work\'s image (its bytes are queued for destruction)' },
  living_work_writer_understanding: { phrase: 'what you told MAIA about it', what: 'what the writer told MAIA about the Work' },
  ask_threads: { phrase: 'conversations with MAIA', what: 'conversations anchored on the Work (ask_turns follow by cascade)' },
  writer_studio_corrections: { phrase: 'your corrections', what: 'corrections the writer made to what MAIA said about the Work' },
  writer_editorial_relationships: { phrase: 'conversations with MAIA', what: 'the content-free record of MAIA\'s editorial exchanges in the Work (episodes and save receipts follow by cascade)' },
  writer_studio_relationship_returns: { phrase: 'where you left off', what: 'where the writer last returned to the Work' },
  writer_studio_place_returns: { phrase: 'where you left off', what: 'the place in the writing the writer last returned to' },
  work_reading_scope_events: { phrase: null, what: 'the content-free record of the writer\'s standing permission for MAIA to read the Work (a permission, not a thing the member keeps; it ends with the Work)' },
  // Baseline tables with no live writer in this tree (production row counts are UNKNOWN). They still cascade, so they are listed.
  developmental_reviews: { phrase: null, what: 'legacy readings of a Work; no live writer in this tree' },
  studio_companion_turns: { phrase: 'conversations with MAIA', what: 'legacy Studio companion turns; no live writer in this tree' },
};

/**
 * Tables that carry a `living_work_id` with NO foreign key: removing the Work does NOT remove their rows. They are listed so that
 * a NEW one cannot appear unnoticed, and so the removal copy never claims more than this. Both are content-free ORIGIN records of
 * editorial conversations, retained on purpose ("No FK: withdrawal/redeclaration must remain possible without rewriting retained
 * origin", migration 20261020000001) and bound to the writing\'s proposal chain, so they go when the WRITING is erased, not when
 * a Work is removed. This is also why the removal copy does not promise where conversations about the writing live afterwards.
 */
const KEEPS_ROWS_AFTER_WORK_REMOVAL: Record<string, string> = {
  writer_editorial_chain_origins: 'content-free origin of an editorial proposal chain; retained by design; erased with the writing',
  writer_editorial_thread_origins: 'content-free origin of an editorial thread; retained by design; erased with the writing',
};

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

  it('every member-facing child is covered by words that appear in each confirmation that says what goes', () => {
    const says = [
      REMOVE_SHARED_WORK_COPY.body,
      REMOVE_MANY_WORK_COPY.body,
      deleteConfirmCopy('writing', 'T').body,
      deleteConfirmCopy('empty', 'T').body,
    ];
    for (const [table, { phrase }] of Object.entries(KNOWN)) {
      if (phrase === null) continue;
      for (const text of says) expect({ table, phrase, covered: text.includes(phrase) }).toEqual({ table, phrase, covered: true });
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
