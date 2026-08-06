/**
 * scripts/check-writer-field-containment.ts
 *
 * CONSTRUCTION TRIPWIRE for the Writer MAIA field containment law
 * (docs/canon/WRITER_MAIA_FIELD_CONTAINMENT_2026-08-06.md).
 *
 * WHAT THIS IS
 * ------------
 * This is NOT a verification that containment is implemented. Writing-field
 * persistence does not exist yet, so there is no runtime subject to verify.
 * This check enforces the CONSTRUCTION BOUNDARY: it goes red at the moment a
 * writing surface acquires a persistence path that could absorb member-scoped
 * material without a per-item crossing authorization.
 *
 * A green result means "the violation has not been constructed", never
 * "containment is verified". Do not cite it as the latter.
 *
 * THE RULING IT ENCODES (founder, 2026-08-06)
 * -------------------------------------------
 * A threshold may expose candidates from another field without crossing them.
 * Crossing occurs only when the person explicitly carries a particular object
 * into a particular work.
 *
 *   Keep authorizes retention in the SOURCE field.
 *   Keep does NOT authorize crossing into the WRITING field.
 *
 * Proximity, retrieval, and prior retention may not substitute for the crossing
 * act. `lib/bookStudio/mirrorSources.ts` is a PERMITTED THRESHOLD — not a
 * constitutional exception — and its permission is conditional on remaining
 * read-only. That condition is asserted below, so the allowance cannot silently
 * widen into a seeding path.
 *
 * HONEST LIMITS
 * -------------
 * Static text analysis. It cannot prove absence of derivation through
 * indirection (a helper in another module, an ORM, a raw client passed in).
 * It catches the direct and near-direct shapes, which is what a construction
 * tripwire is for. It is a floor, not a proof.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = process.cwd();

/**
 * Writing surfaces. Writer's Studio has NO RULED ROUTE (canon:
 * WRITER_STUDIO_AUTHOR_STUDIO_DISTINCTION_2026-08-04.md marks route identity
 * UNRULED), so this list enumerates the concrete surfaces canon does name
 * rather than inventing a route identity. Extend it when a route is ruled.
 */
const WRITING_SURFACES = [
  'app/book-studio',
  'app/api/book-studio',
  'app/maia/songwriter',
  'app/fields/[field]/author',
  'lib/bookStudio',
  'lib/capsules',
  'app/api/capsules',
];

/** Member-scoped memory. Crossing into the writing field requires a gesture. */
const MEMBER_SCOPED_TABLES = ['member_memory_atoms', 'personal_spirals'];

/**
 * Permitted threshold readers: allowed to READ member-scoped tables in order to
 * present crossing candidates. Each is asserted read-only below — the allowance
 * is conditional, not blanket.
 */
const PERMITTED_THRESHOLDS = ['lib/bookStudio/mirrorSources.ts'];

/**
 * A durable, explicit crossing authorization tied to a particular source item
 * and destination work. None of these exist yet; when the crossing gesture
 * ships, its marker belongs here so authorized paths stop tripping the wire.
 */
const CROSSING_AUTHORIZATION_MARKERS = [
  'crossing_authorization',
  'CrossingAuthorization',
  'carried_across_at',
];

const WRITE_SQL = /\b(INSERT\s+INTO|UPDATE\s+|DELETE\s+FROM|UPSERT\s+INTO)\b/i;

type Finding = { file: string; rule: string; detail: string };
const findings: Finding[] = [];

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

const files = WRITING_SURFACES.flatMap((s) => walk(join(ROOT, s)));

for (const full of files) {
  const rel = relative(ROOT, full);
  const src = readFileSync(full, 'utf8');

  // Comments describe intent; they are not the thing being constrained. Strip
  // them so a docblock explaining the boundary is not read as violating it.
  const code = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

  const touchesMemberScope = MEMBER_SCOPED_TABLES.filter((t) => code.includes(t));
  const hasWrite = WRITE_SQL.test(code);
  const hasCrossingAuth = CROSSING_AUTHORIZATION_MARKERS.some((m) => code.includes(m));
  const isPermittedThreshold = PERMITTED_THRESHOLDS.includes(rel);

  // RULE 1 — the permitted threshold must remain read-only. Its permission is
  // conditional; a write here converts presentation into crossing.
  if (isPermittedThreshold && hasWrite) {
    findings.push({
      file: rel,
      rule: 'threshold-must-stay-read-only',
      detail:
        'Permitted threshold reader acquired a write statement. A threshold ' +
        'presents possible crossings; it does not perform them.',
    });
    continue;
  }
  if (isPermittedThreshold) continue;

  if (touchesMemberScope.length === 0) continue;

  // RULE 2 — a writing surface that both reaches member-scoped memory and
  // persists is the seeding shape the law forbids, unless it consumes an
  // explicit per-item crossing authorization.
  if (hasWrite && !hasCrossingAuth) {
    findings.push({
      file: rel,
      rule: 'no-persistence-from-member-scope-without-crossing',
      detail:
        `References ${touchesMemberScope.join(', ')} and contains a write ` +
        'statement, with no per-item crossing authorization. Keep authorizes ' +
        'retention in the source field, not crossing into the writing field.',
    });
    continue;
  }

  // RULE 3 — unlisted readers. Not a violation, but the audited choke point
  // exists so that reads are countable. A new reader is a governance event.
  findings.push({
    file: rel,
    rule: 'unlisted-member-scope-reader',
    detail:
      `Reads ${touchesMemberScope.join(', ')} from a writing surface but is not ` +
      'a listed permitted threshold. Add it to PERMITTED_THRESHOLDS deliberately, ' +
      'or route it through the audited choke point.',
  });
}

console.log('🚧 Writer MAIA field containment — construction tripwire');
console.log(`   Law: docs/canon/WRITER_MAIA_FIELD_CONTAINMENT_2026-08-06.md`);
console.log(`   Scanned ${files.length} file(s) across ${WRITING_SURFACES.length} writing surfaces.`);

if (findings.length > 0) {
  console.error(`\n❌ ${findings.length} containment violation(s):\n`);
  for (const f of findings) {
    console.error(`   ${f.file}`);
    console.error(`     rule:   ${f.rule}`);
    console.error(`     detail: ${f.detail}\n`);
  }
  console.error('The containment law is a precondition of building, not a property of');
  console.error('what gets built. Resolve before this path persists anything.\n');
  process.exit(1);
}

console.log('✅ No writing-field persistence path reaches member-scoped memory.');
console.log('   NOTE: writing-field persistence does not exist yet, so the');
console.log('   persistence half passes VACUOUSLY. This is a construction');
console.log('   tripwire for Canvas Phase C — not proof that containment is');
console.log('   implemented or verified.');
