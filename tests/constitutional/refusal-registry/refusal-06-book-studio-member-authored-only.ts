import type { RefusalCheck } from './harness';

/**
 * Refusal 06 — Book Studio must not generate legacy-writing prompts from
 * MAIA-only inferred themes, hidden clusters, unstated psychological summaries,
 * or unaccepted Living Field reflections.
 *
 * Canon: docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md:72 — "The system may
 * draft from selected, member-owned material; it may never synthesize identity."
 * Spec: docs/specs/BOOK_STUDIO_MIRROR_SAFE_SPEC_2026-07-02.md
 *
 * Two structural halves (graded separately, honestly):
 *
 *   A-half (Grade A, reader-absence — ACTIVE NOW):
 *     The Book Studio SURFACE (app/book-studio, components/book-studio,
 *     app/api/book-studio) imports NO inference surface and reads NO
 *     member-material table directly. It reads only its own arrangement
 *     scaffolding (workbench_tables / workbench_uploads) + static markdown.
 *     This preserves the current absence AND forces the choke-point: when the
 *     mirror reader is built, member material must flow through
 *     lib/bookStudio/mirrorSources — never inline in the surface.
 *     Defeating it requires ADDING a forbidden import/read = visible diff.
 *
 *   B-half (Grade B, query predicate + fail-closed whitelist — ACTIVE 2026-07-02):
 *     The mirror reads ONLY positively-admitted member-material tables (fail-closed
 *     whitelist — B6), and EVERY admitted query carries its own member-act predicate
 *     (proven per source, not file-wide — B4). It imports no inference surface, reads
 *     no inference table, and excludes the Living Field dimension tables (spec §4.1).
 *     Deferred sources fail closed with their admission criterion — "deferred is not
 *     denied unless the verifier enforces it as denied."
 *
 * This is NOT Grade C: no part is a prompt instruction. We do not ask MAIA to
 * "only use accepted material" — that is the memoryAtomsLoader.ts Grade-C
 * pattern this refusal exists to replace with structure.
 *
 * THIS TEST IS THE MEASUREMENT LAYER (verification jurisdiction) — distinct from the
 * reader's EXECUTION and from the constitution's MEANING. Strengthening it (richer
 * per-source proofs, tighter greps, more skeptics) is legitimate sophistication: it
 * reduces uncertainty about whether the refusal holds; it decides nothing new. But it
 * carries its own jurisdiction guard: a verifier may only OBSERVE structure, never
 * ADJUDICATE meaning. That is why B4 checks for the PRESENCE of a member-act token in
 * the query — not whether the content "looks" member-authored. A judging verifier would
 * manufacture the very authority it exists to check.
 */

// The Book Studio surface — everything a member touches when writing.
const SURFACE_DIRS = [
  'app/book-studio',
  'components/book-studio',
  'app/api/book-studio',
];

// The single audited reader permitted to read member material for Book Studio.
const MIRROR_MODULE = 'lib/bookStudio/mirrorSources.ts';

// Inference / synthesis surfaces that must never be reachable from Book Studio.
const FORBIDDEN_IMPORTS =
  'corpusCallosum|breakthroughDetection|spiralStatePersistence|MAIAMemoryArchitecture|QuantumFieldMemory|MorphicPatternService|ConsciousnessEvolutionService|memoryAtomsLoader';

// System-derived / inference tables — forbidden anywhere in the Book Studio path,
// including inside the mirror reader.
const INFERENCE_TABLES = 'agent_runs|integration_passes|member_spiral_state';

// Member-material tables — must be read ONLY via the audited mirror module,
// never inline in the surface. (The allowed-vs-forbidden distinction among
// these lives INSIDE mirrorSources via member-act predicates — the B-half.)
const MEMBER_MATERIAL_TABLES =
  'member_memory_atoms|personal_living_field[a-z_]*|personal_spirals|recognitions|encounter_moments|encounter_reflections|member_field_note_threads';

// Match only real CODE CONSTRUCTS — import statements and SQL FROM/JOIN clauses —
// not comment mentions. This lets a module honestly NAME the surfaces it refuses
// (in its docblock) without tripping its own guard. `^\\s*import` excludes JSDoc
// lines (which start with `*`); uppercase FROM|JOIN excludes lowercase prose "from".
const importRe = (mods: string) => `^[[:space:]]*import.*(${mods})`;
const readRe = (tables: string) => `(FROM|JOIN)[[:space:]]+(${tables})`;

// ADMITTED member-material sources: the ONLY tables the mirror may read, each paired with
// the member-act token its query MUST carry (the B-half per-source proof — B4). Ownership
// alone is insufficient (spec §3: an un-kept atom is member-owned but MAIA-extracted).
// Admission requires a VERIFIED write-event marker: member_memory_atoms via facilitator_id
// IS NULL + keep/breakthrough gestures; personal_spirals via member_id, safe only under the
// §4.2 write-monopoly (enforced by B5). Promoting a deferred source into this list is a
// deliberate two-part diff — add here with a verified predicate AND remove from
// DEFERRED_SOURCES — which forces a writer re-audit (the member_confirmed lesson).
const MEMBER_ACT_BY_TABLE: Array<{ table: string; predicate: RegExp; why: string }> = [
  { table: 'member_memory_atoms', predicate: /kept_at|is_breakthrough|status\s+IN/i, why: 'member keep / breakthrough gesture (status reflects member gestures only)' },
  { table: 'personal_spirals', predicate: /member_id/i, why: 'member-created — §4.2 audit: sole writer is the member POST' },
];

// DEFERRED member-material sources: named, NOT admitted. Their write paths do not (yet)
// produce a member-provable marker, so the mirror must NOT read them — enforced as DENIAL
// by B6, not left as mere absence from the admitted list (absence alone is fail-OPEN:
// unchecked). "Deferred is not denied unless the verifier enforces it as denied." Each
// carries its admission criterion: the observable WRITE EVENT that would confer authority.
const DEFERRED_SOURCES: Array<{ table: string; admitWhen: string }> = [
  { table: 'member_field_note_threads', admitWhen: 'a server-verified acceptance column exists — today member_confirmed/authorship are stamped TRUE unconditionally by the field-note writers (spec §11)' },
  { table: 'encounter_moments', admitWhen: "the accept path persists artifact_type='accepted_recognition' + authored_by=member — today it never does (spec §11)" },
  { table: 'encounter_reflections', admitWhen: 'a verified member action sets a member-authorship marker on the reflection row' },
  { table: 'recognitions', admitWhen: 'a member-authoring write path exists and authored_by is set ONLY by it (no writer today)' },
];

export const check: RefusalCheck = {
  id: 'R06',
  refusal:
    'Book Studio must not generate legacy-writing prompts from MAIA-only inferred themes, hidden clusters, unstated psychological summaries, or unaccepted Living Field reflections',
  grade: 'A',
  enforcedBy:
    'Book Studio surface imports no inference surface and reads no member-material table directly; member material may enter only via the audited lib/bookStudio/mirrorSources (member-act predicate per query)',
  evidence: [
    'app/book-studio + components/book-studio + app/api/book-studio read only workbench_tables / workbench_uploads + static markdown',
    'no import of corpusCallosum / breakthroughDetection / spiralStatePersistence / cluster/synthesis services in the surface',
    'lib/bookStudio/mirrorSources.ts built — B-half verified per source: member_memory_atoms (facilitator_id IS NULL + kept/breakthrough/status) and personal_spirals (member_id, §4.2 audit + B5 write-monopoly) each carry their own member-act predicate; member_field_note_threads DEFERRED (spec §11: member_confirmed/authorship server-stamped, not member-provable); recognitions + encounter accepted-reflection deferred (no member-provable marker); personal_living_field* excluded (§4.1)',
  ].join(' | '),
  violationAttempted: [
    '(A1) forbidden inference-surface import anywhere in the Book Studio surface',
    '(A2) raw read of an inference table (agent_runs/integration_passes/member_spiral_state) in the surface',
    '(A3) raw read of a member-material table in the surface (must go through mirrorSources)',
    '(B, if module exists) a mirrorSources query without a member-act predicate, or a Living-Field-dimension read excluded by spec §4.1',
  ].join('; '),
  passingAuthorizes:
    'no forbidden source class is reachable from the Book Studio surface; when the mirror reader is built, member material is forced through a single audited choke point',
  passingDoesNotAuthorize:
    'that any member material is READY or worth writing (content judgment, out of scope), nor that the mirror reader itself is built and predicate-gated (B-half) — only that no synthesis/inference path exists in the surface today',
  hostileForkMustChange:
    'ADD a forbidden import or a direct member-material/inference read in the Book Studio surface; or remove a member-act WHERE predicate from an admitted mirror query (B4); or make the mirror read a deferred/unrecognized member-material table (fails the B6 fail-closed whitelist) — each a visible diff',

  run(io) {
    // ── A1: no inference-surface imports in the surface ──
    const badImports = io.grep(importRe(FORBIDDEN_IMPORTS), SURFACE_DIRS);
    if (badImports.length === 0) {
      io.pass('Book Studio surface imports no inference/synthesis surface');
    } else {
      io.fail(
        'Book Studio surface imports a forbidden inference surface',
        badImports.slice(0, 3).join(' | '),
      );
    }

    // ── A2: no raw reads of inference tables in the surface ──
    const infTables = io.grep(readRe(INFERENCE_TABLES), SURFACE_DIRS);
    if (infTables.length === 0) {
      io.pass('Book Studio surface reads no system-derived/inference table');
    } else {
      io.fail(
        'Book Studio surface reads an inference table directly',
        infTables.slice(0, 3).join(' | '),
      );
    }

    // ── A3: no raw reads of member-material tables in the surface ──
    // These must be read only via lib/bookStudio/mirrorSources so the member-act
    // predicate + provenance attribution live at one audited choke point.
    const memTables = io.grep(readRe(MEMBER_MATERIAL_TABLES), SURFACE_DIRS);
    if (memTables.length === 0) {
      io.pass(
        'Book Studio surface reads no member-material table inline',
        'member material must enter via lib/bookStudio/mirrorSources',
      );
    } else {
      io.fail(
        'Book Studio surface reads a member-material table directly (bypasses the mirror choke point)',
        memTables.slice(0, 3).join(' | '),
      );
    }

    // ── B-half: mirror reader predicate discipline (activates when built) ──
    if (!io.exists(MIRROR_MODULE)) {
      io.note(
        `B-half pending — ${MIRROR_MODULE} not built yet`,
        'when it lands, this check activates the member-act predicate + Living-Field-exclusion assertions',
      );
      return;
    }

    // B1: mirror reader imports no inference surface.
    const mirrorBadImports = io.grep(importRe(FORBIDDEN_IMPORTS), [MIRROR_MODULE]);
    if (mirrorBadImports.length === 0) {
      io.pass('mirror reader imports no inference/synthesis surface');
    } else {
      io.fail('mirror reader imports a forbidden inference surface', mirrorBadImports.slice(0, 3).join(' | '));
    }

    // B2: mirror reader reads no inference table.
    const mirrorInfTables = io.grep(readRe(INFERENCE_TABLES), [MIRROR_MODULE]);
    if (mirrorInfTables.length === 0) {
      io.pass('mirror reader reads no system-derived/inference table');
    } else {
      io.fail('mirror reader reads an inference table', mirrorInfTables.slice(0, 3).join(' | '));
    }

    // B3: Living Field dimension tables are excluded (spec §4.1 — no member-act marker yet).
    const livingFieldRead = io.grep(readRe('personal_living_field[a-z_]*'), [MIRROR_MODULE]);
    if (livingFieldRead.length === 0) {
      io.pass('mirror reader does not query Living Field dimension tables', 'excluded per spec §4.1 until they earn a member-act marker');
    } else {
      io.fail(
        'mirror reader queries a Living Field dimension table — but personal_living_field* has no enforced member-act marker (spec §4.1)',
        livingFieldRead.slice(0, 3).join(' | '),
      );
    }

    // B4: EVERY admitted member-material query carries its OWN member-act predicate.
    // This is a per-source proof, not a file-level "some predicate exists somewhere"
    // check: for each admitted table actually read (FROM <table>), the query window
    // — from its FROM clause to the end of that SQL template literal (the next
    // backtick) — must contain that table's sanctioned member-act token. A source
    // added without its token fails HERE, even if a sibling query has a predicate.
    const src = io.read(MIRROR_MODULE);
    let anyAdmitted = false;
    for (const { table, predicate, why } of MEMBER_ACT_BY_TABLE) {
      const window = new RegExp(`FROM\\s+${table}\\b([\\s\\S]*?)\``, 'i').exec(src);
      if (!window) continue; // table not read (e.g. deferred source) — nothing to assert
      anyAdmitted = true;
      if (predicate.test(window[1])) {
        io.pass(`mirror query on ${table} carries its member-act predicate`, why);
      } else {
        io.fail(
          `mirror query on ${table} reads member material WITHOUT a member-act predicate`,
          `expected /${predicate.source}/ — ${why}`,
        );
      }
    }
    if (!anyAdmitted) {
      io.note('mirror reader selects no admitted member-material table yet', 'no per-source predicate to assert');
    }

    // B5: named_spiral write-monopoly. personal_spirals has NO row-level member-act
    // marker (no authored_by column), so the mirror's member_id-only predicate is safe
    // ONLY because the sole writer is the authenticated member POST (§4.2 audit). Make
    // that structural: assert no OTHER file writes personal_spirals. A future agent/
    // service writer with a system-generated title would otherwise enter the mirror
    // silently as a 'named_spiral' — this catches it at CI (visible diff to defeat).
    // Only asserted while the module actually reads personal_spirals.
    if (/FROM\s+personal_spirals\b/i.test(src)) {
      const SPIRAL_WRITER = 'app/api/maia/living-field/spirals/route.ts';
      const writers = io.grep(
        'INSERT[[:space:]]+INTO[[:space:]]+personal_spirals|UPDATE[[:space:]]+personal_spirals',
        ['app', 'lib', 'scripts'],
      );
      const foreign = writers.filter((l) => !l.startsWith(`${SPIRAL_WRITER}:`));
      if (foreign.length === 0) {
        io.pass(
          'personal_spirals has no non-member writer',
          'named_spiral safety = write-monopoly (sole writer is the member POST route)',
        );
      } else {
        io.fail(
          'a non-member writer of personal_spirals exists — named_spiral mirror-safety is no longer write-monopoly',
          foreign.slice(0, 3).join(' | '),
        );
      }
    }

    // B6: FAIL CLOSED on unrecognized jurisdiction — the whitelist that makes "deferred"
    // mean "denied". The mirror may read ONLY the positively-ADMITTED member-material
    // tables; every other member-material read fails — a DEFERRED source with its admission
    // criterion, anything else as unrecognized jurisdiction. Absence from the admitted set
    // is ENFORCED here, not merely unchecked: without this, a member-material table not
    // listed in MEMBER_ACT_BY_TABLE (e.g. a re-added member_field_note_threads) would pass
    // B4 silently — fail-open. B6 closes that. Promotion = a deliberate two-part diff
    // (admit in MEMBER_ACT_BY_TABLE with a verified predicate AND remove from DEFERRED_SOURCES).
    const admitted = new Set(MEMBER_ACT_BY_TABLE.map((e) => e.table));
    const deferredWhen = new Map(DEFERRED_SOURCES.map((d) => [d.table, d.admitWhen]));
    const materialReadTables = new Set<string>();
    for (const line of io.grep(readRe(MEMBER_MATERIAL_TABLES), [MIRROR_MODULE])) {
      const m = /(?:FROM|JOIN)\s+([a-z_]+)/i.exec(line);
      if (m) materialReadTables.add(m[1]);
    }
    let jurisdictionClean = true;
    for (const t of materialReadTables) {
      if (admitted.has(t)) continue; // admitted — B4 enforces its per-source write-event predicate
      jurisdictionClean = false;
      if (deferredWhen.has(t)) {
        io.fail(`mirror reads a DEFERRED source: ${t}`, `admit only when ${deferredWhen.get(t)}`);
      } else if (/personal_living_field/.test(t)) {
        io.fail(`mirror reads a Living Field dimension: ${t}`, 'excluded per spec §4.1 until it earns a member-act marker');
      } else {
        io.fail(
          `mirror reads UNRECOGNIZED member-material jurisdiction: ${t}`,
          'fail closed — admit explicitly in MEMBER_ACT_BY_TABLE with a verified write-event predicate',
        );
      }
    }
    if (jurisdictionClean) {
      io.pass(
        'mirror reads only positively-admitted member-material tables (fail-closed whitelist)',
        `admitted: ${[...admitted].join(', ')}`,
      );
    }
  },
};
