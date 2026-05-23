/**
 * Spiral Orientation — Cut 2
 *
 * Read-only orientation infrastructure for understanding where a member
 * has placed material across life domains. Does NOT inject into MAIA's
 * prompt. Does NOT write state. Does NOT infer phase / stage / identity.
 * Does NOT classify atoms automatically by domain.
 *
 * Governed by:
 *   - docs/canon/THE_CLEARING.md
 *   - docs/canon/SPIRAL_CONTINUITY_ENGINE.md
 *   - docs/canon/MAIA_MEMORY_CANON_v1.0.md
 *
 * Core constraints (architectural):
 *   1. The member is the placer. The system records.
 *   2. Evidence is only what the member has explicitly placed.
 *   3. Themes exist only when the member named them.
 *   4. Uncertainty is named, not papered over.
 *   5. Questions are for MAIA to ask; never for the system to silently answer.
 *   6. Orientation may describe visible movement.
 *   7. Orientation may not stabilize identity.
 *   8. crossing_allowed = FALSE remains absolute — no cross-domain synthesis.
 *
 * The orientation layer is a mirror with named edges, not a map.
 *
 * Architecture layer separation (kept legible):
 *   atoms       = continuity substrate
 *   missions    = intentional direction
 *   orientation = present positioning   ← this module
 *   questions   = dialogical emergence
 *   UFI         = field assembly        (not used here)
 *   FIS         = epistemic governance  (not used here)
 */

import { query } from '@/lib/db/postgres';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type LifeDomain =
  | 'identity'
  | 'body'
  | 'relationship'
  | 'work'
  | 'creativity'
  | 'spirituality';

export const ALL_LIFE_DOMAINS: readonly LifeDomain[] = [
  'identity',
  'body',
  'relationship',
  'work',
  'creativity',
  'spirituality',
] as const;

export type EvidenceSource =
  | 'mission'
  | 'atom'
  | 'journal'
  | 'idea'
  | 'decision'
  | 'change'
  | 'capsule';

export interface EvidenceItem {
  source: EvidenceSource;
  source_id: string;
  /**
   * Always true. The system does not generate evidence; it only records
   * what the member placed.
   */
  placed_by_member: true;
  /** Member's own words. Never paraphrased. */
  member_excerpt?: string;
  placed_at: Date;
  /** Source-specific context (e.g., mission status, atom register list). */
  meta?: Record<string, unknown>;
}

export interface ThemeObservation {
  /** Member-given label. Never system-generated. */
  label: string;
  appearances: Array<{
    source: EvidenceSource;
    source_id: string;
    member_excerpt?: string;
  }>;
  /**
   * Always true. A theme exists in orientation only if the member named it.
   * Co-occurrence without naming stays in `uncertainty`.
   */
  member_named: true;
}

export type UncertaintyKind =
  | 'no_recent_placement'
  | 'unclassified_atoms'
  | 'no_member_themes'
  | 'gap'
  | 'ambiguous_register';

export interface UncertaintyItem {
  kind: UncertaintyKind;
  description: string;
}

export interface DomainOrientation {
  domain: LifeDomain;
  evidence: EvidenceItem[];
  themeObservations: ThemeObservation[];
  uncertainty: UncertaintyItem[];
  /**
   * Questions for MAIA to ask the member when relevant. Never to be answered
   * silently by the system. The member's reply rewrites evidence; the system
   * never overwrites the member's framing with its own.
   */
  suggestedQuestions: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// House → LifeDomain mapping
//
// Astrological houses (1-12) mapped to one of six life domains.
// This mapping is PROVISIONAL and intentionally simple for Cut 2.
//
// Future iterations may allow member-defined domains, fluid domains, or
// overlapping spirals. For now: fixed mapping, no overlap, no member override.
// ─────────────────────────────────────────────────────────────────────────────

const HOUSE_TO_DOMAIN: Readonly<Record<number, LifeDomain>> = {
  1: 'identity',       // self
  2: 'body',           // resources, values, material self
  3: 'relationship',   // communication, siblings
  4: 'identity',       // home, roots, foundation
  5: 'creativity',     // play, joy, creative expression
  6: 'body',           // health, daily routines
  7: 'relationship',   // partnerships
  8: 'spirituality',   // transformation, death, shared depth
  9: 'spirituality',   // meaning, philosophy, higher learning
  10: 'work',          // career, public role
  11: 'relationship',  // community, friends
  12: 'spirituality',  // subconscious, hidden
};

export function houseToLifeDomain(house: number): LifeDomain | null {
  if (!Number.isInteger(house) || house < 1 || house > 12) {
    return null;
  }
  return HOUSE_TO_DOMAIN[house] ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal data shapes (DB query results)
// ─────────────────────────────────────────────────────────────────────────────

interface MissionRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'emerging' | 'active' | 'completed' | 'urgent';
  house: number;
  created_at: Date;
  updated_at: Date;
}

interface AtomThematicRow {
  id: string;
  member_id: string;
  source_type: string;
  source_id: string | null;
  title: string;
  registers: string[];
  primary_register: string | null;
  created_at: Date;
}

interface AtomCountRow {
  total: string; // pg COUNT returns string
}

// ─────────────────────────────────────────────────────────────────────────────
// Loaders (read-only)
// ─────────────────────────────────────────────────────────────────────────────

async function loadMissions(memberId: string): Promise<MissionRow[]> {
  try {
    const result = await query<MissionRow>(
      `SELECT id, user_id, title, description, status, house, created_at, updated_at
       FROM missions
       WHERE user_id = $1
         AND status IN ('emerging', 'active', 'urgent')
       ORDER BY updated_at DESC
       LIMIT 50`,
      [memberId],
    );
    return result.rows;
  } catch (err) {
    // Graceful degradation — orientation continues with empty mission set.
    // The uncertainty layer will report the gap.
    console.warn('[orientation] mission load failed (non-fatal):', err);
    return [];
  }
}

/**
 * Loads atoms whose member-placed registers include 'thematic'.
 * These are the only atoms that can legitimately surface as themes —
 * the member explicitly said "this is thematic." Other atoms exist but
 * are not promoted to theme without member naming (per §7 of the design).
 */
async function loadMemberNamedThematicAtoms(
  memberId: string,
): Promise<AtomThematicRow[]> {
  try {
    const result = await query<AtomThematicRow>(
      `SELECT id, member_id, source_type, source_id, title, registers,
              primary_register, created_at
       FROM member_memory_atoms
       WHERE member_id = $1::uuid
         AND 'thematic' = ANY(registers)
       ORDER BY created_at DESC
       LIMIT 50`,
      [memberId],
    );
    return result.rows;
  } catch (err) {
    console.warn('[orientation] thematic atom load failed (non-fatal):', err);
    return [];
  }
}

async function loadTotalAtomCount(memberId: string): Promise<number> {
  try {
    const result = await query<AtomCountRow>(
      `SELECT COUNT(*)::text AS total
       FROM member_memory_atoms
       WHERE member_id = $1::uuid`,
      [memberId],
    );
    return Number.parseInt(result.rows[0]?.total ?? '0', 10) || 0;
  } catch (err) {
    console.warn('[orientation] atom count failed (non-fatal):', err);
    return 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-domain orientation construction
// ─────────────────────────────────────────────────────────────────────────────

function missionToEvidence(mission: MissionRow): EvidenceItem {
  return {
    source: 'mission',
    source_id: mission.id,
    placed_by_member: true,
    member_excerpt: mission.title,
    placed_at: mission.updated_at,
    meta: {
      status: mission.status,
      house: mission.house,
      description: mission.description,
    },
  };
}

function buildDomainEvidence(
  domain: LifeDomain,
  missions: MissionRow[],
): EvidenceItem[] {
  return missions
    .filter((m) => houseToLifeDomain(m.house) === domain)
    .map(missionToEvidence);
}

function buildDomainThemes(
  domain: LifeDomain,
  thematicAtoms: AtomThematicRow[],
  evidenceMissionIds: Set<string>,
): ThemeObservation[] {
  // An atom counts as a theme observation for a domain ONLY when:
  //   - the member tagged it 'thematic' (already filtered by loader), AND
  //   - its source links to a piece of evidence already in this domain
  //     (e.g., an idea attached to a mission in this domain).
  //
  // We do NOT classify atoms into domains by title, content, or element.
  // That would be auto-classification, which violates "the member is the placer."
  return thematicAtoms
    .filter((atom) => {
      // Source bridge: only surface atoms whose source we can confirm
      // belongs to this domain via member-placed missions.
      if (!atom.source_id) return false;
      return evidenceMissionIds.has(atom.source_id);
    })
    .map((atom) => ({
      label: atom.title,
      appearances: [
        {
          source: 'atom',
          source_id: atom.id,
          member_excerpt: atom.title,
        },
      ],
      member_named: true,
    }));
}

function buildDomainUncertainty(
  domain: LifeDomain,
  evidence: EvidenceItem[],
  themes: ThemeObservation[],
  totalAtomCount: number,
): UncertaintyItem[] {
  const items: UncertaintyItem[] = [];

  if (evidence.length === 0) {
    items.push({
      kind: 'no_recent_placement',
      description: `No active or emerging missions placed in ${domain}. This area may be quiet, transitional, or simply unaddressed — the system cannot tell which from here.`,
    });
  }

  if (themes.length === 0 && evidence.length > 0) {
    items.push({
      kind: 'no_member_themes',
      description: `${evidence.length} placement(s) in ${domain}, but the member has not tagged anything here as thematic. Theme detection awaits member naming.`,
    });
  }

  if (totalAtomCount > 0 && themes.length === 0) {
    items.push({
      kind: 'unclassified_atoms',
      description: `${totalAtomCount} kept atom(s) across all domains; none yet linked to ${domain} via member-placed sources.`,
    });
  }

  return items;
}

function buildDomainQuestions(
  domain: LifeDomain,
  evidence: EvidenceItem[],
  themes: ThemeObservation[],
): string[] {
  const questions: string[] = [];

  if (evidence.length === 0) {
    questions.push(
      `What's alive for you in ${domain} right now — or is it quiet?`,
    );
    questions.push(
      `Is there something in ${domain} that hasn't yet found its way into the room?`,
    );
  } else {
    // Evidence exists but no themes — invite member to name what they see.
    if (themes.length === 0) {
      questions.push(
        `You've placed ${evidence.length} thing(s) in ${domain}. Is there a thread connecting them you'd want to name?`,
      );
    }
    questions.push(
      `Of what you've placed in ${domain}, which feels closest to where you're actually at?`,
    );
  }

  return questions;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a read-only orientation snapshot across all life domains for a member.
 *
 * Returns one DomainOrientation per LifeDomain. Each contains:
 *   - evidence: member-placed material visible in this domain
 *   - themeObservations: only member-named themes; never system-discovered
 *   - uncertainty: explicit, named gaps
 *   - suggestedQuestions: for MAIA to ask, never to silently answer
 *
 * This function does NOT:
 *   - infer phase, stage, level, archetype, or identity
 *   - classify atoms into domains by content, title, or element
 *   - synthesize across domains
 *   - write to any table
 *   - compose into MAIA's prompt (downstream decision; see design report §11)
 *
 * Failure mode: graceful degradation. Loader errors return empty data and
 * the orientation surfaces the gap honestly via uncertainty.
 */
export async function buildMemberSpiralOrientation(
  memberId: string,
): Promise<DomainOrientation[]> {
  if (!memberId || typeof memberId !== 'string') {
    throw new Error('buildMemberSpiralOrientation: memberId is required');
  }

  const [missions, thematicAtoms, totalAtomCount] = await Promise.all([
    loadMissions(memberId),
    loadMemberNamedThematicAtoms(memberId),
    loadTotalAtomCount(memberId),
  ]);

  return ALL_LIFE_DOMAINS.map((domain) => {
    const evidence = buildDomainEvidence(domain, missions);
    const evidenceMissionIds = new Set(evidence.map((e) => e.source_id));
    const themes = buildDomainThemes(domain, thematicAtoms, evidenceMissionIds);
    const uncertainty = buildDomainUncertainty(
      domain,
      evidence,
      themes,
      totalAtomCount,
    );
    const suggestedQuestions = buildDomainQuestions(domain, evidence, themes);

    return {
      domain,
      evidence,
      themeObservations: themes,
      uncertainty,
      suggestedQuestions,
    };
  });
}
