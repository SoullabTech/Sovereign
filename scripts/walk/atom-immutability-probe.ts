/**
 * Atom immutability probe — pre-deploy walk instrument for #877 + #878.
 *
 * Claim under test: arranging a Keep on the Workbench changes the ARRANGEMENT
 * and nothing else. The atom, and the source row it points at, must come out
 * of the walk byte-for-byte identical.
 *
 * READ-ONLY. This script never writes to member_memory_atoms or to any source
 * table. It snapshots, and it compares snapshots.
 *
 * Usage:
 *   # before the walk
 *   npx tsx scripts/walk/atom-immutability-probe.ts capture <atom-id> before
 *   # ... perform the walk ...
 *   npx tsx scripts/walk/atom-immutability-probe.ts capture <atom-id> after
 *   npx tsx scripts/walk/atom-immutability-probe.ts compare <atom-id>
 *
 * Snapshots are written to .walk/ (gitignored scratch). Pass an atom id you
 * created yourself through the real Keep gesture — never another member's.
 */

import { createHash } from 'crypto';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { query } from '@/lib/db/postgres';

const OUT = join(process.cwd(), '.walk');

/** Every field whose change would mean arrangement altered meaning. */
const WATCHED = [
  'generated_by',
  'return_preference',
  'status',
  'posture_at_creation',
  'source_type',
  'source_id',
  'surface_count',
  'last_surfaced_at',
  'last_touched_at',
  // Not on the required list, but a silent flip here would be just as wrong:
  'memory_scope',
  'crossing_allowed',
  'is_breakthrough',
  'marked_breakthrough_at',
  'facilitator_id',
  'kept_at',
  'updated_at',
  'still_here_count',
] as const;

type Snapshot = {
  atomId: string;
  takenAt: string;
  atom: Record<string, unknown>;
  contentHash: string;
  sourceRow: Record<string, unknown> | null;
  sourceHash: string | null;
};

function hash(v: unknown): string {
  return createHash('sha256').update(JSON.stringify(v ?? null)).digest('hex').slice(0, 16);
}

async function capture(atomId: string, label: string): Promise<void> {
  const r = await query<Record<string, unknown>>(
    `SELECT ${WATCHED.join(', ')}, title, body FROM member_memory_atoms WHERE id = $1`,
    [atomId],
  );
  if (r.rows.length === 0) throw new Error(`no atom ${atomId}`);
  const row = r.rows[0];

  const atom: Record<string, unknown> = {};
  for (const k of WATCHED) atom[k] = row[k] instanceof Date ? (row[k] as Date).toISOString() : row[k];

  // Source detail, where the atom points at one.
  let sourceRow: Record<string, unknown> | null = null;
  const sourceType = row.source_type as string;
  const sourceId = row.source_id as string | null;
  const SOURCE_TABLES: Record<string, string> = {
    idea: 'member_ideas',
    idea_block: 'member_ideas',
    reflection: 'reflection_capsules',
  };
  const table = SOURCE_TABLES[sourceType];
  if (table && sourceId) {
    try {
      const s = await query<Record<string, unknown>>(
        `SELECT * FROM ${table} WHERE id = $1`,
        [sourceId],
      );
      sourceRow = s.rows[0] ?? null;
    } catch {
      sourceRow = null; // table absent — recorded as null, not as "unchanged"
    }
  }

  const snap: Snapshot = {
    atomId,
    takenAt: new Date().toISOString(),
    atom,
    contentHash: hash({ title: row.title, body: row.body }),
    sourceRow,
    sourceHash: sourceRow ? hash(sourceRow) : null,
  };

  mkdirSync(OUT, { recursive: true });
  const path = join(OUT, `atom-${atomId}-${label}.json`);
  writeFileSync(path, JSON.stringify(snap, null, 2));
  console.log(`captured ${label} → ${path}`);
  console.log(`  content hash ${snap.contentHash}`);
  console.log(`  source row   ${sourceRow ? `${table} (hash ${snap.sourceHash})` : 'none / not applicable'}`);
}

function compare(atomId: string): void {
  const load = (label: string): Snapshot => {
    const p = join(OUT, `atom-${atomId}-${label}.json`);
    if (!existsSync(p)) throw new Error(`missing snapshot: ${p}`);
    return JSON.parse(readFileSync(p, 'utf8'));
  };
  const before = load('before');
  const after = load('after');

  const diffs: string[] = [];
  for (const k of WATCHED) {
    const b = JSON.stringify(before.atom[k]);
    const a = JSON.stringify(after.atom[k]);
    if (b !== a) diffs.push(`  ${k}: ${b} → ${a}`);
  }
  if (before.contentHash !== after.contentHash) {
    diffs.push(`  title/body hash: ${before.contentHash} → ${after.contentHash}`);
  }
  if (before.sourceHash !== after.sourceHash) {
    diffs.push(`  source row hash: ${before.sourceHash} → ${after.sourceHash}`);
  }

  console.log(`\natom ${atomId}`);
  console.log(`  before ${before.takenAt}`);
  console.log(`  after  ${after.takenAt}`);
  if (diffs.length === 0) {
    console.log('\n✅ UNCHANGED — arrangement did not alter the atom or its source.');
    process.exit(0);
  }
  console.log(`\n❌ ${diffs.length} field(s) CHANGED — arrangement altered meaning:`);
  for (const d of diffs) console.log(d);
  process.exit(1);
}

const [cmd, atomId, label] = process.argv.slice(2);
if (cmd === 'capture' && atomId && label) {
  capture(atomId, label).then(() => process.exit(0)).catch((e) => { console.error(e.message); process.exit(1); });
} else if (cmd === 'compare' && atomId) {
  compare(atomId);
} else {
  console.error('usage: capture <atom-id> <before|after> | compare <atom-id>');
  process.exit(2);
}
