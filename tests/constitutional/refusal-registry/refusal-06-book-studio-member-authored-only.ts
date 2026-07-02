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
 *   B-half (Grade B, query predicate — PENDING until mirrorSources exists):
 *     Every query in lib/bookStudio/mirrorSources.ts carries a member-act
 *     predicate; it imports no inference surface; it does not query the
 *     Living Field dimension tables (excluded per spec §4.1 until they earn a
 *     member-act marker). Activates automatically when the module lands.
 *
 * This is NOT Grade C: no part is a prompt instruction. We do not ask MAIA to
 * "only use accepted material" — that is the memoryAtomsLoader.ts Grade-C
 * pattern this refusal exists to replace with structure.
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
    'lib/bookStudio/mirrorSources.ts not yet built — B-half predicate checks pending',
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
    'ADD a forbidden import or a direct member-material/inference table read in the Book Studio surface (visible diff), or — once mirrorSources exists — remove a member-act WHERE predicate from one of its queries (visible diff)',

  run(io) {
    // ── A1: no inference-surface imports in the surface ──
    const badImports = io.grep(FORBIDDEN_IMPORTS, SURFACE_DIRS);
    if (badImports.length === 0) {
      io.pass('Book Studio surface imports no inference/synthesis surface');
    } else {
      io.fail(
        'Book Studio surface imports a forbidden inference surface',
        badImports.slice(0, 3).join(' | '),
      );
    }

    // ── A2: no raw reads of inference tables in the surface ──
    const infTables = io.grep(INFERENCE_TABLES, SURFACE_DIRS);
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
    const memTables = io.grep(MEMBER_MATERIAL_TABLES, SURFACE_DIRS);
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
    const mirrorBadImports = io.grep(FORBIDDEN_IMPORTS, [MIRROR_MODULE]);
    if (mirrorBadImports.length === 0) {
      io.pass('mirror reader imports no inference/synthesis surface');
    } else {
      io.fail('mirror reader imports a forbidden inference surface', mirrorBadImports.slice(0, 3).join(' | '));
    }

    // B2: mirror reader reads no inference table.
    const mirrorInfTables = io.grep(INFERENCE_TABLES, [MIRROR_MODULE]);
    if (mirrorInfTables.length === 0) {
      io.pass('mirror reader reads no system-derived/inference table');
    } else {
      io.fail('mirror reader reads an inference table', mirrorInfTables.slice(0, 3).join(' | '));
    }

    // B3: Living Field dimension tables are excluded (spec §4.1 — no member-act marker yet).
    const livingFieldRead = io.grep('personal_living_field[a-z_]*', [MIRROR_MODULE]);
    if (livingFieldRead.length === 0) {
      io.pass('mirror reader does not query Living Field dimension tables', 'excluded per spec §4.1 until they earn a member-act marker');
    } else {
      io.fail(
        'mirror reader queries a Living Field dimension table — but personal_living_field* has no enforced member-act marker (spec §4.1)',
        livingFieldRead.slice(0, 3).join(' | '),
      );
    }

    // B4: each allowed member-material query carries a member-act predicate.
    // Presence check: the module must contain the member-act markers for the
    // classes it selects. Absence of ANY predicate marker while selecting a
    // member-material table is a failure.
    const src = io.read(MIRROR_MODULE);
    const selectsMemberMaterial = new RegExp(`FROM\\s+(${MEMBER_MATERIAL_TABLES})`, 'i').test(src);
    const hasMemberActPredicate =
      /kept_at|is_breakthrough|status\s*=\s*'accepted'|authorship|authored_by/i.test(src);
    if (!selectsMemberMaterial) {
      io.note('mirror reader selects no member-material table yet', 'no predicate to assert');
    } else if (hasMemberActPredicate) {
      io.pass('mirror reader queries carry member-act predicates', 'kept_at / is_breakthrough / accepted / authorship');
    } else {
      io.fail('mirror reader selects member material without any member-act predicate', 'every allowed-source query must filter on a member act');
    }
  },
};
