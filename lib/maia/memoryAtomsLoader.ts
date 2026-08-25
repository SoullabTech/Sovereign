/**
 * Member Memory Atoms Loader — minimally-safe reader for the Keep/Capture portfolio.
 *
 * Authority chain:
 *   - docs/canon/THE_CLEARING.md (canon-prior)
 *   - docs/canon/SPIRAL_CONTINUITY_ENGINE.md
 *   - docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md
 *   - database/migrations/20260521000001_member_memory_atoms.sql (schema-level discipline)
 *   - database/migrations/20260630000005_memory_atoms_scope.sql (scope containment)
 *   - docs/specs/PSYCHE_ENGAGEMENT_LAYER_SPEC.md (the Psyche Engagement spec governing atoms)
 *
 * What this module does:
 *   Reads the member's portfolio (member_memory_atoms) and produces a prompt-ready
 *   block of member-PLACED material within an explicit scope boundary.
 *   The atoms tell MAIA what they are willing to be, within the context in which
 *   they were placed. System does not cross, infer, synthesize, or interpret.
 *
 * Scope containment (migration 20260630000005):
 *   Every atom carries a memory_scope: personal | colab | client | encounter.
 *   The loader NEVER surfaces atoms outside their declared scope:
 *   - personal atoms: surface only in the member's own MAIA context.
 *   - colab atoms: surface only when the active team_id matches.
 *   - client atoms: surface only when the active client_id matches.
 *   - encounter atoms: surface only within that encounter's review context.
 *   Cross-scope surfacing is architecturally blocked in SQL, not runtime logic.
 *
 * What this module does NOT do:
 *   - Does NOT write atoms — writes must be member gestures only.
 *   - Does NOT surface 'member_pulled' atoms ambiently.
 *   - Does NOT surface 'sacred_protected' register atoms.
 *   - Does NOT surface atoms whose status is set_aside / protected / archived.
 *   - Does NOT surface a practitioner observation the member has DECLINED
 *     (member_response_status = 'rejected'). The prompt invites the member to
 *     confirm, reject, or refine; a recorded reject RELEASES the atom — it is
 *     not silently re-carried next session. (Right to Remain Unpossessed.)
 *   - Does NOT blend atoms across scope boundaries.
 *   - Does NOT compute cross-atom patterns or synthesis.
 *
 * Consent + scope gates enforced by SQL WHERE clauses:
 *   - memory_scope + scope context (team_id / client_id / encounter_id)
 *   - status IN ('active', 'still_alive')
 *   - NOT 'sacred_protected' = ANY(registers)
 *   - return_preference IN ('contextual_doorway', 'ritual_review_opt_in')
 *   - member_response_status IS DISTINCT FROM 'rejected' (declined = released)
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
  | 'practitioner_observation'
  // Registry pointer to session_captures.id. Content stays encrypted at the
  // source; body is always NULL, so a promoted capture surfaces as title +
  // provenance only (see the body-nulling in the row mapper below).
  | 'capture';

export type MemoryScope = 'personal' | 'colab' | 'client' | 'encounter';

/**
 * Scope context passed to the loader. Determines which atoms are eligible.
 * Omitting a field does NOT widen the scope — it restricts it.
 *
 * - No context / personal: only memory_scope = 'personal' atoms surface.
 * - teamId only: personal + colab atoms for that team.
 * - clientId (+ teamId): client-scope atoms for that person in that Co-Lab.
 * - encounterId (+ teamId): encounter-scope atoms for that encounter.
 *
 * The loader never blends across boundaries — each path is a separate query clause.
 */
export interface AtomScopeContext {
  /** Active Co-Lab. Required for colab/client/encounter scope atoms to surface. */
  teamId?: string | null;
  /** Active client (studio_people.id). Required for client-scope atoms. */
  clientId?: string | null;
  /** Active encounter (encounters.id). Required for encounter-scope atoms. */
  encounterId?: string | null;
}

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
 * Load surfacable portfolio atoms for ambient prompt context.
 *
 * Scope enforcement (migration 20260630000005):
 *   The scope parameter determines which atoms are eligible. This is enforced
 *   in SQL — not runtime filtering — so the query never even reads atoms from
 *   other scopes. The boundary is structural, not behavioral.
 *
 *   No scope / personal only: memory_scope = 'personal'
 *   teamId provided:          personal + colab atoms for that team
 *   clientId provided:        + client-scope atoms for that client in that team
 *   encounterId provided:     + encounter-scope atoms for that encounter
 *
 * Consent filters (all canon-derived, all required):
 *   - status IN ('active', 'still_alive')
 *   - return_preference IN ('contextual_doorway', 'ritual_review_opt_in')
 *   - NOT 'sacred_protected' = ANY(registers)
 *
 * Ordering: is_breakthrough DESC, kept_at DESC.
 *
 * @param memberId - the member's UUID
 * @param limit - max atoms to return (default 8)
 * @param scope - scope context; defaults to personal-only
 * @returns array of atom snapshots, empty on no eligible atoms or DB error
 */
export async function loadMemberMemoryAtomsForPrompt(
  memberId: string,
  // Stage 1 policy declaration (ruled 2026-08-04): this default IS the current
  // selection policy — consent-bounded, breakthrough-first, recency-sovereign,
  // take-8 — versioned in lib/maia/memorySelectionPolicy.ts. It stands as
  // known-policy "until a more context-sensitive model is proven". Changing it
  // is a governed act under founder ruling, never a tuning knob.
  limit: number = 8,
  scope: AtomScopeContext = {},
): Promise<MemoryAtomSnapshot[]> {
  if (!memberId) return [];

  try {
    // Build scope clause with parameterized values. Each branch is additive —
    // the caller's context determines which scopes are reachable.
    // Absence = restriction, not widening.
    // $1 = memberId, $2 = limit; scope params start at $3.
    const params: unknown[] = [memberId, limit];
    const scopeClauses: string[] = [`memory_scope = 'personal'`];

    // Push teamId once — all non-personal scope clauses reference the same param.
    let teamParam: number | null = null;
    if (scope.teamId) {
      params.push(scope.teamId);
      teamParam = params.length; // e.g. $3
      scopeClauses.push(`(memory_scope = 'colab' AND team_id = $${teamParam}::uuid)`);
    }
    if (scope.clientId && teamParam !== null) {
      params.push(scope.clientId);
      const pc = params.length; // e.g. $4
      scopeClauses.push(
        `(memory_scope = 'client' AND client_id = $${pc}::uuid AND team_id = $${teamParam}::uuid)`
      );
    }
    if (scope.encounterId && teamParam !== null) {
      params.push(scope.encounterId);
      const pe = params.length; // e.g. $4 or $5
      scopeClauses.push(
        `(memory_scope = 'encounter' AND encounter_id = $${pe}::uuid AND team_id = $${teamParam}::uuid)`
      );
    }

    const scopeWhere = `(${scopeClauses.join(' OR ')})`;

    // Release unit: the member_response_status predicate below depends on
    // migration 20260702000002. Schema + reader ship together — never deploy
    // this loader ahead of that migration (see the migration header). Missing
    // column → this query throws → failure-empty (atoms stop surfacing).
    const result = await query<AtomRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM member_memory_atoms
       WHERE member_id = $1
         AND ${scopeWhere}
         AND status IN ('active', 'still_alive')
         AND return_preference IN ('contextual_doorway', 'ritual_review_opt_in')
         AND NOT ('sacred_protected' = ANY(registers))
         AND ${PRACTITIONER_ATTRIBUTION_GUARD}
         AND member_response_status IS DISTINCT FROM 'rejected'
       ORDER BY is_breakthrough DESC, kept_at DESC
       LIMIT $2`,
      params,
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

/**
 * Count stored vs eligible atoms for a member (personal scope) — Sprint 1
 * (Truth Layer) observability input for the MemoryTransitionRecord.
 *
 * "eligible" = passes the same consent/status predicates the loader applies,
 * before any cap. This is what makes the ELIGIBLE→OFFERED transition visible:
 * the loader's LIMIT drops (eligible − retrieved) atoms with no other trace.
 *
 * ⚠️ The eligibility predicates below MUST stay in lockstep with the personal-
 * scope branch of loadMemberMemoryAtomsForPrompt above. If you touch one,
 * touch both. (Deliberately duplicated rather than extracted so this
 * observability addition cannot alter the production SELECT — Sprint 1
 * preserves retrieval behavior exactly.)
 *
 * Read-only, fire-and-forget-safe: returns null on any failure — unknown is a
 * valid state and must be recorded as such, never guessed.
 */
export async function countMemberMemoryAtomStates(
  memberId: string,
): Promise<{ stored: number; eligible: number } | null> {
  if (!memberId) return null;
  try {
    const result = await query<{ stored: string; eligible: string }>(
      `SELECT count(*) AS stored,
              count(*) FILTER (
                WHERE memory_scope = 'personal'
                  AND status IN ('active', 'still_alive')
                  AND return_preference IN ('contextual_doorway', 'ritual_review_opt_in')
                  AND NOT ('sacred_protected' = ANY(registers))
                  AND ${PRACTITIONER_ATTRIBUTION_GUARD}
                  AND member_response_status IS DISTINCT FROM 'rejected'
              ) AS eligible
       FROM member_memory_atoms
       WHERE member_id = $1`,
      [memberId],
    );
    const row = result.rows[0];
    if (!row) return null;
    return { stored: Number(row.stored), eligible: Number(row.eligible) };
  } catch (err) {
    console.warn(
      '[MAIA] memory-transition atom count failed (non-fatal):',
      err instanceof Error ? err.message : String(err),
    );
    return null;
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
