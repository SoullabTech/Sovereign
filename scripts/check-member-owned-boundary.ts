/**
 * Slice 0 boundary harness — the member-owned/practitioner seam.
 *
 * WHAT THIS PROVES
 *
 *   A practitioner-reachable path cannot acquire access to client-owned reflective
 *   material unless the boundary is explicitly changed.
 *
 * The guarantee is a NEGATIVE. Person-owned tables in the coach-field lane carry no
 * relationship_id — that structural half is already asserted by
 * scripts/verify-coach-field-boundaries.ts checks 1a and 12g. What was NOT held is
 * the source-level half: nothing prevented application code from acquiring a reader
 * for those tables tomorrow.
 *
 * That gap is not hypothetical. #899 is the same shape: sessions.team_id was correct
 * at migration time, no static check held it, and four write paths drifted for five
 * weeks without anyone noticing. This harness exists so the client's private material
 * cannot drift the same way.
 *
 * WHAT THIS IS NOT
 *
 *   Not an authorization for a practitioner workspace, a client Home, or any view.
 *   The deliverable is not "Larry can see clients." It is: before Larry can see
 *   anything, the system can prove what he cannot see.
 *
 * ACCEPTANCE CRITERION (founder-issued, 2026-08-03)
 *
 *   Given a future code change, when a practitioner-reachable path references
 *   protected client material, the harness fails before release.
 *
 * CHANGING THE BOUNDARY
 *
 *   Adding a path to ALLOWED_REFERENCES is the explicit act. It is a visible,
 *   reviewable diff naming the file and the reason — which is the point. A member
 *   reading their OWN material is legitimate; a practitioner-scoped path reading it
 *   is the leak. This harness cannot tell those apart on its own, so it refuses both
 *   and makes the distinction a human ruling rather than an accident.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = process.cwd();

/**
 * Person-owned tables: they exist because the PERSON exists, not because a
 * professional relationship exists. Source: the coach-field ownership map.
 * `deferred: true` means the table is not shipped yet — it is guarded in advance so
 * a reader cannot land in the same change that creates it.
 */
const PROTECTED = [
  { table: 'coach_client_selected_focus', deferred: false },
  { table: 'coach_client_personal_notes', deferred: true },
  { table: 'coach_current_focus', deferred: true },
];

/** Directories holding application code. Scripts and migrations are not app paths. */
const SCAN_DIRS = ['lib', 'app', 'components'];
const SCAN_EXT = ['.ts', '.tsx'];

/**
 * Paths permitted to reference a protected table, each with the ruling that permits
 * it. Empty is the correct state today: zero application readers exist. Every entry
 * added here is a deliberate narrowing of the boundary.
 */
const ALLOWED_REFERENCES: Array<{ path: string; reason: string }> = [];

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    let s;
    try {
      s = statSync(full);
    } catch {
      continue;
    }
    if (s.isDirectory()) walk(full, out);
    else if (SCAN_EXT.some((e) => entry.endsWith(e))) out.push(full);
  }
  return out;
}

const failures: string[] = [];
const notes: string[] = [];

console.log('\n🔍 Member-owned boundary — Slice 0 harness\n');

// ── anti-vacuity ────────────────────────────────────────────────────────────
// A check that guards a name nothing uses passes for the wrong reason. Assert the
// shipped protected table actually exists in the migration set; if it was renamed,
// this harness is guarding a phantom and must say so rather than report success.
const migrationDir = join(ROOT, 'database', 'migrations');
let migrationText = '';
let migrationCount = 0;
try {
  for (const f of readdirSync(migrationDir).filter((f) => f.endsWith('.sql'))) {
    migrationText += readFileSync(join(migrationDir, f), 'utf8');
    migrationCount++;
  }
} catch {
  /* handled below — an unreadable migration set fails the anti-vacuity check */
}

if (migrationCount === 0) {
  failures.push(
    'ANTI-VACUITY: no migrations were read, so table existence cannot be confirmed. ' +
      'This harness would report success without having verified anything.'
  );
}

for (const { table, deferred } of PROTECTED) {
  const created = new RegExp(`CREATE TABLE (IF NOT EXISTS )?(public\\.)?${table}\\b`, 'i').test(
    migrationText
  );
  if (!deferred && !created) {
    failures.push(
      `ANTI-VACUITY: '${table}' is listed as shipped but no migration creates it. ` +
        `The catalogue is stale — this harness would pass without guarding anything.`
    );
  }
  if (deferred && created) {
    notes.push(
      `'${table}' was deferred and now exists. Confirm its lane is the encrypted one, ` +
        `then flip deferred:false here.`
    );
  }
}

// ── the boundary ────────────────────────────────────────────────────────────
const files = SCAN_DIRS.flatMap((d) => walk(join(ROOT, d)));
console.log(`   scanned ${files.length} application files in ${SCAN_DIRS.join(', ')}\n`);

const allowed = new Set(ALLOWED_REFERENCES.map((a) => a.path));

for (const file of files) {
  const rel = relative(ROOT, file);
  let content: string;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  for (const { table } of PROTECTED) {
    if (!content.includes(table)) continue;
    if (allowed.has(rel)) {
      notes.push(`allowed: ${rel} references ${table}`);
      continue;
    }
    const line = content.split('\n').findIndex((l) => l.includes(table)) + 1;
    failures.push(`${rel}:${line} references protected member-owned table '${table}'`);
  }
}

for (const n of notes) console.log(`   note: ${n}`);
if (notes.length) console.log('');

if (failures.length === 0) {
  console.log(`✅ Boundary holds. ${PROTECTED.length} member-owned tables have no application reader.`);
  console.log('   Client-owned reflective material remains unreachable from application code.\n');
  process.exit(0);
}

console.log('🚨 MEMBER-OWNED BOUNDARY VIOLATION\n');
for (const f of failures) console.log(`   ${f}`);
console.log(`
📋 What this means:
   A member-owned table became reachable from application code. These tables exist
   because the PERSON exists, not because a practitioner relationship exists — and a
   practitioner's view must not vary with anything in them.

   If this reference is legitimate (a member reading their OWN material), add it to
   ALLOWED_REFERENCES in this file with the ruling that permits it. That edit is the
   explicit boundary change, and it is meant to be reviewed as one.

   If it is a practitioner-scoped path, it is the leak this boundary exists to prevent.
`);

// ── stated limits ───────────────────────────────────────────────────────────
// This harness matches table names as literal text. It does NOT catch a name built
// at runtime (`'coach_client_' + kind`), a view or function wrapping the table, or
// raw SQL loaded from a file at runtime. It proves that the obvious path is closed,
// not that every conceivable path is. Do not cite it as more than that.
process.exit(1);
