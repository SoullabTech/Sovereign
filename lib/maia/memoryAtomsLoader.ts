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
  | 'spontaneous';

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
  source_type
`;

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
 * Ordering: kept_at DESC (most recently kept first).
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
       ORDER BY kept_at DESC
       LIMIT $2`,
      [memberId, limit],
    );

    return result.rows.map((r) => ({
      id: r.id,
      title: r.title,
      // Body only carried for spontaneous atoms; sourced atoms keep content in source table
      body: r.source_type === 'spontaneous' ? r.body : null,
      primaryRegister: r.primary_register,
      registers: r.registers ?? [],
      elementalLenses: r.elemental_lenses ?? [],
      status: r.status,
      keptAt: r.kept_at,
      returnPreference: r.return_preference,
      sourceType: r.source_type,
    }));
  } catch (err) {
    console.warn(
      '[memoryAtomsLoader] loadMemberMemoryAtomsForPrompt failed (non-fatal):',
      err,
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
 *   - Member-placed framing, not system-tagged
 *   - Each atom rendered as the atom itself declares (registers, lenses, status)
 *   - Explicit "do NOT cross-reference, synthesize, or interpret across" instruction
 *   - Returns empty string if no atoms — never injects an empty block
 *   - Never includes source content for non-spontaneous atoms (only the title)
 *
 * Returns '' when atoms array is empty so the caller can safely concat.
 */
export function formatAtomsForPrompt(atoms: MemoryAtomSnapshot[]): string {
  if (!atoms || atoms.length === 0) return '';

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

  for (const atom of atoms) {
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

    lines.push(`- ${parts.join(' — ')}`);

    // Spontaneous atoms carry member-typed body content; surface verbatim
    if (atom.sourceType === 'spontaneous' && atom.body) {
      const body = atom.body.trim();
      if (body.length > 0) {
        // Indent one level; cap to ~200 chars to avoid prompt bloat
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

  return lines.join('\n');
}

/**
 * Compact log payload for telemetry.
 */
export function summarizeAtomsForLog(
  atoms: MemoryAtomSnapshot[],
): Record<string, unknown> {
  return {
    count: atoms.length,
    registers: Array.from(
      new Set(atoms.flatMap((a) => a.registers.concat(a.primaryRegister ? [a.primaryRegister] : []))),
    ),
    lenses: Array.from(new Set(atoms.flatMap((a) => a.elementalLenses))),
    statuses: Array.from(new Set(atoms.map((a) => a.status))),
    return_preferences: Array.from(new Set(atoms.map((a) => a.returnPreference))),
  };
}
