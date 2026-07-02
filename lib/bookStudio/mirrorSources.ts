/**
 * lib/bookStudio/mirrorSources.ts
 *
 * A constitutionally-constrained reader for Book Studio — the SINGLE audited choke
 * point through which member material may enter the surface that answers
 *   "What in my Living Field is ready to become writing?"
 *
 * Its architectural contribution is NOT that it reads member material. It is what
 * it REFUSES to read: MAIA-inferred themes, un-kept atoms, practitioner-authored
 * observations, unverified "acceptances", and any source whose member-authorship
 * cannot be structurally proven at the row level (see DEFERRED, below). The
 * refusal is the artifact; the reading is SUBORDINATE to it — retrieval exists in
 * service of the refusal, not alongside it. The refusal is set at AUTHORING time (the
 * shape of these queries); the runtime does not DECIDE to refuse per call — it inhabits
 * a boundary already established. Keep admission STRUCTURAL: never swap a member-act
 * predicate for a runtime branch that "decides" what to admit — that turns a
 * jurisdiction into a judgment, and exercising judgment is what a constitutional
 * reader must not do.
 *
 * TWO CLASSES OF CHANGE follow from that hierarchy. The discriminator is JURISDICTIONAL,
 * not complexity: does the change make this layer smarter about MEANING, or only about
 * EXECUTION? Smarter-about-execution is always fine; smarter-about-meaning is authority
 * drifting downward into a layer that must not hold it.
 *   - SUBORDINATE (execution — normal review): recall, latency, performance, and
 *     ordering keyed to member-act FACTS (e.g. `memberActAt DESC` — WHEN the member
 *     acted). No new source, no predicate change, no inferred salience.
 *   - CONSTITUTIONAL (meaning — must pass the R06 gate `npm run check:refusals` +
 *     architectural-integrity review): weakening/removing a member-act predicate,
 *     ADDING ANY source, reading any surface named in DEFERRED, OR ranking by INFERRED
 *     readiness / importance / relevance. That last one is the subtle case: deciding
 *     which material is "most ready to become writing" is a MEANING judgment MAIA must
 *     not make — the exact drift this module refuses — so ordering stays on member-act
 *     facts, never inferred salience. And "it's provably member-authored" is a VERDICT
 *     the refusal gate returns, never a self-issued exemption that skips it. These
 *     changes alter what this module refuses, which is its identity — not a feature knob.
 *
 * Constitutional grounding:
 *   - docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md:72 — "The system may draft
 *     from selected, member-owned material; it may never synthesize identity."
 *   - Refusal R06 (docs/architecture/REFUSAL_REGISTRY.md) — Book Studio must not
 *     generate legacy-writing prompts from MAIA-only inferred themes, hidden
 *     clusters, unstated psychological summaries, or unaccepted Living Field
 *     reflections. This module is where R06's B-half lives.
 *   - Spec: docs/specs/BOOK_STUDIO_MIRROR_SAFE_SPEC_2026-07-02.md
 *
 * INVARIANTS (enforced structurally, not by prompt text):
 *   1. Every row admitted carries a MEMBER-ACT predicate in its query WHERE clause
 *      (kept_at / is_breakthrough / member-created title), preferring a POSITIVE
 *      structural marker over a string-literal denylist wherever one exists.
 *   2. NO synthesis, NO cross-row theming: one member act = exactly one MirrorSource.
 *      This module never joins rows into a higher-order claim (mirrors the schema-level
 *      crossing_must_be_false pin on member_memory_atoms).
 *   3. It imports ONLY the db `query` handle — never memoryAtomsLoader (Grade-C prose),
 *      never corpusCallosum / breakthroughDetection / spiralState / any inference surface.
 *   4. Provenance rides on every row: memberActLabel + memberActAt attribute each
 *      fragment to the member's own gesture. No un-attributed fragment is returned.
 *
 * ADMITTED (v1) — three member-act classes across two tables:
 *   keep         → member_memory_atoms, kept & not marked breakthrough
 *   breakthrough → member_memory_atoms, is_breakthrough = TRUE (member-marked; system never sets)
 *   named_spiral → personal_spirals, member-authored title (§4.2 audit: sole writer is the member POST)
 *
 * DEFERRED (named, not silently dropped — each needs a real member-act marker first).
 * All three deferrals were confirmed against the live schema/routes by an adversarial
 * verification pass (2026-07-02):
 *   member_note + accepted_reflection → member_field_note_threads. DEFERRED after a
 *     HIGH-severity finding: member_confirmed=TRUE is server-stamped unconditionally on
 *     every insert (the DEFAULT false never applies), and authorship='member_confirmed'
 *     is derived from a CLIENT-SUPPLIED decision flag with no server verification that
 *     the underlying proposal was MAIA-issued, shown to the member, or actually acted on.
 *     Result: MAIA's own proposed prose can circulate as "You accepted this reflection"
 *     without a structurally-enforced member act (the vision-studio writer has no consent
 *     or tester gate). Re-admit only once acceptance is structurally bound — a write-side
 *     member_decision_at requirement + proposal-provenance verification + the vision-studio
 *     consent/tester gate — and the read predicate additionally requires member_decision_at
 *     IS NOT NULL. (adversarial verdict: notes = bypassFound:yes, severity:high.)
 *   encounter_recognition → encounter_moments 'accepted_recognition' is UI-only (PATCH
 *     never persists artifact_type; authored_by not stamped on accept; status trusts the
 *     request body; acceptance is a PRACTITIONER act on PHI; Stage-B encryption). Not
 *     member-provable today. (Named 'encounter_recognition' to avoid colliding with the
 *     member-note 'accepted_reflection' concept above.)
 *   living_field_dimension → personal_living_field* has no enforced member-act marker
 *     (authored_by TEXT DEFAULT 'member'). Excluded per spec §4.1.
 */

import { query } from '@/lib/db/postgres';

/** The member act that made this material eligible to become writing. */
export type MirrorSourceClass =
  | 'keep' // member kept an atom
  | 'breakthrough' // member marked a breakthrough
  | 'named_spiral'; // member named a spiral/theme
// DEFERRED classes ('member_note', 'accepted_reflection', 'recognition') are intentionally
// absent — the type reflects only what is structurally provable today (see header).

/** Which underlying member-material table a MirrorSource was drawn from. */
export type MirrorOriginTable = 'member_memory_atoms' | 'personal_spirals';

export interface MirrorSource {
  /** Source-native id (atom uuid, spiral id). */
  id: string;
  /** Short member-given label; null when the material has no member title. */
  title: string | null;
  /** The member's own words — the writable fragment. */
  text: string;
  /** Row/formation time. */
  createdAt: Date;

  /** Which member act produced this. Drives sectioning + attribution copy. */
  sourceClass: MirrorSourceClass;
  /** UI-ready attribution sentence, authored here (never inferred at render). */
  memberActLabel: string;
  /** When the member performed that act (distinct from createdAt). */
  memberActAt: Date;

  /** Back-reference to the substrate, for dedup / re-resolution on the Shelf. */
  origin: { table: MirrorOriginTable; scope: 'personal' };
}

/** Canonical attribution copy, keyed by class. Authored, never inferred. */
const MEMBER_ACT_LABEL: Record<MirrorSourceClass, string> = {
  keep: 'You kept this',
  breakthrough: 'You marked this a breakthrough',
  named_spiral: 'You named this spiral',
};

// ── Query 1: Keeps + breakthroughs (member_memory_atoms) ──────────────────────
// Member-act predicate: every atom IS a member keep gesture (kept_at); an atom
// cannot exist un-kept or auto-extracted (base-migration core rule). Breakthrough
// is a member-only flag the system never sets.
//
// NON-MEMBER EXCLUSION — positive structural marker, not a denylist. The ONLY
// non-member writer of this table is the facilitated With-Me path, which stamps
// facilitator_id (migration 20260624000001) on every row it inserts. We therefore
// require `facilitator_id IS NULL` — a positive member-authorship marker that does
// NOT drift if a source_type value is later renamed. We ALSO keep the
// source_type <> 'practitioner_observation' clause (belt-and-suspenders); an
// adversarial pass (2026-07-02) showed relying on the string literal alone is a
// single point of failure.
//
// Protection: EXCLUDE both the 'protected' status (voice-ineligible /
// held-without-circulation) AND the 'sacred_protected' register (R04). Scope to
// the member's own personal field. The ambient `return_preference` gate is
// intentionally OMITTED — Book Studio is member-INITIATED, so a member's own
// default-private keeps belong in their book.
interface AtomRow {
  id: string;
  title: string;
  body: string | null;
  is_breakthrough: boolean;
  kept_at: Date;
  marked_breakthrough_at: Date | null;
}

async function loadKeptAtoms(memberId: string): Promise<MirrorSource[]> {
  const { rows } = await query<AtomRow>(
    `SELECT id, title, body, is_breakthrough, kept_at, marked_breakthrough_at
       FROM member_memory_atoms
      WHERE member_id = $1
        AND facilitator_id IS NULL                           -- positive member-authorship marker (only With-Me sets it)
        AND source_type <> 'practitioner_observation'        -- belt-and-suspenders denylist (see comment)
        AND status IN ('active', 'still_alive')              -- excludes 'protected' (+ set_aside/archived)
        AND NOT ('sacred_protected' = ANY(registers))        -- R04: sacred register never circulates
        AND memory_scope = 'personal'                        -- member's own field only; no colab/client bleed
      ORDER BY kept_at DESC`,
    [memberId],
  );
  return rows.map((r): MirrorSource => {
    const isBreak = r.is_breakthrough === true;
    const sourceClass: MirrorSourceClass = isBreak ? 'breakthrough' : 'keep';
    // Breakthrough marked_breakthrough_at is coherence-pinned non-null when the flag is true.
    const memberActAt = isBreak && r.marked_breakthrough_at ? r.marked_breakthrough_at : r.kept_at;
    return {
      id: r.id,
      title: r.title,
      text: r.body ?? r.title, // sourced atoms carry no body; title is the member's own label
      createdAt: r.kept_at,
      sourceClass,
      memberActLabel: MEMBER_ACT_LABEL[sourceClass],
      memberActAt,
      origin: { table: 'member_memory_atoms', scope: 'personal' },
    };
  });
}

// ── Query 2: Named spirals (personal_spirals) ─────────────────────────────────
// Member-act predicate: member_id scope. title is member-authored by construction —
// the only writer is the authenticated member POST (§4.2 audit 2026-07-02, re-verified
// by the adversarial pass: exactly one writer, no UPDATE path, no internal caller).
// Distinct from member_spiral_state (system-computed structural position, no
// member-authored text). NOTE: this safety is INHERITED from the write-monopoly, not
// from a row-level marker (personal_spirals has no authored_by column) — a
// refusal-registry write-monopoly guard (R06 B5) catches any future non-member writer.
interface SpiralRow {
  id: string;
  title: string;
  description: string | null;
  created_at: Date;
}

async function loadNamedSpirals(memberId: string): Promise<MirrorSource[]> {
  const { rows } = await query<SpiralRow>(
    `SELECT id, title, description, created_at
       FROM personal_spirals
      WHERE member_id = $1
      ORDER BY created_at DESC`,
    [memberId],
  );
  return rows.map((r): MirrorSource => ({
    id: r.id,
    title: r.title,
    text: r.description ?? r.title,
    createdAt: r.created_at,
    sourceClass: 'named_spiral',
    memberActLabel: MEMBER_ACT_LABEL.named_spiral,
    memberActAt: r.created_at,
    origin: { table: 'personal_spirals', scope: 'personal' },
  }));
}

/**
 * Answers "What in my Living Field is ready to become writing?"
 *
 * Fans out across the admitted member-act substrates, maps each row to a
 * MirrorSource with its provenance already resolved, and returns them sorted by
 * memberActAt DESC. One member act = one MirrorSource. Never synthesizes, never
 * crosses substrates, never admits a MAIA-inferred theme.
 *
 * @param memberId the authenticated member's id (never a client-asserted claim)
 */
export async function getWritableMaterial(memberId: string): Promise<MirrorSource[]> {
  const [atoms, spirals] = await Promise.all([
    loadKeptAtoms(memberId),
    loadNamedSpirals(memberId),
  ]);
  return [...atoms, ...spirals].sort(
    (a, b) => new Date(b.memberActAt).getTime() - new Date(a.memberActAt).getTime(),
  );
}
