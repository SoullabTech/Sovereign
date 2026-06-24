/**
 * Member Memory Atoms Loader — minimally-safe reader for the Keep/Capture portfolio.
 *
 * Authority chain:
 *   - docs/canon/THE_CLEARING.md (canon-prior)
 *   - docs/canon/SPIRAL_CONTINUITY_ENGINE.md
 *   - docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md
 *   - database/migrations/20260521000001_member_memory_atoms.sql (schema-level discipline)
 *   - docs/specs/PSYCHE_ENGAGEMENT_LAYER_SPEC.md (the Psyche Engagement spec governing atoms)
 *   - docs/specs/CUT_1_SUBSTRATE_RESTORATION.md §II.B (this cut's authorization)
 *
 * What this module does:
 *   Reads the member's portfolio (member_memory_atoms) and produces a prompt-ready
 *   block of member-PLACED material. The atoms tell MAIA what they are willing to be.
 *   System does not cross, infer, synthesize, or interpret across atoms.
 *
 * What this module does NOT do:
 *   - Does NOT write atoms (extraction is out of Cut 1 scope, and atoms canon says
 *     writes must be member gestures only — see lib/psyche/portfolio.ts).
 *   - Does NOT surface 'member_pulled' atoms ambiently — those return only on member
 *     direct request, not in implicit prompt context.
 *   - Does NOT surface 'sacred_protected' register atoms — structurally voice-ineligible
 *     per migration CONSTRAINT sacred_protected_register_status.
 *   - Does NOT surface atoms whose status is set_aside / protected / archived.
 *   - Does NOT load the source content of sourced atoms (idea / journal / dream / etc.)
 *     — the atom points at the source; the source remains in its native table.
 *     Only spontaneous atoms (member-typed body) carry body text.
 *   - Does NOT compute "atom patterns" or "register frequencies" or any cross-atom
 *     synthesis. The migration's crossing_must_be_false constraint backstops this.
 *
 * Consent gate enforced by SQL WHERE clauses:
 *   - status IN ('active', 'still_alive')
 *   - NOT 'sacred_protected' = ANY(registers)
 *   - return_preference IN ('contextual_doorway', 'ritual_review_opt_in')
 *
 * The default return_preference is 'member_pulled' — meaning until the member
 * explicitly sets a different preference on an atom, it does not surface here.
 * This is the consent gate, encoded in the schema's default value + this WHERE clause.
 *
 * The atoms read by this loader are atoms the member has consented to ambient surfacing of.
 */

import { query } from '@/lib/db/postgres';

// ════════════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════════════

export type MemoryAtomRegister =
  | 'episodic'
  | 'thematic'
  | 'developmental'
  | 'archetypal'
  | 'relational'
  | 'threshold'
  | 'witnessed'
  | 'sacred_protected';

export type MemoryAtomLens = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export type MemoryAtomStatus =
  | 'active'
  | 'still_alive'
  | 'set_aside'
  | 'protected'
  | 'archived';

export type MemoryAtomReturnPreference =
  | 'member_pulled'
  | 'contextual_doorway'
  | 'ritual_review_opt_in';

export type MemoryAtomSourceType =
  | 'idea'
  | 'idea_block'
  | 'journal'
  | 'dream'
  | 'reflection'
  | 'decision'
  | 'change'
  | 'session_excerpt'
  | 'spontaneous'
  | 'practitioner_observation';

export type EpistemologicalStatus =
  | 'observed'    // witnessed directly by a facilitator in session
  | 'reported'    // shared by the member in their own words
  | 'inferred'    // derived from patterns
  | 'provisional' // low confidence or flagged for member review
  | 'claimed';    // asserted by the member as their truth

/**
 * Prompt-safe snapshot of a member memory atom.
 *
 * NOTE: body is only populated for spontaneous atoms (where the member typed the
 * content directly into the Keep surface). For sourced atoms (idea / journal / etc.),
 * body is null and the source content remains in its native table — out of scope for
 * this loader.
 */
export interface MemoryAtomSnapshot {
  id: string;
  title: string;
  body: string | null;
  primaryRegister: MemoryAtomRegister | null;
  registers: MemoryAtomRegister[];
  elementalLenses: MemoryAtomLens[];
  status: MemoryAtomStatus;
  keptAt: Date;
  returnPreference: MemoryAtomReturnPreference;
  sourceType: MemoryAtomSourceType;
  /**
   * Member-marked breakthrough. The system NEVER sets this — only the member,
   * via POST /api/sovereign/atoms/[id]/breakthrough. Schema constraint
   * breakthrough_flag_timestamp_coherent guarantees flag and timestamp align.
   */
  isBreakthrough: boolean;
  markedBreakthroughAt: Date | null;
  /**
   * Epistemic provenance — how was this known? Null for member-placed atoms.
   * Populated for practitioner_observation atoms written by the With Me bridge.
   */
  epistemologicalStatus: EpistemologicalStatus | null;
  /** Facilitator who authored the observation. Null for member-placed atoms. */
  facilitatorId: string | null;
}

// ════════════════════════════════════════════════════════════════════════════
// Loader
// ════════════════════════════════════════════════════════════════════════════

const SELECT_COLUMNS = `
  id,
  title,
  body,
  primary_register,
  registers,
  elemental_lenses,
  status,
  kept_at,
  return_preference,
  source_type,
  is_breakthrough,
  marked_breakthrough_at,
  epistemological_status,
  facilitator_id
`;

/**
 * Attribution guard — bridge-verification finding 2026-06-24.
 *
 * Canon: `facilitator_id` is the canonical runtime attribution for a
 * practitioner_observation atom; the `provenance` jsonb is audit history, never
 * runtime identity. An unattributed practitioner atom must NOT be loader-eligible —
 * formatAtomsForPrompt renders the "PRACTITIONER OBSERVATIONS" section by
 * source_type alone, so surfacing one would present "a practitioner observed…"
 * with nothing backing it. Such atoms (legacy/seed/test) may exist; they simply
 * never surface. (No write-time block — existence is allowed, surfacing is not.)
 */
export const PRACTITIONER_ATTRIBUTION_GUARD =
  "(source_type <> 'practitioner_observation' OR facilitator_id IS NOT NULL)";

interface AtomRow {
  id: string;
  title: string;
  body: string | null;
  primary_register: MemoryAtomRegister | null;
  registers: MemoryAtomRegister[];
  elemental_lenses: MemoryAtomLens[];
  status: MemoryAtomStatus;
  kept_at: Date;
  return_preference: MemoryAtomReturnPreference;
  source_type: MemoryAtomSourceType;
  is_breakthrough: boolean;
  marked_breakthrough_at: Date | null;
  epistemological_status: EpistemologicalStatus | null;
  facilitator_id: string | null;
}

/**
 * Load the member's surfacable portfolio atoms for ambient prompt context.
 *
 * Filters (all canon-derived, all required):
 *   - status IN ('active', 'still_alive') — excludes set_aside / protected / archived
 *   - return_preference IN ('contextual_doorway', 'ritual_review_opt_in') — member
 *     has explicitly opted into ambient surfacing (default is member_pulled, which
 *     is excluded here)
 *   - NOT 'sacred_protected' = ANY(registers) — sacred-protected register is
 *     structurally voice-ineligible per migration constraint
 *
 * Ordering: is_breakthrough DESC, kept_at DESC. Member-marked breakthroughs
 * surface first within the saliency window. The flag is never system-set —
 * it reflects only material the member has explicitly marked as a breakthrough.
 *
 * @param memberId - the member's UUID
 * @param limit - max atoms to return (default 8)
 * @returns array of atom snapshots, empty array on no eligible atoms or DB error
 *
 * Errors are caught and logged. Returns [] on failure — never throws. The loader
 * is non-blocking to the route; the orchestrator can run without atoms.
 */
export async function loadMemberMemoryAtomsForPrompt(
  memberId: string,
  limit: number = 8,
): Promise<MemoryAtomSnapshot[]> {
  if (!memberId) return [];

  try {
    const result = await query<AtomRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM member_memory_atoms
       WHERE member_id = $1
         AND status IN ('active', 'still_alive')
         AND return_preference IN ('contextual_doorway', 'ritual_review_opt_in')
         AND NOT ('sacred_protected' = ANY(registers))
         AND ${PRACTITIONER_ATTRIBUTION_GUARD}
       ORDER BY is_breakthrough DESC, kept_at DESC
       LIMIT $2`,
      [memberId, limit],
    );

    return result.rows.map((r) => ({
      id: r.id,
      title: r.title,
      // Body carried for spontaneous (member-typed) and practitioner_observation atoms.
      // Sourced atoms (idea/journal/etc.) keep content in their native table.
      body: (r.source_type === 'spontaneous' || r.source_type === 'practitioner_observation')
        ? r.body
        : null,
      primaryRegister: r.primary_register,
      registers: r.registers ?? [],
      elementalLenses: r.elemental_lenses ?? [],
      status: r.status,
      keptAt: r.kept_at,
      returnPreference: r.return_preference,
      sourceType: r.source_type,
      isBreakthrough: r.is_breakthrough ?? false,
      markedBreakthroughAt: r.marked_breakthrough_at,
      epistemologicalStatus: r.epistemological_status ?? null,
      facilitatorId: r.facilitator_id ?? null,
    }));
  } catch (err) {
    // Failure-empty (distinct from legitimate-empty path in the route handler,
    // which logs '[MAIA/sovereign] atoms: none surfacable for this member').
    // Marker aligned with the production grep pattern so this surfaces in ops
    // diagnostics. See memory: project_semantic_atoms_cat6_verified — silent
    // catch swallowing schema-drift errors hid a broken substrate for weeks.
    console.warn(
      '[MAIA/sovereign] atoms loader failure-empty:',
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Prompt formatting
// ════════════════════════════════════════════════════════════════════════════

/**
 * Render a human-relative time string ("3 days ago", "yesterday", "this week").
 * Conservative; no surveillance-shape precision.
 */
function relativeTime(d: Date): string {
  const ms = Date.now() - d.getTime();
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (day < 1) return 'today';
  if (day === 1) return 'yesterday';
  if (day < 7) return `${day} days ago`;
  if (day < 14) return 'last week';
  if (day < 30) return `${Math.floor(day / 7)} weeks ago`;
  if (day < 60) return 'last month';
  if (day < 365) return `${Math.floor(day / 30)} months ago`;
  return 'over a year ago';
}

/**
 * Format atoms into a prompt block.
 *
 * Discipline:
 *   - Member-placed atoms and practitioner-witnessed atoms are rendered in
 *     separate blocks with distinct epistemic framing.
 *   - Practitioner observations are never phrased as "You are…" — always as
 *     "A practitioner observed…" or similar, with authority proportional to
 *     epistemologicalStatus.
 *   - No cross-atom synthesis or interpretation regardless of source type.
 *   - Returns empty string if no atoms — never injects an empty block.
 *
 * Returns '' when atoms array is empty so the caller can safely concat.
 */
export function formatAtomsForPrompt(atoms: MemoryAtomSnapshot[]): string {
  if (!atoms || atoms.length === 0) return '';

  const memberAtoms = atoms.filter(a => a.sourceType !== 'practitioner_observation');
  const practitionerAtoms = atoms.filter(a => a.sourceType === 'practitioner_observation');

  const sections: string[] = [];

  // ── Member-placed portfolio ──────────────────────────────────────────────
  if (memberAtoms.length > 0) {
    const lines: string[] = [];
    lines.push('# MEMBER-PLACED PORTFOLIO');
    lines.push('');
    lines.push(
      'The member has explicitly kept the following material in their portfolio. ' +
        'These are *member-placed*, not system-inferred. Recognize naturally if the ' +
        'present moment connects, but do NOT cross-reference, synthesize, or interpret ' +
        'across them — each atom stands as the member declared it.',
    );
    lines.push('');

    for (const atom of memberAtoms) {
      const parts: string[] = [`"${atom.title}"`];
      parts.push(`kept ${relativeTime(atom.keptAt)}`);

      if (atom.primaryRegister) {
        parts.push(`primary register: ${atom.primaryRegister}`);
      } else if (atom.registers.length > 0) {
        parts.push(`registers: ${atom.registers.join(', ')}`);
      }

      if (atom.elementalLenses.length > 0) {
        parts.push(`lens: ${atom.elementalLenses.join('/')}`);
      }

      if (atom.status === 'still_alive') {
        parts.push('marked still alive by the member');
      }

      if (atom.isBreakthrough) {
        parts.push('marked as a breakthrough by the member');
      }

      lines.push(`- ${parts.join(' — ')}`);

      if (atom.sourceType === 'spontaneous' && atom.body) {
        const body = atom.body.trim();
        if (body.length > 0) {
          const truncated = body.length > 200 ? body.slice(0, 200) + '…' : body;
          lines.push(`    ${truncated}`);
        }
      }
    }

    lines.push('');
    lines.push(
      'Discipline: surface as the atoms themselves declare. No cross-atom claims. ' +
        'No system inference of patterns across these.',
    );
    lines.push('');
    sections.push(lines.join('\n'));
  }

  // ── Practitioner-witnessed observations ─────────────────────────────────
  if (practitionerAtoms.length > 0) {
    const lines: string[] = [];
    lines.push('# PRACTITIONER OBSERVATIONS');
    lines.push('');
    lines.push(
      'The following observations were made by a practitioner during a facilitated session ' +
        'and approved for inclusion in MAIA context. These are NOT statements of fact about ' +
        'the member — they are practitioner-witnessed observations with their own epistemic ' +
        'standing. Phrase accordingly: "A practitioner observed…", "It was noted in a ' +
        'session that…", "A facilitator\'s impression was…". Never collapse these into ' +
        '"You are…" or "You have…" without the member confirming it as their own truth.',
    );
    lines.push('');
    lines.push(
      'When to surface (REQUIRED): when one of these observations contains a concrete, ' +
        'behaviorally relevant detail that directly bears on what the member is asking ' +
        'right now, you SHOULD surface it — briefly and descriptively — before you ask ' +
        'your next question. Name it as a witnessed note and invite the member to weigh ' +
        'it. For example: "I notice there\'s a note from a prior session that you tend to ' +
        'pause before naming what you actually want — does that feel relevant here?" ' +
        '(descriptive and invitational) — never "You always pause before naming what you ' +
        'want" (a verdict). Surface only what is genuinely new to this exchange; if the ' +
        'member has already named the same insight, support their authorship rather than ' +
        'repeating it.',
    );
    lines.push('');

    for (const atom of practitionerAtoms) {
      const framing = epistemicFraming(atom.epistemologicalStatus);
      const parts: string[] = [`"${atom.title}"`];
      parts.push(framing);
      parts.push(`noted ${relativeTime(atom.keptAt)}`);

      if (atom.elementalLenses.length > 0) {
        parts.push(`lens: ${atom.elementalLenses.join('/')}`);
      }

      lines.push(`- ${parts.join(' — ')}`);

      if (atom.body) {
        const body = atom.body.trim();
        if (body.length > 0) {
          // Strip the "Session: <uuid>" provenance line — MAIA doesn't need it inline
          const displayBody = body.replace(/\n\nSession: [a-f0-9-]{36}$/, '').trim();
          const truncated = displayBody.length > 300 ? displayBody.slice(0, 300) + '…' : displayBody;
          if (truncated.length > 0) {
            lines.push(`    ${truncated}`);
          }
        }
      }
    }

    lines.push('');
    lines.push(
      'Epistemic discipline: these observations have practitioner-level standing, not ' +
        'member-confirmed standing. Surface with appropriate tentativeness. The member ' +
        'remains the authority on their own experience. When surfacing a practitioner ' +
        'observation, explicitly invite the member to confirm, reject, or refine it — ' +
        'do not carry it as established context until the member has responded to it.',
    );
    lines.push('');
    sections.push(lines.join('\n'));
  }

  return sections.join('\n');
}

/**
 * Map epistemological_status to a prompt-facing framing phrase.
 * Proportions authority to the quality of the knowledge.
 */
function epistemicFraming(status: EpistemologicalStatus | null): string {
  switch (status) {
    case 'observed':    return 'observed by a practitioner in session';
    case 'reported':    return 'reported by the member during a session';
    case 'inferred':    return 'inferred from session patterns — provisional';
    case 'provisional': return 'provisional practitioner impression';
    case 'claimed':     return 'stated by the member during a session';
    default:            return 'noted in a practitioner session';
  }
}

/**
 * Compact log payload for telemetry.
 */
export function summarizeAtomsForLog(
  atoms: MemoryAtomSnapshot[],
): Record<string, unknown> {
  return {
    count: atoms.length,
    breakthrough_count: atoms.filter((a) => a.isBreakthrough).length,
    registers: Array.from(
      new Set(atoms.flatMap((a) => a.registers.concat(a.primaryRegister ? [a.primaryRegister] : []))),
    ),
    lenses: Array.from(new Set(atoms.flatMap((a) => a.elementalLenses))),
    statuses: Array.from(new Set(atoms.map((a) => a.status))),
    return_preferences: Array.from(new Set(atoms.map((a) => a.returnPreference))),
  };
}

/**
 * Whether any of the surfaced atoms is member-marked as a breakthrough.
 *
 * Used by the route handler to set memoryHealth.breakthrough = 'ok' | 'empty'
 * for substrate observability. NOT a state claim about the member; only a
 * structural observation that the breakthrough substrate carried signal this turn.
 */
export function hasBreakthroughSignal(atoms: MemoryAtomSnapshot[]): boolean {
  return atoms.some((a) => a.isBreakthrough);
}
