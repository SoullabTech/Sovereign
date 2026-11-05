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

function referencesToLivingWorks(): Reference[] {
  const found: Reference[] = [];
  for (const file of files) {
    const sql = clean(readFileSync(file, 'utf8'));
    const owner = /(?:CREATE TABLE(?: IF NOT EXISTS)?|ALTER TABLE(?: ONLY| IF EXISTS)*)\s+(?:public\.)?([a-z_0-9]+)/gi;
    const owners: Array<{ at: number; name: string }> = [];
    for (let m = owner.exec(sql); m; m = owner.exec(sql)) owners.push({ at: m.index, name: m[1]!.toLowerCase() });
    const ref = /REFERENCES\s+(?:public\.)?living_works\s*\(/gi;
    for (let m = ref.exec(sql); m; m = ref.exec(sql)) {
      const table = [...owners].reverse().find((o) => o.at < m!.index)?.name;
      if (!table) throw new Error(`could not find the table that owns a reference to living_works in ${file}`);
      const tail = sql.slice(m.index, m.index + 220);
      const onDelete = /ON DELETE\s+(CASCADE|SET NULL|SET DEFAULT|RESTRICT|NO ACTION)/i.exec(tail)?.[1]?.toUpperCase() ?? 'NO ACTION';
      found.push({ table, onDelete, file: file.slice(repo.length + 1) });
    }
  }
  return found;
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
  // Baseline tables with no live writer in this tree (production row counts are UNKNOWN). They still cascade, so they are listed.
  developmental_reviews: { phrase: null, what: 'legacy readings of a Work; no live writer in this tree' },
  studio_companion_turns: { phrase: 'conversations with MAIA', what: 'legacy Studio companion turns; no live writer in this tree' },
};

describe('what Remove says goes matches what the database removes with a Work', () => {
  const refs = referencesToLivingWorks();

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
  });
});
